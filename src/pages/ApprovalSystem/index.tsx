import { useModel } from '@@/exports';
import {PlusOutlined, UploadOutlined} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import {Button, Select, Tabs, Upload} from 'antd';
import React from 'react';
import {AddApprovalInfoRequest, ApprovalInfoVO} from "@/model/approvalsystem";
import { useApprovalPage } from "@/hooks/approval/Hook.useApprovalPage";
import {isLogin} from "@/api/usermanagement";

const { TabPane } = Tabs;

export const approvalStatusConfig = {
  0: { text: '待审批', status: 'Default' },
  1: { text: '已批准', status: 'Success' },
  2: { text: '已拒绝', status: 'Error' },
};

const ApprovalSystem: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { state, handleModalOpen, handleFileUpload, handleApprovalChange, handleAddApproval, actionRef } = useApprovalPage(initialState.currentUser.userId);

  const intl = useIntl();

  const approvalColumns: ProColumns<ApprovalInfoVO>[] = [
    {
      title: <FormattedMessage id="审批发起人" />,
      dataIndex: 'approvalInitiatorName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="审批接收人" />,
      dataIndex: 'approvalReceiverName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="审批类型" />,
      dataIndex: 'approvalType',
      valueType: 'digit',
    },
    {
      title: <FormattedMessage id="文件链接" />,
      dataIndex: 'approvalFileUrl',
      valueType: 'text',
      render: (_, record) => (
        <a href={record.approvalFileUrl} target="_blank" rel="noopener noreferrer">
          {record.approvalFileUrl}
        </a>
      ),
    },
    {
      title: <FormattedMessage id="创建时间" />,
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="更新时间" />,
      dataIndex: 'updateTime',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      dataIndex: 'approvalStatus',
      valueType: 'select',
      valueEnum: approvalStatusConfig,
      renderFormItem: (_, { record }) => (
        <Select
          defaultValue={record?.approvalStatus ?? 0} // 使用可选链和空值合并运算符
          onChange={(value) => handleApprovalChange(record, value)} // 使用 handleApprovalChange 处理状态更改
        >
          <Select.Option value={0}>待审批</Select.Option>
          <Select.Option value={1}>通过</Select.Option>
          <Select.Option value={2}>拒绝</Select.Option>
        </Select>
      ),
    },
  ];

  const columns: ProColumns<ApprovalInfoVO>[] = [
    {
      title: <FormattedMessage id="审批发起人" />,
      dataIndex: 'approvalInitiatorName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="审批接收人" />,
      dataIndex: 'approvalReceiverName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="审批类型" />,
      dataIndex: 'approvalType',
      valueType: 'digit',
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      valueType: 'select',
      valueEnum: approvalStatusConfig,
    },
    {
      title: <FormattedMessage id="文件链接" />,
      dataIndex: 'approvalFileUrl',
      valueType: 'text',
      render: (_, record) => (
        <a href={record.approvalFileUrl} target="_blank" rel="noopener noreferrer">
          {record.approvalFileUrl}
        </a>
      ),
    },
    {
      title: <FormattedMessage id="创建时间" />,
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="更新时间" />,
      dataIndex: 'updateTime',
      valueType: 'dateTime',
    },
  ];

  return (
    <PageContainer>
      <Tabs defaultActiveKey="1">
        <TabPane tab="阅读审批" key="1">
          <ProTable<ApprovalInfoVO, API.PageParams>
            headerTitle={intl.formatMessage({
              id: 'pages.searchTable.title',
              defaultMessage: 'Enquiry form',
            })}
            actionRef={actionRef}
            rowKey="key"
            search={{
              labelWidth: 'auto',
              filterType: 'query',
            }}
            cardBordered
            toolBarRender={() => [
              <Button
                type="primary"
                key="primary"
                onClick={() => handleModalOpen('createModalOpen', true)}
              >
                <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
              </Button>,
            ]}
            request={async () => {
              await isLogin();
              return {};
              // return getUsers(initialState.currentUser?.userId || '');
            }}
            columns={columns}
          />
        </TabPane>
        <TabPane tab="待处理审批" key="2">
          <ProTable<ApprovalInfoVO, API.PageParams>
            headerTitle={intl.formatMessage({
              id: 'pages.searchTable.title',
              defaultMessage: 'Enquiry form',
            })}
            actionRef={actionRef}
            rowKey="key"
            search={{
              labelWidth: 'auto',
              filterType: 'query',
            }}
            cardBordered
            toolBarRender={() => [
              <Button
                type="primary"
                key="primary"
                onClick={() => handleModalOpen('createModalOpen', true)}
              >
                <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
              </Button>,
            ]}
            request={async () => {
              await isLogin();
              return {};
               //return getUsers(initialState.currentUser?.userId || '');
            }}
            columns={approvalColumns}
          />
        </TabPane>
      </Tabs>

      <ModalForm
        title="新加入审批"
        width="400px"
        open={state.createModalOpen}
        onOpenChange={(isOpen) => handleModalOpen('createModalOpen', isOpen)}
        onFinish={async (values) => {
          const data: AddApprovalInfoRequest = {
            ...values,
            approvalFileUrl: state.fileUrl, // 使用上传后的文件URL
          };
          await handleAddApproval(data);
        }}
      >
        <ProFormText
          name="approvalInitiatorName"
          label="审批发起人"
          rules={[{ required: true, message: '请输入审批发起人' }]}
        />
        <ProFormText
          name="approvalReceiverName"
          label="审批接收人"
          rules={[{ required: true, message: '请输入审批接收人' }]}
        />
        <ProFormTextArea name="approvalDesc" label="审批描述" />

        <Upload
          name="file"
          showUploadList={false}
          beforeUpload={async (file) => {
            await handleFileUpload(file);
            return false; // 阻止自动上传，使用自定义上传逻辑
          }}
        >
          <Button icon={<UploadOutlined />}>点击上传文件</Button>
        </Upload>
      </ModalForm>
    </PageContainer>
  );
};

export default ApprovalSystem;
