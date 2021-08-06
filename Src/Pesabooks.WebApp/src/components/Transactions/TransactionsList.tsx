import { Table } from 'antd';
import React from 'react';
import { TransactionDto } from '../../services/ApiService';

interface Props {
  transactions: TransactionDto[];
}

const TransactionsList = ({ transactions }: Props) => {
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      // eslint-disable-next-line react/display-name
      render: (test, record) => {
        const date: Date = record.date;
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Member',
      dataIndex: 'memberFullName',
      key: 'memberFullName',
    },
    {
      title: 'Category',
      dataIndex: 'creditedAccountName',
      key: 'category',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      // eslint-disable-next-line react/display-name
      render: (text, record) => {
        return record.transactionDirection == 'Incoming' ? (
          <div style={{ color: 'green' }}>{text}</div>
        ) : (
          <div>-{text}</div>
        );
      },
    },
  ];
  return (
    <Table
      rowKey={(record) => record.id}
      columns={columns}
      pagination={{ pageSize: 50 }}
      dataSource={transactions}
    />
  );
};

export default TransactionsList;
