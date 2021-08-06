import { PageHeader } from 'antd';
import React, { useEffect, useState } from 'react';
import PbLayout from '../components/Layout/Layout';
import { TransactionsServices } from '../services/ApiService';
import TransactionsList from '../components/Transactions/TransactionsList';

const transactionServices = new TransactionsServices();

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  const getTransactions = async () => {
    const t = await transactionServices.getAll(null);
    setTransactions(t);
  };

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <PbLayout>
      <PageHeader backIcon={false} title="Transactions" />
      <TransactionsList transactions={transactions}></TransactionsList>
    </PbLayout>
  );
};

export default Transactions;
