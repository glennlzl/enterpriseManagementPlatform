// MeasurementDetailTable.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ProTable, ProColumns, PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Popconfirm,
  Form,
  Input,
  Space,
  Modal,
  Select,
  message,
  Table,
  Tree,
  Row,
  Col,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMeasurementDetail } from '@/hooks/project/Hook.useMeasurementDetail';
import { MeasurementDetailVO } from '@/model/project/Model.measurement-detail';
import MeasurementDetailForm from '@/pages/project-management/measurement-detail/component/Component.measurementDetailForm';

const { Option } = Select;
const { DirectoryTree } = Tree;

const MeasurementDetailTable: React.FC = () => {
  const [form] = Form.useForm();

  const {
    measurementDetailList,
    loading,
    selectedRowKeys,
    projectList,
    contractList,
    periodList,
    selectedProjectId,
    setSelectedProjectId,
    selectedContractId,
    setSelectedContractId,
    selectedPeriodId,
    setSelectedPeriodId,
    currentMeasurementDetail,
    setCurrentMeasurementDetail,
    modalOpen,
    setModalOpen,
    handleAddOrUpdateMeasurementDetail,
    handleDeleteMeasurementDetail,
    handleReviewMeasurementDetail,
    onSelectChange,
    selectedItemId,
    setSelectedItemId,
    measurementItemList,
    measurementItemTreeData,
    fetchMeasurementDetailList,
    operationLogModalOpen,
    setOperationLogModalOpen,
    operationLogs,
    operationLogLoading,
    handleDeleteOperationLog,
    handleOpenOperationLogModal,
  } = useMeasurementDetail();

  // 当选择树节点时触发
  const onTreeSelect: React.ComponentProps<typeof DirectoryTree>['onSelect'] = (keys, info) => {
    if (keys.length > 0) {
      const itemId = parseInt(keys[0] as string, 10);
      setSelectedItemId(itemId);
      fetchMeasurementDetailList(undefined, itemId);
    } else {
      setSelectedItemId(undefined);
      fetchMeasurementDetailList();
    }
  };

  // 打开或关闭弹窗
  const handleModalOpen = useCallback(
    (open: boolean, record?: MeasurementDetailVO) => {
      setModalOpen(open);
      if (record) {
        setCurrentMeasurementDetail(record);
        form.setFieldsValue({
          ...record,
        });
      } else {
        setCurrentMeasurementDetail(null);
        form.resetFields();
      }
    },
    [form, setModalOpen, setCurrentMeasurementDetail],
  );

  const measurementItems = measurementItemList.map((item) => ({
    value: item.id!,
    label: item.name!, // 用于选中后显示的内容
    item, // 将整个 item 对象传递给子组件
  }));

  // 字段名到中文列名的映射
  const fieldNameMap: { [key: string]: { label: string; isDate?: boolean } } = {
    id: { label: '序号' },
    measurementItemId: { label: '测量项' },
    subItemNumber: { label: '子目号' },
    position: { label: '位置' },
    price: { label: '单价' },
    unit: { label: '单位' },
    currentCount: { label: '当前数量' },
    totalCount: { label: '累计数量' },
    remainingCount: { label: '剩余数量' },
    currentAmount: { label: '当前金额' },
    upperLimitQuantity: { label: '上限数量' },
    measurementStatus: { label: '状态' },
    measurementComment: { label: '审核意见' },
    measurementBillNumber: { label: '计量单号' },
    measurementType: { label: '计量类型' },
    extend: { label: '扩展字段' },
    contractCostType: { label: '合同费用类型' },
    transactionType: { label: '交易类型' },
    attachmentList: { label: '附件列表' },
    updateTime: { label: '更新时间', isDate: true },
    createTime: { label: '创建时间', isDate: true },
    // 根据需要添加更多字段
  };

  // 格式化值的函数
  const formatValue = (value: any, fieldKey?: string): string => {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return '-';
    } else if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === 'object') {
            // 提取对象中的关键字段
            const itemDetails = Object.keys(item)
              .map((key) => {
                const fieldInfo = fieldNameMap[key] || { label: key };
                const fieldLabel = fieldInfo.label;
                const fieldValue = formatValue(item[key], key);
                return `${fieldLabel}: ${fieldValue}`;
              })
              .join(', ');
            return `{ ${itemDetails} }`;
          } else {
            return String(item);
          }
        })
        .join('; ');
    } else if (typeof value === 'object') {
      // 对象，提取关键字段
      const objectDetails = Object.keys(value)
        .map((key) => {
          const fieldInfo = fieldNameMap[key] || { label: key };
          const fieldLabel = fieldInfo.label;
          const fieldValue = formatValue(value[key], key);
          return `${fieldLabel}: ${fieldValue}`;
        })
        .join(', ');
      return `{ ${objectDetails} }`;
    } else if (
      fieldKey &&
      fieldNameMap[fieldKey] &&
      fieldNameMap[fieldKey].isDate &&
      typeof value === 'number'
    ) {
      // 如果是时间字段，且值是数字，则格式化为日期
      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    } else {
      return String(value);
    }
  };

  // 解析操作日志记录的函数
  const parseOperationRecord = (record: OperationLogVO) => {
    try {
      const operationFieldArray = JSON.parse(record.operationField);
      const operationFieldOriginalValueArray = JSON.parse(record.operationFieldOriginalValue);
      const operationFieldNewValueArray = JSON.parse(record.operationFieldNewValue);

      const parsedOriginalValues = operationFieldOriginalValueArray.map((value) =>
        JSON.parse(value)
      );
      const parsedNewValues = operationFieldNewValueArray.map((value) =>
        JSON.parse(value)
      );

      const changes = operationFieldArray.map((field: string, index: number) => ({
        field,
        originalValue: parsedOriginalValues[index],
        newValue: parsedNewValues[index],
      }));

      return changes;
    } catch (error) {
      console.error('解析操作记录失败:', error);
      return [];
    }
  };

  // 定义操作日志的列
  const operationLogColumns: ProColumns<OperationLogVO>[] = [
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 100,
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      width: 160,
    },
    {
      title: '修改详情',
      key: 'operationDetail',
      width: 400,
      render: (_, record) => {
        const changes = parseOperationRecord(record);
        return changes.map((change, index) => {
          // 使用字段名映射获取中文列名
          const fieldInfo = fieldNameMap[change.field] || { label: change.field };
          const fieldName = fieldInfo.label;

          // 将 originalValue 和 newValue 转换为易读的字符串
          const originalValueText = formatValue(change.originalValue, change.field);
          const newValueText = formatValue(change.newValue, change.field);
          return (
            <div key={index} style={{ marginBottom: '8px' }}>
              <strong>{fieldName}:</strong>
              <div>
                <span style={{ color: 'red' }}>原始值:</span> {originalValueText}
              </div>
              <div>
                <span style={{ color: 'green' }}>新值:</span> {newValueText}
              </div>
            </div>
          );
        });
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除这条操作日志吗？"
          onConfirm={() => handleDeleteOperationLog(record)}
          okText="确定"
          cancelText="取消"
        >
          <a>删除</a>
        </Popconfirm>
      ),
    },
  ];


  // 表格列定义，包含所有字段
  const columns: ProColumns<MeasurementDetailVO>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'text',
      fixed: 'left',
      width: 80,
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: '测量项',
      dataIndex: 'measurementItemId',
      valueType: 'text',
      width: 150,
      render: (_, record) => {
        const item = measurementItemList.find((item) => item.id === record.measurementItemId);
        return item ? item.itemName : record.measurementItemId;
      },
    },
    {
      title: '子目号',
      dataIndex: 'subItemNumber',
      valueType: 'text',
      fixed: 'left',
      width: 120,
      sorter: (a, b) => (a.subItemNumber || '').localeCompare(b.subItemNumber || ''),
    },
    {
      title: '位置',
      dataIndex: 'position',
      valueType: 'text',
      width: 150,
      sorter: (a, b) => (a.position || '').localeCompare(b.position || ''),
    },
    {
      title: '单价',
      dataIndex: 'price',
      valueType: 'money',
      width: 100,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      valueType: 'text',
      width: 100,
      sorter: (a, b) => (a.unit || '').localeCompare(b.unit || ''),
    },
    {
      title: '当前数量',
      dataIndex: 'currentCount',
      valueType: 'digit',
      width: 120,
      sorter: (a, b) => (a.currentCount || 0) - (b.currentCount || 0),
    },
    {
      title: '累计数量',
      dataIndex: 'totalCount',
      valueType: 'digit',
      width: 120,
      sorter: (a, b) => (a.totalCount || 0) - (b.totalCount || 0),
    },
    {
      title: '剩余数量',
      dataIndex: 'remainingCount',
      valueType: 'digit',
      width: 120,
      sorter: (a, b) => (a.remainingCount || 0) - (b.remainingCount || 0),
    },
    {
      title: '当前金额',
      dataIndex: 'currentAmount',
      valueType: 'money',
      width: 120,
      sorter: (a, b) => (a.currentAmount || 0) - (b.currentAmount || 0),
    },
    {
      title: '上限数量',
      dataIndex: 'upperLimitQuantity',
      valueType: 'digit',
      width: 120,
      sorter: (a, b) => (a.upperLimitQuantity || 0) - (b.upperLimitQuantity || 0),
    },
    {
      title: '状态',
      dataIndex: 'measurementStatus',
      valueType: 'select',
      width: 120,
      valueEnum: {
        0: { text: '未审核', status: 'Default' },
        1: { text: '已审核', status: 'Success' },
        2: { text: '驳回', status: 'Error' },
      },
      sorter: (a, b) => (a.measurementStatus || 0) - (b.measurementStatus || 0),
    },
    {
      title: '审核意见',
      dataIndex: 'measurementComment',
      valueType: 'text',
      width: 150,
    },
    {
      title: '计量单号',
      dataIndex: 'measurementBillNumber',
      valueType: 'text',
      width: 150,
    },
    {
      title: '计量类型',
      dataIndex: 'measurementType',
      valueType: 'text',
      width: 150,
    },
    {
      title: '扩展字段',
      dataIndex: 'extend',
      valueType: 'text',
      width: 150,
    },
    {
      title: '合同费用类型',
      dataIndex: 'contractCostType',
      valueType: 'text',
      width: 150,
    },
    {
      title: '交易类型',
      dataIndex: 'transactionType',
      valueType: 'text',
      width: 150,
    },
    {
      title: '附件列表',
      dataIndex: 'attachmentList',
      valueType: 'text',
      width: 150,
      render: (_, record) => {
        return record.attachmentList ? record.attachmentList.join(', ') : '';
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      width: 180,
      sorter: (a, b) => new Date(a.updateTime || '').getTime() - new Date(b.updateTime || '').getTime(),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: 180,
      sorter: (a, b) => new Date(a.createTime || '').getTime() - new Date(b.createTime || '').getTime(),
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
            title="确定要删除这个计量明细吗？"
            onConfirm={() => handleDeleteMeasurementDetail(record.id!)}
          >
            <a>删除</a>
          </Popconfirm>
          <a onClick={() => handleOpenOperationLogModal(record)}>日志</a>
          {record.measurementStatus === 0 && (
            <>
              <a onClick={() => handleReviewMeasurementDetail(record.id!, 1)}>审核</a>
              <a onClick={() => handleReviewMeasurementDetail(record.id!, 2)}>驳回</a>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 使用 useMemo 优化性能
  const memoizedColumns = useMemo(() => columns, [columns, measurementItemList]);

  // 查询表单
  const [searchForm] = Form.useForm();

  return (
    <PageContainer breadcrumbRender={false}>
      <Row gutter={[16, 16]}>
        {/* 左侧的 DirectoryTree 组件 */}
        <Col flex="300px">
          <div style={{ background: '#fff', padding: '16px', borderRadius: '8px' }}>
            <DirectoryTree
              multiple
              defaultExpandAll
              onSelect={onTreeSelect}
              treeData={measurementItemTreeData} // 使用真实的树形数据
            />
          </div>
        </Col>

        {/* 右侧的内容 */}
        <Col flex="auto">
          <div style={{ background: '#fff', padding: '16px', borderRadius: '8px' }}>
            {/* 项目、合同、周期选择器 */}
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
              <Form.Item label="选择周期">
                <Select
                  value={selectedPeriodId}
                  onChange={(value) => setSelectedPeriodId(value)}
                  style={{ width: 200 }}
                  disabled={!selectedContractId || periodList.length === 0}
                >
                  {periodList.map((period) => (
                    <Option key={period.id} value={period.id}>
                      {period.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>

            {/* 查询表单 */}
            <Form
              form={searchForm}
              layout="inline"
              onValuesChange={(changedValues) => {
                const { generalQueryCondition } = changedValues;
                fetchMeasurementDetailList(generalQueryCondition, selectedItemId);
              }}
              style={{ marginBottom: 16 }}
            >
              <Form.Item label="查询" name="generalQueryCondition">
                <Input placeholder="请输入子目号、位置等信息" style={{ width: 300 }} />
              </Form.Item>
            </Form>

            {/* 计量明细表格 */}
            <ProTable<MeasurementDetailVO>
              headerTitle="计量支付管理"
              columns={memoizedColumns}
              rowKey="id"
              search={false}
              loading={loading}
              dataSource={measurementDetailList}
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
                  disabled={!selectedProjectId || !selectedContractId || !selectedPeriodId}
                >
                  <PlusOutlined /> 新增计量明细
                </Button>,
              ]}
            />

            {/* 新增/编辑计量明细的弹窗 */}
            <Modal
              title={currentMeasurementDetail ? '编辑计量明细' : '新增计量明细'}
              visible={modalOpen}
              onCancel={() => handleModalOpen(false)}
              onOk={() => {
                form
                  .validateFields()
                  .then((values) => {
                    handleAddOrUpdateMeasurementDetail(values);
                    form.resetFields();
                    setModalOpen(false);
                  })
                  .catch((info) => {
                    console.log('验证失败:', info);
                  });
              }}
              width={800}
            >
              <MeasurementDetailForm
                form={form}
                measurementItems={measurementItems}
              />
            </Modal>
            {/* 操作日志的模态框 */}
            <Modal
              title="操作日志"
              visible={operationLogModalOpen}
              onCancel={() => setOperationLogModalOpen(false)}
              footer={null}
              width={1000}
            >
              <Table
                dataSource={operationLogs}
                columns={operationLogColumns}
                rowKey="id"
                loading={operationLogLoading}
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            </Modal>
          </div>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default MeasurementDetailTable;
