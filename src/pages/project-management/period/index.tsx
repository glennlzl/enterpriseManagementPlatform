import React, { useMemo } from 'react';
import {
  ProTable,
  ProColumns,
  PageContainer,
} from '@ant-design/pro-components';
import {Button, Popconfirm, Form, Input, Space, Modal, Select, message} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import { PeriodInfoVO } from '@/model/project/Model.period';
import { usePeriodInfo } from '@/hooks/project/Hook.usePeriodInfo';
import PeriodInfoForm from '@/pages/project-management/period/component/PeriodInfoForm';
import {isLogin} from "@/api/usermanagement";
import {history} from "@@/core/history";

const { Option } = Select;

const PeriodInfoTable: React.FC = () => {
  const [form] = Form.useForm();

  const {
    periodList,
    loading,
    selectedRowKeys,
    projectList,
    contractList,
    selectedProjectId,
    setSelectedProjectId,
    selectedContractId,
    setSelectedContractId,
    currentPeriod,
    setCurrentPeriod,
    modalOpen,
    setModalOpen,
    fetchPeriodList,
    handleAddOrUpdatePeriod,
    handleDeletePeriod,
    handleArchivePeriod,
    onSelectChange,
  } = usePeriodInfo();

  // 打开或关闭模态框
  const handleModalOpen = (open: boolean, record?: PeriodInfoVO) => {
    setModalOpen(open);
    if (open && record) {
      // 编辑周期信息
      setCurrentPeriod(record);
      form.setFieldsValue({
        ...record,
        startDate: record.startDate ? moment(record.startDate) : undefined,
        endDate: record.endDate ? moment(record.endDate) : undefined,
      });
    } else {
      // 新增周期信息
      setCurrentPeriod(null);
      form.resetFields();
    }
  };

  const downloadFromOSS = async (fileUrl: string) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    try {
      // 通过文件URL直接下载
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const fileName = fileUrl.split('/').pop();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName || 'downloaded_file';
      link.click();
    } catch (err) {
      console.error('文件下载失败:', err);
      throw err;
    }
  };

  // 定义表格的列
  const columns: ProColumns<PeriodInfoVO>[] = [
    {
      title: '编号',
      dataIndex: 'id',
      valueType: 'text',
      fixed: 'left',
      width: 80,
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: '周期名称',
      dataIndex: 'name',
      valueType: 'text',
      fixed: 'left',
      width: 150,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'text',
      width: 100,
    },
    {
      title: '流水号',
      dataIndex: 'serialNumber',
      valueType: 'text',
      width: 100,
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      valueType: 'date',
      width: 120,
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      valueType: 'date',
      width: 120,
    },
    {
      title: '计量月份',
      dataIndex: 'measurementMonth',
      valueType: 'text',
      width: 120,
    },
    {
      title: '周期状态',
      dataIndex: 'periodStatus',
      valueType: 'text',
      width: 120,
    },
    {
      title: '是否归档',
      dataIndex: 'isArchived',
      render: (_, record) => (record.isArchived ? '是' : '否'),
      width: 100,
    },
    {
      title: '附件列表',
      dataIndex: 'attachmentList',
      valueType: 'text',
      render: (_, record) =>
        record.attachmentList && record.attachmentList.length > 0 ? (
          record.attachmentList.map((url: string, index: number) => {
            if (!url) {
              return null; // 或者返回一个占位符
            }

            // 提取并解码文件名
            const decodedFileName = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));

            return (
              <div key={index}>
                <a
                  href="#"
                  onClick={async (e) => {
                    e.preventDefault();
                    await downloadFromOSS(url); // 调用下载函数
                  }}
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'inline-block',
                    maxWidth: '100%',
                  }}
                >
                  {decodedFileName}
                </a>
              </div>
            );
          })
        ) : (
          '-'
        ),
      width: 200,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: 160,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      width: 160,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space>
          {/* 更新操作 */}
          <a onClick={() => handleModalOpen(true, record)}>更新</a>
          {/* 删除操作 */}
          <Popconfirm
            title="确定要删除这个周期信息吗？"
            onConfirm={() => handleDeletePeriod(record.id!)}
          >
            <a>删除</a>
          </Popconfirm>
          {/* 归档操作，仅在未归档时显示 */}
          {!record.isArchived && (
            <Popconfirm
              title="确定要归档这个周期信息吗？"
              onConfirm={() => handleArchivePeriod(record.id!)}
            >
              <a>归档</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 使用 useMemo 优化性能
  const memoizedColumns = useMemo(() => columns, [selectedRowKeys]);

  return (
    <PageContainer breadcrumbRender={false}>
      {/* 项目和合同选择器 */}
      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item label="选择项目">
          <Select
            value={selectedProjectId}
            onChange={(value) => setSelectedProjectId(value)}
            style={{ width: 200 }}
          >
            {projectList.map((project) => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="选择合同">
          <Select
            value={selectedContractId}
            onChange={(value) => setSelectedContractId(value)}
            style={{ width: 200 }}
            disabled={!selectedProjectId || contractList.length === 0}
          >
            {contractList.map((contract) => (
              <Option key={contract.id} value={contract.id}>
                {contract.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>

      {/* 查询表单 */}
      <Form
        layout="vertical"
        onValuesChange={(changedValues) => {
          const { generalQueryCondition } = changedValues;
          fetchPeriodList(generalQueryCondition);
        }}
        style={{ marginBottom: 16 }}
      >
        <Form.Item label="查询" name="generalQueryCondition">
          <Input placeholder="请输入周期名称等信息" />
        </Form.Item>
      </Form>

      {/* 周期信息表格 */}
      <ProTable<PeriodInfoVO>
        headerTitle={
          <div>
            周期信息管理
            {selectedRowKeys.length > 0 && (
              <>
                {/* 批量归档和删除操作 */}
                <Button
                  onClick={() => {
                    selectedRowKeys.forEach((id) => {
                      handleArchivePeriod(id);
                    });
                  }}
                  style={{ marginLeft: 16 }}
                >
                  批量归档
                </Button>
                <Button
                  onClick={() => {
                    selectedRowKeys.forEach((id) => {
                      handleDeletePeriod(id);
                    });
                  }}
                  style={{ marginLeft: 16 }}
                >
                  批量删除
                </Button>
              </>
            )}
          </div>
        }
        columns={memoizedColumns}
        rowKey="id"
        search={false}
        loading={loading}
        dataSource={periodList}
        scroll={{ x: 'max-content' }}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
          preserveSelectedRowKeys: true,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => handleModalOpen(true)}
            disabled={!selectedProjectId || !selectedContractId}
          >
            <PlusOutlined /> 新增周期信息
          </Button>,
        ]}
      />

      {/* 新增/编辑周期信息的弹窗 */}
      <Modal
        title={currentPeriod ? '更新周期信息' : '新增周期信息'}
        visible={modalOpen}
        onCancel={() => handleModalOpen(false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              handleAddOrUpdatePeriod({
                ...currentPeriod,
                ...values,
                attachmentList: values.attachmentList ? values.attachmentList.map((attachment) => attachment.response) : [],
                startDate: values.startDate
                  ? values.startDate.format('YYYY-MM-DD')
                  : undefined,
                endDate: values.endDate
                  ? values.endDate.format('YYYY-MM-DD')
                  : undefined,
              });
              form.resetFields();
              setModalOpen(false);
            })
            .catch((info) => {
              console.log('验证失败:', info);
            });
        }}
      >
        <PeriodInfoForm form={form} />
      </Modal>
    </PageContainer>
  );
};

export default PeriodInfoTable;
