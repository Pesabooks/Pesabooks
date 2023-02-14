import { Flex, Spinner, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useRef } from 'react';
import { Card, CardBody, CardHeader } from '../../../components/Card';
import {
  ReviewAndSubmitTransaction,
  ReviewAndSubmitTransactionRef
} from '../../../components/ReviewAndSubmitTransaction';
import { ButtonWithAdmingRights } from '../../../components/withConnectedWallet';
import { usePool } from '../../../hooks/usePool';
import { useSafeAdmins } from '../../../hooks/useSafeAdmins';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { changeThreshold } from '../../../services/transactionsServices';
import { ChangeThresholdModal } from '../components/ChangeThresholdModal';

export const ThresholdPage = () => {
  const { pool } = usePool();
  const { provider, user } = useWeb3Auth();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const toast = useToast();
  const reviewTxRef = useRef<ReviewAndSubmitTransactionRef>(null);
  const signer = (provider as Web3Provider)?.getSigner();

  const { safeAdmins: adminAddressess, threshold: currentThreshold, loading } = useSafeAdmins();

  const reviewChangeThresholdTx = (threshold: number) => {
    reviewTxRef.current?.review(
      `Change required confirmations to ${threshold}`,
      'changeThreshold',
      threshold,
      onChangeThreshold,
    );
  };

  const onChangeThreshold = async (confirmed: boolean, threshold: number) => {
    if (confirmed && pool) {
      try {
        reviewTxRef.current?.openSubmitting('changeThreshold');

        let tx = await changeThreshold(user!, signer, pool, threshold, currentThreshold);

        if (tx) reviewTxRef.current?.openTxSubmitted(tx.type, tx.hash, tx.id);

        onClose();
      } catch (e: any) {
        toast({
          title: e?.data?.message ?? e.message,
          status: 'error',
          isClosable: true,
        });
      } finally {
        reviewTxRef.current?.closeSubmitting();
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
      <ReviewAndSubmitTransaction ref={reviewTxRef} chainId={pool!.chain_id} />
    </>
  );
};
