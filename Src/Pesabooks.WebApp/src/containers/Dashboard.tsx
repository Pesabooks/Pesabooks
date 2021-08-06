import { Layout, Breadcrumb, PageHeader, Card, Col, Row, Statistic } from 'antd';
import React, { Component } from 'react';
import PbLayout from '../components/Layout/Layout';

const { Header, Content } = Layout;

export class Dashboard extends Component {
  render() {
    return (
      <PbLayout>
        <PageHeader backIcon={false} title="Dashboard" subTitle="" />
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Balance"
                value={5500}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                suffix="$"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Loan" value={3000} precision={2} suffix="$" />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Savings" value={12000} precision={2} suffix="$" />
            </Card>
          </Col>
        </Row>
      </PbLayout>
    );
  }
}

export default Dashboard;
