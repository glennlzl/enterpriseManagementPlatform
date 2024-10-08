import React, { useState, useEffect } from 'react';
import {
  ProTable,
  ProColumns,
  PageContainer,
} from '@ant-design/pro-components';
import { Button, Popconfirm, Form, Input, Space, Modal, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import {useContractInfo} from "@/hooks/project/Hook.useContractInfo";
import {AddOrUpdateContractInfoRequest, ContractInfoVO} from "@/model/project/Model.contract";
import ContractInfoForm from "@/pages/project-management/contract/component/Component.contractInfoForm";
import {useModel} from "@@/exports";
import {queryProjectInfoList} from "@/api/project-managerment/Api.project";
import {ProjectInfoVO} from "@/model/project/Modal.project";
import {EmployeeSimpleInfoResponse, queryAllEmployeeSimpleInfo} from "@/api/usermanagement";

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
      title: '合同金额',
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
      title: '结束日期',
      dataIndex: 'endDate',
      valueType: 'date',
      width: 120,
    },
    {
      title: '负责人',
      dataIndex: 'adminList',
      valueType: 'text',
      render: (_, record) => record.adminList?.map((admin) => admin.name).join(', ') || '-',
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
        <Form.Item label="查询" name="generalQueryCondition">
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
        scroll={{ x: 1500 }}
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
              const formattedValues : AddOrUpdateContractInfoRequest = {
                ...values,
                startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
                endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
                projectId: selectedProjectId,
                financialResponsiblePerson: values.financialResponsiblePerson.label,
                financialResponsiblePersonId: values.financialResponsiblePerson.key,
                financialResponsiblePersonMobile: values.financialResponsiblePerson.value,
                relatedProjectId: values.relatedProjectId.value,
                adminList: values.adminList
                  ? employeeList.filter((emp) => values.adminList.includes(emp.id))
                  : undefined,
              };
              console.log(employeeList);
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
                startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
                endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
                projectId: selectedProjectId,
                financialResponsiblePerson: values.financialResponsiblePerson.label,
                financialResponsiblePersonId: values.financialResponsiblePerson.key,
                financialResponsiblePersonMobile: values.financialResponsiblePerson.value,
                relatedProjectId: values.relatedProjectId.value,
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
        <ContractInfoForm form={form} employeeList={employeeList}  projectList={projectList}/>
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
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
    </PageContainer>
  );
};

export default ContractInfoTable;
