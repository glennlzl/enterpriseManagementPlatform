import React, { useState, useMemo, useEffect } from 'react';
import {
  ProTable,
  ProColumns,
  PageContainer,
} from '@ant-design/pro-components';
import {Button, Popconfirm, Form, Input, Space, Modal, Select, DatePicker, message, Popover, List, Typography} from 'antd';
import {FileOutlined, PlusOutlined} from '@ant-design/icons';
import { ProjectInfoVO } from "@/model/project/Modal.project";
import { useProjectInfo } from "@/hooks/project/Hook.useProjectInfo";
import ProjectInfoForm from "@/pages/project-management/project/component/Component.projectInfoForm";
import moment from "moment";
import {
  EmployeeSimpleInfoResponse, isLogin,
  queryAllEmployeeSimpleInfo
} from "@/api/usermanagement";
import _ from 'lodash';
import { DateTime } from 'luxon';
import {history} from "@@/core/history";

const { Option } = Select;

const ProjectInfoTable: React.FC = () => {
  const {
    projectList,
    loading,
    handleAddProject,
    handleUpdateProject,
    handleDeleteProject,
    handleBatchExport,
    selectedRowKeys,
    onSelectChange,
    actionRef,
    reloadData,
    handleAuthorizeProject,
    userId
  } = useProjectInfo();

  const [form] = Form.useForm();
  const [authorizeForm] = Form.useForm(); // 授权表单
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [authorizeModalOpen, setAuthorizeModalOpen] = useState<boolean>(false); // 授权弹窗
  const [currentProject, setCurrentProject] = useState<ProjectInfoVO | null>(null);
  const [employeeList, setEmployeeList] = useState<EmployeeSimpleInfoResponse[]>([]);

  // 在 useEffect 中获取员工列表
  useEffect(() => {
    // 获取员工列表
    queryAllEmployeeSimpleInfo().then((data) => {
      setEmployeeList(data);
    });
  }, []);

  const handleModalOpen = (modalType: string, open: boolean, record?: ProjectInfoVO) => {
    if (modalType === 'createModalOpen') {
      setCreateModalOpen(open);
      form.resetFields();
    } else if (modalType === 'editModalOpen') {
      setEditModalOpen(open);
      if (record) {
        setCurrentProject(record);
        form.setFieldsValue({
          ...record,
          startDate: record.startDate ? moment(record.startDate) : undefined,
          endDate: record.endDate ? moment(record.endDate) : undefined,
          contractDate: record.contractDate ? moment(record.contractDate) : undefined,
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
          // 如果需要处理其他字段
        });
      }
    } else if (modalType === 'authorizeModalOpen') {
      setAuthorizeModalOpen(open);
      if (record) {
        setCurrentProject(record);
        // 设置授权表单的初始值
        authorizeForm.setFieldsValue({
          adminList: record.adminList ? record.adminList.map((admin) => admin.id) : [],
        });
      }
    }
  };

  // 生成过滤选项
  const generateFilters = (dataSource, key) => {
    const uniqueValues = Array.from(new Set(dataSource.map(item => item[key]).filter(Boolean)));
    return uniqueValues.map(value => ({ text: value, value }));
  };

  // 定义过滤选项
  const typeFilters = generateFilters(projectList, 'type');
  const regionFilters = generateFilters(projectList, 'region');
  const investmentTypeFilters = generateFilters(projectList, 'investmentType');
  const projectStatusFilters = generateFilters(projectList, 'projectStatus');
  const regulatoryLevelFilters = generateFilters(projectList, 'regulatoryLevel');
  const techLevelFilters = generateFilters(projectList, 'techLevel');


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

  // 处理日期过滤器
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

  const columns: ProColumns<ProjectInfoVO>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'text',
      fixed: 'left',
      width: 80,
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'text',
      width: 100,
      filters: typeFilters,
      onFilter: (value, record) => record.type === value,
      filterSearch: true,
    },
    {
      title: '施工单位',
      dataIndex: 'constructionOrganization',
      valueType: 'text',
      width: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="请输入施工单位"
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
      onFilter: (value, record) => record.constructionOrganization?.includes(value),
    },
    {
      title: '开工日期',
      dataIndex: 'startDate',
      valueType: 'date',
      width: 120,
      filterDropdown: dateFilterDropdown('startDate'),
      onFilter: dateOnFilter('startDate'),
    },
    {
      title: '完工日期',
      dataIndex: 'endDate',
      valueType: 'date',
      width: 120,
      filterDropdown: dateFilterDropdown('endDate'),
      onFilter: dateOnFilter('endDate'),
    },
    {
      title: '项目状态',
      dataIndex: 'projectStatus',
      valueType: 'text',
      width: 100,
      filters: projectStatusFilters,
      onFilter: (value, record) => record.projectStatus === value,
      filterSearch: true,
    },
    {
      title: '合同日期',
      dataIndex: 'contractDate',
      valueType: 'date',
      width: 120,
      filterDropdown: dateFilterDropdown('contractDate'),
      onFilter: dateOnFilter('contractDate'),
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      valueType: 'text',
      fixed: 'left',
      width: 150,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="请输入项目名称"
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
    },
    {
      title: '流水号',
      dataIndex: 'serialNumber',
      valueType: 'digit',
      width: 100,
      sorter: (a, b) => (a.serialNumber || 0) - (b.serialNumber || 0),
    },
    {
      title: '地区',
      dataIndex: 'region',
      valueType: 'text',
      width: 100,
      filters: regionFilters,
      onFilter: (value, record) => record.region === value,
      filterSearch: true,
    },
    {
      title: '项目地址',
      dataIndex: 'projectAddress',
      valueType: 'text',
      width: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="请输入项目地址"
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
      onFilter: (value, record) => record.projectAddress?.includes(value),
    },
    {
      title: '总投资',
      dataIndex: 'totalInvestment',
      valueType: 'text',
      width: 120,
      sorter: (a, b) => parseFloat(a.totalInvestment || '0') - parseFloat(b.totalInvestment || '0'),
    },
    {
      title: '建造成本',
      dataIndex: 'buildingCost',
      valueType: 'text',
      width: 120,
      sorter: (a, b) => parseFloat(a.buildingCost || '0') - parseFloat(b.buildingCost || '0'),
    },
    {
      title: '计划工期',
      dataIndex: 'plannedDuration',
      valueType: 'digit',
      width: 100,
      sorter: (a, b) => (a.plannedDuration || 0) - (b.plannedDuration || 0),
    },
    {
      title: '投资类型',
      dataIndex: 'investmentType',
      valueType: 'text',
      width: 120,
      filters: investmentTypeFilters,
      onFilter: (value, record) => record.investmentType === value,
      filterSearch: true,
    },
    {
      title: '项目描述',
      dataIndex: 'projectDescription',
      valueType: 'text',
      width: 200,
      ellipsis: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="请输入项目描述"
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
      onFilter: (value, record) => record.projectDescription?.includes(value),
    },
    {
      title: '工商注册地址',
      dataIndex: 'businessRegistrationAddress',
      valueType: 'text',
      width: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="请输入工商注册地址"
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
      onFilter: (value, record) => record.businessRegistrationAddress?.includes(value),
    },
    {
      title: '监管级别',
      dataIndex: 'regulatoryLevel',
      valueType: 'text',
      width: 100,
      filters: regulatoryLevelFilters,
      onFilter: (value, record) => record.regulatoryLevel === value,
      filterSearch: true,
    },
    {
      title: '技术级别',
      dataIndex: 'techLevel',
      valueType: 'text',
      width: 100,
      filters: techLevelFilters,
      onFilter: (value, record) => record.techLevel === value,
      filterSearch: true,
    },
    {
      title: '部位',
      dataIndex: 'location',
      valueType: 'text',
      width: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="请输入部位"
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
      onFilter: (value, record) => record.location?.includes(value),
    },
    {
      title: '负责人',
      dataIndex: 'adminList',
      valueType: 'text',
      render: (_, record) => record.adminList?.map((admin) => admin.name).join(', ') || '-',
      width: 150,
      filters: generateFilters(
        projectList.flatMap(item => item.adminList?.map(admin => admin.name)),
        ''
      ),
      onFilter: (value, record) => record.adminList?.some(admin => admin.name === value),
      filterSearch: true,
      filterMode: 'menu', // 设置为 'menu' 模式，确保显示搜索框
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
            title="确定要删除这个项目吗？"
            onConfirm={() => handleDeleteProject(record.id!)}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 由于您没有特殊的行样式要求，可以省略 memoizedColumns
  const memoizedColumns = useMemo(() => columns, [columns]);

  return (
    <PageContainer breadcrumbRender={false}>
      <Form
        layout="vertical"
        onValuesChange={(changedValues) => {
          const { generalQueryCondition } = changedValues;
          // 根据查询条件重新加载数据
          reloadData(generalQueryCondition);
        }}
        style={{ marginBottom: 16 }}
      >
        <Form.Item label="模糊查询" name="generalQueryCondition" style={{ width: 500 }}>
          <Input placeholder="请输入项目名称、地区等信息" />
        </Form.Item>
      </Form>
      <ProTable<ProjectInfoVO>
        headerTitle={
          <div>
            项目管理
            {selectedRowKeys.length > 0 && (
              <>
                <Button onClick={handleBatchExport} style={{ marginLeft: 16 }}>
                  批量导出
                </Button>
              </>
            )}
          </div>
        }
        columns={memoizedColumns}
        scroll={{ x: 2500 }}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        loading={loading}
        dataSource={projectList}
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
            <PlusOutlined /> 新增项目
          </Button>,
        ]}
      />

      <Modal
        title="新增项目"
        visible={createModalOpen}
        maskClosable={false}
        onCancel={() => handleModalOpen('createModalOpen', false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              // 处理日期字段，转换为字符串格式
              const formattedValues = {
                ...values,
                attachmentList: values.attachmentList
                  ? values.attachmentList.map((file) => file.url || file.response.url)
                  : [],
                startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
                endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
                contractDate: values.contractDate ? values.contractDate.format('YYYY-MM-DD') : undefined,
                adminList: values.adminList ? employeeList.filter((emp) => _.includes(values.adminList.map((person) => person.value), emp.id)) : employeeList.filter((emp) => _.isEqual(emp.id, userId))
              };
              handleAddProject(formattedValues);
              handleModalOpen('createModalOpen', false);
            })
            .catch((info) => {
              console.log('验证失败:', info);
            });
        }}
      >
        <ProjectInfoForm form={form} employeeList={employeeList} />
      </Modal>

      {/* 授权项目的弹窗 */}
      <Modal
        title="授权项目"
        maskClosable={false}
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
              if (currentProject) {
                handleAuthorizeProject(currentProject, selectedAdmins);
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

      <Modal
        title="编辑项目"
        maskClosable={false}
        visible={editModalOpen}
        onCancel={() => handleModalOpen('editModalOpen', false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              // 处理日期字段，转换为字符串格式
              const formattedValues = {
                ...currentProject,
                ...values,
                attachmentList: values.attachmentList
                  ? values.attachmentList.map((file) => file.url || file.response.url)
                  : [],                startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
                endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
                contractDate: values.contractDate ? values.contractDate.format('YYYY-MM-DD') : undefined,
                adminList: values.adminList ? employeeList.filter((emp) => _.includes(values.adminList.map((person) => person.value), emp.id)) : undefined
              };
              handleUpdateProject(formattedValues);
              handleModalOpen('editModalOpen', false);
            })
            .catch((info) => {
              console.log('验证失败:', info);
            });
        }}
      >
        <ProjectInfoForm form={form} employeeList={employeeList}/>
      </Modal>
    </PageContainer>
  );
};

export default ProjectInfoTable;
