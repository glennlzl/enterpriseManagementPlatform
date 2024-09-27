import React from 'react';
import { Form, Input, DatePicker, Upload, Button, Select, message } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';

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

  // 附件上传处理，将上传的文件列表转换为所需的格式
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

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
        rules={[{ required: true, message: '请输入类型' }]}
      >
        <Input placeholder="请输入类型" />
      </Form.Item>

      {/* 流水号 */}
      <Form.Item
        label="流水号"
        name="serialNumber"
        rules={[{ required: true, message: '请输入流水号' }]}
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

      {/* 周期状态 */}
      <Form.Item
        label="周期状态"
        name="periodStatus"
        rules={[{ required: true, message: '请选择周期状态' }]}
      >
        <Select placeholder="请选择周期状态">
          <Option value="进行中">进行中</Option>
          <Option value="已完成">已完成</Option>
          <Option value="已归档">已归档</Option>
        </Select>
      </Form.Item>

      {/* 附件列表 */}
      <Form.Item
        label="附件列表"
        name="attachmentList"
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Upload
          name="files"
          action="/api/upload" // 请根据实际情况修改上传地址
          listType="picture"
          multiple
          // 你可以添加其他 Upload 属性，如 beforeUpload、onChange 等
        >
          <Button icon={<UploadOutlined />}>上传附件</Button>
        </Upload>
      </Form.Item>
    </Form>
  );
};

export default PeriodInfoForm;
