import {useModel} from '@@/exports';
import {PlusOutlined, UploadOutlined} from '@ant-design/icons';
import type {ProColumns} from '@ant-design/pro-components';
import {ModalForm, PageContainer, ProFormSelect, ProFormText, ProTable,} from '@ant-design/pro-components';
import {FormattedMessage, useIntl} from '@umijs/max';
import {Button, Input, Select, Tabs, Upload} from 'antd';
import React from 'react';
import {AddApprovalInfoRequest, ApprovalInfoVO} from "@/model/approvalsystem";
import {useApprovalPage} from "@/hooks/approval/Hook.useApprovalPage";

const { TabPane } = Tabs;

export const approvalStatusConfig = {
  3: { text: '待审批', status: 'Default' },
  1: { text: '已批准', status: 'Success' },
  2: { text: '已拒绝', status: 'Error' },
};

const ApprovalSystem: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { state, handleModalOpen, handleFileUpload, handleApprovalChange, handleAddApproval, downloadFromOSS, actionRef } = useApprovalPage(initialState.currentUser?.id || '');

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
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault(); // 阻止默认的<a>标签行为
            await downloadFromOSS(record.approvalFileUrl); // 调用模拟的下载函数
          }}
          style={{ marginRight: 8 }}
        >
          下载文件
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
      title: '审批状态',
      dataIndex: 'approvalStatus',
      valueType: 'select',
      valueEnum: approvalStatusConfig,
    },
    {
      title: '操作',
      dataIndex: 'approvalStatus',
      render: (_, record) => {
        const isApproved = record?.approvalStatus === 1; // 已批准
        const isRejected = record?.approvalStatus === 2; // 已拒绝

        return (
          <div>
            <Button
              type="primary"
              disabled={isApproved || isRejected} // 如果已批准或已拒绝，则按钮不可点击
              onClick={() => handleApprovalChange(record, 1)} // 点击批准
            >
              批准
            </Button>
            <Button
              type="default"
              disabled={isApproved || isRejected} // 如果已批准或已拒绝，则按钮不可点击
              onClick={() => handleApprovalChange(record, 2)} // 点击拒绝
              style={{ marginLeft: 8 }} // 添加间距
            >
              拒绝
            </Button>
          </div>
        );
      },
    },
    // {
    //   title: '评论',
    //   dataIndex: 'comment',
    //   render: (_, record) => (
    //     <Input
    //       placeholder="输入评论"
    //       defaultValue={record.comment} // 如果有默认值，可以设置
    //       onBlur={(e) => {
    //         const comment = e.target.value;
    //         // 在这里处理评论保存逻辑，比如发送API请求
    //         console.log(`Comment for record ${record.id}: ${comment}`);
    //       }}
    //     />
    //   ),
    // }
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
      title: <FormattedMessage id="文件链接" />,
      dataIndex: 'approvalFileUrl',
      valueType: 'text',
      render: (_, record) => (
        <div>
          <a
            href="#"
            onClick={async (e) => {
              e.preventDefault(); // 阻止默认的<a>标签行为
              await downloadFromOSS(record.approvalFileUrl); // 调用模拟的下载函数
            }}
            style={{ marginRight: 8 }}
          >
            下载文件
          </a>
        </div>
      ),
    },
    {
      title: <FormattedMessage id="上传文件" />,
      dataIndex: 'approvalFileUrl',
      valueType: 'text',
      render: (_, record) => (
        <div>
          <Upload
            name="file"
            showUploadList={false}
            beforeUpload={async (file) => {
              record.approvalFileUrl = await handleFileUpload(file, record.id);
              actionRef.current?.reload();
              return false; // 阻止自动上传，使用自定义上传逻辑
            }}
          >
            <Button icon={<UploadOutlined />}>重新上传</Button>
          </Upload>
        </div>
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
      title: '审批状态',
      dataIndex: 'approvalStatus',
      valueType: 'select',
      valueEnum: approvalStatusConfig,
    },
  ];

  return (
    <PageContainer>
      <Tabs defaultActiveKey="1">
        <TabPane tab="我发起的" key="1">
          <ProTable<ApprovalInfoVO, API.PageParams>
            headerTitle={intl.formatMessage({
              id: '审批管理',
              defaultMessage: '审批管理',
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
            loading={state.loadingInitiator} // Spinner for Initiator data
            dataSource={state.initiatorData} // Use fetched data
            columns={columns}
          />
        </TabPane>
        <TabPane tab="我受理的" key="2">
          <ProTable<ApprovalInfoVO, API.PageParams>
            headerTitle={intl.formatMessage({
              id: '审批管理',
              defaultMessage: '审批管理',
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
            loading={state.loadingReceiver} // Spinner for Receiver data
            dataSource={state.receiverData} // Use fetched data
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
          const initiator = state.employeeList.find(emp => emp.name === values.approvalInitiatorName);
          const receiver = state.employeeList.find(emp => emp.name === values.approvalReceiverName);

          const data: AddApprovalInfoRequest = {
            ...values,
            approvalInitiatorId: initiator?.id || 0, // 使用选中的发起人ID
            approvalReceiverId: receiver?.id || 0,   // 使用选中的接收人ID
            approvalFileUrl: state.fileUrl,          // 使用上传后的文件URL
          };
          await handleAddApproval(data);
        }}
      >
        <ProFormText
          name="approvalInitiatorName"
          label="审批发起人"
          initialValue={initialState.currentUser?.name}
          readonly
        />
        <ProFormSelect
          name="approvalReceiverName"
          label="审批接收人"
          options={state.employeeList.map(emp => ({ label: emp.name, value: emp.name }))}
          rules={[{ required: true, message: '请选择审批接收人' }]}
        />
        <ProFormText
          name="approvalType"
          label="审批类型"
          rules={[{ required: true, message: '请输入审批类型' }]}
        />

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
