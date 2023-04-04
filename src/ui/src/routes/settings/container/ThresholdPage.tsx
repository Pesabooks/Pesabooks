import { Card, CardBody, CardHeader, Flex, Spinner, Text, useDisclosure } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { useRef } from 'react';
import { ButtonWithAdmingRights } from '../../../components/withConnectedWallet';
import { usePool } from '../../../hooks/usePool';
import { useSafeAdmins } from '../../../hooks/useSafeAdmins';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { estimateTransaction } from '../../../services/estimationService';
import { buildChangeThresholdTx } from '../../../services/transaction-builder';
import { submitTransaction } from '../../../services/transactionsServices';
import {
    ReviewAndSendTransactionModal,
    ReviewAndSendTransactionModalRef
} from '../../transactions/components/ReviewAndSendTransactionModal';
import { ChangeThresholdModal } from '../components/ChangeThresholdModal';

export const ThresholdPage = () => {
  const { pool } = usePool();
  const { provider, user } = useWeb3Auth();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const reviewTxRef = useRef<ReviewAndSendTransactionModalRef>(null);
  const signer = (provider as Web3Provider)?.getSigner();

  const { safeAdmins: adminAddressess, threshold: currentThreshold, loading } = useSafeAdmins();

  const changeThreshold = async (threshold: number) => {
    if (pool) {
      const transaction = await buildChangeThresholdTx(signer, pool, threshold, currentThreshold);

      reviewTxRef.current?.open(
        `Change required confirmations to ${threshold}`,
        transaction.type,
        () =>
          currentThreshold > 1
            ? Promise.resolve(BigNumber.from(0))
            : estimateTransaction(provider!, transaction.transaction_data),
        async () => {
          const tx = await submitTransaction(user!, signer, pool!, transaction!);
          onClose();
          return { hash: tx?.hash, internalTxId: tx?.id };
        },
      );
    }
  };

  return (
    <>
      <Card>
        <CardHeader mb="40px">
          <Flex justify="space-between" align="center" w="100%">
            <Flex direction="column">
              <Text fontSize="lg" fontWeight="bold" mb="6px">
                Required confirmations
              </Text>

              <Flex>
                <Text color="gray.400" fontSize="sm" fontWeight="normal" mr={2}>
                  Every transaction requires the confirmation of{' '}
                </Text>
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <Text color="gray.400" fontSize="sm" fontWeight="normal">
                    <b>
                      {currentThreshold} out of {adminAddressess.length}
                    </b>
                  </Text>
                )}
                <Text color="gray.400" fontSize="sm" fontWeight="normal" ml={2}>
                  members
                </Text>
              </Flex>
            </Flex>
            <ButtonWithAdmingRights size="sm" onClick={onOpen}>
              Change
            </ButtonWithAdmingRights>
          </Flex>
        </CardHeader>
        <CardBody></CardBody>
      </Card>

      {isOpen && (
        <ChangeThresholdModal
          isOpen={isOpen}
          onClose={onClose}
          onChange={changeThreshold}
          currenThreshold={currentThreshold}
          adminsCount={adminAddressess.length}
        />
      )}
      <ReviewAndSendTransactionModal ref={reviewTxRef} />
    </>
  );
};
