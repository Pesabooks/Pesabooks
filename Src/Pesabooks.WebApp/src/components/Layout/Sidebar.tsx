import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { PieChartOutlined, TeamOutlined, BankOutlined } from '@ant-design/icons';
import { PlusMenu } from './PlusMenu';

const { Sider } = Layout;

const items = [
  { key: '1', label: 'Dashboard', path: '/', icon: <PieChartOutlined /> },
  { key: '2', label: 'Members', path: '/members', icon: <TeamOutlined /> },
  { key: '3', label: 'Transactions', path: '/transactions', icon: <BankOutlined /> },
  { key: '4', label: 'Chart of accounts ', path: '/accounts', icon: <BankOutlined /> },
];

export const Sidebar = () => {
  const location = useLocation();
  const history = useHistory();

  const [collapsed, setcollapsed] = useState(false);

  const [selectedKey, setSelectedKey] = useState(
    items.find((_item) => location.pathname == _item.path)?.key
  );

  const onClickMenu = (item) => {
    const clicked = items.find((_item) => _item.key === item.key);
    setSelectedKey(clicked.key);
    history.push(clicked.path);
  };

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setcollapsed}>
      <div className="logo" />
      <div
        style={{ padding: '15px', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
      >
        <PlusMenu />
      </div>
      <Menu theme="dark" selectedKeys={[selectedKey]} mode="inline" onClick={onClickMenu}>
        {items.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};
