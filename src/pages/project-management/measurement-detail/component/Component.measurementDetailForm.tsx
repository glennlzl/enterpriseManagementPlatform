import React, {useEffect, useState} from 'react';
import { Form, Input, Upload, Button, InputNumber, Divider, message } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { UploadOutlined } from '@ant-design/icons';
import { MeasurementItemVO } from "@/model/project/Model.measurement-item";
import { fetchOssStsAccessInfo, OssStsAccessInfo } from '@/api/usermanagement';
import OSS from 'ali-oss';

const OSSClient = OSS.default || OSS;

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


  return (
    <Form form={form} layout="vertical">
      {/* 基本信息 */}
      <Divider orientation="left">基本信息</Divider>

      {/* 测量项名称 */}
      <Form.Item label="测量项名称">
        <Input value={selectedMeasurementItem?.itemName} readOnly disabled />
      </Form.Item>

      {/* 仅在 measurementType !== 'cost' 时显示 */}
      {measurementType !== 'cost' && (
        <>
          {/* 设计量 */}
          <Form.Item label="设计量">
            <Input value={selectedMeasurementItem?.designCount} readOnly disabled />
          </Form.Item>

          {/* 单价 */}
          <Form.Item label="单价">
            <Input value={selectedMeasurementItem?.itemPrice} readOnly disabled />
          </Form.Item>
        </>
      )}

      {/* 金额或工程量 */}
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

      {/* 其他信息 */}
      <Divider orientation="left">其他信息</Divider>

      {/* 分项（桩号） */}
      <Form.Item label="分项（桩号）" name="subItemNumber">
        <Input placeholder="请输入分项（桩号）" />
      </Form.Item>

      {/* 部位 */}
      <Form.Item label="部位" name="position">
        <Input placeholder="请输入部位" />
      </Form.Item>

      {/* 备注 */}
      <Form.Item label="备注" name="extend">
        <Input placeholder="请输入备注" />
      </Form.Item>

      {/* 附件 */}
      <Divider orientation="left">附件</Divider>
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

      {/* 隐藏字段 */}
      <Form.Item name="id" hidden>
        <Input type="hidden" />
      </Form.Item>
    </Form>
  );
};

export default MeasurementDetailForm;
