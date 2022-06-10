import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, Flex, Link, Text } from '@chakra-ui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTxScanLink } from '../../services/transactionsServices';
import { Transaction } from '../../types';
import { Card, CardBody, CardHeader } from '../Card';

interface TransactionSubmittedModalProps {
  description: string;
  transaction: Transaction;
  chainId: number;
}
export const TransactionSubmittedModal = ({
  description,
  chainId,
  transaction,
}: TransactionSubmittedModalProps) => {
  const navigate = useNavigate();
  const link = getTxScanLink(transaction.hash, chainId);

  return (
    <Card>
      <CardHeader p="6px 0px 22px 0px">
        <Text fontSize="lg" fontWeight="bold">
          Transaction Pending
        </Text>
      </CardHeader>
      <CardBody mb={30}>{description}</CardBody>

      <Flex justifyContent="space-between">
        <Button onClick={() => navigate(`../transactions?id=${transaction.id}`)}>
          View Transaction
        </Button>
        {transaction.hash && (
          <Link href={link} isExternal>
            <Button rightIcon={<ExternalLinkIcon />}>View Receipt</Button>
          </Link>
        )}
      </Flex>
    </Card>
  );
};
