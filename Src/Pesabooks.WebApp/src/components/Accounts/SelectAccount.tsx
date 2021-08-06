import { Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { AccountsListDto, AccountsServices } from '../../services/ApiService';

interface Props {
  accounts: AccountsListDto[];
  disable?: boolean;
  value?: number;
  onChange?: (value: number) => void;
}

const SelectAccount = ({ accounts, disable, value, onChange }: Props) => {
  return (
    <Select style={{ minWidth: '200px' }} disabled={disable} value={value} onChange={onChange}>
      {accounts.map((account) => (
        <Select.Option key={account.id} value={account.id}>
          {account.name}
        </Select.Option>
      ))}
    </Select>
  );
};

export default SelectAccount;
