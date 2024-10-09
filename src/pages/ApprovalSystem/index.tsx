import { useApprovalPage } from '@/hooks/approval/Hook.useApprovalPage';
import {
  AddApprovalInfoRequest,
  ApprovalInfoVO,
} from '@/model/approvalsystem';
import { useModel, useParams } from '@@/exports';
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  CopyOutlined, FileOutlined, UserOutlined, CheckCircleOutlined, CommentOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import {
  Button,
  DatePicker,
  Input,
  message,
  Modal,
  Space,
  Badge,
  Tabs,
  Typography,
  Tooltip,
  Upload,
  List, Card, Avatar, Descriptions, Divider,
} from 'antd';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { GENERAL_CLIENT_API_BASE_URL } from '@/api/usermanagement';
import { DateTime } from 'luxon';
import moment from 'moment';

const { TabPane } = Tabs;

export const approvalStatusConfig = {
  3: { text: '待审批', status: 'Default' },
  1: { text: '已批准', status: 'Success' },
  2: { text: '已拒绝', status: 'Error' },
};

export const approvalTypeConfig = {
  1: { text: '工程' },
  2: { text: '采购' },
  default: { text: '其他' },
};

const ApprovalSystem: React.FC = () => {
  const { id } = useParams();
  const { initialState } = useModel('@@initialState');

  if (!initialState?.currentUser) {
    return null;
  }

  const [currentRecord, setCurrentRecord] = useState<ApprovalInfoVO | null>(
    null,
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [selectedRowKeysV2, setSelectedRowKeysV2] = useState<number[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [fileModalVisible, setFileModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [comment, setComment] = useState('');
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);

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
    exportToCSV,
    fetchApprovalData,
  } = useApprovalPage(initialState.currentUser?.id || '');
  const intl = useIntl();

  const initiator = _.uniqBy(
    state.initiatorData.map((item) => ({
      text: item.approvalInitiatorName,
      value: item.approvalInitiatorName,
    })),
    'value',
  );
  const receiver = _.uniqBy(
    state.initiatorData.map((item) => ({
      text: item.approvalReceiverName,
      value: item.approvalReceiverName,
    })),
    'value',
  );
  const fileType = _.uniqBy(
    state.initiatorData.map((item) => ({
      text:
        approvalTypeConfig[item.approvalType]?.text ||
        approvalTypeConfig.default.text,
      value: item.approvalType,
    })),
    'value',
  );
  const initiatorToMe = _.uniqBy(
    state.receiverData.map((item) => ({
      text: item.approvalInitiatorName,
      value: item.approvalInitiatorName,
    })),
    'value',
  );
  const receiverToMe = _.uniqBy(
    state.receiverData.map((item) => ({
      text: item.approvalReceiverName,
      value: item.approvalReceiverName,
    })),
    'value',
  );
  const fileTypeToMe = _.uniqBy(
    state.receiverData.map((item) => ({
      text:
        approvalTypeConfig[item.approvalType]?.text ||
        approvalTypeConfig.default.text,
      value: item.approvalType,
    })),
    'value',
  );

  const openApprovalModalById = async (approvalId: number) => {
    let allApprovals = [...state.initiatorData, ...state.receiverData];

    if (allApprovals.length === 0) {
      try {
        const { initiatorData, receiverData } = await fetchApprovalData();
        allApprovals = [...initiatorData, ...receiverData];
      } catch (error) {
        message.error('无法加载审批数据');
        return;
      }
    }

    const targetRecord = allApprovals.find((item) => item.id === approvalId);

    if (targetRecord) {
      setCurrentRecord(targetRecord);
      setApprovalModalVisible(true);
    } else {
      message.error('无法找到对应的审批记录');
    }
  };

  useEffect(() => {
    fetchApprovalData();

    if (id) {
      openApprovalModalById(Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCopy = (record: any) => {
    const textToCopy = `${GENERAL_CLIENT_API_BASE_URL}/approval/id/${record.id}`;

    const input = document.createElement('textarea');
    input.value = textToCopy;
    input.style.position = 'absolute';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        message.success('复制成功！');
      } else {
        message.error('复制失败，请重试');
      }
    } catch (err) {
      message.error('复制失败，请重试');
    }

    document.body.removeChild(input);
  };

  const renderApprovalModal = () => {
    if (!currentRecord) return null;

    const isApproved = currentRecord.approvalStatus === 1;
    const isRejected = currentRecord.approvalStatus === 2;
    const statusText = approvalStatusConfig[currentRecord.approvalStatus]?.text;
    const statusColor = isApproved
      ? 'success'
      : isRejected
        ? 'error'
        : 'processing';

    return (
      <Modal
        title="审批详情"
        visible={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Card bordered={false}>
          <Space align="start">
            <Avatar size={64} icon={<UserOutlined />} />
            <div style={{ marginLeft: 16 }}>
              <Typography.Title level={4}>
                {currentRecord.approvalInitiatorName}
              </Typography.Title>
              <Typography.Text type="secondary">发起人</Typography.Text>
            </div>
          </Space>
          <Divider />
          <Descriptions column={1} bordered>
            <Descriptions.Item label="审批接收人">
              {currentRecord.approvalReceiverName}
            </Descriptions.Item>
            <Descriptions.Item label="审批类型">
              {approvalTypeConfig[currentRecord.approvalType]?.text ||
                approvalTypeConfig.default.text}
            </Descriptions.Item>
            <Descriptions.Item label="审批状态">
              <Badge status={statusColor} text={statusText} />
            </Descriptions.Item>
            <Descriptions.Item label="批示">
              {currentRecord.comment || '无'}
            </Descriptions.Item>
            <Descriptions.Item label="文件列表">
              {renderApprovalFiles(null, currentRecord)}
            </Descriptions.Item>
          </Descriptions>
          {!isApproved && !isRejected && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Space size="large">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprovalChange(currentRecord, 1)}
                >
                  批准
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleApprovalChange(currentRecord, 2)}
                >
                  拒绝
                </Button>
                <Button
                  icon={<CommentOutlined />}
                  onClick={() => showModal(currentRecord)}
                >
                  添加批示
                </Button>
              </Space>
            </div>
          )}
        </Card>
      </Modal>
    );
  };

  const handleDataSource = (dataSource: ApprovalInfoVO[]) => {
    const target = _.filter(
      dataSource,
      (item) => Number(item.id) === Number(id),
    );
    if (_.isUndefined(id) || _.isEmpty(target) || _.isEqual(showAll, true)) {
      return dataSource;
    }
    return target;
  };

  const showModal = (record) => {
    setCurrentRecord(record);
    setComment(record.comment || '');
    handleModalOpen('commentModalOpen', true);
  };

  const prefix = 'http://rohana-erp.oss-cn-beijing.aliyuncs.com/files/';

  const extractFileName = (fileUrl) => {
    let fileName = '未知文件';
    if (fileUrl && fileUrl.startsWith(prefix)) {
      const rawFileName = fileUrl.replace(prefix, '');
      const decodedFileName = decodeURIComponent(
        rawFileName.replace(/^[a-zA-Z0-9-]+_/, ''),
      );
      fileName = decodedFileName;
    }
    return fileName;
  };

  const renderApprovalFiles = (_, record) => {
    if (!record.approvalFileUrl || record.approvalFileUrl.length === 0) {
      return <Typography.Text>无文件</Typography.Text>;
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={record.approvalFileUrl}
        renderItem={(fileUrl) => {
          const fileName = extractFileName(fileUrl);
          return (
            <List.Item>
              <List.Item.Meta
                avatar={<FileOutlined style={{ fontSize: '24px' }} />}
                title={
                  <a
                    href="#"
                    onClick={async (e) => {
                      e.preventDefault();
                      await downloadFromOSS(fileUrl);
                    }}
                  >
                    {fileName}
                  </a>
                }
              />
            </List.Item>
          );
        }}
      />
    );
  };

  const approvalColumns: ProColumns<ApprovalInfoVO>[] = [
    {
      title: <FormattedMessage id="审批发起人" />,
      dataIndex: 'approvalInitiatorName',
      valueType: 'text',
      filters: initiatorToMe,
      onFilter: (value, record) => record.approvalInitiatorName === value,
      filterSearch: true,
      filterMode: 'menu',
    },
    {
      title: <FormattedMessage id="审批接收人" />,
      dataIndex: 'approvalReceiverName',
      valueType: 'text',
      filters: receiverToMe,
      onFilter: (value, record) => record.approvalReceiverName === value,
      filterSearch: true,
      filterMode: 'menu',
    },
    {
      title: <FormattedMessage id="审批类型" />,
      dataIndex: 'approvalType',
      valueType: 'select',
      valueEnum: approvalTypeConfig,
      filters: fileTypeToMe,
      onFilter: (value, record) => record.approvalType === value,
      filterSearch: true,
      filterMode: 'menu',
    },
    {
      title: <FormattedMessage id="文件链接" />,
      dataIndex: 'approvalFileUrl',
      valueType: 'text',
      key: 'approvalFileUrl',
      width: '150px',
      render: renderApprovalFiles,
    },
    {
      title: <FormattedMessage id="创建时间" />,
      dataIndex: 'createTime',
      valueType: 'dateTime',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
        const [startDate, endDate] = selectedKeys[0] || [];
        return (
          <div style={{ padding: 8 }}>
            <DatePicker.RangePicker
              value={[
                startDate ? moment(startDate) : null,
                endDate ? moment(endDate) : null,
              ]}
              onChange={(dates) => {
                if (dates) {
                  setSelectedKeys([dates.map((date) => date.format('YYYY-MM-DD'))]);
                } else {
                  setSelectedKeys([]);
                }
              }}
              format="YYYY-MM-DD"
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button type="primary" onClick={() => confirm()} size="small">
                筛选
              </Button>
              <Button
                onClick={() => {
                  if (clearFilters) {
                    clearFilters();
                  }
                  confirm();
                }}
                size="small"
              >
                重置
              </Button>
            </Space>
          </div>
        );
      },
      onFilter: (value, record) => {
        if (!value || value.length === 0) return true;
        const [start, end] = value;

        const recordDate = DateTime.fromISO(record.createTime);
        const startDate = DateTime.fromFormat(start, 'yyyy-MM-dd').startOf('day');
        const endDate = DateTime.fromFormat(end, 'yyyy-MM-dd').endOf('day');

        if (!recordDate.isValid || !startDate.isValid || !endDate.isValid) {
          return false;
        }

        return recordDate >= startDate && recordDate <= endDate;
      },
    },
    {
      title: <FormattedMessage id="更新时间" />,
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
        const [startDate, endDate] = selectedKeys[0] || [];
        return (
          <div style={{ padding: 8 }}>
            <DatePicker.RangePicker
              value={[
                startDate ? moment(startDate) : null,
                endDate ? moment(endDate) : null,
              ]}
              onChange={(dates) => {
                if (dates) {
                  setSelectedKeys([dates.map((date) => date.format('YYYY-MM-DD'))]);
                } else {
                  setSelectedKeys([]);
                }
              }}
              format="YYYY-MM-DD"
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button type="primary" onClick={() => confirm()} size="small">
                筛选
              </Button>
              <Button
                onClick={() => {
                  if (clearFilters) {
                    clearFilters();
                  }
                  confirm();
                }}
                size="small"
              >
                重置
              </Button>
            </Space>
          </div>
        );
      },
      onFilter: (value, record) => {
        if (!value || value.length === 0) return true;
        const [start, end] = value;

        const recordDate = DateTime.fromISO(record.updateTime);
        const startDate = DateTime.fromFormat(start, 'yyyy-MM-dd').startOf('day');
        const endDate = DateTime.fromFormat(end, 'yyyy-MM-dd').endOf('day');

        if (!recordDate.isValid || !startDate.isValid || !endDate.isValid) {
          return false;
        }

        return recordDate >= startDate && recordDate <= endDate;
      },
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      valueType: 'select',
      valueEnum: approvalStatusConfig,
      filters: Object.keys(approvalStatusConfig).map((key) => ({
        text: approvalStatusConfig[key].text,
        value: key,
      })),
      onFilter: (value, record) => record.approvalStatus === parseInt(value, 10),
      filterMode: 'menu',
    },
    {
      title: '批示',
      dataIndex: 'comment',
      valueType: 'text',
    },
    {
      title: '操作',
      dataIndex: 'approvalStatus',
      render: (_, record) => {
        const isApproved = record?.approvalStatus === 1;
        const isRejected = record?.approvalStatus === 2;
        return !isApproved && !isRejected ? (
          <div>
            <Button
              type="primary"
              disabled={isApproved || isRejected}
              onClick={() => handleApprovalChange(record, 1)}
            >
              批准
            </Button>
            <Button
              type="default"
              disabled={isApproved || isRejected}
              onClick={() => handleApprovalChange(record, 2)}
              style={{ marginLeft: 8 }}
            >
              拒绝
            </Button>
            <Button
              type="default"
              onClick={() => showModal(record)}
              style={{ marginLeft: 8 }}
            >
              添加批示
            </Button>
          </div>
        ) : null;
      },
    },
  ];

  const columns: ProColumns<ApprovalInfoVO>[] = [
    {
      title: <FormattedMessage id="审批发起人" />,
      dataIndex: 'approvalInitiatorName',
      valueType: 'text',
      filters: initiator,
      onFilter: (value, record) => record.approvalInitiatorName === value,
      filterSearch: true,
      filterMode: 'menu',
    },
    {
      title: <FormattedMessage id="审批接收人" />,
      dataIndex: 'approvalReceiverName',
      valueType: 'text',
      filters: receiver,
      onFilter: (value, record) => record.approvalReceiverName === value,
      filterSearch: true,
      filterMode: 'menu',
    },
    {
      title: <FormattedMessage id="审批类型" />,
      dataIndex: 'approvalType',
      valueType: 'select',
      valueEnum: approvalTypeConfig,
      filters: fileType,
      onFilter: (value, record) => record.approvalType === value,
      filterSearch: true,
      filterMode: 'menu',
    },
    {
      title: <FormattedMessage id="文件链接" />,
      dataIndex: 'approvalFileUrl',
      valueType: 'text',
      key: 'approvalFileUrl',
      width: '150px',
      render: renderApprovalFiles, // 使用渲染多个文件的函数
    },
    {
      title: <FormattedMessage id="创建时间" />,
      dataIndex: 'createTime',
      valueType: 'dateTime',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
        const [startDate, endDate] = selectedKeys[0] || [];
        return (
          <div style={{ padding: 8 }}>
            <DatePicker.RangePicker
              value={[
                startDate ? moment(startDate) : null,
                endDate ? moment(endDate) : null,
              ]}
              onChange={(dates) => {
                if (dates) {
                  setSelectedKeys([dates.map((date) => date.format('YYYY-MM-DD'))]);
                } else {
                  setSelectedKeys([]);
                }
              }}
              format="YYYY-MM-DD"
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button type="primary" onClick={() => confirm()} size="small">
                筛选
              </Button>
              <Button
                onClick={() => {
                  if (clearFilters) {
                    clearFilters();
                  }
                  confirm();
                }}
                size="small"
              >
                重置
              </Button>
            </Space>
          </div>
        );
      },
      onFilter: (value, record) => {
        if (!value || value.length === 0) return true;
        const [start, end] = value;

        const recordDate = DateTime.fromISO(record.createTime);
        const startDate = DateTime.fromFormat(start, 'yyyy-MM-dd').startOf('day');
        const endDate = DateTime.fromFormat(end, 'yyyy-MM-dd').endOf('day');

        if (!recordDate.isValid || !startDate.isValid || !endDate.isValid) {
          return false;
        }

        return recordDate >= startDate && recordDate <= endDate;
      },
    },
    {
      title: <FormattedMessage id="更新时间" />,
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
        const [startDate, endDate] = selectedKeys[0] || [];
        return (
          <div style={{ padding: 8 }}>
            <DatePicker.RangePicker
              value={[
                startDate ? moment(startDate) : null,
                endDate ? moment(endDate) : null,
              ]}
              onChange={(dates) => {
                if (dates) {
                  setSelectedKeys([dates.map((date) => date.format('YYYY-MM-DD'))]);
                } else {
                  setSelectedKeys([]);
                }
              }}
              format="YYYY-MM-DD"
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button type="primary" onClick={() => confirm()} size="small">
                筛选
              </Button>
              <Button
                onClick={() => {
                  if (clearFilters) {
                    clearFilters();
                  }
                  confirm();
                }}
                size="small"
              >
                重置
              </Button>
            </Space>
          </div>
        );
      },
      onFilter: (value, record) => {
        if (!value || value.length === 0) return true;
        const [start, end] = value;

        const recordDate = DateTime.fromISO(record.updateTime);
        const startDate = DateTime.fromFormat(start, 'yyyy-MM-dd').startOf('day');
        const endDate = DateTime.fromFormat(end, 'yyyy-MM-dd').endOf('day');

        if (!recordDate.isValid || !startDate.isValid || !endDate.isValid) {
          return false;
        }

        return recordDate >= startDate && recordDate <= endDate;
      },
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      valueType: 'select',
      valueEnum: approvalStatusConfig,
      filters: Object.keys(approvalStatusConfig).map((key) => ({
        text: approvalStatusConfig[key].text,
        value: key,
      })),
      onFilter: (value, record) => record.approvalStatus === parseInt(value, 10),
      filterMode: 'menu',
    },
    {
      title: '批示',
      dataIndex: 'comment',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="操作" />,
      dataIndex: 'operation',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <Button
            onClick={async () => {
              // 在打开文件管理 Modal 前，获取最新的审批记录数据
              await fetchApprovalData(); // 确保数据是最新的

              // 在最新的 initiatorData 中找到当前的审批记录
              const updatedRecord = state.initiatorData.find(
                (item) => item.id === record.id,
              );

              if (updatedRecord) {
                setCurrentRecord(updatedRecord);
                setFileModalVisible(true);
                // 初始化文件列表
                setFileList(
                  updatedRecord.approvalFileUrl?.map((url) => ({
                    uid: url,
                    name: extractFileName(url),
                    status: 'done',
                    url,
                  })) || [],
                );
              } else {
                message.error('无法找到审批记录，请稍后重试');
              }
            }}
          >
            管理文件
          </Button>
          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record)}
          >
            一键复制链接
          </Button>
        </Space>
      ),
    },
  ];

  const handleBatchExport = (
    columns: ProColumns<ApprovalInfoVO>[],
    fileName: string,
    data: any,
    selectedRowKeys: any,
  ) => {
    const selectedData = data.filter((item) => selectedRowKeys.includes(item.id));
    if (selectedData.length > 0) {
      exportToCSV(selectedData, fileName, columns);
    } else {
      message.warning('请先选择要导出的行');
    }
  };

  const handleUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const fileUrl = await uploadToOSS(file);
      const newFileUrls = currentRecord.approvalFileUrl
        ? [...currentRecord.approvalFileUrl, fileUrl]
        : [fileUrl];

      await handleFileUpload({ id: currentRecord.id, fileUrl: newFileUrls });

      // 更新当前记录的文件列表
      setCurrentRecord((prev) => ({
        ...prev,
        approvalFileUrl: newFileUrls,
      }));

      message.success('文件上传成功');
      fetchApprovalData();
      onSuccess(null, file);
    } catch (error) {
      message.error('文件上传失败');
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  // 文件删除处理函数（用于文件管理 Modal）
  const handleRemove = async (file) => {
    try {
      const fileUrl = file.url || file.response;
      const newFileUrls = currentRecord.approvalFileUrl.filter(
        (url) => url !== fileUrl,
      );

      await handleFileUpload({ id: currentRecord.id, fileUrl: newFileUrls });

      // 更新当前记录的文件列表
      setCurrentRecord((prev) => ({
        ...prev,
        approvalFileUrl: newFileUrls,
      }));

      // 更新文件列表状态
      setFileList((prevList) =>
        prevList.filter((item) => item.uid !== file.uid),
      );

      message.success('文件删除成功');
      await fetchApprovalData(); // 更新数据

      return true; // 告诉 Upload 组件文件已被删除
    } catch (error) {
      message.error('文件删除失败');
      return false; // 告诉 Upload 组件文件删除失败
    }
  };

  // 文件上传处理函数（用于新建审批 Modal）
  const handleUploadNewApproval = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const fileUrl = await uploadToOSS(file);
      setFileList((prevList) => [
        ...prevList,
        { uid: file.uid, url: fileUrl, name: file.name },
      ]);
      onSuccess(null, file);
    } catch (error) {
      message.error('文件上传失败');
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  // 文件删除处理函数（用于新建审批 Modal）
  const handleRemoveNewApproval = async (file) => {
    setFileList((prevList) => prevList.filter((item) => item.uid !== file.uid));
  };

  // 当关闭文件管理 Modal 时，刷新文件列表
  const handleFileModalClose = async () => {
    setFileModalVisible(false);
    await fetchApprovalData(); // 更新数据
  };

  return (
    <PageContainer>
      <Tabs defaultActiveKey={_.isUndefined(id) ? '1' : '2'}>
        <TabPane tab="我发起的" key="1">
          <ProTable<ApprovalInfoVO, API.PageParams>
            headerTitle={
              <div>
                {intl.formatMessage({
                  id: '审批管理',
                  defaultMessage: '审批管理',
                })}
                {selectedRowKeys.length > 0 && (
                  <Button
                    onClick={() =>
                      handleBatchExport(
                        columns,
                        '我发起的审批',
                        state.initiatorData,
                        selectedRowKeys,
                      )
                    }
                    style={{ marginLeft: 16 }}
                  >
                    批量导出
                  </Button>
                )}
              </div>
            }
            actionRef={actionRef}
            rowKey="id"
            search={false}
            cardBordered
            rowSelection={{
              selectedRowKeys,
              onChange: (selectedKeys) =>
                setSelectedRowKeys(selectedKeys as number[]),
            }}
            toolBarRender={() => [
              <Button
                type="primary"
                key="primary"
                onClick={() => handleModalOpen('createModalOpen', true)}
              >
                <PlusOutlined /> 新增审批
              </Button>,
            ]}
            loading={state.loadingInitiator}
            dataSource={state.initiatorData}
            columns={columns}
          />
        </TabPane>
        <TabPane tab="我受理的" key="2">
          <ProTable<ApprovalInfoVO, API.PageParams>
            headerTitle={
              <div>
                {intl.formatMessage({
                  id: '审批管理',
                  defaultMessage: '审批管理',
                })}
                {selectedRowKeysV2.length > 0 && (
                  <Button
                    onClick={() =>
                      handleBatchExport(
                        approvalColumns,
                        '我受理的',
                        state.receiverData,
                        selectedRowKeysV2,
                      )
                    }
                    style={{ marginLeft: 16 }}
                  >
                    批量导出
                  </Button>
                )}
                {!showAll && (
                  <Button
                    type="primary"
                    onClick={() => setShowAll(true)}
                    style={{ marginLeft: 16 }}
                  >
                    显示全部
                  </Button>
                )}
              </div>
            }
            actionRef={actionRef}
            rowKey="id"
            search={false}
            cardBordered
            rowSelection={{
              selectedRowKeys: selectedRowKeysV2,
              onChange: (selectedKeys) =>
                setSelectedRowKeysV2(selectedKeys as number[]),
            }}
            loading={state.loadingReceiver}
            dataSource={handleDataSource(state.receiverData)}
            columns={approvalColumns}
          />
        </TabPane>
      </Tabs>

      {/* 评论输入的 Modal */}
      <Modal
        title="输入评论"
        visible={state.commentModalOpen}
        onCancel={() => handleModalOpen('commentModalOpen', false)}
        onOk={async () => {
          if (currentRecord) {
            await handleUpdateComment(currentRecord, comment);
            handleModalOpen('commentModalOpen', false);
          }
        }}
      >
        <Input.TextArea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="请输入评论"
          rows={4}
        />
      </Modal>

      {/* 审批详情的弹窗 */}
      {renderApprovalModal()}


      {/* 文件管理的 Modal */}
      <Modal
        title="文件管理"
        visible={fileModalVisible}
        onCancel={handleFileModalClose}
        footer={null}
        destroyOnClose
      >
        <Upload
          customRequest={handleUpload}
          onRemove={handleRemove}
          fileList={fileList}
          multiple
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            选择文件
          </Button>
        </Upload>
      </Modal>

      {/* 新建审批的 Modal */}
      <ModalForm
        title="新加入审批"
        width="400px"
        modalProps={{
          destroyOnClose: true,
        }}
        open={state.createModalOpen}
        onOpenChange={(isOpen) => {
          handleModalOpen('createModalOpen', isOpen);
          setFileList([]);
        }}
        submitter={{
          submitButtonProps: {
            loading: state.isLoading,
          },
        }}
        onFinish={async (values) => {
          const initiator = state.employeeList.find(
            (emp) => emp.name === values.approvalInitiatorName,
          );
          const receiver = state.employeeList.find(
            (emp) => emp.name === values.approvalReceiverName,
          );

          const uploadedUrls = fileList.map((file) => file.url);

          const data: AddApprovalInfoRequest = {
            ...values,
            approvalStatus: 3,
            approvalInitiatorId: initiator?.id || 0,
            approvalReceiverId: receiver?.id || 0,
            approvalFileUrl: uploadedUrls,
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
          options={state.employeeList.map((emp) => ({
            label: emp.name,
            value: emp.name,
          }))}
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
          customRequest={handleUploadNewApproval}
          onRemove={handleRemoveNewApproval}
          fileList={fileList}
          multiple
        >
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
      </ModalForm>
    </PageContainer>
  );
};

export default ApprovalSystem;
