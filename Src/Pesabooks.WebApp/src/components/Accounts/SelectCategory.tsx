import { Select } from 'antd';
import React from 'react';
import { AccountCategory } from '../../services/ApiService';

interface Props {
  value?: number;
  onChange?: (value: number) => void;
}

const SelectCategory = ({ value, onChange }: Props) => {
  const categories = Object.keys(AccountCategory)
    .filter((x) => !(parseInt(x) >= 0))
    .map((k) => ({
      key: k,
      value: AccountCategory[k],
    }));

  return (
    <Select value={value} onChange={onChange}>
      {categories.map((category) => (
        <Select.Option key={category.value} value={category.value}>
          {category.key}
        </Select.Option>
      ))}
    </Select>
  );
};

export default SelectCategory;
