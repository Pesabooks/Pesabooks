import { Select } from 'antd';
import React from 'react';
import { MemberListDto } from '../../services/ApiService';

interface Props {
  members: MemberListDto[];
  disable?: boolean;
  value?: number;
  onChange?: (value: number) => void;
}

const SelectMember = ({ members, disable, value, onChange }: Props) => {
  return (
    <Select style={{ minWidth: '200px' }} disabled={disable} value={value} onChange={onChange}>
      {members.map((member) => (
        <Select.Option key={member.id} value={member.id}>
          {member.firstName + ' ' + member.lastName}
        </Select.Option>
      ))}
    </Select>
  );
};

export default SelectMember;
