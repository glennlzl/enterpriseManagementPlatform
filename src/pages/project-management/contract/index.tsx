import React, { useState, useEffect } from 'react';
import {
  ProTable,
  ProColumns,
  PageContainer,
} from '@ant-design/pro-components';
import {Button, Popconfirm, Form, Input, Space, Modal, Select, Table, message} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useContractInfo } from '@/hooks/project/Hook.useContractInfo';
import { AddOrUpdateContractInfoRequest, ContractInfoVO, MeasurementItemVO } from '@/model/project/Model.contract';
import ContractInfoForm from '@/pages/project-management/contract/component/Component.contractInfoForm';
import {history, useModel} from '@@/exports';
import { queryProjectInfoList } from '@/api/project-managerment/Api.project';
import { ProjectInfoVO } from '@/model/project/Modal.project';
import {EmployeeSimpleInfoResponse, isLogin, queryAllEmployeeSimpleInfo} from '@/api/usermanagement';
import {OperationLogVO} from "@/model/project/Model.operation";
import _ from 'lodash';

const { Option } = Select;

const ContractInfoTable: React.FC = () => {
  const {
    contractList,
    loading,
    handleAddContract,
    handleUpdateContract,
    handleDeleteContract,
    handleBatchDelete,
    handleBatchExport,
    handleAuthorizeContract,
    selectedRowKeys,
    onSelectChange,
    actionRef,
    reloadData,
    operationLogModalOpen,
    setOperationLogModalOpen,
    operationLogs,
    operationLogLoading,
    handleDeleteOperationLog,
    handleOpenOperationLogModal,
  } = useContractInfo();

  const [form] = Form.useForm();
  const [authorizeForm] = Form.useForm();
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [authorizeModalOpen, setAuthorizeModalOpen] = useState<boolean>(false);
  const [currentContract, setCurrentContract] = useState<ContractInfoVO | null>(null);
  const [employeeList, setEmployeeList] = useState<EmployeeSimpleInfoResponse[]>([]);
  const [projectList, setProjectList] = useState<ProjectInfoVO[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);

  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [detailTitle, setDetailTitle] = useState<string>('');
  const [detailData, setDetailData] = useState<MeasurementItemVO[]>([]);
  const [detailColumns, setDetailColumns] = useState<ProColumns<MeasurementItemVO>[]>([]); // 新增状态
  const [detailType, setDetailType] = useState<'contractCost' | 'projectSchedule'>('contractCost'); // 新增状态

  const { initialState } = useModel('@@initialState');
  const userId = initialState?.currentUser?.id;

  useEffect(() => {
    // 获取项目列表
    queryProjectInfoList(userId).then((data) => {
      setProjectList(data || []);
      if (data && data.length > 0) {
        setSelectedProjectId(data[0].id); // 设置默认项目
      }
    });
    // 获取员工列表
    queryAllEmployeeSimpleInfo().then((data) => {
      setEmployeeList(data || []);
    });
  }, [userId]);

  useEffect(() => {
    if (selectedProjectId !== undefined) {
      reloadData(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleModalOpen = (modalType: string, open: boolean, record?: ContractInfoVO) => {
    if (modalType === 'createModalOpen') {
      setCreateModalOpen(open);
      form.resetFields();
    } else if (modalType === 'editModalOpen') {
      setEditModalOpen(open);
      if (record) {
        setCurrentContract(record);
        form.setFieldsValue({
          ...record,
          startDate: record.startDate ? moment(record.startDate) : undefined,
          endDate: record.endDate ? moment(record.endDate) : undefined,
          financialResponsiblePersonId: record.financialResponsiblePersonId,
        });
      }
    } else if (modalType === 'authorizeModalOpen') {
      setAuthorizeModalOpen(open);
      if (record) {
        setCurrentContract(record);
        // 设置授权表单的初始值
        authorizeForm.setFieldsValue({
          adminList: record.adminList ? record.adminList.map((admin) => admin.id) : [],
        });
      }
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


// 字段名到中文列名的映射
  const fieldNameMap: { [key: string]: { label: string; isDate?: boolean } } = {
    id: { label: '序号' },
    name: { label: '合同名称' },
    contractSerialNumber: { label: '合同编号'},
    type: { label: '合同类型' },
    contractor: { label: '乙方单位' },
    contractAmount: { label: '合同金额' },
    startDate: { label: '开始日期', isDate: true },
    endDate: { label: '完工日期', isDate: true },
    contractOrder: { label: '合同排序' },
    contractProvisionalPrice: { label: '暂估价' },
    contractTermType: { label: '合同期限类型' },
    supervisingOrganization: { label: '总监单位' },
    monitoringOrganization: { label: '监理单位' },
    consultingOrganization: { label: '咨询单位' },
    accountName: { label: '账户名称' },
    accountBank: { label: '开户行' },
    accountNumber: { label: '账号' },
    financialResponsiblePerson: { label: '财务负责人' },
    projectSchedule: { label: '项目进度' },
    contractCost: { label: '合同成本' },
    adminList: { label: '负责人列表' },
    attachmentList: { label: '附件列表' },
    updateTime: { label: '更新时间', isDate: true },
    createTime: { label: '创建时间', isDate: true },
    // 对于测量项的字段
    itemType: { label: '项目类型' },
    itemName: { label: '项目名称' },
    itemPrice: { label: '项目价格' },
    itemUnit: { label: '项目单位' },
    designCount: { label: '设计数量' },
    transactionType: { label: '交易类型' },
    contractCostType: { label: '合同成本类型' },
    // 其他字段...
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
            // 提取对象中的关键字段，排除不需要显示的字段
            const itemDetails = Object.keys(item)
              .filter((key) => key !== 'itemType' && key !== 'contractCostType') // 排除字段
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
        .filter((key) => key !== 'itemType' && key !== 'contractCostType') // 排除字段
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
  ];

// 定义合同成本的列
  const contractCostColumns: ProColumns<MeasurementItemVO>[] = [
    {
      title: '计量类目名称',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: '计量类目费用类型',
      dataIndex: 'contractCostType',
      key: 'contractCostType',
    },
    {
      title: '计量类目交易类型',
      dataIndex: 'transactionType',
      key: 'transactionType',
    },
  ];

  // 定义项目进度的列
  const projectScheduleColumns: ProColumns<MeasurementItemVO>[] = [
    {
      title: '计量类目名称',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: '计量类目单价',
      dataIndex: 'itemPrice',
      key: 'itemPrice',
    },
    {
      title: '计量类目单位',
      dataIndex: 'itemUnit',
      key: 'itemUnit',
    },
    {
      title: '计量类目设计数量',
      dataIndex: 'designCount',
      key: 'designCount',
    },
  ];

  const showDetailModal = (
    title: string,
    data: MeasurementItemVO[],
    type: 'contractCost' | 'projectSchedule',
  ) => {
    setDetailTitle(title);
    setDetailData(data);
    setDetailType(type);

    // 根据类型设置对应的列
    if (type === 'contractCost') {
      setDetailColumns(contractCostColumns);
    } else {
      setDetailColumns(projectScheduleColumns);
    }

    setDetailModalOpen(true);
  };


  const columns: ProColumns<ContractInfoVO>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'text',
      fixed: 'left',
      width: 80,
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: '合同名称',
      dataIndex: 'name',
      valueType: 'text',
      fixed: 'left',
      width: 150,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: '合同编号',
      dataIndex: 'contractSerialNumber',
      valueType: 'text',
      width: 150,
    },
    {
      title: '合同类型',
      dataIndex: 'type',
      valueType: 'text',
      width: 100,
    },
    {
      title: '乙方单位',
      dataIndex: 'contractor',
      valueType: 'text',
      width: 120,
    },
    {
      title: '合同金额(元)',
      dataIndex: 'contractAmount',
      valueType: 'text',
      width: 120,
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      valueType: 'date',
      width: 120,
    },
    {
      title: '完工日期',
      dataIndex: 'endDate',
      valueType: 'date',
      width: 120,
    },
    {
      title: '合同排序',
      dataIndex: 'contractOrder',
      valueType: 'digit',
      width: 100,
    },
    {
      title: '暂估价',
      dataIndex: 'contractProvisionalPrice',
      valueType: 'text',
      width: 150,
    },
    {
      title: '合同期限类型',
      dataIndex: 'contractTermType',
      valueType: 'text',
      width: 150,
    },
    {
      title: '总监单位',
      dataIndex: 'supervisingOrganization',
      valueType: 'text',
      width: 150,
    },
    {
      title: '监理单位',
      dataIndex: 'monitoringOrganization',
      valueType: 'text',
      width: 150,
    },
    {
      title: '咨询单位',
      dataIndex: 'consultingOrganization',
      valueType: 'text',
      width: 150,
    },
    {
      title: '账户名称',
      dataIndex: 'accountName',
      valueType: 'text',
      width: 150,
    },
    {
      title: '开户行',
      dataIndex: 'accountBank',
      valueType: 'text',
      width: 150,
    },
    {
      title: '账号',
      dataIndex: 'accountNumber',
      valueType: 'text',
      width: 150,
    },
    {
      title: '财务负责人',
      dataIndex: 'financialResponsiblePerson',
      valueType: 'text',
      width: 150,
    },
    {
      title: '合同成本',
      dataIndex: 'contractCost',
      valueType: 'text',
      width: 150,
      render: (_, record) => (
        <a
          onClick={() =>
            showDetailModal('合同成本详情', record.contractCost || [], 'contractCost')
          }
        >
          查看详情
        </a>
      ),
    },
    {
      title: '项目进度',
      dataIndex: 'projectSchedule',
      valueType: 'text',
      width: 150,
      render: (_, record) => (
        <a
          onClick={() =>
            showDetailModal('项目进度详情', record.projectSchedule || [], 'projectSchedule')
          }
        >
          查看详情
        </a>
      ),
    },
    {
      title: '负责人列表',
      dataIndex: 'adminList',
      valueType: 'text',
      render: (_, record) => record.adminList?.map((admin) => admin.name).join(', ') || '-',
      width: 150,
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
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      width: 150,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              handleModalOpen('editModalOpen', true, record);
            }}
          >
            编辑
          </a>
          <a
            onClick={() => {
              handleOpenOperationLogModal(record);
            }}
          >
            日志
          </a>
          <a
            onClick={() => {
              handleModalOpen('authorizeModalOpen', true, record);
            }}
          >
            授权
          </a>
          <Popconfirm
            title="确定要删除这个合同吗？"
            onConfirm={() => handleDeleteContract(record.id!)}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer breadcrumbRender={false}>
      {/* 项目选择器 */}
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
      </Form>

      {/* 查询表单 */}
      <Form
        layout="vertical"
        onValuesChange={(changedValues) => {
          const { generalQueryCondition } = changedValues;
          if (selectedProjectId !== undefined) {
            reloadData(selectedProjectId, generalQueryCondition);
          }
        }}
        style={{ marginBottom: 16 }}
      >
        <Form.Item label="查询" name="generalQueryCondition" style={{ width: 500 }}>
          <Input placeholder="请输入合同名称、编号等信息" />
        </Form.Item>
      </Form>

      {/* 合同表格 */}
      <ProTable<ContractInfoVO>
        headerTitle={
          <div>
            合同管理
            {selectedRowKeys.length > 0 && (
              <>
                <Button onClick={handleBatchExport} style={{ marginLeft: 16 }}>
                  批量导出
                </Button>
                <Button onClick={handleBatchDelete} style={{ marginLeft: 16 }}>
                  批量删除
                </Button>
              </>
            )}
          </div>
        }
        columns={columns}
        scroll={{ x: 'max-content' }}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        loading={loading}
        dataSource={contractList}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
          preserveSelectedRowKeys: true,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            disabled={_.isEmpty(projectList)}
            onClick={() => handleModalOpen('createModalOpen', true)}
          >
            <PlusOutlined /> 新增合同
          </Button>,
        ]}
      />

      {/* 新增合同的弹窗 */}
      <Modal
        title="新增合同"
        visible={createModalOpen}
        onCancel={() => handleModalOpen('createModalOpen', false)}
        width={1500}
        destroyOnClose
        onOk={() => {
          form
            .validateFields()
            .then((values: any) => {
              const formattedValues: AddOrUpdateContractInfoRequest = {
                ...values,
                projectSchedule: values.projectSchedule,
                attachmentList: values.attachmentList ? values.attachmentList.map((attachment) => attachment.response) : [],
                startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
                endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
                relatedProjectId: selectedProjectId,
                financialResponsiblePerson: values.financialResponsiblePerson
                  ? values.financialResponsiblePerson.label
                  : undefined,
                financialResponsiblePersonId: values.financialResponsiblePerson
                  ? values.financialResponsiblePerson.key
                  : undefined,
                financialResponsiblePersonMobile: values.financialResponsiblePerson
                  ? values.financialResponsiblePerson.value
                  : undefined,
                contractCost: values.contractCost ? values.contractCost : undefined,
                adminList: values.adminList
                  ? employeeList.filter((emp) => values.adminList.includes(emp.id))
                  : undefined,
              };
              handleAddContract(formattedValues);
              handleModalOpen('createModalOpen', false);
            })
            .catch((info) => {
              console.log('验证失败:', info);
            });
        }}
      >
        <ContractInfoForm form={form} employeeList={employeeList} projectList={projectList} />
      </Modal>

      {/* 编辑合同的弹窗 */}
      <Modal
        title="编辑合同"
        width={1500}
        destroyOnClose
        visible={editModalOpen}
        onCancel={() => handleModalOpen('editModalOpen', false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              const formattedValues = {
                ...currentContract,
                ...values,
                projectSchedule: values.projectSchedule,
                attachmentList: values.attachmentList ? values.attachmentList.map((attachment) => attachment.response) : [],
                startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
                endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
                relatedProjectId: selectedProjectId,
                financialResponsiblePerson: values.financialResponsiblePerson
                  ? values.financialResponsiblePerson.label
                  : undefined,
                financialResponsiblePersonId: values.financialResponsiblePerson
                  ? values.financialResponsiblePerson.key
                  : undefined,
                financialResponsiblePersonMobile: values.financialResponsiblePerson
                  ? values.financialResponsiblePerson.value
                  : undefined,
                contractCost: values.contractCost ? values.contractCost : undefined,
                adminList: values.adminList
                  ? employeeList.filter((emp) => values.adminList.includes(emp.id))
                  : undefined,
              };
              handleUpdateContract(formattedValues);
              handleModalOpen('editModalOpen', false);
            })
            .catch((info) => {
              console.log('验证失败:', info);
            });
        }}
      >
        <ContractInfoForm
          form={form}
          employeeList={employeeList}
          projectList={projectList}
          currentContract={currentContract || undefined}
        />
      </Modal>

      {/* 授权合同的弹窗 */}
      <Modal
        title="授权合同"
        visible={authorizeModalOpen}
        onCancel={() => handleModalOpen('authorizeModalOpen', false)}
        onOk={() => {
          authorizeForm
            .validateFields()
            .then((values) => {
              const selectedAdmins = values.adminList.map((id: number) => {
                const admin = employeeList.find((emp) => emp.id === id);
                return admin!;
              });
              if (currentContract) {
                handleAuthorizeContract(currentContract, selectedAdmins);
              }
              handleModalOpen('authorizeModalOpen', false);
            })
            .catch((info) => {
              console.log('验证失败:', info);
            });
        }}
      >
        <Form form={authorizeForm} layout="vertical">
          <Form.Item
            label="选择授权人"
            name="adminList"
            rules={[{ required: true, message: '请选择授权人' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择授权人"
              optionLabelProp="label"
              showSearch
              filterOption={(input, option) =>
                option?.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {employeeList.map((admin) => (
                <Option key={admin.id} value={admin.id} label={admin.name}>
                  {admin.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看详情的模态框 */}
      <Modal
        title={detailTitle}
        visible={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={800}
      >
        <Table
          dataSource={detailData}
          columns={detailColumns}
          rowKey="id"
          pagination={false}
        />
      </Modal>

      {/* 操作日志的模态框 */}
      <Modal
        title="操作日志"
        visible={operationLogModalOpen}
        onCancel={() => setOperationLogModalOpen(false)}
        footer={null}
        width={800}
      >
        <Table
          dataSource={operationLogs}
          columns={operationLogColumns}
          rowKey="id"
          loading={operationLogLoading}
          pagination={false}
        />
      </Modal>
    </PageContainer>
  );
};

export default ContractInfoTable;
