import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Image,
  Input,
  InputGroup,
  NumberInput,
  NumberInputField,
  Spacer,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react';
import { BalancesReponse } from '@pesabooks/supabase/functions';
import { BigNumber, ethers } from 'ethers';
import { debounce } from 'lodash';
import { Address, APIError, ParaSwap, Token, Transaction as ParaswapTx } from 'paraswap';
import { OptimalRate } from 'paraswap-core';
import { useCallback, useEffect, useState } from 'react';
import { FaWallet } from 'react-icons/fa';
import { formatBigNumber } from '../../../bignumber-utils';
import { Card, CardHeader } from '../../../components/Card';
import { getTokenAllowance } from '../../../services/blockchainServices';
import { getBalances } from '../../../services/covalentServices';
import { getPendingTokenUnlockingTxCount } from '../../../services/transactionsServices';
import { compareAddress } from '../../../utils';
import { SelectParaswapToken } from '../components/SelectParaswapToken';

const DEFAULT_ALLOWED_SLIPPAGE = 0.01; //1%
const DEFAULT_AMOUNT = '1';
const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

interface IState {
  error?: string | React.ReactElement;
  status?: string;
  loading?: boolean;
  tokens: Token[];
  srcAmount: string;
  receiver?: Address;
  tokenFrom?: Token;
  tokenTo?: Token;
  balances?: BalancesReponse[];
  priceRoute?: OptimalRate;
  pendingUnlocking?: boolean;
  validation?: 'insufficientFunds' | 'insufficientAllowance' | 'invalidAmount';
}

export interface SwapArgs {
  txParams: ParaswapTx;
  tokenFrom: Token;
  tokenTo: Token;
  priceRoute: OptimalRate;
  callback: () => void;
}

export interface ApproveArgs {
  paraswapProxy: string;
  tokenFrom: Token;
  callback: () => void;
}

interface SwapCardProps {
  chain_id: number;
  address: string;
  defaultTokenAddress?: string;
  pool_id: string;
  onApproveToken: (approveArgs: ApproveArgs) => void;
  isSubmitting: boolean;
  onSwap: (swapargs: SwapArgs) => void;
}

export const SwapCard = ({
  chain_id,
  address,
  defaultTokenAddress,
  pool_id,
  onApproveToken,
  isSubmitting,
  onSwap,
}: SwapCardProps) => {
  const [paraswap, setParaswap] = useState<ParaSwap>();

  const [state, setState] = useState<IState>({ srcAmount: DEFAULT_AMOUNT, tokens: [] });

  useEffect(() => {
    if (chain_id && (chain_id === 137 || chain_id === 56)) setParaswap(new ParaSwap(chain_id));
  }, [chain_id]);

  const getBalancesCB = useCallback(() => {
    if (address && paraswap) {
      getBalances(chain_id, address).then((balances) => {
        setState((prevState) => ({
          ...prevState,
          balances: balances,
        }));
      });
    }
  }, [address, paraswap, chain_id]);

  const getBestPrice = useCallback(
    async (srcAmount: string, tokenFrom: Token, tokenTo: Token) => {
      try {
        setState((prevState) => ({
          ...prevState,
          status: '',
        }));

        if (
          !srcAmount ||
          !BigNumber.from(srcAmount) ||
          BigNumber.from(srcAmount).lte(0) ||
          !tokenFrom ||
          !tokenTo
        ) {
          return;
        }

        setState((prevState) => ({
          ...prevState,
          error: '',
          loading: true,
          priceRoute: undefined,
        }));

        const _srcAmount = ethers.utils.parseUnits(srcAmount.toString(), tokenFrom.decimals);

        setState((prevState) => ({
          ...prevState,
          loading: true,
        }));

        const priceRouteOrError = await paraswap?.getRate(
          tokenFrom.address,
          tokenTo.address,
          _srcAmount.toString(),
        );

        if ((priceRouteOrError as APIError).message) {
          setState((prevState) => ({
            ...prevState,
            error: (priceRouteOrError as APIError).message,
            loading: false,
          }));
          return;
        }

        const priceRoute = priceRouteOrError as OptimalRate;

        setState((prevState) => ({
          ...prevState,
          loading: false,
          priceRoute,
        }));
      } catch (e) {
        setState((prevState) => ({
          ...prevState,
          error: 'Price Feed Error',
          loading: false,
        }));
      }
    },
    [paraswap],
  );

  const getTokens = useCallback(async (): Promise<
    [defaultTokenFrom: Token, defaultTokenTo: Token] | undefined
  > => {
    if (!paraswap) return;

    try {
      const tokensOrError: Token[] | APIError = await paraswap.getTokens();

      if ((tokensOrError as APIError).message) {
        setState((prevState) => ({
          ...prevState,
          error: (tokensOrError as APIError).message,
          loading: false,
        }));
        return;
      }

      const tokens = tokensOrError as Token[];

      const tokenFrom = tokens.find((t) => compareAddress(t.address, defaultTokenAddress));

      const tokenTo = tokens.find((t) => compareAddress(t.address, NATIVE_TOKEN_ADDRESS));

      setState((prevState) => ({
        ...prevState,
        tokens,
        tokenFrom,
        tokenTo,
        loading: false,
      }));
      if (tokenFrom && tokenTo) {
        return [tokenFrom, tokenTo];
      }
    } catch (e) {
      console.error('Error', e);
    }
  }, [defaultTokenAddress, paraswap]);

  useEffect(() => {
    const loadData = async () => {
      await getBalancesCB();
      const defaultsToken = await getTokens();
      if (defaultsToken) {
        const [from, to] = defaultsToken;
        await getBestPrice(DEFAULT_AMOUNT, from, to);
      }
    };
    loadData();
  }, [getBalancesCB, getBestPrice, getTokens]);

  const checkPendingTokenUnlocking = useCallback(() => {
    if (pool_id && state.tokenFrom?.symbol)
      getPendingTokenUnlockingTxCount(pool_id, state.tokenFrom.symbol).then((count) => {
        if (count === 0) {
          setState((prevState) => ({
            ...prevState,
            pendingUnlocking: false,
          }));
        } else {
          setState((prevState) => ({
            ...prevState,
            pendingUnlocking: true,
          }));
        }
      });
  }, [pool_id, state.tokenFrom?.symbol]);

  //todo : wtf??
  useEffect(() => {
    checkPendingTokenUnlocking();
  }, [checkPendingTokenUnlocking]);

  const getMinDestAmount = () => {
    if (!state.priceRoute?.destAmount || !BigNumber.from(state.priceRoute?.destAmount)) return;
    const res = BigNumber.from(state.priceRoute?.destAmount)
      .mul(1000 * (1 - DEFAULT_ALLOWED_SLIPPAGE))
      .div(1000);
    return res;
  };

  const availableTokens = () => {
    const { tokens, balances } = state;
    return (
      tokens?.filter((t) => balances?.find((b) => compareAddress(b.contract_address, t.address))) ??
      []
    );
  };

  const switchToken = () => {
    const { tokenFrom, tokenTo } = state;
    setState((prevState) => ({
      ...prevState,
      tokenFrom: tokenTo,
      tokenTo: tokenFrom,
    }));
    if (tokenTo && tokenFrom) getBestPrice(state.srcAmount, tokenTo, tokenFrom);
  };

  const updatePair = (key: 'tokenFrom' | 'tokenTo', token: Token) => {
    if (
      (key === 'tokenFrom' && token.symbol === state.tokenTo?.symbol) ||
      (key === 'tokenTo' && token.symbol === state.tokenFrom?.symbol)
    ) {
      switchToken();
      return;
    }

    setState((prevState) => ({
      ...prevState,
      [key]: token,
    }));
    if (key === 'tokenFrom' && state.tokenTo) getBestPrice(state.srcAmount, token, state.tokenTo);
    else if (key === 'tokenTo' && state.tokenFrom)
      getBestPrice(state.srcAmount, state.tokenFrom, token);
  };

  const getBestPriceDebounced = debounce((value, tokenFrom: Token, tokenTo: Token) => {
    getBestPrice(value, tokenFrom, tokenTo);
  }, 500);

  const onAmountChange = (value: any) => {
    setState((prevState) => ({
      ...prevState,
      srcAmount: value,
    }));
    if (state.tokenFrom && state.tokenTo)
      getBestPriceDebounced(value, state.tokenFrom, state.tokenTo);
  };

  const formatUsdPrice = (price: string) => {
    const numericPrice = +price;
    if (isNaN(numericPrice)) return null;
    return numericPrice.toFixed(2);
  };

  const getTokenBalance = (token: Token | undefined) => {
    const balance = formatBigNumber(
      state.balances?.find((b) => compareAddress(b.contract_address, token?.address))?.balance,
      token?.decimals!,
    );
    if (balance) return balance.toString();
    return '0';
  };

  useEffect(() => {
    const checkBalances = async () => {
      if (!state.tokenFrom) return;

      try {
        const { balance } =
          state?.balances?.find((t) =>
            compareAddress(t.contract_address, state.tokenFrom?.address),
          ) || {};

        const paraswapProxy = await paraswap?.getTokenTransferProxy();

        let allowance: BigNumber | null = null;
        if (!compareAddress(state.tokenFrom.address, NATIVE_TOKEN_ADDRESS)) {
          allowance = await getTokenAllowance(
            chain_id,
            state.tokenFrom.address,
            address,
            paraswapProxy as string,
          );
        }

        if (!state.srcAmount || isNaN(+state.srcAmount)) {
          setState((prevState) => ({
            ...prevState,
            validation: 'invalidAmount',
          }));
          return;
        }

        const _srcAmount = ethers.utils.parseUnits(
          state.srcAmount.toString(),
          state.tokenFrom.decimals,
        );

        if (balance && !BigNumber.from(balance).gte(_srcAmount)) {
          setState((prevState) => ({
            ...prevState,
            validation: 'insufficientFunds',
          }));
        } else if (allowance && !allowance.gte(_srcAmount)) {
          setState((prevState) => ({
            ...prevState,
            validation: 'insufficientAllowance',
          }));
        } else {
          setState((prevState) => ({
            ...prevState,
            validation: undefined,
          }));
        }
      } catch (e) {
        console.error('error checkBalances', e);
      }
    };
    checkBalances();
  }, [address, chain_id, paraswap, state.balances, state.srcAmount, state.tokenFrom]);

  const styles = {
    py: '5px',
    border: '1px solid',
    borderColor: 'inherit',
    bg: 'inherit',
    _hover: {
      // borderColor: mode('gray.300', 'whiteAlpha.400')(props),
    },
  };

  const unlock = async () => {
    if (!state.tokenFrom) return;

    const proxyOrError = await paraswap?.getTokenTransferProxy();
    if ((proxyOrError as APIError).message) {
      setState((prevState) => ({
        ...prevState,
        error: (proxyOrError as APIError).message,
        loading: false,
      }));
      return;
    }

    await onApproveToken({
      paraswapProxy: proxyOrError as string,
      tokenFrom: state.tokenFrom,
      callback: getBalancesCB,
    });

    checkPendingTokenUnlocking();
  };

  const submitSwap = async () => {
    const { tokenFrom, tokenTo, srcAmount, priceRoute } = state;
    if (!paraswap || !tokenFrom || !tokenTo) return;

    if (!priceRoute) {
      setState((prevState) => ({
        ...prevState,
        error: 'Price Error. Please refresh the rates',
      }));
      return;
    }

    const _srcAmount = ethers.utils.parseUnits(srcAmount.toString(), tokenFrom!.decimals);

    const minDestinationAmount = getMinDestAmount();

    const txParams = await paraswap.buildTx(
      tokenFrom!.address,
      tokenTo!.address,
      _srcAmount.toString(),
      minDestinationAmount!.toString(),
      priceRoute,
      address,
    );

    if ((txParams as APIError).message) {
      setState((prevState) => ({
        ...prevState,
        error: (txParams as APIError).message,
      }));
      return;
    }

    await onSwap({
      txParams: txParams as ParaswapTx,
      tokenFrom,
      tokenTo,
      priceRoute,
      callback: () => {
        setState((prevState) => ({
          ...prevState,
          loading: false,
          status: '',
        }));
      },
    });
  };

  const fillMaxAmount = () => {
    const balance = getTokenBalance(state.tokenFrom);

    if (balance) {
      setState((prevState) => ({
        ...prevState,
        srcAmount: balance,
      }));
    }
  };

  return (
    <>
      {state.error && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state.validation === 'insufficientAllowance' && state.pendingUnlocking && (
        <Alert status="warning">
          <AlertIcon />
          <AlertDescription>
            A transaction to unlock {state.tokenFrom?.symbol} is already pending. Please execute
            fist to continue.
          </AlertDescription>
        </Alert>
      )}
      <Text>{state.status}</Text>
      <Card>
        <CardHeader p="6px 0px 32px 0px">
          <Heading size="lg">Swap token </Heading>
        </CardHeader>
        <Stack gap={5}>
          <Box>
            <Flex>
              <FormLabel htmlFor="amount">Pay</FormLabel>
              <Spacer />
              <Button
                onClick={fillMaxAmount}
                size="xs"
                colorScheme="white"
                leftIcon={<FaWallet />}
                variant="link"
              >
                {getTokenBalance(state.tokenFrom)} {state.tokenFrom?.symbol}
              </Button>
            </Flex>
            <Flex p={5} style={styles} alignItems="center">
              <NumberInput
                min={0}
                variant="unstyled"
                w="100%"
                value={state.srcAmount}
                onChange={(e) => onAmountChange(e)}
              >
                <NumberInputField id="fromAmount" />
              </NumberInput>
              <SelectParaswapToken
                value={state.tokenFrom}
                tokens={availableTokens()}
                onChange={(e) => updatePair('tokenFrom', e)}
              />
            </Flex>

            <Text color="red.300" fontSize="sm" mt={1}>
              {state.validation === 'insufficientFunds' && 'Insufficient funds'}
              {state.validation === 'insufficientAllowance' &&
                `You need to unlock ${state.srcAmount} ${state.tokenFrom?.symbol} before swapping`}
            </Text>
          </Box>

          <FormControl>
            <Flex>
              <FormLabel htmlFor="amount">Receive</FormLabel>
              <Spacer />
              <Flex align="center" gap={1}>
                <Icon as={FaWallet} h={'12px'} w={'12px'} />
                <Text fontSize="sm">
                  {getTokenBalance(state.tokenTo)} {state.tokenTo?.symbol}
                </Text>
              </Flex>
            </Flex>
            <Flex gap={2} p={5} style={styles} alignItems="center">
              <InputGroup>
                {state.loading ? (
                  <Spinner />
                ) : (
                  <Input
                    id="toAmount"
                    variant="unstyled"
                    w="100%"
                    value={formatBigNumber(state.priceRoute?.destAmount, state.tokenTo?.decimals!)}
                    readOnly
                  ></Input>
                )}
                {state.priceRoute?.destUSD && (
                  <Text as="i" fontSize="sm">
                    ~${formatUsdPrice(state.priceRoute.destUSD)}
                  </Text>
                )}
              </InputGroup>

              <SelectParaswapToken
                value={state.tokenTo}
                tokens={state.tokens}
                onChange={(e) => updatePair('tokenTo', e)}
              />
            </Flex>
          </FormControl>
          <Flex gap={5}>
            {state.validation === 'insufficientAllowance' && (
              <Button
                flex="1"
                isLoading={isSubmitting}
                onClick={unlock}
                disabled={state.pendingUnlocking}
              >
                Unlock {state.tokenFrom?.symbol}
              </Button>
            )}

            <Button
              onClick={submitSwap}
              flex="1"
              isLoading={isSubmitting && !state.validation}
              disabled={!!state.validation}
            >
              Swap
            </Button>
          </Flex>

          <Flex style={styles} direction="column" p={3}>
            <Flex justifyContent="space-between">
              <Text fontSize="sm">Estimated Cost</Text>
              {state.priceRoute?.gasCostUSD && (
                <Text as="i" fontSize="sm">
                  ~${formatUsdPrice(state.priceRoute.gasCostUSD)}
                </Text>
              )}
            </Flex>

            <Flex justifyContent="space-between">
              <Text fontSize="sm">Minimum Received</Text>
              <Text as="i" fontSize="sm">
                {formatBigNumber(getMinDestAmount()?.toString(), state.tokenTo?.decimals!, 8)}{' '}
                {state.tokenTo?.symbol}
              </Text>
            </Flex>
          </Flex>
        </Stack>
      </Card>
      <Flex justifyContent="end" alignContent="center" gap={2} mt={5}>
        <Text fontSize="sm">Powered by</Text>
        <Image
          w={100}
          src="https://assets.website-files.com/617aa5e4225be2555942852c/6214d5c4db4ce4d976b5f1f9_logo_paraswap-handbook%20copy%201.svg"
        />
      </Flex>
    </>
  );
};
