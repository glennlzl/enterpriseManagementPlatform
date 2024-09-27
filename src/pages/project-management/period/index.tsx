import React, { useMemo } from 'react';
import {
  ProTable,
  ProColumns,
  PageContainer,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Form, Input, Space, Modal, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import { PeriodInfoVO } from "@/model/project/Model.period";
import { usePeriodInfo } from "@/hooks/project/Hook.usePeriodInfo";
import PeriodInfoForm from "@/pages/project-management/period/component/PeriodInfoForm";

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

  const handleModalOpen = (open: boolean, record?: PeriodInfoVO) => {
    setModalOpen(open);
    if (record) {
      setCurrentPeriod(record);
      form.setFieldsValue({
        ...record,
        startDate: record.startDate ? moment(record.startDate) : undefined,
        endDate: record.endDate ? moment(record.endDate) : undefined,
      });
    } else {
      setCurrentPeriod(null);
      form.resetFields();
    }
  };

  // 更新后的 columns 数组，包含所有的字段
  const columns: ProColumns<PeriodInfoVO>[] = [
    {
      title: 'ID',
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
      title: '关联项目ID',
      dataIndex: 'relatedProjectId',
      valueType: 'digit',
      width: 100,
      render: (_, record) => record.relatedProjectId || '-',
    },
    {
      title: '关联合同ID',
      dataIndex: 'relatedContractId',
      valueType: 'digit',
      width: 100,
      render: (_, record) => record.relatedContractId || '-',
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
      render: (_, record) => (
        <Space>
          {record.attachmentList?.map((file, index) => (
            <a key={index} href={file} target="_blank" rel="noopener noreferrer">
              附件{index + 1}
            </a>
          )) || '-'}
        </Space>
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
          <a onClick={() => handleModalOpen(true, record)}>编辑</a>
          <Popconfirm
            title="确定要删除这个周期信息吗？"
            onConfirm={() => handleDeletePeriod(record.id!)}
          >
            <a>删除</a>
          </Popconfirm>
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

  // 使用 useMemo 优化性能（可选）
  const memoizedColumns = useMemo(() => columns, [columns]);

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
                {/* 可以添加批量操作按钮 */}
                <Button onClick={() => message.info('批量操作功能待实现')} style={{ marginLeft: 16 }}>
                  批量归档
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
        title={currentPeriod ? '编辑周期信息' : '新增周期信息'}
        visible={modalOpen}
        onCancel={() => handleModalOpen(false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              handleAddOrUpdatePeriod({
                ...currentPeriod,
                ...values,
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
