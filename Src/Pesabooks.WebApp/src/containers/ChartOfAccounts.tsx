import { Button, message, Modal, PageHeader } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AccountList from '../components/Accounts/AccountList';
import AccountCreateForm from '../components/Accounts/AccountCreateForm';
import PbLayout from '../components/Layout/Layout';
import {
  AccountsListDto,
  AccountsServices,
  ApiException,
  CreateAccountCommand,
} from '../services/ApiService';

const accountService = new AccountsServices();

function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<AccountsListDto[]>([]);

  const [isModalVisibile, setIsModalVisibile] = useState(false);
  const history = useHistory();

  const getAccounts = async () => {
    const accounts = await accountService.getAll(false);
    setAccounts(accounts);
  };

  const createAccount = async (form: CreateAccountCommand) => {
    try {
      await accountService.post(form);
      await getAccounts();
      setIsModalVisibile(false);
    } catch (e) {
      message.error(e.message);
    }
  };

  const deactivateAccount = async (id: number) => {
    await accountService.deactivate(id);
    await getAccounts();
  };

  const viewAccounthistory = (id: number) => {
    history.push(`/account/${id}/history`);
  };

  useEffect(() => {
    getAccounts();
  }, []);

  return (
    <PbLayout>
      <PageHeader
        className="site-page-header"
        backIcon={false}
        title="Chart of accounts"
        subTitle=""
        extra={[
          <Button
            key="1"
            type="primary"
            onClick={() => {
              setIsModalVisibile(true);
            }}
          >
            New Account
          </Button>,
        ]}
      />
      <AccountList
        accounts={accounts}
        onDeactivate={deactivateAccount}
        onViewHistory={viewAccounthistory}
      ></AccountList>
      <AccountCreateForm
        visible={isModalVisibile}
        onCreate={createAccount}
        onCancel={() => setIsModalVisibile(false)}
      ></AccountCreateForm>
    </PbLayout>
  );
}

export default ChartOfAccounts;
