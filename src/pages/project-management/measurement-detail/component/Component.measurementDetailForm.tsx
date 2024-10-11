import React from 'react';
import { Form, Input, Upload, Button, InputNumber, Row, Col, Divider } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { UploadOutlined } from '@ant-design/icons';
import {MeasurementItemVO} from "@/model/project/Model.measurement-item";

interface MeasurementDetailFormProps {
  form: FormInstance;
  selectedMeasurementItem?: MeasurementItemVO;
  measurementType: 'cost' | 'material';
}

const MeasurementDetailForm: React.FC<MeasurementDetailFormProps> = ({
                                                                       form,
                                                                       selectedMeasurementItem,
                                                                       measurementType,
                                                                     }) => {
  // 附件上传处理
  const normFile = (e: any) => {
    return Array.isArray(e) ? e : e && e.fileList;
  };

  return (
    <Form form={form} layout="vertical">
      {/* 基本信息 */}
      <Divider orientation="left">基本信息</Divider>

      {/* Row for 测量项名称和计量单号 */}
      <Row gutter={16}>
        {/* 测量项名称 */}
        <Col span={12}>
          <Form.Item label="测量项名称">
            <Input value={selectedMeasurementItem?.itemName} readOnly disabled />
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
      </Row>

      {/* Row for 单价和设计量 (仅在 measurementType !== 'cost' 时显示) */}
      {measurementType !== 'cost' && (
        <Row gutter={16}>
          {/* 设计量 */}
          <Col span={12}>
            <Form.Item label="设计量">
              <Input value={selectedMeasurementItem?.designCount} readOnly disabled />
            </Form.Item>
          </Col>
          {/* 单价 */}
          <Col span={12}>
            <Form.Item label="单价">
              <Input value={selectedMeasurementItem?.itemPrice} readOnly disabled />
            </Form.Item>
          </Col>
        </Row>
      )}

      {/* Row for 金额或工程量 */}
      <Row gutter={16}>
        {/* 金额或工程量 */}
        <Col span={12}>
          {measurementType === 'cost' ? (
            <Form.Item
              label="金额"
              name="currentCount"
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <InputNumber placeholder="请输入金额" style={{ width: '100%' }} />
            </Form.Item>
          ) : (
            <Form.Item
              label="工程量"
              name="currentCount"
              rules={[{ required: true, message: '请输入工程量' }]}
            >
              <InputNumber placeholder="请输入工程量" style={{ width: '100%' }} />
            </Form.Item>
          )}
        </Col>
      </Row>

      {/* 其他信息 */}
      <Divider orientation="left">其他信息</Divider>
      <Row gutter={16}>
        {/* 分项（桩号） */}
        <Col span={12}>
          <Form.Item label="分项（桩号）" name="subItemNumber">
            <Input placeholder="请输入分项（桩号）" />
          </Form.Item>
        </Col>

        {/* 部位 */}
        <Col span={12}>
          <Form.Item label="部位" name="position">
            <Input placeholder="请输入部位" />
          </Form.Item>
        </Col>

        {/* 备注 */}
        <Col span={12}>
          <Form.Item label="备注" name="extend">
            <Input placeholder="请输入备注" />
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
      <Form.Item name="id" hidden>
        <Input type="hidden" />
      </Form.Item>
    </Form>
  );
};

export default MeasurementDetailForm;
