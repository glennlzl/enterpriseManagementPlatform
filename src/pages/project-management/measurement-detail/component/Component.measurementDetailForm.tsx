// MeasurementDetailTable.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ProTable,
  ProColumns,
  PageContainer,
} from '@ant-design/pro-components';
import { Button, Popconfirm, Form, Input, Space, Modal, Select, message, Tree } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMeasurementDetail } from "@/hooks/project/Hook.useMeasurementDetail";
import { MeasurementDetailVO } from "@/model/project/Model.measurement-detail";
import MeasurementDetailForm from "@/pages/project-management/measurement-detail/component/Component.measurementDetailForm";

const { Option } = Select;

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
    fetchMeasurementDetailList,
    handleAddOrUpdateMeasurementDetail,
    handleDeleteMeasurementDetail,
    handleReviewMeasurementDetail,
    onSelectChange,
    selectedItemId,
    setSelectedItemId,
  } = useMeasurementDetail();

  // 示例树形数据（请根据实际情况替换）
  const treeData = [
    {
      title: '计量项目分类 1',
      key: '1',
      children: [
        { title: '计量项目 1-1', key: '11' },
        { title: '计量项目 1-2', key: '12' },
      ],
    },
    {
      title: '计量项目分类 2',
      key: '2',
      children: [
        { title: '计量项目 2-1', key: '21' },
        { title: '计量项目 2-2', key: '22' },
      ],
    },
    // ...更多数据
  ];

  // 当选择树节点时触发
  const onTreeSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const itemId = parseInt(selectedKeys[0] as string, 10);
      setSelectedItemId(itemId);
    } else {
      setSelectedItemId(undefined);
    }
  };

  // 打开或关闭弹窗
  const handleModalOpen = useCallback((open: boolean, record?: MeasurementDetailVO) => {
    setModalOpen(open);
    if (record) {
      setCurrentMeasurementDetail(record);
      form.setFieldsValue({
        ...record,
        relatedProjectId: selectedProjectId,
        relatedContractId: selectedContractId,
        relatedPeriodId: selectedPeriodId,
      });
    } else {
      setCurrentMeasurementDetail(null);
      form.resetFields();
      form.setFieldsValue({
        relatedProjectId: selectedProjectId,
        relatedContractId: selectedContractId,
        relatedPeriodId: selectedPeriodId,
      });
    }
  }, [form, setModalOpen, setCurrentMeasurementDetail, selectedProjectId, selectedContractId, selectedPeriodId]);

  // 表格列定义
  const columns: ProColumns<MeasurementDetailVO>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
      fixed: 'left',
      width: 80,
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: '计量项目ID',
      dataIndex: 'measurementItemId',
      valueType: 'text',
      width: 120,
      sorter: (a, b) => (a.measurementItemId || 0) - (b.measurementItemId || 0),
    },
    {
      title: '子目号',
      dataIndex: 'subItemNumber',
      valueType: 'text',
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
      width: 100,
      sorter: (a, b) => (a.currentCount || 0) - (b.currentCount || 0),
    },
    {
      title: '累计数量',
      dataIndex: 'totalCount',
      valueType: 'digit',
      width: 100,
      sorter: (a, b) => (a.totalCount || 0) - (b.totalCount || 0),
    },
    {
      title: '剩余数量',
      dataIndex: 'remainingCount',
      valueType: 'digit',
      width: 100,
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
      width: 100,
      sorter: (a, b) => (a.upperLimitQuantity || 0) - (b.upperLimitQuantity || 0),
    },
    {
      title: '状态',
      dataIndex: 'measurementStatus',
      valueType: 'select',
      valueEnum: {
        0: { text: '未审核', status: 'Default' },
        1: { text: '已审核', status: 'Success' },
        2: { text: '驳回', status: 'Error' },
      },
      width: 120,
      sorter: (a, b) => (a.measurementStatus || 0) - (b.measurementStatus || 0),
    },
    {
      title: '审核意见',
      dataIndex: 'measurementComment',
      valueType: 'text',
      width: 200,
      ellipsis: true,
    },
    {
      title: '计量单号',
      dataIndex: 'measurementBillNumber',
      valueType: 'text',
      width: 150,
      sorter: (a, b) => (a.measurementBillNumber || '').localeCompare(b.measurementBillNumber || ''),
    },
    {
      title: '计量类型',
      dataIndex: 'measurementType',
      valueType: 'text',
      width: 150,
      sorter: (a, b) => (a.measurementType || '').localeCompare(b.measurementType || ''),
    },
    {
      title: '关联项目ID',
      dataIndex: 'relatedProjectId',
      valueType: 'digit',
      width: 120,
      render: (_, record) => record.relatedProjectId || '-',
    },
    {
      title: '关联合同ID',
      dataIndex: 'relatedContractId',
      valueType: 'digit',
      width: 120,
      render: (_, record) => record.relatedContractId || '-',
    },
    {
      title: '关联周期ID',
      dataIndex: 'relatedPeriodId',
      valueType: 'digit',
      width: 120,
      render: (_, record) => record.relatedPeriodId || '-',
    },
    {
      title: '扩展字段',
      dataIndex: 'extend',
      valueType: 'text',
      width: 150,
      ellipsis: true,
    },
    {
      title: '合同费用类型',
      dataIndex: 'contractCostType',
      valueType: 'text',
      width: 150,
      sorter: (a, b) => (a.contractCostType || '').localeCompare(b.contractCostType || ''),
    },
    {
      title: '交易类型',
      dataIndex: 'transactionType',
      valueType: 'text',
      width: 150,
      sorter: (a, b) => (a.transactionType || '').localeCompare(b.transactionType || ''),
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
      sorter: (a, b) => new Date(a.createTime || 0).getTime() - new Date(b.createTime || 0).getTime(),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      width: 160,
      sorter: (a, b) => new Date(a.updateTime || 0).getTime() - new Date(b.updateTime || 0).getTime(),
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
  const memoizedColumns = useMemo(() => columns, [columns]);

  return (
    <PageContainer breadcrumbRender={false}>
      <div style={{ display: 'flex' }}>
        {/* 左侧的 Tree 组件 */}
        <div style={{ width: 250, marginRight: 16 }}>
          <Tree
            treeData={treeData}
            onSelect={onTreeSelect}
          />
        </div>

        {/* 右侧的内容 */}
        <div style={{ flex: 1 }}>
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
            layout="vertical"
            onValuesChange={(changedValues) => {
              const { generalQueryCondition } = changedValues;
              fetchMeasurementDetailList(generalQueryCondition, selectedItemId);
            }}
            style={{ marginBottom: 16 }}
          >
            <Form.Item label="查询" name="generalQueryCondition">
              <Input placeholder="请输入子目号、位置等信息" />
            </Form.Item>
          </Form>

          {/* 计量明细表格 */}
          <ProTable<MeasurementDetailVO>
            headerTitle={
              <div>
                计量支付管理
                {selectedRowKeys.length > 0 && (
                  <>
                    {/* 可以添加批量操作按钮 */}
                    <Button onClick={() => message.info('批量操作功能待实现')} style={{ marginLeft: 16 }}>
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
            dataSource={measurementDetailList}
            scroll={{ x: 2500 }}
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
          >
            <MeasurementDetailForm form={form} />
          </Modal>
        </div>
      </div>
    </PageContainer>
  );
};

export default MeasurementDetailTable;
