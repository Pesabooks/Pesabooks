import React, { useEffect, useState } from 'react';
import { Checkbox, Col, Form, Input, Modal, Row, Select } from 'antd';
import { AccountsListDto, AccountsServices, CreateAccountCommand } from '../../services/ApiService';
import SelectCategory from './SelectCategory';
import SelectAccount from './SelectAccount';

interface Props {
  visible: boolean;
  onCreate: (account: CreateAccountCommand) => void;
  onCancel: () => void;
}

const accountService = new AccountsServices();

const AccountCreateForm = ({ visible, onCreate, onCancel }: Props) => {
  const [form] = Form.useForm();
  const [isLinkedAccount, setIsLinkedAccount] = useState(false);

  const [accounts, setAccounts] = useState<AccountsListDto[]>([]);

  useEffect(() => {
    accountService.getAll(false).then((a) => setAccounts(a));
  }, []);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onCreate(values);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsLinkedAccount(false);
    onCancel();
  };

  return (
    <>
      <Modal
        title="Account"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose={true}
      >
        <Form name="createAccount" form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'This field is mandatory' }]}
              >
                <SelectCategory />
              </Form.Item>

              <div>Description compte selection</div>
            </Col>
            <Col span={12}>
              <Form.Item label="Code" name="code">
                <Input />
              </Form.Item>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'This field is mandatory' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item label="Description" name="description">
                <Input type="textarea" />
              </Form.Item>
              <div>
                <Checkbox
                  checked={isLinkedAccount}
                  onChange={(e) => setIsLinkedAccount(e.target.checked)}
                >
                  is a linked account
                </Checkbox>
                <Form.Item label="" name="parentAccountId">
                  <SelectAccount accounts={accounts} disable={!isLinkedAccount} />
                </Form.Item>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default AccountCreateForm;
