import { useApprovalPage } from '@/hooks/approval/Hook.useApprovalPage';
import { AddApprovalInfoRequest, ApprovalInfoVO } from '@/model/approvalsystem';
import {useModel, useParams} from '@@/exports';
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
import {Button, DatePicker, Input, message, Modal, Space, Tabs, Tooltip, Upload} from 'antd';
import React, { useState } from 'react';
import _ from 'lodash';
import { CopyOutlined } from '@ant-design/icons';
import { GENERAL_CLIENT_API_BASE_URL} from "@/api/usermanagement";
import { DateTime } from 'luxon';
import moment from "moment";



const { TabPane } = Tabs;

export const approvalStatusConfig = {
  3: { text: '待审批', status: 'Default' },
  1: { text: '已批准', status: 'Success' },
  2: { text: '已拒绝', status: 'Error' },
};

export const approvalTypeConfig = {
  1: { text: '工程' },
  2: { text: '采购' },
  default: { text: '其他' }, // 处理任何其他数字或值
};

const ApprovalSystem: React.FC = () => {
  const { id } = useParams(); // 使用 useParams 获取 id
  const { initialState } = useModel('@@initialState');
  // 检查用户是否已登录，如果未登录，返回 null 或者空组件
  if (!initialState?.currentUser) {
    return null; // 或者返回一个 loading 状态，或者重定向到登录页面
  }

  const [currentRecord, setCurrentRecord] = useState<ApprovalInfoVO | null>(null); // 用于存储当前操作的记录
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [selectedRowKeysV2, setSelectedRowKeysV2] = useState<number[]>([]);
  const [fileName, setFileName] = useState(''); // 用于保存文件名
  const [showAll, setShowAll] = useState(false);

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
    exportToCSV
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

  // 复制文本的函数
  const handleCopy = (record: any) => {
    navigator.clipboard.writeText(`${GENERAL_CLIENT_API_BASE_URL}/approval/id/${record.id}`).then(
      () => {
        message.success('复制成功！');
      },
      () => {
        message.error('复制失败，请重试');
      }
    );
  };

  const handleDataSource = (dataSource: ApprovalInfoVO[]) => {
    const target = _.filter(dataSource, (item) => Number(item.id) ===  Number(id))
    console.log(target);
    if (_.isUndefined(id) || _.isEmpty(target) || _.isEqual(showAll, true)) {
      return dataSource;
    }

    return target;
  };


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
      const decodedFileName = decodeURIComponent(trimmedFileName); // 解码文件名

      if(decodedFileName.length > 20) {
        // 只显示前 20 个字符，并加上省略号
        fileName = decodedFileName.slice(0, 20) + '...';
      } else {
        fileName = decodedFileName
      }
    }

    console.log(fileName);

    return record.approvalFileUrl ? (
      <Tooltip title={decodeURIComponent(record.approvalFileUrl.replace(prefix, '').replace(/^[a-zA-Z0-9-]+_/, ''))}>
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
      filterMode: 'menu', // 立即应用模式
    },
    {
      title: <FormattedMessage id="审批接收人" />,
      dataIndex: 'approvalReceiverName',
      valueType: 'text',
      filters: receiver,
      onFilter: (value, record) => record.approvalReceiverName === value,
      filterSearch: true,
      filterMode: 'menu', // 立即应用模式
    },
    {
      title: <FormattedMessage id="审批类型" />,
      dataIndex: 'approvalType',
      valueType: 'select',
      valueEnum: approvalTypeConfig, // 使用映射
      filters: fileType,
      onFilter: (value, record) => record.approvalType === value,
      filterSearch: true,
      filterMode: 'menu', // 立即应用模式
    },
    {
      title: <FormattedMessage id="文件链接" />,
      dataIndex: 'approvalFileUrl',
      valueType: 'text',
      key: 'approvalFileUrl',
      width: '150px',
      render: renderApprovalFileLink,
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
                  setSelectedKeys([
                    dates.map((date) => date.format('YYYY-MM-DD')),
                  ]);
                } else {
                  setSelectedKeys([]);
                }
              }}
              format="YYYY-MM-DD"
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
              >
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

        // 比较日期范围，忽略时间部分
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
                  setSelectedKeys([
                    dates.map((date) => date.format('YYYY-MM-DD')),
                  ]);
                } else {
                  setSelectedKeys([]);
                }
              }}
              format="YYYY-MM-DD"
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
              >
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

        // 比较日期范围，忽略时间部分
        return recordDate >= startDate && recordDate <= endDate;
      },
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      valueType: 'select',
      valueEnum: approvalStatusConfig,
      filters: Object.keys(approvalStatusConfig).map(key => ({
        text: approvalStatusConfig[key].text,
        value: key,
      })),
      onFilter: (value, record) => record.approvalStatus === parseInt(value, 10), // 将值与状态进行比较
      filterMode: 'menu', // 立即应用模式
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

  const columns: ProColumns<ApprovalInfoVO>[] = [
    {
      title: <FormattedMessage id="审批发起人" />,
      dataIndex: 'approvalInitiatorName',
      valueType: 'text',
      filters: initiatorToMe,
      onFilter: (value, record) => record.approvalInitiatorName === value,
      filterSearch: true,
      filterMode: 'menu', // 立即应用模式
    },
    {
      title: <FormattedMessage id="审批接收人" />,
      dataIndex: 'approvalReceiverName',
      valueType: 'text',
      filters: receiverToMe,
      onFilter: (value, record) => record.approvalReceiverName === value,
      filterSearch: true,
      filterMode: 'menu', // 立即应用模式
    },
    {
      title: <FormattedMessage id="审批类型" />,
      dataIndex: 'approvalType',
      valueType: 'select',
      valueEnum: approvalTypeConfig, // 使用映射
      filters: fileTypeToMe,
      onFilter: (value, record) => record.approvalType === value,
      filterSearch: true,
      filterMode: 'menu', // 立即应用模式
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
                  setSelectedKeys([
                    dates.map((date) => date.format('YYYY-MM-DD')),
                  ]);
                } else {
                  setSelectedKeys([]);
                }
              }}
              format="YYYY-MM-DD"
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
              >
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

        // 比较日期范围，忽略时间部分
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
                  setSelectedKeys([
                    dates.map((date) => date.format('YYYY-MM-DD')),
                  ]);
                } else {
                  setSelectedKeys([]);
                }
              }}
              format="YYYY-MM-DD"
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
              >
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

        // 比较日期范围，忽略时间部分
        return recordDate >= startDate && recordDate <= endDate;
      },
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      valueType: 'select',
      valueEnum: approvalStatusConfig,
      filters: Object.keys(approvalStatusConfig).map(key => ({
        text: approvalStatusConfig[key].text,
        value: key,
      })),
      onFilter: (value, record) => record.approvalStatus === parseInt(value, 10), // 将值与状态进行比较
      filterMode: 'menu', // 立即应用模式
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

          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record)}> {/* 将 handleCopy 改为函数引用 */}
            一键复制链接
          </Button>
        </div>
      ),
    }
  ];

  const handleBatchExport = (columns: ProColumns<ApprovalInfoVO>[], fileName: string, data: any, selectedRowKeys: any) => {
    console.log(data);
    const selectedData = data.filter((item) => selectedRowKeys.includes(item.id));
    if (selectedData.length > 0) {
      exportToCSV(selectedData, fileName, columns); // 传递 columns 作为参数
    } else {
      message.warning('请先选择要导出的行');
    }
  };

  return (
    <PageContainer>
      <Tabs defaultActiveKey={_.isUndefined(id) ? "1" : "2"}>
        <TabPane tab="我发起的" key="1">
          <ProTable<ApprovalInfoVO, API.PageParams>
            headerTitle={
              <div>
                {intl.formatMessage({
                  id: '审批管理',
                  defaultMessage: '审批管理',
                })}
                {selectedRowKeys.length > 0 && (
                  <Button onClick={() => handleBatchExport(columns, '我发起的审批', state.initiatorData, selectedRowKeys)} style={{ marginLeft: 16 }}>
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
              onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys as number[]),
            }}
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
            headerTitle={
              <div>
                {intl.formatMessage({
                  id: '审批管理',
                  defaultMessage: '审批管理',
                })}
                {selectedRowKeys.length > 0 && (
                  <Button onClick={() => handleBatchExport(columns,'我受理的', state.initiatorData, selectedRowKeysV2)} style={{ marginLeft: 16 }}>
                    批量导出
                  </Button>
                )}
                {_.isEqual(showAll, false) && (
                  <Button type="primary" onClick={() => setShowAll(true)} style={{ marginLeft: 16 }}>
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
              selectedRowKeysV2,
              onChange: (selectedKeys) => setSelectedRowKeysV2(selectedKeys as number[]),
            }}
            loading={state.loadingReceiver} // Spinner for Receiver data
            dataSource={handleDataSource(state.receiverData)} // Use fetched data
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
        onOpenChange={(isOpen) => {
          handleModalOpen('createModalOpen', isOpen);
          setFileName(''); // 将文件名保存到fileName中
        }}
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
            setFileName(file.name); // 将文件名保存到fileName中
            return false; // 阻止自动上传，使用自定义上传逻辑
          }}
        >
          <Button icon={<UploadOutlined />}>点击上传文件</Button>
        </Upload>
        {fileName && <div style={{ marginTop: 16 }}>已上传文件: {fileName}</div>}
      </ModalForm>
    </PageContainer>
  );
};

export default ApprovalSystem;
