import { Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import React from 'react';
import { JournalEntryDto } from '../../services/ApiService';

interface Props {
  entries: JournalEntryDto[];
}

const JournalEntriesList = ({ entries }: Props) => {
  const columns: ColumnType<JournalEntryDto>[] = [
    {
      title: 'Date',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      // eslint-disable-next-line react/display-name
      render: (test, record) => {
        const date: Date = record.transactionDate;
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      title: 'Type',
      dataIndex: 'transactionType',
      key: 'transactionType',
    },
    {
      title: 'Beneficiary',
      dataIndex: 'transactionMemberFullName',
      key: 'transactionMemberFullName',
    },
    {
      title: 'Description',
      dataIndex: 'transactionDescription',
      key: 'transactionDescription',
    },
    {
      title: 'Debit',
      dataIndex: 'amount',
      key: 'debit',
      // eslint-disable-next-line react/display-name
      render: (text, record) => {
        const type = record.type;
        return type == 'Debit' && <div>{text}</div>;
      },
    },
    {
      title: 'Credit',
      dataIndex: 'amount',
      key: 'credit',
      // eslint-disable-next-line react/display-name
      render: (text, record) => {
        const type = record.type;
        return type == 'Credit' && <div>{text}</div>;
      },
    },
  ];
  return (
    <Table
      rowKey={(record) => record.id}
      columns={columns}
      pagination={{ pageSize: 50 }}
      dataSource={entries}
    />
  );
};

export default JournalEntriesList;
