import React, {useState} from 'react';
import {Form, Input, DatePicker, Upload, Button, Select, message, UploadProps} from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import OSS from 'ali-oss';
import {fetchOssStsAccessInfo, OssStsAccessInfo} from "@/api/usermanagement";
import _ from "lodash";

const OSSClient = OSS.default || OSS;

interface PeriodInfoFormProps {
  form: FormInstance;
  // 如果需要传递其他 props，如项目列表、合同列表等，可以在这里添加
}

const { Option } = Select;

const PeriodInfoForm: React.FC<PeriodInfoFormProps> = ({ form }) => {
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


  const contractTermTypes = [
    '普通周期',
    '结算周期',
    '返还周期',
    '预付款周期',
  ];

  return (
    <Form form={form} layout="vertical">
      {/* 周期名称 */}
      <Form.Item
        label="周期名称"
        name="name"
        rules={[{ required: true, message: '请输入周期名称' }]}
      >
        <Input placeholder="请输入周期名称" />
      </Form.Item>

      {/* 类型 */}
      <Form.Item
        label="类型"
        name="type"
        rules={[{ required: true, message: '请选择类型' }]}
      >
        <Select
          showSearch
          placeholder="请选择类型"
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

      {/* 流水号 */}
      <Form.Item
        label="周期编号"
        name="serialNumber"
        rules={[{ required: true, message: '请输入周期编号' }]}
      >
        <Input placeholder="请输入流水号" />
      </Form.Item>

      {/* 开始日期 */}
      <Form.Item
        label="开始日期"
        name="startDate"
        rules={[
          { required: true, message: '请选择开始日期' },
          { validator: validateStartEndDate },
        ]}
      >
        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
      </Form.Item>

      {/* 结束日期 */}
      <Form.Item
        label="结束日期"
        name="endDate"
        rules={[
          { required: true, message: '请选择结束日期' },
          { validator: validateStartEndDate },
        ]}
      >
        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
      </Form.Item>

      {/* 计量月份 */}
      <Form.Item
        label="计量月份"
        name="measurementMonth"
        rules={[{ required: true, message: '请输入计量月份' }]}
      >
        <Input placeholder="请输入计量月份" />
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
    </Form>
  );
};

export default PeriodInfoForm;
