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

  const [fileList, setFileList] = useState<any[]>([]);

  const uploadImageToOss = async (file: File, ossStsAccessInfo: OssStsAccessInfo) => {
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
      const fileUrl = await uploadImageToOss(file, ossStsAccessInfo);

      setFileList((prevList) => [...prevList, fileUrl]);
      // 更新表单中的 attachmentList
      const currentUrls = form.getFieldValue('attachmentList') || [];
      console.log(currentUrls);
      form.setFieldsValue({
        attachmentList: _.isUndefined(currentUrls) ? [...currentUrls, fileUrl] : [fileUrl],
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

  const uploadProps: UploadProps = {
    customRequest: handleUpload,
    onRemove: handleRemove,
    multiple: true,
    fileList,
  };

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
          <Form.Item label="类型" name="type">
            <Input placeholder="请输入项目类型" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="施工单位" name="constructionOrganization">
            <Input placeholder="请输入施工单位" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="流水号" name="serialNumber">
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
          <Form.Item label="投资类型" name="investmentType">
            <Input placeholder="请输入投资类型" />
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
            rules={[
              { required: true, message: '请选择开始日期' },
              { validator: validateStartEndDate },
            ]}
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
            rules={[
              { required: true, message: '请选择结束日期' },
              { validator: validateStartEndDate },
            ]}
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
          <Form.Item label="监管级别" name="regulatoryLevel">
            <Input placeholder="请输入监管级别" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="技术级别" name="techLevel">
            <Input placeholder="请输入技术级别" />
          </Form.Item>
          <Form.Item label="位置" name="location">
            <Input placeholder="请输入位置" />
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
