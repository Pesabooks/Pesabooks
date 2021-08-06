import { Col, DatePicker, Form, Input, InputNumber, Modal, Row } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  AccountCategory,
  AccountsListDto,
  AccountsServices,
  CreateTransactionCommand,
  ICreateTransactionCommand,
  MemberListDto,
  MembersServices,
  TransactionType,
} from '../../services/ApiService';
import SelectAccount from '../Accounts/SelectAccount';
import SelectMember from '../Members/SelectMember';
import './DepositForm.scss';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

interface Props {
  visible: boolean;
  onCreate: (account: ICreateTransactionCommand) => void;
  onCancel: () => void;
}

const accountService = new AccountsServices();
const membersService = new MembersServices();

const getCashAccount = (list: AccountsListDto[]) => {
  return list.find((a) => a.category === 'Cash');
};

const getLiabilitiesAccount = (list: AccountsListDto[]) => {
  return list.filter((a) => a.type === 'Liability');
};

const DepositForm = ({ visible, onCreate, onCancel }: Props) => {
  const [form] = Form.useForm<ICreateTransactionCommand>();

  const [state, setState] = useState<{ accounts: AccountsListDto[]; members: MemberListDto[] }>({
    accounts: [],
    members: [],
  });

  useEffect(() => {
    (async () => {
      const accounts = await accountService.getAll(false);
      const members = await membersService.getAll(false);
      setState({ accounts, members });

      const cashAccount = getCashAccount(accounts);
      form.setFieldsValue({ debitedAccountId: cashAccount?.id });
    })();
  }, []);

  const { members, accounts } = state;

  const handleOk = () => {
    form.validateFields().then((values) => {
      onCreate({ ...values, transactionType: TransactionType.Deposit });
    });
  };

  const handleCancel = () => {
    if (form)
      confirm({
        title: 'Do you Want to leave without saving?',
        icon: <ExclamationCircleOutlined />,
        onOk() {
          form.resetFields();
          onCancel();
        },
      });
  };

  return (
    <Modal
      className="depositForm"
      width={900}
      title="Member Deposit"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose={true}
    >
      <Form name="Deposit" form={form} layout="vertical" initialValues={{ date: dayjs() }}>
        <Row gutter={16} className="rowAutoCompleted">
          <Col>
            <Form.Item label="Deposit to:" name="debitedAccountId">
              <SelectAccount accounts={accounts} />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="Date:" name="date">
              <DatePicker />
            </Form.Item>
          </Col>
          <Col flex="auto"></Col>
          <Col>{/* <div>Amout:500</div> */}</Col>
        </Row>
        <Row gutter={16}>
          <Col>
            <Form.Item label="Received from:" name="memberId">
              <SelectMember members={members} />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="Account:" name="creditedAccountId">
              <SelectAccount accounts={getLiabilitiesAccount(accounts)} />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="Description:" name="description">
              <Input />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label="Amount:" name="amount">
              <InputNumber />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default DepositForm;
