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
  const [fileList, setFileList] = useState([]);

  const uploadImageToOss = async (file, ossStsAccessInfo) => {
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

  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      const ossStsAccessInfo = await fetchOssStsAccessInfo();
      const fileUrl = await uploadImageToOss(file, ossStsAccessInfo);

      const newFile = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: fileUrl,
      };

      setFileList((prevList) => [...prevList, newFile]);

      const currentUrls = form.getFieldValue('attachmentList') || [];
      form.setFieldsValue({
        attachmentList: [...currentUrls, fileUrl],
      });

      onSuccess(newFile);
    } catch (error) {
      onError(error);
    }
  };

  const handleRemove = (file) => {
    setFileList((prevList) => prevList.filter((item) => item.uid !== file.uid));

    const currentUrls = form.getFieldValue('attachmentList') || [];
    const updatedUrls = currentUrls.filter((url) => url !== file.url);
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


  // 添加或编辑计量项
  const handleMeasurementOk = async () => {
    try {
      const values = await measurementForm.validateFields();
      // 根据 measurementType 设置 itemType
      const itemType = measurementType === 'contractCost' ? 'cost' : 'material';
      const measurementItemData = { ...values, itemType };

      if (currentMeasurementItem) {
        // 编辑计量项
        const updatedItem = { ...currentMeasurementItem, ...measurementItemData };
        // 调用后端 API 更新计量项
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
        message.success('计量项更新成功');
      } else {
        // 添加计量项
        // 调用后端 API 添加计量项
        const newItem = await addMeasurementItem(measurementItemData);
        if (measurementType === 'contractCost') {
          setContractCostItems((prevItems) => [...prevItems, newItem]);
        } else {
          setProjectScheduleItems((prevItems) => [...prevItems, newItem]);
        }
        message.success('计量项添加成功');
      }
      setMeasurementModalVisible(false);
      setCurrentMeasurementItem(null);
      measurementForm.resetFields();
    } catch (error) {
      message.error(error);
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

  const contractTypes = [
    '施工合同',
    '监理合同',
    '设计合同',
    '咨询费',
    '环评、水保合同',
    '可研合同',
    '技术服务合同',
    '设备采购合同',
    '征拆合同',
    '科研项目',
    '建设单位管理费',
    '建设期贷款利息',
  ];

  // 编辑计量项
  const handleEditMeasurementItem = (
    record: MeasurementItemVO,
    type: 'contractCost' | 'projectSchedule',
  ) => {
    setCurrentMeasurementItem(record);
    setMeasurementType(type);
    // 在设置表单值时，排除 itemType 字段
    const { itemType, ...rest } = record;
    measurementForm.setFieldsValue(rest);
    setMeasurementModalVisible(true);
  };


  const contractCostColumns = [
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
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: MeasurementItemVO) => (
        <Space>
          <a onClick={() => handleEditMeasurementItem(record, 'contractCost')}>编辑</a>
          <Popconfirm
            title="确定要删除这个计量项吗？"
            onConfirm={() => handleDeleteMeasurement(record.id!, 'contractCost')}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const projectScheduleColumns = [
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
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: MeasurementItemVO) => (
        <Space>
          <a onClick={() => handleEditMeasurementItem(record, 'projectSchedule')}>编辑</a>
          <Popconfirm
            title="确定要删除这个计量项吗？"
            onConfirm={() => handleDeleteMeasurement(record.id!, 'projectSchedule')}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const contractTermTypes = [
    '固定合同',
    '以完成一定工作为期限的合同',
  ];

  const contractCostTypes = [
    '暂定金',
    '工程款',
    '保证金',
    '预付款',
  ];

  const transactionTypes = [
    '支付',
    '扣回',
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
            rules={[{ required: true, message: '请选择合同类型' }]}
          >
            <Select
              showSearch
              placeholder="请选择合同类型"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {contractTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="乙方单位"
            name="contractor"
            rules={[{ required: true, message: '请输入乙方信息' }]}
          >
            <Input placeholder="请输入乙方信息" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="合同金额(元)"
            name="contractAmount"
            rules={[{ required: true, message: '请输入合同金额' }]}
          >
            <Input placeholder="请输入合同金额" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="合同排序" name="contractOrder">
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
            label="完工日期"
            name="endDate"
            rules={[{ validator: validateStartEndDate }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      {/* 关联信息部分 */}
      <Divider orientation="left">其他信息</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="暂估价" name="contractProvisionalPrice">
            <Input placeholder="请输入暂估价" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="合同期限类型"
            name="contractTermType"
            rules={[{ required: true, message: '请选择合同期限类型' }]}
          >
            <Select
              showSearch
              placeholder="请选择合同期限类型"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {contractTermTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="总监单位" name="supervisingOrganization">
            <Input placeholder="请输入监理单位" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="监理单位" name="monitoringOrganization">
            <Input placeholder="请输入监测单位" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="咨询单位" name="consultingOrganization">
            <Input placeholder="请输入咨询单位" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">财务信息</Divider>

      <Row gutter={16}>
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
        columns={contractCostColumns}
        rowKey="id"
        pagination={false}
      />

      {/* 测量项管理部分 - 项目进度 */}
      <Divider orientation="left">工程清单</Divider>
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
        添加工程清单项
      </Button>
      <Table
        dataSource={projectScheduleItems}
        columns={projectScheduleColumns}
        rowKey="id"
        pagination={false}
      />

      {/* 添加或编辑计量项的模态框 */}
      <Modal
        title={currentMeasurementItem ? '编辑计量项' : '添加计量项'}
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
          <Form.Item
            label="计量类目名称"
            name="itemName"
            rules={[{ required: true, message: '请输入计量类目名称' }]}
          >
            <Input placeholder="请输入计量类目名称" />
          </Form.Item>

          {measurementType === 'contractCost' && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="计量类目费用类型"
                    name="contractCostType"
                    rules={[{ required: true, message: '请选择计量类目费用类型' }]}
                  >
                    <Select
                      showSearch
                      placeholder="请选择计量类目费用类型"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {contractCostTypes.map((type) => (
                        <Select.Option key={type} value={type}>
                          {type}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="计量类目交易类型"
                    name="transactionType"
                    rules={[{ required: true, message: '请选择计量类目交易类型' }]}
                  >
                    <Select
                      showSearch
                      placeholder="请选择计量类目交易类型"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {transactionTypes.map((type) => (
                        <Select.Option key={type} value={type}>
                          {type}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

              </Row>
            </>
          )}

          {measurementType === 'projectSchedule' && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="计量类目单价"
                    name="itemPrice"
                    rules={[{ required: true, message: '请输入计量类目单价' }]}
                  >
                    <InputNumber style={{ width: '100%' }} placeholder="请输入计量类目单价" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="计量类目单位"
                    name="itemUnit"
                    rules={[{ required: true, message: '请输入计量类目单位' }]}
                  >
                    <Input placeholder="请输入计量类目单位" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label="计量类目设计数量"
                name="designCount"
                rules={[{ required: true, message: '请输入计量类目设计数量' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入计量类目设计数量" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </Form>
  );
};

export default ContractInfoForm;
