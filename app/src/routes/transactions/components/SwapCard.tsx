import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Editable,
  EditableInput,
  EditablePreview,
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
  Text,
} from '@chakra-ui/react';
import { getTokenAllowance } from '@pesabooks/services/blockchainServices';
import { TokenBalance, getBalances } from '@pesabooks/services/covalentServices';
import { eventBus } from '@pesabooks/services/events/eventBus';
import { getPendingTokenUnlockingTxCount } from '@pesabooks/services/transactionsServices';
import { compareAddress } from '@pesabooks/utils/addresses-utils';
import {
  formatBigNumber,
  formatCurrency,
  formatLongNumber,
} from '@pesabooks/utils/bignumber-utils';
import { BigNumber, ethers } from 'ethers';
import { debounce } from 'lodash';
import {
  APIError,
  Address,
  ETHER_ADDRESS as NATIVE_TOKEN_ADDRESS,
  NetworkID,
  ParaSwap,
  Transaction as ParaswapTx,
  Token,
} from 'paraswap';
import { OptimalRate } from 'paraswap-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaWallet } from 'react-icons/fa';
import { SelectParaswapToken } from '../components/SelectParaswapToken';

const DEFAULT_ALLOWED_SLIPPAGE = 1; //1%
const MAX_ALLOWED_SLIPPAGE = 15; //15%
const DEFAULT_AMOUNT = '1';

interface IState {
  error?: string | React.ReactElement;
  status?: string;
  loading?: boolean;
  tokens: Token[];
  availableTokens: Token[];
  srcAmount: string;
  receiver?: Address;
  tokenFrom?: Token;
  tokenTo?: Token;
  balances?: TokenBalance[];
  priceRoute?: OptimalRate;
  pendingUnlocking?: boolean;
  validation?: 'insufficientFunds' | 'insufficientAllowance' | 'invalidAmount';
  slippage: number;
  InputSlippage?: string;
}

export interface SwapArgs {
  txParams: ParaswapTx;
  tokenFrom: Token;
  tokenTo: Token;
  priceRoute: OptimalRate;
  slippage: number;
}

export interface ApproveArgs {
  paraswapProxy: string;
  tokenFrom: Token;
  amount: number;
}

interface SwapCardProps {
  chain_id: number;
  address: string;
  defaultTokenAddress?: string;
  pool_id?: string;
  onApproveToken: (approveArgs: ApproveArgs) => void;
  onSwap: (swapargs: SwapArgs) => void;
}

const compareParaswapToken = (b: TokenBalance, t: Token) =>
  b.token.is_native
    ? compareAddress(NATIVE_TOKEN_ADDRESS, t.address)
    : compareAddress(b.token.address, t.address);

export const SwapCard = ({
  chain_id,
  address,
  defaultTokenAddress,
  pool_id,
  onApproveToken,
  onSwap,
}: SwapCardProps) => {
  const [paraswap, setParaswap] = useState<ParaSwap>();

  const [state, setState] = useState<IState>({
    srcAmount: DEFAULT_AMOUNT,
    tokens: [],
    availableTokens: [],
    slippage: DEFAULT_ALLOWED_SLIPPAGE,
    InputSlippage: DEFAULT_ALLOWED_SLIPPAGE.toString(),
  });

  useEffect(() => {
    setParaswap(new ParaSwap(chain_id as NetworkID));
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

        if (!srcAmount || isNaN(+srcAmount) || !tokenFrom || !tokenTo) {
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
          const message = (priceRouteOrError as APIError).message;
          if (message === 'Invalid Amount') {
            setState((prevState) => ({
              ...prevState,
              validation: 'invalidAmount',
              loading: false,
            }));
          } else {
            setState((prevState) => ({
              ...prevState,
              error: (priceRouteOrError as APIError).message,
              loading: false,
            }));
          }
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

  const getBestPriceDebounced = useMemo(() => debounce(getBestPrice, 700), [getBestPrice]);

  // Stop the invocation of the debounced function after unmounting
  useEffect(() => {
    return () => {
      getBestPriceDebounced.cancel();
    };
  }, [getBestPriceDebounced]);

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

  useEffect(() => {
    const loadData = async () => {
      await getBalancesCB();
      await checkPendingTokenUnlocking();
      const defaultsToken = await getTokens();
      if (defaultsToken) {
        const [from, to] = defaultsToken;
        await getBestPrice(DEFAULT_AMOUNT, from, to);
      }
    };
    loadData();
  }, [checkPendingTokenUnlocking, getBalancesCB, getBestPrice, getTokens]);

  const minDestinationAmount = useMemo(() => {
    if (!state.priceRoute?.destAmount || !BigNumber.from(state.priceRoute?.destAmount)) return;

    let res: BigNumber;
    //Bignumber throw an erro on small numbers
    try {
      res = BigNumber.from(state.priceRoute?.destAmount).mul(
        1 - (state.slippage ?? DEFAULT_ALLOWED_SLIPPAGE) / 100,
      );
    } catch (error) {
      res = BigNumber.from(state.priceRoute?.destAmount)
        .mul(1000 * (1 - (state.slippage ?? DEFAULT_ALLOWED_SLIPPAGE) / 100))
        .div(1000);
    }

    return res;
  }, [state.priceRoute?.destAmount, state.slippage]);

  useEffect(() => {
    const availableTokens =
      state.tokens?.filter((t) => state.balances?.find((b) => compareParaswapToken(b, t))) ?? [];
    setState((prevState) => ({
      ...prevState,
      availableTokens,
    }));
  }, [state.balances, state.tokens]);

  const switchToken = () => {
    const { tokenFrom, tokenTo } = state;
    setState((prevState) => ({
      ...prevState,
      tokenFrom: tokenTo,
      tokenTo: tokenFrom,
    }));
    if (tokenTo && tokenFrom) getBestPrice(state.srcAmount, tokenTo, tokenFrom);
  };

  const updatePair = (key: 'tokenFrom' | 'tokenTo', token: Token | null) => {
    if (
      (key === 'tokenFrom' && token?.symbol === state.tokenTo?.symbol) ||
      (key === 'tokenTo' && token?.symbol === state.tokenFrom?.symbol)
    ) {
      switchToken();
      return;
    }

    setState((prevState) => ({
      ...prevState,
      [key]: token,
    }));
    if (key === 'tokenFrom' && state.tokenTo && token) {
      getBestPrice(state.srcAmount, token, state.tokenTo);
    } else if (key === 'tokenTo' && state.tokenFrom && token) {
      getBestPrice(state.srcAmount, state.tokenFrom, token);
    }
  };

  const onAmountChange = (value: string) => {
    setState((prevState) => ({
      ...prevState,
      srcAmount: value,
    }));
    if (state.tokenFrom && state.tokenTo)
      getBestPriceDebounced(value, state.tokenFrom, state.tokenTo);
  };

  const getTokenBalance = (token: Token | undefined) => {
    if (!token) return '0';
    const balance = formatBigNumber(
      state.balances?.find((b) => compareParaswapToken(b, token))?.balance,
      token?.decimals,
    );
    if (balance) return balance.toString();
    return '0';
  };

  useEffect(() => {
    const checkBalances = async () => {
      if (!state.tokenFrom) return;

      try {
        const { balance } =
          state?.balances?.find((t) => compareAddress(t.token.address, state.tokenFrom?.address)) ||
          {};

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

  //Subscribe to transaction completed event
  useEffect(() => {
    const subscription = eventBus.channel('transaction').on('execution_completed', () => {
      getBalancesCB();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getBalancesCB]);

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
      amount: +state.srcAmount,
    });

    checkPendingTokenUnlocking();
  };

  const submitSwap = async () => {
    const { tokenFrom, tokenTo, srcAmount, priceRoute } = state;
    if (!paraswap || !tokenFrom || !tokenTo || !minDestinationAmount) return;

    if (!priceRoute) {
      setState((prevState) => ({
        ...prevState,
        error: 'Price Error. Please refresh the rates',
      }));
      return;
    }

    const _srcAmount = ethers.utils.parseUnits(srcAmount.toString(), tokenFrom.decimals);

    const txParams = await paraswap.buildTx(
      tokenFrom.address,
      tokenTo.address,
      _srcAmount.toString(),
      minDestinationAmount.toString(),
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
      slippage: state.slippage,
    });
  };

  const fillMaxAmount = () => {
    const balanceBN = state.balances?.find((b) =>
      compareAddress(b.token.address, state.tokenFrom?.address),
    )?.balance;

    if (balanceBN && state.tokenFrom?.decimals) {
      const balance = ethers.utils.formatUnits(balanceBN, state.tokenFrom.decimals);
      onAmountChange(balance);
    }
  };

  const changeSlippage = () => {
    const { InputSlippage } = state;
    if (!InputSlippage || isNaN(+InputSlippage) || +InputSlippage < 0) {
      setState((prevState) => ({
        ...prevState,
        InputSlippage: DEFAULT_ALLOWED_SLIPPAGE.toString(),
        slippage: DEFAULT_ALLOWED_SLIPPAGE,
      }));
    } else if (+InputSlippage > MAX_ALLOWED_SLIPPAGE) {
      setState((prevState) => ({
        ...prevState,
        InputSlippage: MAX_ALLOWED_SLIPPAGE.toString(),
        slippage: MAX_ALLOWED_SLIPPAGE,
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        slippage: +InputSlippage,
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
        <CardHeader>
          <Heading size="lg">Swap token </Heading>
        </CardHeader>
        <CardBody>
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
                  tokens={state.availableTokens}
                  onChange={(e) => updatePair('tokenFrom', e)}
                />
              </Flex>

              <Text color="red.300" fontSize="sm" mt={1}>
                {state.validation === 'insufficientFunds' && 'Insufficient funds'}
                {state.validation === 'invalidAmount' && 'invalid amount'}
                {state.validation === 'insufficientAllowance' &&
                  `You need to unlock ${formatLongNumber(+state.srcAmount)} ${
                    state.tokenFrom?.symbol
                  } before swapping`}
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
                      value={
                        state.tokenTo
                          ? formatBigNumber(state.priceRoute?.destAmount, state.tokenTo.decimals)
                          : ''
                      }
                      readOnly
                    ></Input>
                  )}
                  {state.priceRoute?.destUSD && (
                    <Text as="i" fontSize="sm">
                      ~${formatCurrency(state.priceRoute.destUSD)}
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
                <Button flex="1" onClick={unlock} isDisabled={state.pendingUnlocking}>
                  Unlock {state.tokenFrom?.symbol}
                </Button>
              )}

              <Button onClick={submitSwap} flex="1" isDisabled={!!state.validation}>
                Swap
              </Button>
            </Flex>

            <Flex style={styles} direction="column" p={3}>
              <Flex justifyContent="space-between">
                <Text fontSize="sm">Estimated Cost:</Text>
                {state.priceRoute?.gasCostUSD && (
                  <Text as="i" fontSize="sm">
                    ~${formatCurrency(state.priceRoute.gasCostUSD)}
                  </Text>
                )}
              </Flex>

              <Flex justifyContent="space-between">
                <Text fontSize="sm">Minimum Received:</Text>
                {state.tokenTo && (
                  <Text as="i" fontSize="sm">
                    {formatBigNumber(minDestinationAmount?.toString(), state.tokenTo.decimals, 8)}{' '}
                    {state.tokenTo.symbol}
                  </Text>
                )}
              </Flex>

              <Flex justifyContent="space-between">
                <Text fontSize="sm">Slippage (Max allowed 15%):</Text>
                <Flex alignItems="center" gap={0.5}>
                  <Editable
                    value={state.InputSlippage}
                    onChange={(value) =>
                      setState((prevState) => ({
                        ...prevState,
                        InputSlippage: value,
                      }))
                    }
                    onBlur={changeSlippage}
                  >
                    <EditablePreview fontSize="sm" />
                    <Input as={EditableInput} size="sm" />
                  </Editable>
                  <Text fontSize="sm" marginLeft={0}>
                    %
                  </Text>
                </Flex>
              </Flex>

              <Flex justifyContent="space-between">
                <Text fontSize="sm">Deadline:</Text>
                <Text as="i" fontSize="sm">
                  5mn
                </Text>
              </Flex>
            </Flex>
          </Stack>
        </CardBody>
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
