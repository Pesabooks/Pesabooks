import { Layout, Breadcrumb } from 'antd';
import React, { Component } from 'react';
import PbLayout from '../components/Layout/Layout';

const { Header, Content } = Layout;

export class Dashboard extends Component {
  render() {
    return (
      <PbLayout>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>User</Breadcrumb.Item>
          <Breadcrumb.Item>Bill</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
          Bill is a cat.
        </div>
      </PbLayout>
    );
  }
}

export default Dashboard;
