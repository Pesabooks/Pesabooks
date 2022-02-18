import { Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MembersTable } from '../components/MembersTable';
import { usePool } from '../hooks/usePool';
import { getMembers } from '../services/membersService';
import { Member } from '../types/Member';

export const MembersPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const { pool } = usePool();

  useEffect(() => {
    if (pool) getMembers(pool.id).then((members) => setMembers(members ?? []));
  }, [pool]);

  return (
    <>
      <Helmet>
        <title>Members | {pool?.name}</title>
      </Helmet>
      <Heading as="h2" mb={4} size="lg">
        Members
      </Heading>
      <MembersTable members={members}></MembersTable>
    </>
  );
};
