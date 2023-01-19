import { Flex, Spinner, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useRef } from 'react';
import { Card, CardBody, CardHeader } from '../../../components/Card';
import { ButtonWithAdmingRights } from '../../../components/withConnectedWallet';
import { usePool } from '../../../hooks/usePool';
import { useSafeAdmins } from '../../../hooks/useSafeAdmins';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { changeThreshold } from '../../../services/transactionsServices';
import {
  ReviewTransactionModal,
  ReviewTransactionModalRef
} from '../../transactions/components/ReviewTransactionModal';
import {
  SubmittingTransactionModal,
  SubmittingTxModalRef
} from '../../transactions/components/SubmittingTransactionModal';
import {
  TransactionSubmittedModal,
  TransactionSubmittedModalRef
} from '../../transactions/components/TransactionSubmittedModal';
import { ChangeThresholdModal } from '../components/ChangeThresholdModal';

export const ThresholdPage = () => {

  const { pool } = usePool();
  const { provider } = useWeb3Auth();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const toast = useToast();
  const reviewTxRef = useRef<ReviewTransactionModalRef>(null);
  const txSubmittedRef = useRef<TransactionSubmittedModalRef>(null);
  const submittingRef = useRef<SubmittingTxModalRef>(null);
  const signer = (provider as Web3Provider)?.getSigner();

  const { safeAdmins:adminAddressess, threshold:currentThreshold, loading } = useSafeAdmins();

  const reviewChangeThresholdTx = (threshold: number) => {
    reviewTxRef.current?.open(
      `Change required confirmations to ${threshold}`,
      'changeThreshold',
      threshold,
      onChangeThreshold,
    );
  };

  const onChangeThreshold = async (confirmed: boolean, threshold: number) => {
    if (confirmed && pool) {
      try {
        submittingRef.current?.open('changeThreshold');

        let tx = await changeThreshold(signer, pool, threshold, currentThreshold);

        if (tx) txSubmittedRef.current?.open(tx.type, tx.hash, tx.id);

        onClose();
      } catch (e: any) {
        toast({
          title: e?.data?.message ?? e.message,
          status: 'error',
          isClosable: true,
        });
      } finally {
        submittingRef.current?.close();
      }
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
          onChange={reviewChangeThresholdTx}
          currenThreshold={currentThreshold}
          adminsCount={adminAddressess.length}
        />
      )}
      <ReviewTransactionModal ref={reviewTxRef} />
      <TransactionSubmittedModal ref={txSubmittedRef} chainId={pool?.chain_id} />
      <SubmittingTransactionModal ref={submittingRef} />
    </>
  );
};
