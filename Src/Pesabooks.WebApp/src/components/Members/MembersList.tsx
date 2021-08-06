import { Dropdown, Menu, Table } from 'antd';
import React, { ReactElement } from 'react';
import { MemberListDto } from '../../services/ApiService';

interface Props {
  members: MemberListDto[];
}

function MembersList({ members }: Props): ReactElement {
  const handleButtonClick = (e) => {
    console.log('click left button', e);
  };

  const handleMenuClick = (e) => {
    console.log('click', e);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">1st menu item</Menu.Item>
      <Menu.Item key="2">2nd menu item</Menu.Item>
      <Menu.Item key="3">3rd menu item</Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'code',
      key: 'code',
      // eslint-disable-next-line react/display-name
      render: (text, record) => (
        <div>
          {record.firstName} {record.lastName}
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '',
      key: 'action',
      // // eslint-disable-next-line react/display-name
      // render: () => (
      //   <Dropdown.Button onClick={handleButtonClick} overlay={menu}>
      //     View Histore
      //   </Dropdown.Button>
      // ),
    },
  ];

  return (
    <Table
      rowKey={(record) => record.id}
      columns={columns}
      pagination={{ pageSize: 50 }}
      dataSource={members}
    />
  );
}

export default MembersList;
