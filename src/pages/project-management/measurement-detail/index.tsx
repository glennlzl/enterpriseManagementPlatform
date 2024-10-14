import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ProTable, ProColumns, PageContainer } from '@ant-design/pro-components';
import {
  Popconfirm,
  Form,
  Select,
  message,
  Tree,
  Layout,
  Button,
  DatePicker,
  Input,
  Modal,
  Space,
  Badge,
  Tabs,
  Typography,
  Tooltip,
  Upload,
  Popover,
  List,
  Card,
  Avatar,
  Descriptions,
  Divider,
  Table,
  Result,
  Alert,
} from 'antd';
import { PlusOutlined, FileOutlined } from '@ant-design/icons';
import { useMeasurementDetail } from '@/hooks/project/Hook.useMeasurementDetail';
import { MeasurementDetailVO } from '@/model/project/Model.measurement-detail';
import MeasurementDetailForm from '@/pages/project-management/measurement-detail/component/Component.measurementDetailForm';
import moment from 'moment';
import { OperationLogVO } from '@/model/project/Model.operation';
const { Option } = Select;
const { DirectoryTree } = Tree;
const { Sider, Content } = Layout;

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
    selectedItem,
    setSelectedItem,
    measurementItemList,
    measurementItemTreeData,
    operationLogModalOpen,
    setOperationLogModalOpen,
    operationLogs,
    operationLogLoading,
    handleDeleteOperationLog,
    handleOpenOperationLogModal,
    reviewModalVisible,
    setReviewModalVisible,
    currentReviewRecord,
    reviewComment,
    setReviewComment,
    handleOpenReviewModal,
    handleSubmitReview,
    handleExportReport,
    handleProjectChange,
    handleContractChange,
    handlePeriodChange,
  } = useMeasurementDetail();

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (measurementItemTreeData && measurementItemTreeData.length > 0) {
      // 递归获取所有节点的 key
      const getAllKeys = (data: any[]): React.Key[] => {
        let keys: React.Key[] = [];
        data.forEach((item) => {
          keys.push(item.key);
          if (item.children) {
            keys = keys.concat(getAllKeys(item.children));
          }
        });
        return keys;
      };

      const allKeys = getAllKeys(measurementItemTreeData);
      setExpandedKeys(allKeys);
    }
  }, [measurementItemTreeData]);

  const onTreeSelect: React.ComponentProps<typeof DirectoryTree>['onSelect'] = (keys, info) => {
    if (info.node.isLeaf) {
      const selectedNode = info.node;
      const itemId = selectedNode.itemId;
      const type = selectedNode.type;
      const item = selectedNode.item;

      setSelectedItem({
        id: itemId,
        type: type,
        item: item,
      });
    } else {
      // 父节点被点击
      const type = info.node.key === 'cost-folder' ? 'cost' : 'material';
      setSelectedItem({
        id: undefined, // id 为空
        type: type, // 类型为 'cost' 或 'material'
        item: undefined,
      });
    }
  };

  // 打开或关闭弹窗
  const handleModalOpen = useCallback(
    (open: boolean, record?: MeasurementDetailVO) => {
      if (open && !record) {
        // 如果未选择子项目，提示用户并返回
        if (!selectedItem || !selectedItem.id) {
          message.warning('请选择一条清单进行计量');
          return;
        }
      }
      setModalOpen(open);
      if (open) {
        if (record) {
          setCurrentMeasurementDetail(record);
          form.setFieldsValue({
            ...record,
          });
        } else {
          setCurrentMeasurementDetail(null);
          form.resetFields();
          if (selectedItem?.item) {
            form.setFieldsValue({
              unit: selectedItem.item.itemUnit,
              price: selectedItem.item.itemPrice,
              // 如果需要预填充其他字段，可以在这里添加
            });
          }
        }
      }
    },
    [form, setModalOpen, setCurrentMeasurementDetail, selectedItem],
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
    subItemNumber: { label: '分项(桩号) ' },
    position: { label: '部位' },
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
    extend: { label: '备注' },
    contractCostType: { label: '合同费用类型' },
    transactionType: { label: '交易类型' },
    attachmentList: { label: '附件列表' },
    updateTime: { label: '更新时间', isDate: true },
    createTime: { label: '创建时间', isDate: true },
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
          if (item !== null && typeof item === 'object') {
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
    } else if (value !== null && typeof value === 'object') {
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
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '修改详情',
      key: 'operationDetail',
      width: 600,
      render: (_, record) => {
        const changes = parseOperationRecord(record);
        return changes.map((change, index) => {
          const fieldInfo = fieldNameMap[change.field] || { label: change.field };
          const fieldName = fieldInfo.label;
          const originalValueText = formatValue(change.originalValue, change.field);
          const newValueText = formatValue(change.newValue, change.field);

          return (
            <div key={index} style={{ marginBottom: '8px' }}>
              <strong>{fieldName}：</strong>
              <div>
                <span style={{ color: 'red' }}>原始值：{originalValueText}</span> →
                <span style={{ color: 'green' }}> 新值：{newValueText}</span>
              </div>
            </div>
          );
        });
      },
    },
  ];

  const headerTitle = useMemo(() => {
    let measurementTypeText = '';
    let measurementItemName = '总览';

    if (selectedItem?.type === 'cost') {
      measurementTypeText = '费用计量支付管理';
    } else if (selectedItem?.type === 'material') {
      measurementTypeText = '工程清单计量支付管理';
    } else {
      measurementTypeText = '计量支付管理';
    }

    if (selectedItem?.id) {
      // 如果选择了子项，使用其名称
      measurementItemName = selectedItem.item.itemName || '未知项目';
    }

    return `${measurementTypeText}（${measurementItemName}）`;
  }, [selectedItem]);

  // 提取文件名的函数
  const extractFileName = (fileUrl) => {
    // 根据您的逻辑提取文件名
    // 例如：
    const prefix = 'http://rohana-erp.oss-cn-beijing.aliyuncs.com/files/';
    let fileName = '未知文件';
    if (fileUrl && fileUrl.startsWith(prefix)) {
      const rawFileName = fileUrl.replace(prefix, '');
      const decodedFileName = decodeURIComponent(rawFileName.replace(/^[a-zA-Z0-9-]+_/, ''));
      fileName = decodedFileName;
    }
    return fileName;
  };

  const downloadFromOSS = async (fileUrl: string) => {
    try {
      // 使用 fetch 获取文件
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const fileName = extractFileName(fileUrl);

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);

      // 触发下载
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      message.error('文件下载失败');
    }
  };

// 渲染附件列表列的函数
  const renderApprovalFilesInTable = (_, record) => {
    // 过滤掉 null 或 undefined 的文件 URL
    const validFileUrls = (record.attachmentList || []).filter((url) => url);

    // 统一的容器样式
    const containerStyle = {
      display: 'flex',
      alignItems: 'center',
    };

    // // 如果没有有效的文件 URL
    // if (validFileUrls.length === 0) {
    //   return (
    //     <div style={containerStyle}>
    //       <Typography.Text>无文件</Typography.Text>
    //     </div>
    //   );
    // }

    // 有文件的情况
    return (
      <div style={containerStyle}>
        <Popover
          content={
            <div style={{ maxWidth: '400px' }}>
              <List
                itemLayout="horizontal"
                dataSource={validFileUrls}
                renderItem={(fileUrl) => {
                  const fileName = extractFileName(fileUrl);
                  return (
                    <List.Item
                      key={fileUrl}
                      actions={[
                        <Button
                          type="link"
                          onClick={async () => {
                            await downloadFromOSS(fileUrl);
                          }}
                        >
                          下载
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<FileOutlined style={{ fontSize: '24px' }} />}
                        title={
                          <Typography.Text
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '80%',
                              display: 'block',
                            }}
                            title={fileName}
                          >
                            {fileName}
                          </Typography.Text>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </div>
          }
          title="文件列表"
          trigger="hover"
          overlayStyle={{ width: '400px' }}
        >
          <Button type="link">
            查看文件 ({validFileUrls.length})
          </Button>
        </Popover>
      </div>
    );
  };

  // 表格列定义，包含所有字段
  const columns = useMemo(() => {
    const cols: ProColumns<MeasurementDetailVO>[] = [
      // 基础列，始终显示
      {
        title: '序号',
        dataIndex: 'id',
        valueType: 'text',
        fixed: 'left',
        width: 80,
        sorter: (a, b) => (a.id || 0) - (b.id || 0),
      },
      {
        title: '清单名称',
        dataIndex: 'name',
        valueType: 'text',
        fixed: 'left',
        width: 150,
      },
    ];

    // 根据 selectedItem 的类型，决定是否添加“合同费用类型”和“交易类型”列
    if (selectedItem?.type !== 'material') {
      cols.push(
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
          title: '金额（元）',
          dataIndex: 'currentCount',
          valueType: 'money', // 将 'digit' 改为 'money'
          width: 150,
          sorter: (a, b) => (a.currentCount || 0) - (b.currentCount || 0),
        },
      );
    }

    if (selectedItem?.type !== 'cost') {
      cols.push(
        {
          title: '分项 （桩号）',
          dataIndex: 'subItemNumber',
          valueType: 'text',
          width: 150,
        },
        {
          title: '部位',
          dataIndex: 'position',
          valueType: 'text',
          width: 150,
        },
        {
          title: '单位',
          dataIndex: 'unit',
          valueType: 'text',
          width: 150,
        },
        {
          title: '单价',
          dataIndex: 'price',
          valueType: 'text',
          width: 150,
        },
        {
          title: '本期末累积量',
          dataIndex: 'remainingCount',
          valueType: 'text',
          width: 150,
        },
        {
          title: '设计量',
          dataIndex: 'upperLimitQuantity',
          valueType: 'text',
          width: 150,
        },
        {
          title: '本期计量（元）',
          dataIndex: 'currentCount',
          valueType: 'money', // 将 'digit' 改为 'money'
          width: 150,
          sorter: (a, b) => (a.currentCount || 0) - (b.currentCount || 0),
        },
        {
          title: '总价（元）',
          dataIndex: 'totalCount',
          valueType: 'money', // 将 'digit' 改为 'money'
          width: 150,
          sorter: (a, b) => (a.totalCount || 0) - (b.totalCount || 0),
        },
      );
    }

    if (selectedItem?.id) {
      cols.push({
        title: '附件列表',
        dataIndex: 'attachmentList',
        valueType: 'text',
        render: renderApprovalFilesInTable,
        width: 200,
        ellipsis: true,
      });
    }

    // 添加剩余的列
    cols.push(
      {
        title: '状态',
        dataIndex: 'measurementStatus',
        valueType: 'select',
        width: 120,
        valueEnum: {
          0: { text: '未审核', status: 'Default' },
          1: { text: '通过', status: 'Success' },
          2: { text: '驳回', status: 'Error' },
        },
        sorter: (a, b) => (a.measurementStatus || 0) - (b.measurementStatus || 0),
      },
      {
        title: '计量单号',
        dataIndex: 'measurementBillNumber',
        valueType: 'text',
        width: 150,
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        valueType: 'dateTime',
        width: 180,
        sorter: (a, b) =>
          new Date(a.updateTime || '').getTime() - new Date(b.updateTime || '').getTime(),
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        valueType: 'dateTime',
        width: 180,
        sorter: (a, b) =>
          new Date(a.createTime || '').getTime() - new Date(b.createTime || '').getTime(),
      },
      {
        title: '审核意见',
        dataIndex: 'measurementComment',
        valueType: 'text',
        width: 150,
      },
      {
        title: '操作',
        dataIndex: 'option',
        valueType: 'option',
        fixed: 'right',
        width: 250,
        render: (_, record) => {
          if (!selectedItem || !selectedItem.id) {
            return null;
          }

          return (
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
                <a onClick={() => handleOpenReviewModal(record)}>审核</a>
              )}
            </Space>
          );
        },
      },
    );

    return cols;
  }, [selectedItem]);

  const addButtonDisabled =
    !selectedProjectId ||
    !selectedContractId ||
    !selectedPeriodId ||
    !selectedItem ||
    !selectedItem.id;

  // 查询表单
  const [searchForm] = Form.useForm();

  const isTreeEmpty = useMemo(() => {
    if (!measurementItemTreeData || measurementItemTreeData.length === 0) {
      return true;
    }
    return measurementItemTreeData.every(node => !node.children || node.children.length === 0);
  }, [measurementItemTreeData]);

  const handleExportCSV = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要导出的行');
      return;
    }

    const selectedData = measurementDetailList.filter(record => selectedRowKeys.includes(record.id!));

    if (selectedData.length === 0) {
      message.warning('未找到选中的数据');
      return;
    }

    const exportColumns = columns.filter(col => {
      return col.dataIndex && col.title && col.hideInTable !== true && col.dataIndex !== 'option';
    });

    const headers = exportColumns.map(col => col.title as string);

    const rows = selectedData.map(record => {
      return exportColumns.map(col => {
        const dataIndex = col.dataIndex as string;
        let value = record[dataIndex as keyof MeasurementDetailVO];
        if (col.valueType === 'dateTime' && value) {
          value = moment(value as string).format('YYYY-MM-DD HH:mm:ss');
        } else if (col.valueType === 'select' && col.valueEnum && value !== undefined) {
          const enumValue = col.valueEnum[value as React.Key];
          value = enumValue ? enumValue.text : value;
        }
        return value !== undefined && value !== null ? value : '';
      });
    });

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `导出数据-${moment().format('YYYYMMDD')}.csv`;
    saveAs(blob, fileName);
  };


  return (
    <PageContainer breadcrumbRender={false}>
      <Layout style={{ background: '#fff' }}>
        {/* 左侧的 Sider 组件 */}
        <Sider width={300} style={{ background: '#fff' }}>
          <div style={{ padding: '16px' }}>
            {isTreeEmpty ? (
              // 当树为空时，显示提示信息
              <div style={{ textAlign: 'center', color: '#999', paddingTop: '50px' }}>
                当前没有可用的计量项，请先在合同表格中添加测量项。然后在右侧选择项目，合同和周期。
              </div>
            ) : (
              // 当树有数据时，显示树形控件
              <DirectoryTree
                multiple
                expandedKeys={expandedKeys}
                onExpand={(keys) => setExpandedKeys(keys)}
                onSelect={onTreeSelect}
                treeData={measurementItemTreeData}
              />
            )}
          </div>
        </Sider>

        {/* 右侧的 Content */}
        <Layout style={{ background: '#fff' }}>
          <Content style={{ padding: '16px' }}>
            {/* 项目、合同、周期选择器 */}
            <Form layout="inline" style={{ marginBottom: 16 }}>
              <Form.Item label="选择项目">
                <Select
                  value={selectedProjectId}
                  onChange={handleProjectChange}
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
                  onChange={handleContractChange}
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
                  onChange={handlePeriodChange}
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
                fetchMeasurementDetailList(generalQueryCondition);
              }}
              style={{ marginBottom: 16 }}
            >
              <Form.Item label="查询" name="generalQueryCondition">
                <Input placeholder="请输入序号、部位等信息" style={{ width: 500 }} />
              </Form.Item>
            </Form>

            {/* 计量明细表格 */}
            <ProTable<MeasurementDetailVO>
              headerTitle={headerTitle}
              columns={columns}
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
                addButtonDisabled ? (
                  <Tooltip title={'请选择一条清单进行计量'} key="add-button-tooltip">
                    <Button
                      type="primary"
                      onClick={() => handleModalOpen(true)}
                      disabled={addButtonDisabled}
                    >
                      <PlusOutlined /> 新增计量明细
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    type="primary"
                    key="primary"
                    onClick={() => handleModalOpen(true)}
                    disabled={addButtonDisabled}
                  >
                    <PlusOutlined /> 新增计量明细
                  </Button>
                ),
                <Button
                  type="default"
                  key="export-csv"
                  onClick={handleExportCSV}
                  disabled={selectedRowKeys.length === 0}
                >
                  导出当前表格
                </Button>,
                <Button
                  type="default"
                  key="export"
                  onClick={handleExportReport}
                  disabled={!selectedContractId || !selectedPeriodId || !selectedItem}
                >
                  导出全量报表
                </Button>,
              ]}
            />

            {/* 新增/编辑计量明细的弹窗 */}
            <Modal
              title={
                currentMeasurementDetail
                  ? `编辑${selectedItem?.type === 'cost' ? '费用' : '工程'}计量明细`
                  : `新增${selectedItem?.type === 'cost' ? '费用' : '工程'}计量明细`
              }
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
                selectedMeasurementItem={selectedItem?.item}
                measurementType={selectedItem?.type || 'material'}
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
            {/* 审核模态框 */}
            <Modal
              title="审核计量明细"
              visible={reviewModalVisible}
              onCancel={() => setReviewModalVisible(false)}
              footer={null}
            >
              <Form layout="vertical">
                <Form.Item label="审核意见">
                  <Input.TextArea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="请输入审核意见"
                  />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" onClick={() => handleSubmitReview(1)}>
                      同意
                    </Button>
                    <Button danger onClick={() => handleSubmitReview(2)}>
                      驳回
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </PageContainer>
  );
};

export default MeasurementDetailTable;
