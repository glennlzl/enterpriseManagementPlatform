import { useApprovalPage } from '@/hooks/approval/Hook.useApprovalPage';
import { AddApprovalInfoRequest, ApprovalInfoVO } from '@/model/approvalsystem';
import { useModel } from '@@/exports';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import {Button, Input, Modal, Tabs, Tooltip, Upload} from 'antd';
import React, { useState } from 'react';
import _ from 'lodash';

const { TabPane } = Tabs;

export const approvalStatusConfig = {
  3: { text: '待审批', status: 'Default' },
  1: { text: '已批准', status: 'Success' },
  2: { text: '已拒绝', status: 'Error' },
};

const approvalTypeConfig = {
  1: { text: '工程' },
  2: { text: '采购' },
  default: { text: '其他' }, // 处理任何其他数字或值
};

const ApprovalSystem: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  // 检查用户是否已登录，如果未登录，返回 null 或者空组件
  if (!initialState?.currentUser) {
    return null; // 或者返回一个 loading 状态，或者重定向到登录页面
  }

  const [currentRecord, setCurrentRecord] = useState<ApprovalInfoVO | null>(null); // 用于存储当前操作的记录

  const {
    state,
    handleModalOpen,
    handleFileUpload,
    handleApprovalChange,
    handleAddApproval,
    downloadFromOSS,
    actionRef,
    uploadToOSS,
    handleUpdateComment,
  } = useApprovalPage(initialState.currentUser?.id || '');
  const intl = useIntl();
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [comment, setComment] = useState('');
  const initiator = _.uniqBy(state.initiatorData.map(item => ({ text: item.approvalInitiatorName, value: item.approvalInitiatorName })), 'value');
  const receiver = _.uniqBy(state.initiatorData.map(item => ({ text: item.approvalReceiverName, value: item.approvalReceiverName })), 'value');
  const fileType = _.uniqBy(
    state.initiatorData.map(item => ({
      text: approvalTypeConfig[item.approvalType]?.text || approvalTypeConfig.default.text, // 使用映射的文字
      value: item.approvalType,
    })),
    'value'
  );
  const initiatorToMe = _.uniqBy(state.receiverData.map(item => ({ text: item.approvalReceiverName, value: item.approvalReceiverName })), 'value');
  const receiverToMe = _.uniqBy(state.receiverData.map(item => ({ text: item.approvalReceiverName, value: item.approvalReceiverName })), 'value');
  const fileTypeToMe = _.uniqBy(
    state.receiverData.map(item => ({
      text: approvalTypeConfig[item.approvalType]?.text || approvalTypeConfig.default.text, // 使用映射的文字
      value: item.approvalType,
    })),
    'value'
  );

  const showModal = (record) => {
    setCurrentRecord(record);
    setComment(record.comment || '');  // 如果没有评论，默认设置为空字符串
    handleModalOpen('commentModalOpen', true);  // 打开评论 Modal
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [loading, setLoading] = useState(false);


  const prefix = 'http://rohana-erp.oss-cn-beijing.aliyuncs.com/files/';


  const renderApprovalFileLink = (_, record) => {
    let fileName = '未知文件';

    if (record.approvalFileUrl && record.approvalFileUrl.startsWith(prefix)) {
      // 先去掉前缀部分
      const rawFileName = record.approvalFileUrl.replace(prefix, '');

      // 使用正则表达式或字符串处理去掉 uuid + '_'
      const trimmedFileName = rawFileName.replace(/^[a-zA-Z0-9-]+_/, ''); // 去掉 uuid 和下划线部分

      if(trimmedFileName.length > 20) {
        // 只显示前 20 个字符，并加上省略号
        fileName = trimmedFileName.slice(0, 20) + '...';
      } else {
        fileName = trimmedFileName
      }
    }

    return record.approvalFileUrl ? (
      <Tooltip title={record.approvalFileUrl.replace(prefix, '').replace(/^[a-zA-Z0-9-]+_/, '')}>
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            await downloadFromOSS(record.approvalFileUrl); // 调用OSS下载函数
          }}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            maxWidth: '100%',
          }}
        >
          {fileName}
        </a>
      </Tooltip>
    ) : null; // 如果没有文件链接，则不渲染任何内容
  };


  const approvalColumns: ProColumns<ApprovalInfoVO>[] = [
    {
      title: <FormattedMessage id="审批发起人" />,
      dataIndex: 'approvalInitiatorName',
      valueType: 'text',
      filters: initiator,
      onFilter: (value, record) => record.approvalReceiverName === value,
      filterSearch: true,
    },
    {
      title: <FormattedMessage id="审批接收人" />,
      dataIndex: 'approvalReceiverName',
      valueType: 'text',
      filters: receiver,
      onFilter: (value, record) => record.approvalReceiverName === value,
      filterSearch: true,
    },
    {
      title: <FormattedMessage id="审批类型" />,
      dataIndex: 'approvalType',
      valueType: 'select',
      valueEnum: approvalTypeConfig, // 使用映射
      filters: fileType,
      onFilter: (value, record) => record.approvalType === value,
      filterSearch: true,
    },
    {
      title: '文件链接',
      dataIndex: 'approvalFileUrl',
      key: 'approvalFileUrl',
      width: '150px',
      render: renderApprovalFileLink,
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
      title: '批示',
      dataIndex: 'comment',
      valueType: 'text',
    },
    // {
    //   title: '评论',
    //   dataIndex: 'comment',
    //   valueEnum: approvalStatusConfig,
    //   render: (_, record) => {
    //     const isApproved = record?.approvalStatus === 1; // 已批准
    //     const isRejected = record?.approvalStatus === 2; // 已拒绝
    //     return (
    //       (!isApproved && !isRejected) ? (<Input
    //         placeholder="输入评论"
    //         defaultValue={record.comment} // 如果有默认值，可以设置
    //         onBlur={async (e) => {
    //           const comment = e.target.value;
    //           if (comment !== record.comment) {
    //             // 仅在评论发生变化时更新
    //             await handleUpdateComment(record, comment);
    //           }
    //         }}
    //       />) : (<span>{record.comment}</span>)
    //     );
    //   },
    // },
    {
      title: '操作',
      dataIndex: 'approvalStatus',
      render: (_, record) => {
        const isApproved = record?.approvalStatus === 1; // 已批准
        const isRejected = record?.approvalStatus === 2; // 已拒绝
        return (
          (!isApproved && !isRejected) ? (
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
              <Button
                type="default"
                onClick={() => showModal(record)} // 点击打开评论输入框
                style={{ marginLeft: 8 }}
                >
                添加批示
              </Button>
            </div>
          ) : null
        );
      },
    },
  ];

  console.log(currentRecord);
  const columns: ProColumns<ApprovalInfoVO>[] = [
    {
      title: <FormattedMessage id="审批发起人" />,
      dataIndex: 'approvalInitiatorName',
      valueType: 'text',
      filters: initiatorToMe,
      onFilter: (value, record) => record.approvalInitiatorName === value,
      filterSearch: true,
    },
    {
      title: <FormattedMessage id="审批接收人" />,
      dataIndex: 'approvalReceiverName',
      valueType: 'text',
      filters: receiverToMe,
      onFilter: (value, record) => record.approvalReceiverName === value,
      filterSearch: true,
    },
    {
      title: <FormattedMessage id="审批类型" />,
      dataIndex: 'approvalType',
      valueType: 'select',
      valueEnum: approvalTypeConfig, // 使用映射
      filters: fileTypeToMe,
      onFilter: (value, record) => record.approvalType === value,
      filterSearch: true,
    },
    {
      title: '文件链接',
      dataIndex: 'approvalFileUrl',
      key: 'approvalFileUrl',
      width: '150px',
      render: renderApprovalFileLink,
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
      title: '批示',
      dataIndex: 'comment',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="操作" />,
      dataIndex: 'approvalFileUrl',
      valueType: 'text',
      render: (_, record) => (
        <div>
          <Upload
            name="file"
            showUploadList={false}
            beforeUpload={async (file) => {
              setLoading(true);
              record.approvalFileUrl = await handleFileUpload(file, record.id); // 使用OSS上传文件
              actionRef.current?.reload();
              setLoading(false);
              return false; // 阻止自动上传，使用自定义上传逻辑
            }}
          >
            <Button icon={<UploadOutlined />} disabled={loading}>上传文件</Button>
          </Upload>
        </div>
      ),
    },
  ];

  console.log(comment);

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
            search={false}
            cardBordered
            toolBarRender={() => [
              <Button
                type="primary"
                key="primary"
                onClick={() => handleModalOpen('createModalOpen', true)}
              >
                <PlusOutlined />{' '}
                <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
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
            search={false}
            cardBordered
            toolBarRender={() => [
              <Button
                type="primary"
                key="primary"
                onClick={() => {
                  handleModalOpen('createModalOpen', true)}
              }
              >
                <PlusOutlined />{' '}
                <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
              </Button>,
            ]}
            loading={state.loadingReceiver} // Spinner for Receiver data
            dataSource={state.receiverData} // Use fetched data
            columns={approvalColumns}
          />
        </TabPane>
      </Tabs>

      {/* 评论输入的 Modal */}
      <Modal
        title="输入评论"
        visible={state.commentModalOpen}
        onCancel={() => handleModalOpen('commentModalOpen', false)} // 取消关闭 Modal
        onOk={async () => {
          if (currentRecord) {
            await handleUpdateComment(currentRecord, comment); // 提交评论时使用当前记录
            handleModalOpen('commentModalOpen', false); // 关闭 Modal
          }
        }} // 提交评论
      >
        <Input.TextArea
          value={comment}  // 绑定评论状态
          onChange={(e) => setComment(e.target.value)}  // 更新评论状态
          placeholder="请输入评论"
          rows={4}
        />
      </Modal>


      <ModalForm
        title="新加入审批"
        width="400px"
        modalProps={{
          destroyOnClose: true
        }}
        open={state.createModalOpen}
        onOpenChange={(isOpen) => handleModalOpen('createModalOpen', isOpen)}
        submitter={{
          submitButtonProps: {
            loading: state.isLoading,  // 控制加载状态
          },
        }}
        onFinish={async (values) => {
          const initiator = state.employeeList.find(
            (emp) => emp.name === values.approvalInitiatorName,
          );
          const receiver = state.employeeList.find(
            (emp) => emp.name === values.approvalReceiverName,
          );

          const data: AddApprovalInfoRequest = {
            ...values,
            approvalStatus: 3,
            approvalInitiatorId: initiator?.id || 0, // 使用选中的发起人ID
            approvalReceiverId: receiver?.id || 0, // 使用选中的接收人ID
            approvalFileUrl: uploadedFileUrl, // 使用上传后的文件URL
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
          options={state.employeeList.map((emp) => ({ label: emp.name, value: emp.name }))}
          rules={[{ required: true, message: '请选择审批接收人' }]}
        />
        <ProFormSelect
          name="approvalType"
          label="审批类型"
          options={[
            { label: '工程', value: 1 },
            { label: '采购', value: 2 },
          ]}
          rules={[{ required: true, message: '请选择审批类型' }]}
        />

        <Upload
          name="file"
          showUploadList={false}
          beforeUpload={async (file) => {
            const res = await uploadToOSS(file); // 上传文件到OSS并获取URL
            setUploadedFileUrl(res); // 将文件URL保存到uploadedFileUrl中
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
