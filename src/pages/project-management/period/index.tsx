import React, { useMemo } from 'react';
import {
  ProTable,
  ProColumns,
  PageContainer,
} from '@ant-design/pro-components';
import {Button, Popconfirm, Form, Input, Space, Modal, Select, message, Table, List, Popover, Typography} from 'antd';
import {FileOutlined, PlusOutlined} from '@ant-design/icons';
import moment from 'moment';
import { PeriodInfoVO } from '@/model/project/Model.period';
import { usePeriodInfo } from '@/hooks/project/Hook.usePeriodInfo';
import PeriodInfoForm from '@/pages/project-management/period/component/PeriodInfoForm';
import {isLogin} from "@/api/usermanagement";
import {history} from "@@/core/history";
import {OperationLogVO} from "@/model/project/Model.operation";

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
    operationLogModalOpen,
    setOperationLogModalOpen,
    operationLogs,
    operationLogLoading,
    handleDeleteOperationLog,
    handleOpenOperationLogModal,
    handleProjectChange,
    handleContractChange
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
        attachmentList: record.attachmentList
          ? record.attachmentList
            .filter((url) => url)
            .map((url, index) => ({
              uid: `-${index}`,
              name: extractFileName(url),
              status: 'done',
              url: url,
            }))
          : [],
      });
    } else {
      // 新增周期信息
      setCurrentPeriod(null);
      form.resetFields();
    }
  };

  // 定义字段名到中文列名的映射
  const fieldNameMap: { [key: string]: { label: string; isDate?: boolean } } = {
    id: { label: '编号' },
    name: { label: '周期名称' },
    type: { label: '类型' },
    serialNumber: { label: '流水号' },
    startDate: { label: '开始日期', isDate: true },
    endDate: { label: '结束日期', isDate: true },
    measurementMonth: { label: '计量月份' },
    periodStatus: { label: '周期状态' },
    isArchived: { label: '是否归档' },
    attachmentList: { label: '附件列表' },
    createTime: { label: '创建时间', isDate: true },
    updateTime: { label: '更新时间', isDate: true },
    // 根据需要添加更多字段
  };

  const formatValue = (value: any, fieldKey?: string): string => {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return '-';
    } else if (Array.isArray(value)) {
      if (fieldKey === 'adminList') {
        // 针对 adminList，提取姓名，逗号分隔
        return value.map((item) => item.name).join(', ');
      } else {
        return value
          .map((item) => {
            if (typeof item === 'object') {
              const itemDetails = Object.keys(item)
                .filter(
                  (key) =>
                    key !== 'itemType' &&
                    key !== 'contractCostType' &&
                    key !== 'id'
                )
                .map((key) => {
                  const fieldLabel = fieldNameMap[key]?.label || key;
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
      }
    } else if (typeof value === 'object') {
      if (fieldKey === 'adminList') {
        // 单个对象，提取姓名
        return value.name;
      } else {
        const objectDetails = Object.keys(value)
          .filter(
            (key) =>
              key !== 'itemType' &&
              key !== 'contractCostType' &&
              key !== 'id'
          )
          .map((key) => {
            const fieldLabel = fieldNameMap[key]?.label || key;
            const fieldValue = formatValue(value[key], key);
            return `${fieldLabel}: ${fieldValue}`;
          })
          .join(', ');
        return `{ ${objectDetails} }`;
      }
    } else if (
      fieldKey &&
      fieldNameMap[fieldKey] &&
      fieldNameMap[fieldKey].isDate &&
      typeof value === 'number'
    ) {
      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    } else {
      return String(value);
    }
  };



// 解析操作日志记录的函数
  const safeJSONParse = (value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  };

  const parseOperationRecord = (record) => {
    try {
      const operationFieldArray = JSON.parse(record.operationField);
      const operationFieldOriginalValueArray = JSON.parse(record.operationFieldOriginalValue);
      const operationFieldNewValueArray = JSON.parse(record.operationFieldNewValue);

      const changes = operationFieldArray.map((field, index) => {
        let originalValue = operationFieldOriginalValueArray[index];
        let newValue = operationFieldNewValueArray[index];

        originalValue = safeJSONParse(originalValue);
        newValue = safeJSONParse(newValue);

        return {
          field,
          originalValue,
          newValue,
        };
      });

      return changes;
    } catch (error) {
      console.error('解析操作记录失败:', error);
      return [];
    }
  };

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
      render: renderApprovalFilesInTable,
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
          {!record.isArchived && (
            <a onClick={() => handleModalOpen(true, record)}>编辑</a>
          )}
          {/* 删除操作 */}
          <Popconfirm
            title="确定要删除这个周期信息吗？"
            onConfirm={() => handleDeletePeriod(record.id!)}
          >
            <a>删除</a>
          </Popconfirm>
          <a onClick={() => handleOpenOperationLogModal(record)}>日志</a>
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
            onChange={handleProjectChange}
            style={{ width: 200 }}
            placeholder="请选择项目"
            disabled={projectList.length === 0}
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
            placeholder="请选择合同"
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
        <Form.Item label="模糊查询" name="generalQueryCondition" style={{ width: 500 }}>
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
                attachmentList: values.attachmentList
                  ? values.attachmentList.map((file) => file.url || file.response.url)
                  : [],
                startDate: values.startDate
                  ? values.startDate.format('YYYY-MM-DD')
                  : undefined,
                periodStatus: currentPeriod ? currentPeriod.periodStatus : '进行中',
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

      {/* 操作日志的模态框 */}
      <Modal
        title="操作日志"
        visible={operationLogModalOpen}
        onCancel={() => setOperationLogModalOpen(false)}
        footer={null}
        width={1000} // 根据需要调整模态框的宽度
      >
        <Table
          dataSource={operationLogs}
          columns={operationLogColumns}
          rowKey="id"
          loading={operationLogLoading}
          pagination={false}
          scroll={{ x: 'max-content' }} // 启用横向滚动
        />
      </Modal>

    </PageContainer>
  );
};

export default PeriodInfoTable;
