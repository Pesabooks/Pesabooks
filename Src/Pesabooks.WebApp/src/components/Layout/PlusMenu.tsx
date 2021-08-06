import { Button, Col, message, Popover, Row, Space } from 'antd';
import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import './PlusMenu.scss';
import DepositForm from '../Transactions/DepositForm';
import { CreateTransactionCommand, TransactionsServices } from '../../services/ApiService';

const transactionsServices = new TransactionsServices();

export const PlusMenu = () => {
  const [visible, setVisible] = useState(false);

  const [isDepositFormVisible, setIsDepositFormVisible] = useState(false);
  const [isWithdrawalFormVisible, setIsWithdrawalFormVisible] = useState(false);
  const [isChargeFormVisible, setIsChargeFormVisible] = useState(false);
  const [isJournalEntryFormVisible, setIsJournalEntryFormVisible] = useState(false);

  const deposit = async (form: CreateTransactionCommand) => {
    try {
      await transactionsServices.post(form);
      setIsDepositFormVisible(false);
    } catch (e) {
      message.error(e.message);
    }
  };

  const content = (
    <div style={{ padding: '15px' }} className="plusmenu" onClick={() => setVisible(false)}>
      <Row gutter={32}>
        <Col span={12}>
          <Space direction="vertical">
            <h3>Members</h3>
            <Button
              type="text"
              onClick={() => {
                setIsDepositFormVisible(true);
              }}
            >
              Deposit
            </Button>
            <Button
              type="text"
              onClick={() => {
                setIsWithdrawalFormVisible(true);
              }}
            >
              Withdrawal
            </Button>
            <Button
              type="text"
              onClick={() => {
                setIsChargeFormVisible(true);
              }}
            >
              Charge
            </Button>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical">
            <h3>Other</h3>
            <Button
              type="text"
              onClick={() => {
                setIsJournalEntryFormVisible(true);
              }}
            >
              Journal entry
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
  return (
    <>
      <Popover
        arrowPointAtCenter={true}
        placement="bottom"
        content={content}
        trigger="click"
        visible={visible}
        onVisibleChange={setVisible}
      >
        <Button
          style={{ width: '180px' }}
          type="primary"
          ghost
          shape="round"
          icon={<PlusOutlined />}
          size="large"
        >
          New
        </Button>
      </Popover>
      {isDepositFormVisible && (
        <DepositForm
          visible={isDepositFormVisible}
          onCreate={deposit}
          onCancel={() => setIsDepositFormVisible(false)}
        ></DepositForm>
      )}
    </>
  );
};
