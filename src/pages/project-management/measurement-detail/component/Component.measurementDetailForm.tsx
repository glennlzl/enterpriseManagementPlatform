import React from 'react';
import { Form, Input, Upload, Button, InputNumber, Row, Col, Divider } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { UploadOutlined } from '@ant-design/icons';
import { MeasurementItemVO } from '@/model/project/Model.contract'; // 引入 MeasurementItemVO 类型

interface MeasurementDetailFormProps {
  form: FormInstance;
  selectedMeasurementItem?: MeasurementItemVO; // 接收选中的测量项
}

const MeasurementDetailForm: React.FC<MeasurementDetailFormProps> = ({ form, selectedMeasurementItem }) => {
  // 附件上传处理
  const normFile = (e: any) => {
    return Array.isArray(e) ? e : e && e.fileList;
  };

  return (
    <Form form={form} layout="vertical">
      {/* 基本信息 */}
      <Divider orientation="left">基本信息</Divider>
      <Row gutter={16}>
        {/* 测量项名称 */}
        <Col span={12}>
          <Form.Item label="测量项名称">
            <Input value={selectedMeasurementItem?.itemName} readOnly />
          </Form.Item>
        </Col>

        {/* 计量单号 */}
        <Col span={12}>
          <Form.Item
            label="计量单号"
            name="measurementBillNumber"
            rules={[{ required: true, message: '请输入计量单号' }]}
          >
            <Input placeholder="请输入计量单号" />
          </Form.Item>
        </Col>

        {/* 当前数量 */}
        <Col span={12}>
          <Form.Item
            label="当前数量"
            name="currentCount"
            rules={[{ required: true, message: '请输入当前数量' }]}
          >
            <InputNumber placeholder="请输入当前数量" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      {/* 其他信息 */}
      <Divider orientation="left">其他信息</Divider>
      <Row gutter={16}>
        {/* 子目号 */}
        <Col span={12}>
          <Form.Item label="子目号" name="subItemNumber">
            <Input placeholder="请输入子目号" />
          </Form.Item>
        </Col>

        {/* 位置 */}
        <Col span={12}>
          <Form.Item label="位置" name="position">
            <Input placeholder="请输入位置" />
          </Form.Item>
        </Col>

        {/* 扩展字段 */}
        <Col span={12}>
          <Form.Item label="扩展字段" name="extend">
            <Input placeholder="请输入扩展字段" />
          </Form.Item>
        </Col>
      </Row>

      {/* 附件 */}
      <Divider orientation="left">附件</Divider>
      <Form.Item
        label="附件列表"
        name="attachmentList"
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Upload
          name="files"
          action="/api/upload" // 根据实际情况修改上传地址
          listType="picture"
          multiple
        >
          <Button icon={<UploadOutlined />}>上传附件</Button>
        </Upload>
      </Form.Item>

      {/* 隐藏字段 */}
      {/* ID */}
      <Form.Item name="id" hidden>
        <Input type="hidden" />
      </Form.Item>
    </Form>
  );
};

export default MeasurementDetailForm;
