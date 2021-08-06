/* eslint-disable react/display-name */
import React, { FC } from 'react';
import { AccountsListDto } from '../../services/ApiService';
import { Dropdown, Menu, Modal, Popconfirm, Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

interface AccountsListProps {
  accounts: AccountsListDto[];
  onDeactivate: (id: number) => void;
  onViewHistory: (id: number) => void;
}

const AccountList: FC<AccountsListProps> = ({ accounts, onDeactivate, onViewHistory }) => {
  const handleMenuClick = (e) => {
    console.log('click', e);
  };

  const columns: ColumnType<AccountsListDto>[] = [
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
    {
      title: 'Balance',
      align: 'right',
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (text, record) => (
        <Dropdown.Button
          onClick={() => onViewHistory(record.id)}
          overlay={menu(record.id)}
          trigger={['click']}
        >
          View account History
        </Dropdown.Button>
      ),
    },
  ];

  function confirmDeactivate(id: number) {
    confirm({
      title: 'Do you Want to delete these items?',
      icon: <ExclamationCircleOutlined />,
      content: 'Some descriptions',
      onOk() {
        onDeactivate(id);
      },
    });
  }

  const menu = (id: number) => (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key={`edit${id}`}>Edit</Menu.Item>
      <Menu.Item onClick={() => confirmDeactivate(id)} key={`delete${id}`}>
        Delete
      </Menu.Item>
    </Menu>
  );

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
