import { PageHeader, Row, Statistic } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import JournalEntriesList from '../components/Accounts/JournalEntriesList';
import { AccountsServices, JournalEntryDto } from '../services/ApiService';
import PbLayout from '../components/Layout/Layout';

const accountService = new AccountsServices();

const AccountHistory = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [journalEntries, setJournalEntries] = useState<JournalEntryDto[]>([]);

  useEffect(() => {
    accountService.getJournalEntries(+id).then((entries) => setJournalEntries(entries));
  }, []);

  return (
    <PbLayout>
      <PageHeader
        onBack={() => history.goBack()}
        className="site-page-header"
        title="History of the account"
        subTitle="Cash"
      >
        <Row>
          <Statistic title="Balance" prefix="$" value={3345.08} />
        </Row>
      </PageHeader>
      <JournalEntriesList entries={journalEntries}></JournalEntriesList>
    </PbLayout>
  );
};

export default AccountHistory;
