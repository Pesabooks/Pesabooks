import React, { FunctionComponent, useState } from 'react';
import { Avatar, Button, Col, Layout, Menu, Row } from 'antd';
import { PieChartOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import './Layout.scss';

import Title from 'antd/lib/typography/Title';
import { Sidebar } from './Sidebar';
import { signoutRedirect } from '../../services/UserService';

const { Header, Content, Footer, Sider } = Layout;

const items = [
  { key: '1', label: 'Dashboard', path: '/', icon: PieChartOutlined },
  { key: '2', label: 'Members', path: '/members', icon: TeamOutlined },
  { key: '3', label: 'Accounts', path: '/accounts', icon: TeamOutlined },
];
const PbLayout: FunctionComponent = (props) => {
  const { children } = props;

  function signOut() {
    signoutRedirect();
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: '0 24px' }}>
          <Row>
            <Col flex="none">
              <Title>My tontine</Title>
            </Col>
            <Col flex="auto"></Col>
            <Button onClick={signOut} type="text">
              Log out
            </Button>
            <Col flex="none">
              <Avatar size="large" icon={<UserOutlined />} />
            </Col>
          </Row>
        </Header>
        <Content style={{ margin: '0 24px', minHeight: 280 }}>{children}</Content>
        <Footer style={{ textAlign: 'center' }}>Pesabooks© 2021</Footer>
      </Layout>
    </Layout>
  );
};

export default PbLayout;
