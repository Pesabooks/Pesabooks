import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { AccountsListDto } from '../../services/ApiService';
import { Table } from 'antd';

interface AccountsListProps {
  accounts: AccountsListDto[];
}

const columns = [
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
  },
];

const AccountList: FC<AccountsListProps> = ({ accounts }) => {
  return (
    <Table
      rowKey={(record) => record.id}
      columns={columns}
      pagination={{ pageSize: 50 }}
      dataSource={accounts}
    />
  );
};

export default AccountList;
