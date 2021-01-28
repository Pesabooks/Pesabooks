import { PageHeader } from 'antd';
import React, { Component } from 'react';
import PbLayout from '../components/Layout/Layout';

export class Members extends Component {
  render() {
    return (
      <PbLayout>
        <PageHeader className="site-page-header" backIcon={false} title="Members" subTitle="" />
      </PbLayout>
    );
  }
}

export default Members;
