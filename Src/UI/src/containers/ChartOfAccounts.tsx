import { message, PageHeader } from 'antd';
import React, { useEffect, useState } from 'react';
import AccountList from '../components/Accounts/AccountList';
import PbLayout from '../components/Layout/Layout';
import { AccountsListDto, AccountsServices, ApiException } from '../services/ApiService';

function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<AccountsListDto[]>([]);
  useEffect(() => {
    const accountService = new AccountsServices();
    accountService.getAll(false, false).then((a) => setAccounts(a));
  }, []);
  return (
    <PbLayout>
      <PageHeader
        className="site-page-header"
        backIcon={false}
        title="Chart of accounts"
        subTitle=""
      />
      <AccountList accounts={accounts}></AccountList>
    </PbLayout>
  );
}

export default ChartOfAccounts;
