import React, {useState} from 'react';
import {Form, Input, DatePicker, InputNumber, Select, Divider, Row, Col, Upload, Button, UploadProps} from 'antd';
import type { FormInstance } from 'antd/lib/form';
import moment from 'moment';
import {EmployeeSimpleInfoResponse, fetchOssStsAccessInfo, OssStsAccessInfo} from "@/api/usermanagement";
import _ from "lodash";
import OSS from 'ali-oss';
import {UploadOutlined} from "@ant-design/icons";

interface ProjectInfoFormProps {
  form: FormInstance;
  employeeList: EmployeeSimpleInfoResponse[];
}

const { TextArea } = Input;
const { Option } = Select;


const OSSClient = OSS.default || OSS;

const ProjectInfoForm: React.FC<ProjectInfoFormProps> = ({ form, employeeList }) => {
  // 自定义校验，确保开始日期早于结束日期
  const validateStartEndDate = (_: any, value: any) => {
    const startDate = form.getFieldValue('startDate');
    const endDate = form.getFieldValue('endDate');
    if (startDate && endDate && moment(startDate).isAfter(moment(endDate))) {
      return Promise.reject(new Error('开始日期不能晚于结束日期'));
    }
    return Promise.resolve();
  };

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

  const projectTypes = [
    '高速公路',
    '国省干道',
    '农村公路',
    '市政项目',
    '地铁项目',
    '房建项目',
    '水利项目',
    '铁路项目',
    '其他',
    '产业园',
    '城市更新',
    '城市开发',
    '矿产资源',
    '流域治理',
    '片区开发',
    '生态环保',
    '投资建设',
    '土地治理',
    '一级公路',
  ];

  const investmentTypes = [
    '国有企业投资',
    '社会投资',
    '政府投资',
  ];

  const regulatoryLevels = [
    '省监管计划内项目',
    '计划外项目',
  ];

  return (
    <Form form={form} layout="vertical">
      <Divider orientation="left">基本信息</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="项目名称"
            name="name"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="类型"
            name="type"
            rules={[{ required: true, message: '请选择项目类型' }]}
          >
            <Select placeholder="请选择项目类型">
              {projectTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="施工单位" name="constructionOrganization" rules={[{ required: true, message: '请输入施工单位' }]}
          >
            <Input placeholder="请输入施工单位" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="项目编号" name="serialNumber"  rules={[{ required: true, message: '请输入项目编号' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入流水号" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="地区" name="region">
            <Input placeholder="请输入地区" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="项目地址" name="projectAddress">
            <Input placeholder="请输入项目地址" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">投资信息</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="总投资" name="totalInvestment">
            <Input placeholder="请输入总投资" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="建造成本" name="buildingCost">
            <Input placeholder="请输入建造成本" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="投资类型"
            name="investmentType"
          >
            <Select placeholder="请选择投资类型">
              {investmentTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          {/* 空白占位 */}
        </Col>
      </Row>

      <Divider orientation="left">计划信息</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="计划工期" name="plannedDuration">
            <InputNumber style={{ width: '100%' }} placeholder="请输入计划工期（天）" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="开始日期"
            name="startDate"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="结束日期"
            name="endDate"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="合同日期" name="contractDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">其他信息</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="项目描述" name="projectDescription">
            <Input placeholder="请输入项目描述" rows={3} />
          </Form.Item>
          <Form.Item label="工商注册地址" name="businessRegistrationAddress">
            <Input placeholder="请输入工商注册地址" />
          </Form.Item>
          <Form.Item label="项目状态" name="projectStatus">
            <Select placeholder="请选择项目状态">
              <Option value="未开始">未开始</Option>
              <Option value="进行中">进行中</Option>
              <Option value="已完成">已完成</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="监管层级"
            name="regulatoryLevel"
          >
            <Select placeholder="请选择监管层级">
              {regulatoryLevels.map((level) => (
                <Select.Option key={level} value={level}>
                  {level}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="技术级别" name="techLevel">
            <Input placeholder="请输入技术级别" />
          </Form.Item>
          <Form.Item label="部位" name="location">
            <Input placeholder="请输入部位" />
          </Form.Item>
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
        </Col>
      </Row>
    </Form>
  );
};

export default ProjectInfoForm;

