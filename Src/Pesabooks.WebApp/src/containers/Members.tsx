import { Button, PageHeader } from 'antd';
import React, { Component, useEffect, useState } from 'react';
import PbLayout from '../components/Layout/Layout';
import MembersList from '../components/Members/MembersList';
import { MemberListDto, MembersServices } from '../services/ApiService';

const Members = () => {
  const [members, setMembers] = useState<MemberListDto[]>([]);

  useEffect(() => {
    const memberService = new MembersServices();
    memberService.getAll(false).then((members) => setMembers(members));
  }, []);

  const setIsModalVisibile = (isVisible: boolean) => console.log();

  return (
    <PbLayout>
      <PageHeader
        className="site-page-header"
        backIcon={false}
        title="Members"
        extra={[
          <Button
            key="1"
            type="primary"
            onClick={() => {
              setIsModalVisibile(true);
            }}
          >
            New Member
          </Button>,
        ]}
      />
      <MembersList members={members}></MembersList>
    </PbLayout>
  );
};

export default Members;
