import { ChevronDownIcon } from '@chakra-ui/icons';
import { Button, Icon, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import {
  RampInstantEvents,
  RampInstantEventTypes,
  RampInstantSDK
} from '@ramp-network/ramp-instant-sdk';

import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { BsArrowDownLeftCircleFill, BsArrowUpRightCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { usePool } from '../hooks/usePool';
import { depositWithCard } from '../services/transactionsServices';
import { compareAddress } from '../utils';

export const NewTransactionMenu = () => {
  const { pool } = usePool();
  const { isActive, chainId } = useWeb3React();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();

  const walletConnected = isActive && pool?.chain_id === chainId;
  const DepositLogo = () => <Icon as={BsArrowDownLeftCircleFill} boxSize={6} color="green.400" />;
  const WithdrawLogo = () => <Icon as={BsArrowUpRightCircleFill} boxSize={6} color="red.400" />;

  const openRamp = () => {
    new RampInstantSDK({
      hostAppName: 'Pesabooks',
      //swapAsset: 'MATIC_USDC',
      userAddress: pool?.gnosis_safe_address,
      // userEmailAddress: user?.email,
      hostLogoUrl: 'https://pesabooks.com/assets/img/logo-dark.png',
      url: 'https://ri-widget-staging.firebaseapp.com/',
      webhookStatusUrl: `${process.env.REACT_APP_SUPABASE_FUNCTIONS_URL}/ramp-callback`,
    })
      .on<RampInstantEvents>(RampInstantEventTypes.PURCHASE_CREATED, (event) => {
        const purchase = event.payload?.purchase;
        const purchaseViewToken = event.payload?.purchaseViewToken;
        if (!purchase || !pool) return;
        const { id, cryptoAmount, asset, finalTxHash, receiverAddress } = purchase;
        const amount = +ethers.utils.formatUnits(cryptoAmount, asset.decimals);

        // Make sure it is the gnosis safe address
        if (compareAddress(receiverAddress, pool?.gnosis_safe_address)) {
          depositWithCard(pool, id, purchaseViewToken, undefined, undefined, amount, finalTxHash);
        }
      })
      .show();
  };

  return walletConnected ? (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
        New Transaction
      </MenuButton>
      <MenuList>
        <MenuItem icon={<DepositLogo />} onClick={() => navigate(`/pool/${pool?.id}/deposit`)}>
          Deposit
        </MenuItem>
        <MenuItem icon={<DepositLogo />} onClick={openRamp}>
          Deposit with Card
        </MenuItem>
        <MenuItem
          icon={<WithdrawLogo />}
          onClick={() => navigate(`/pool/${pool?.id}/withdraw`)}
          isDisabled={!isAdmin}
        >
          Withdraw
        </MenuItem>
      </MenuList>
    </Menu>
  ) : null;
};
