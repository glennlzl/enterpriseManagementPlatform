import React, { useMemo } from 'react';
import {
  ProTable,
  ProColumns,
  PageContainer,
} from '@ant-design/pro-components';
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
  List,
  Popover,
  Typography,
  DatePicker,
  Tooltip
} from 'antd';
import {FileOutlined, PlusOutlined} from '@ant-design/icons';
import moment from 'moment';
import { PeriodInfoVO } from '@/model/project/Model.period';
import { usePeriodInfo } from '@/hooks/project/Hook.usePeriodInfo';
import PeriodInfoForm from '@/pages/project-management/period/component/PeriodInfoForm';
import {isLogin} from "@/api/usermanagement";
import {history} from "@@/core/history";
import {OperationLogVO} from "@/model/project/Model.operation";
import { DateTime } from 'luxon';

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
    name: { label: '周期名称' },
    type: { label: '类型' },
    serialNumber: { label: '周期编号' },
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

  // 生成过滤选项
  const generateFilters = (dataSource, key) => {
    const uniqueValues = Array.from(new Set(dataSource.map(item => item[key]).filter(Boolean)));
    return uniqueValues.map(value => ({ text: String(value), value }));
  };

  // 手动定义布尔值的过滤选项
  const isArchivedFilters = [
    { text: '是', value: true },
    { text: '否', value: false },
  ];

  const periodStatusFilters = [
    { text: '进行中', value: '进行中' },
    { text: '已归档', value: '已归档' },
  ];

  const dateFilterDropdown = (dataIndex) => ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
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
  };

  const dateOnFilter = (dataIndex) => (value, record) => {
    if (!value || value.length === 0) return true;
    const [start, end] = value;

    const recordDate = DateTime.fromISO(record[dataIndex]);
    const startDate = DateTime.fromFormat(start, 'yyyy-MM-dd').startOf('day');
    const endDate = DateTime.fromFormat(end, 'yyyy-MM-dd').endOf('day');

    if (!recordDate.isValid || !startDate.isValid || !endDate.isValid) {
      return false;
    }

    // 比较日期范围，忽略时间部分
    return recordDate >= startDate && recordDate <= endDate;
  };

  // 定义表格的列
  const columns: ProColumns<PeriodInfoVO>[] = [
    // {
    //   title: '编号',
    //   dataIndex: 'id',
    //   valueType: 'text',
    //   fixed: 'left',
    //   width: 80,
    //   sorter: (a, b) => (a.id || 0) - (b.id || 0),
    //   filters: generateFilters(periodList, 'id'),
    //   onFilter: (value, record) => record.id === value,
    //   search: true,
    // },
    {
      title: '周期名称',
      dataIndex: 'name',
      valueType: 'text',
      fixed: 'left',
      width: 150,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="请输入周期名称"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
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
      ),
      onFilter: (value, record) => record.name?.includes(value),
      filterSearch: true,
      search: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'text',
      width: 100,
      filters: generateFilters(periodList, 'type'),
      onFilter: (value, record) => record.type === value,
      filterSearch: true,
    },
    {
      title: '周期编号',
      tip: '周期的先后顺序以周期编号为准',
      dataIndex: 'serialNumber',
      valueType: 'text',
      width: 100,
      filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
        <div style={{padding: 8}}>
          <Input
            placeholder="请输入周期编号"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{marginBottom: 8, display: 'block'}}
          />
          <Space>
            <Button type="primary" onClick={() => confirm()} size="small">
              筛选
            </Button>
            <Button
              onClick={() => {
                clearFilters && clearFilters();
                confirm();
              }}
              size="small"
            >
              重置
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => record.serialNumber?.includes(value),
      filterSearch: true,
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      valueType: 'date',
      width: 120,
      filterDropdown: dateFilterDropdown('startDate'),
      onFilter: dateOnFilter('startDate'),
      search: true,
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      valueType: 'date',
      width: 120,
      filterDropdown: dateFilterDropdown('endDate'),
      onFilter:  dateOnFilter('endDate'),
      search: true,
    },
    {
      title: '计量月份',
      dataIndex: 'measurementMonth',
      valueType: 'text',
      width: 120,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="请输入计量月份"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button type="primary" onClick={() => confirm()} size="small">
              筛选
            </Button>
            <Button
              onClick={() => {
                clearFilters && clearFilters();
                confirm();
              }}
              size="small"
            >
              重置
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => record.measurementMonth?.includes(value),
      filterSearch: true,
      search: true,
    },
    {
      title: '周期状态',
      dataIndex: 'periodStatus',
      valueType: 'text',
      width: 120,
      filters: periodStatusFilters,
      onFilter: (value, record) => record.periodStatus === value,
      filterSearch: true,
      search: true,
    },
    {
      title: '是否归档',
      dataIndex: 'isArchived',
      render: (_, record) => (record.isArchived ? '是' : '否'),
      width: 100,
      filters: isArchivedFilters,
      onFilter: (value, record) => record.isArchived === value,
      search: true,
      valueType: 'select',
      valueEnum: {
        true: { text: '是' },
        false: { text: '否' },
      },
    },
    {
      title: '附件列表',
      dataIndex: 'attachmentList',
      valueType: 'text',
      render: renderApprovalFilesInTable,
      width: 200,
      ellipsis: true,
      search: false, // 一般不对附件列表进行搜索
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: 160,
      filterDropdown: dateFilterDropdown('createTime'),
      onFilter: dateOnFilter('createTime'),
      search: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      width: 160,
      filterDropdown: dateFilterDropdown('updateTime'),
      onFilter: dateOnFilter('updateTime'),
      search: true,
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
          {
            !record.isArchived && (
              <Popconfirm
                title="确定要删除这个周期信息吗？"
                onConfirm={() =>
                  handleDeletePeriod(
                    record.id!,
                    record.relatedProjectId!,
                    record.relatedContractId!,
                  )
                }
              >
                <a>删除</a>
              </Popconfirm>
            )
          }
          <a onClick={() => handleOpenOperationLogModal(record)}>日志</a>
          {!record.isArchived && (
            <Popconfirm
              title="确定要归档这个周期信息吗？"
              onConfirm={() =>
                handleArchivePeriod(
                  record.id!,
                  record.relatedProjectId!,
                  record.relatedContractId!,
                )
              }
            >
              <a>归档</a>
            </Popconfirm>
          )}
        </Space>
      ),
      search: false,
      filters: false,
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
            showSearch
            value={selectedProjectId}
            onChange={handleProjectChange}
            style={{ width: 200 }}
            placeholder="请选择项目"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            disabled={projectList.length === 0}
          >
            {projectList.map((project) => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* 选择合同下拉框 */}
        <Form.Item label="选择合同">
          <Select
            showSearch
            value={selectedContractId}
            onChange={handleContractChange}
            style={{ width: 200 }}
            placeholder="请选择合同"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
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
          fetchPeriodList(selectedProjectId, selectedContractId, generalQueryCondition);
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
                {/*<Button*/}
                {/*  onClick={() => {*/}
                {/*    selectedRowKeys.forEach((id) => {*/}
                {/*      handleArchivePeriod(id, selectedProjectId!, selectedContractId!);*/}
                {/*    });*/}
                {/*  }}*/}
                {/*  style={{ marginLeft: 16 }}*/}
                {/*>*/}
                {/*  批量归档*/}
                {/*</Button>*/}
                {/*<Button*/}
                {/*  onClick={() => {*/}
                {/*    selectedRowKeys.forEach((id) => {*/}
                {/*      handleDeletePeriod(id);*/}
                {/*    });*/}
                {/*  }}*/}
                {/*  style={{ marginLeft: 16 }}*/}
                {/*>*/}
                {/*  批量删除*/}
                {/*</Button>*/}
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
        maskClosable={false}
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
