// MeasurementDetailForm.tsx

import React from 'react';
import { Form, Input, Upload, Button, Select, InputNumber, Row, Col, Divider } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { UploadOutlined } from '@ant-design/icons';

interface MeasurementDetailFormProps {
  form: FormInstance;
  measurementItems: {
    value: number;
    label: string;
    item: {
      id?: number;
      itemType?: string;
      itemName?: string;
      itemPrice?: number;
      itemUnit?: string;
      contractCostType?: string;
      transactionType?: string;
      designCount?: number;
      updateTime?: string;
      createTime?: string;
    };
  }[];
}

const MeasurementDetailForm: React.FC<MeasurementDetailFormProps> = ({ form, measurementItems }) => {
  // 附件上传处理
  const normFile = (e: any) => {
    return Array.isArray(e) ? e : e && e.fileList;
  };

  return (
    <Form form={form} layout="vertical">
      {/* 基本信息 */}
      <Divider orientation="left">基本信息</Divider>
      <Row gutter={16}>
        {/* 测量项 */}
        <Col span={12}>
          <Form.Item
            label="测量项"
            name="measurementItemId"
            rules={[{ required: true, message: '请选择测量项' }]}
          >
            <Select
              placeholder="请选择测量项"
              showSearch
              optionLabelProp="label"
              filterOption={(input, option) =>
                option?.label.toLowerCase().includes(input.toLowerCase())
              }
            >
              {measurementItems.map((item) => (
                <Select.Option key={item.value} value={item.value} label={item.item.itemName}>
                  <div>
                    <strong>{item.item.itemName}</strong>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      类型: {item.item.itemType}, 单位: {item.item.itemUnit}, 价格: {item.item.itemPrice}
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
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
