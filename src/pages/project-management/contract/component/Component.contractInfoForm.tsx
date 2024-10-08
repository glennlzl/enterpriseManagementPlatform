import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Divider,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Space,
  Popconfirm,
  message,
  Upload,
} from 'antd';
import type { FormInstance } from 'antd/lib/form';
import moment from 'moment';
import {
  EmployeeSimpleInfoResponse,
  fetchOssStsAccessInfo,
  OssStsAccessInfo,
} from '@/api/usermanagement';
import { ProjectInfoVO } from '@/model/project/Modal.project';
import type { ContractInfoVO, MeasurementItemVO } from '@/model/project/Model.contract';
import {
  addMeasurementItem,
  updateMeasurementItem,
  deleteMeasurementItem,
} from '@/api/project-managerment/Api.measurement-item';
import OSS from 'ali-oss';
import _ from 'lodash';
import { UploadOutlined } from '@ant-design/icons';

const OSSClient = OSS.default || OSS;

interface ContractInfoFormProps {
  form: FormInstance;
  employeeList: EmployeeSimpleInfoResponse[];
  projectList: ProjectInfoVO[];
  currentContract?: ContractInfoVO;
}

const { Option } = Select;

const ContractInfoForm: React.FC<ContractInfoFormProps> = ({
                                                             form,
                                                             employeeList,
                                                             projectList,
                                                             currentContract,
                                                           }) => {
  // 管理测量项的状态
  const [contractCostItems, setContractCostItems] = useState<MeasurementItemVO[]>([]);
  const [projectScheduleItems, setProjectScheduleItems] = useState<MeasurementItemVO[]>([]);

  const [measurementModalVisible, setMeasurementModalVisible] = useState<boolean>(false);
  const [currentMeasurementItem, setCurrentMeasurementItem] = useState<MeasurementItemVO | null>(
    null,
  );
  const [measurementForm] = Form.useForm();
  const [measurementType, setMeasurementType] = useState<'contractCost' | 'projectSchedule'>(
    'contractCost',
  );

  // 自定义校验，确保开始日期早于结束日期
  const validateStartEndDate = (_: any, value: any) => {
    const startDate = form.getFieldValue('startDate');
    const endDate = form.getFieldValue('endDate');
    if (startDate && endDate && moment(startDate).isAfter(moment(endDate))) {
      return Promise.reject(new Error('开始日期不能晚于结束日期'));
    }
    return Promise.resolve();
  };

  // 如果有当前合同，初始化测量项
  useEffect(() => {
    if (currentContract) {
      setContractCostItems(currentContract.contractCost || []);
      setProjectScheduleItems(currentContract.projectSchedule || []);
    } else {
      setContractCostItems([]);
      setProjectScheduleItems([]);
    }
  }, [currentContract]);

  // 将测量项数据同步到表单中，以便在提交时获取
  useEffect(() => {
    form.setFieldsValue({
      contractCost: contractCostItems,
      projectSchedule: projectScheduleItems,
    });
  }, [contractCostItems, projectScheduleItems]);

  // 附件上传相关状态
  const [fileList, setFileList] = useState<any[]>([]);

  // 上传到OSS
  const uploadFileToOss = async (file: File, ossStsAccessInfo: OssStsAccessInfo) => {
    const client = new OSSClient({
      region: 'oss-cn-beijing',
      accessKeyId: ossStsAccessInfo.accessKeyId,
      accessKeySecret: ossStsAccessInfo.accessKeySecret,
      stsToken: ossStsAccessInfo.securityToken,
      bucket: 'rohana-erp',
    });

    try {
      const result = await client.put(`files/${file.name}`, file);
      return result.url;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const handleUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      const ossStsAccessInfo = await fetchOssStsAccessInfo();
      const fileUrl = await uploadFileToOss(file, ossStsAccessInfo);

      setFileList((prevList) => [...prevList, { uid: file.uid, name: file.name, url: fileUrl }]);
      // 更新表单中的 attachmentList
      const currentUrls = form.getFieldValue('attachmentList') || [];
      form.setFieldsValue({
        attachmentList: [...currentUrls, fileUrl],
      });

      onSuccess(fileUrl);
    } catch (error) {
      onError(error);
    }
  };

  const handleRemove = (file: any) => {
    setFileList((prevList) => prevList.filter((item) => item.uid !== file.uid));

    // 更新表单中的 attachmentList
    const currentUrls = form.getFieldValue('attachmentList') || [];
    const updatedUrls = currentUrls.filter((url: string) => url !== file.url);
    form.setFieldsValue({
      attachmentList: updatedUrls,
    });
  };

  const uploadProps = {
    customRequest: handleUpload,
    onRemove: handleRemove,
    multiple: true,
    fileList,
  };

  // 添加或编辑测量项
  const handleMeasurementOk = async () => {
    try {
      const values = await measurementForm.validateFields();
      if (currentMeasurementItem) {
        // 编辑测量项
        const updatedItem = { ...currentMeasurementItem, ...values };
        // 调用后端 API 更新测量项
        await updateMeasurementItem(updatedItem);
        if (measurementType === 'contractCost') {
          setContractCostItems((prevItems) =>
            prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
          );
        } else {
          setProjectScheduleItems((prevItems) =>
            prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
          );
        }
        message.success('测量项更新成功');
      } else {
        // 添加测量项
        // 调用后端 API 添加测量项
        const newItem = await addMeasurementItem(values);
        if (measurementType === 'contractCost') {
          setContractCostItems((prevItems) => [...prevItems, newItem]);
        } else {
          setProjectScheduleItems((prevItems) => [...prevItems, newItem]);
        }
        message.success('测量项添加成功');
      }
      setMeasurementModalVisible(false);
      setCurrentMeasurementItem(null);
      measurementForm.resetFields();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  // 删除测量项
  const handleDeleteMeasurement = async (id: number, type: 'contractCost' | 'projectSchedule') => {
    try {
      // 调用后端 API 删除测量项
      await deleteMeasurementItem(id);
      if (type === 'contractCost') {
        setContractCostItems((prevItems) => prevItems.filter((item) => item.id !== id));
      } else {
        setProjectScheduleItems((prevItems) => prevItems.filter((item) => item.id !== id));
      }
      message.success('测量项删除成功');
    } catch (error) {
      message.error('删除测量项失败');
    }
  };

  // 编辑测量项
  const handleEditMeasurementItem = (
    record: MeasurementItemVO,
    type: 'contractCost' | 'projectSchedule',
  ) => {
    setCurrentMeasurementItem(record);
    setMeasurementType(type);
    measurementForm.setFieldsValue(record);
    setMeasurementModalVisible(true);
  };

  // 测量项的列定义
  const measurementColumns = [
    {
      title: '项目类型',
      dataIndex: 'itemType',
      key: 'itemType',
    },
    {
      title: '项目名称',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: '项目价格',
      dataIndex: 'itemPrice',
      key: 'itemPrice',
    },
    {
      title: '项目单位',
      dataIndex: 'itemUnit',
      key: 'itemUnit',
    },
    {
      title: '合同成本类型',
      dataIndex: 'contractCostType',
      key: 'contractCostType',
    },
    {
      title: '交易类型',
      dataIndex: 'transactionType',
      key: 'transactionType',
    },
    {
      title: '设计数量',
      dataIndex: 'designCount',
      key: 'designCount',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: MeasurementItemVO) => (
        <Space>
          <a onClick={() => handleEditMeasurementItem(record, measurementType)}>编辑</a>
          <Popconfirm
            title="确定要删除这个测量项吗？"
            onConfirm={() => handleDeleteMeasurement(record.id!, measurementType)}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Form form={form} layout="vertical">
      {/* 合同基本信息部分 */}
      <Divider orientation="left">合同基本信息</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="合同名称"
            name="name"
            rules={[{ required: true, message: '请输入合同名称' }]}
          >
            <Input placeholder="请输入合同名称" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="合同编号"
            name="contractSerialNumber"
            rules={[{ required: true, message: '请输入合同编号' }]}
          >
            <Input placeholder="请输入合同编号" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="合同类型"
            name="type"
            rules={[{ required: true, message: '请输入合同类型' }]}
          >
            <Input placeholder="请输入合同类型" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="乙方"
            name="contractor"
            rules={[{ required: true, message: '请输入乙方信息' }]}
          >
            <Input placeholder="请输入乙方信息" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="合同金额"
            name="contractAmount"
            rules={[{ required: true, message: '请输入合同金额' }]}
          >
            <Input placeholder="请输入合同金额" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="合同序号" name="contractOrder">
            <InputNumber style={{ width: '100%' }} placeholder="请输入合同序号" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="开始日期"
            name="startDate"
            rules={[{ validator: validateStartEndDate }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="结束日期"
            name="endDate"
            rules={[{ validator: validateStartEndDate }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="合同临时价格" name="contractProvisionalPrice">
            <Input placeholder="请输入合同临时价格" />
          </Form.Item>
        </Col>
      </Row>

      {/* 关联信息部分 */}
      <Divider orientation="left">关联信息</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="合同期限类型" name="contractTermType">
            <Input placeholder="请输入合同期限类型" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="监理单位" name="supervisingOrganization">
            <Input placeholder="请输入监理单位" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="监测单位" name="monitoringOrganization">
            <Input placeholder="请输入监测单位" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="咨询单位" name="consultingOrganization">
            <Input placeholder="请输入咨询单位" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="账户名称" name="accountName">
            <Input placeholder="请输入账户名称" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="开户行" name="accountBank">
            <Input placeholder="请输入开户行" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="账号" name="accountNumber">
            <Input placeholder="请输入账号" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="财务负责人" name="financialResponsiblePerson">
            <Select
              placeholder="请选择财务负责人"
              optionLabelProp="label"
              showSearch
              labelInValue
              filterOption={(input, option) =>
                option?.label.toLowerCase().includes(input.toLowerCase())
              }
            >
              {employeeList.map((emp) => (
                <Option key={emp.id} value={emp.id} label={emp.name}>
                  {emp.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* 附件上传 */}
      <Divider orientation="left">附件上传</Divider>
      <Form.Item
        label="附件列表"
        name="attachmentList"
        valuePropName="fileList"
        getValueFromEvent={(e) => e && e.fileList}
      >
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>点击上传文件</Button>
        </Upload>
      </Form.Item>

      {/* 隐藏的表单项，用于验证测量项列表不为空 */}
      <Form.Item name="contractCost" style={{ display: 'none' }}>
        <Input />
      </Form.Item>
      <Form.Item name="projectSchedule" style={{ display: 'none' }}>
        <Input />
      </Form.Item>

      {/* 测量项管理部分 - 合同成本 */}
      <Divider orientation="left">合同成本</Divider>
      <Button
        type="dashed"
        onClick={() => {
          setMeasurementType('contractCost');
          setCurrentMeasurementItem(null);
          measurementForm.resetFields();
          setMeasurementModalVisible(true);
        }}
        style={{ width: '100%', marginBottom: 16 }}
      >
        添加合同成本项
      </Button>
      <Table
        dataSource={contractCostItems}
        columns={measurementColumns}
        rowKey="id"
        pagination={false}
      />

      {/* 测量项管理部分 - 项目进度 */}
      <Divider orientation="left">项目进度</Divider>
      <Button
        type="dashed"
        onClick={() => {
          setMeasurementType('projectSchedule');
          setCurrentMeasurementItem(null);
          measurementForm.resetFields();
          setMeasurementModalVisible(true);
        }}
        style={{ width: '100%', marginBottom: 16 }}
      >
        添加项目进度项
      </Button>
      <Table
        dataSource={projectScheduleItems}
        columns={measurementColumns}
        rowKey="id"
        pagination={false}
      />

      {/* 添加或编辑测量项的模态框 */}
      <Modal
        title={currentMeasurementItem ? '编辑测量项' : '添加测量项'}
        visible={measurementModalVisible}
        onOk={handleMeasurementOk}
        onCancel={() => {
          setMeasurementModalVisible(false);
          setCurrentMeasurementItem(null);
          measurementForm.resetFields();
        }}
        destroyOnClose
        width={600}
      >
        <Form form={measurementForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="项目类型"
                name="itemType"
                rules={[{ required: true, message: '请输入项目类型' }]}
              >
                <Input placeholder="请输入项目类型" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="项目名称"
                name="itemName"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="项目价格"
                name="itemPrice"
                rules={[{ required: true, message: '请输入项目价格' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入项目价格" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="项目单位"
                name="itemUnit"
                rules={[{ required: true, message: '请输入项目单位' }]}
              >
                <Input placeholder="请输入项目单位" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="合同成本类型" name="contractCostType" rules={[{ required: true, message: '请输入项目类型' }]}
              >
                <Input placeholder="请输入合同成本类型" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="交易类型" name="transactionType" rules={[{ required: true, message: '请输入项目类型' }]}>
                <Input placeholder="请输入交易类型" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="设计数量" name="designCount">
            <InputNumber style={{ width: '100%' }} placeholder="请输入设计数量" />
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
};

export default ContractInfoForm;
