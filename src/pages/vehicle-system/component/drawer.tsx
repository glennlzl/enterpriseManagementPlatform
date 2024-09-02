import { fetchOssStsAccessInfo, OssStsAccessInfo } from '@/api/usermanagement';
import {
  addVehicleUsageInfo,
  deleteVehicleUsageInfo,
  queryVehicleUsageInfoList,
  updateVehicleUsageInfo,
} from '@/api/vihicle-system';
import type {
  AddOrUpdateVehicleUsageInfoRequest,
  VehicleInfo,
  VehicleUsageInfo,
} from '@/model/vehicle-management-system';
import { PlusOutlined } from '@ant-design/icons';
import OSS from 'ali-oss';
import {
  Badge,
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  message,
  Select,
  Table,
  Upload,
} from 'antd';
import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OSSClient = OSS.default || OSS;

interface VehicleDrawerProps {
  visible: boolean;
  onClose: () => void;
  vehicleInfo: VehicleInfo | null;
  usageInfoList: VehicleUsageInfo[];
  loading: boolean;
}

const VehicleDrawer: React.FC<VehicleDrawerProps> = ({
  visible,
  onClose,
  vehicleInfo,
  usageInfoList,
  loading,
}) => {
  const [showMore, setShowMore] = useState(false);
  const [filteredUsageList, setFilteredUsageList] = useState<VehicleUsageInfo[]>(usageInfoList);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [isAdding, setIsAdding] = useState(false); // 控制新记录的展开
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]); // 用于存储文件列表
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null); // 保存展开行的ID

  useEffect(() => {
    setFilteredUsageList(usageInfoList);
  }, [usageInfoList]);

  const refreshUsageInfoList = async () => {
    if (vehicleInfo) {
      try {
        const updatedUsageList = await queryVehicleUsageInfoList(vehicleInfo.id);
        setFilteredUsageList(updatedUsageList);
      } catch (error) {
        message.error(error);
      }
    }
  };

  const handleExpand = (expanded: boolean, record: VehicleUsageInfo) => {
    setExpandedRowKeys(expanded ? [record.id] : []);
    setSelectedRecordId(expanded ? record.id : null); // 保存当前展开行的ID

    if (expanded) {
      form.setFieldsValue({
        startMileage: record.startMileage,
        endMileage: record.endMileage,
        usageStatus: record.usageStatus,
        vehicleImageUrls: record.vehicleImageUrls,
        extend: record.extend,
        recordTime: record.recordTime, // 新增的字段
      });

      setFileList(
        record.vehicleImageUrls?.map((url, index) => ({
          uid: index.toString(),
          name: `Image-${index + 1}`,
          status: 'done',
          url: url,
        })) || [],
      );
    }
  };

  const uploadImageToOss = async (file: File, ossStsAccessInfo: OssStsAccessInfo) => {
    const client = new OSSClient({
      region: 'oss-cn-beijing',
      accessKeyId: ossStsAccessInfo.accessKeyId,
      accessKeySecret: ossStsAccessInfo.accessKeySecret,
      stsToken: ossStsAccessInfo.securityToken,
      bucket: 'rohana-erp',
    });

    try {
      const result = await client.put(`photos/${file.name}`, file);
      return result.url;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const handleUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      const ossStsAccessInfo = await fetchOssStsAccessInfo();
      const imageUrl = await uploadImageToOss(file, ossStsAccessInfo);

      const newFile = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: imageUrl,
      };

      setFileList((prevList) => [...prevList, newFile]);

      // 获取当前的 vehicleImageUrls 并确保它是一个数组
      const currentUrls = form.getFieldValue('vehicleImageUrls');
      form.setFieldsValue({
        vehicleImageUrls: Array.isArray(currentUrls) ? [...currentUrls, imageUrl] : [imageUrl],
      });

      onSuccess(newFile);
    } catch (error) {
      onError(error);
    }
  };

  const handleUpdate = async (values: any) => {
    // console.log(form.getFieldValue('vehicleImageUrls').fileList.map((file: any) => file.response.url));
    console.log(filteredUsageList);
    try {
      const payload: AddOrUpdateVehicleUsageInfoRequest = {
        vehicleId: vehicleInfo?.id || 0,
        userId: vehicleInfo?.responsiblePersonId || 0,
        userName: vehicleInfo?.responsiblePersonName || '',
        id: selectedRecordId || 0,
        startMileage: values.startMileage,
        endMileage: values.endMileage,
        usageStatus: values.usageStatus,
        vehicleImageUrls: form
          .getFieldValue('vehicleImageUrls')
          .fileList.map((file: any) => file.response.url),
        extend: form.getFieldValue('extend'),
        recordTime: values.recordTime, // 保存使用日期
      };
      await updateVehicleUsageInfo(payload);
      message.success('车辆使用信息添加成功');
      setIsAdding(false);
      await refreshUsageInfoList(); // 更新数据
    } catch (error) {
      message.error(error);
    }
  };

  const handleAdd = async (values: any) => {
    // console.log(form.getFieldValue('vehicleImageUrls').fileList.map((file: any) => file.response.url));
    try {
      const payload: AddOrUpdateVehicleUsageInfoRequest = {
        vehicleId: vehicleInfo?.id || 0,
        userId: vehicleInfo?.responsiblePersonId || 0,
        userName: vehicleInfo?.responsiblePersonName || '',
        startMileage: values.startMileage,
        endMileage: values.endMileage,
        usageStatus: values.usageStatus,
        vehicleImageUrls: form
          .getFieldValue('vehicleImageUrls')
          .fileList.map((file: any) => file.response.url),
        extend: values.extend,
        recordTime: values.recordTime, // 保存使用日期
      };
      await addVehicleUsageInfo(payload);
      message.success('车辆使用信息添加成功');
      setIsAdding(false);
      await refreshUsageInfoList(); // 更新数据
    } catch (error) {
      message.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicleUsageInfo(id);
      message.success('车辆使用信息删除成功');
      setFilteredUsageList(filteredUsageList.filter((item) => item.id !== id));
      await refreshUsageInfoList(); // 更新数据
    } catch (error) {
      message.error(error);
    }
  };

  const handleDateFilter = (dates: [Moment, Moment] | null) => {
    if (dates) {
      const [start, end] = dates;
      const filteredList = usageInfoList.filter((item) => {
        const recordTime = moment(item.recordTime, 'YYYY-MM-DD'); // 根据格式解析
        if (recordTime.isValid()) {
          return recordTime.isBetween(start, end, 'days', '[]');
        }
        return false;
      });
      setFilteredUsageList(filteredList);
    } else {
      setFilteredUsageList(usageInfoList);
    }
  };

  const columns = [
    {
      title: '记录日期',
      dataIndex: 'recordTime',
      key: 'recordTime',
    },
    {
      title: '使用者',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '里程数',
      dataIndex: 'startMileage',
      key: 'startMileage',
      render: (text: string, record: VehicleUsageInfo) =>
        `${record.startMileage}/${record.endMileage}`,
    },
    {
      title: '使用情况',
      dataIndex: 'usageStatus',
      key: 'usageStatus',
      render: (status: number) => (
        <Badge status={status === 0 ? 'success' : 'error'} text={status === 0 ? '正常' : '异常'} />
      ),
    },
  ];

  return (
    <Drawer title="车辆详情" width={640} placement="right" onClose={onClose} visible={visible}>
      {vehicleInfo && (
        <>
          <Descriptions title="车辆基础信息" bordered size="small" column={2}>
            <Descriptions.Item label="车辆编号">{vehicleInfo.vehicleNumber}</Descriptions.Item>
            <Descriptions.Item label="工程车编号">
              {vehicleInfo.engineeingVehicleNumber}
            </Descriptions.Item>
            <Descriptions.Item label="车牌号码">{vehicleInfo.licenseNumber}</Descriptions.Item>
            <Descriptions.Item label="管理人姓名">
              {vehicleInfo.responsiblePersonName}
            </Descriptions.Item>
            {showMore && <>{/* 展开更多信息 */}</>}
          </Descriptions>
          <Button type="link" style={{ margin: '10px 0' }} onClick={() => setShowMore(!showMore)}>
            {showMore ? '收起' : '展开'}
          </Button>
        </>
      )}

      <Table
        columns={columns}
        dataSource={filteredUsageList}
        loading={loading}
        pagination={false}
        rowKey="id"
        style={{ marginTop: 20 }}
        title={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '15px', fontWeight: 'bold' }}>使用历史</span>
            <RangePicker style={{ marginBottom: 20 }} onChange={handleDateFilter} format="MM-DD" />
          </div>
        )}
        expandable={{
          expandedRowRender: (record) => {
            return (
              <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <Form layout="vertical" form={form} onFinish={handleUpdate}>
                  <Form.Item
                    label="开始里程数"
                    name="startMileage"
                    rules={[{ required: true, message: '请输入开始里程数' }]}
                  >
                    <Input type="number" placeholder="请输入开始里程数" />
                  </Form.Item>
                  <Form.Item
                    label="结束里程数"
                    name="endMileage"
                    rules={[
                      { required: true, message: '请输入结束里程数' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('startMileage') <= value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('结束里程数必须大于等于开始里程数'));
                        },
                      }),
                    ]}
                  >
                    <Input type="number" placeholder="请输入结束里程数" />
                  </Form.Item>
                  <Form.Item
                    label="使用情况"
                    name="usageStatus"
                    rules={[{ required: true, message: '请选择使用情况' }]}
                  >
                    <Select placeholder="请选择使用情况">
                      <Option value={0}>正常</Option>
                      <Option value={1}>异常</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="车辆图片" name="vehicleImageUrls">
                    <Upload
                      customRequest={handleUpload}
                      listType="picture-card"
                      fileList={fileList} // 使用状态中的fileList
                      onChange={({ fileList: newFileList }) => setFileList(newFileList)} // 同步更新fileList
                      onPreview={(file) => window.open(file.url || file.thumbUrl)}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传照片</div>
                      </div>
                    </Upload>
                  </Form.Item>
                  <Form.Item label="备注信息" name="extend">
                    <Input.TextArea placeholder="请输入备注信息" />
                  </Form.Item>
                  <Form.Item label="id" name="id" hidden={true}>
                    <Input.TextArea placeholder="请输入备注信息" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit">
                    保存
                  </Button>
                  <Button
                    type="primary"
                    style={{ marginLeft: '8px' }}
                    onClick={() => handleDelete(record.id)}
                  >
                    删除
                  </Button>
                </Form>
              </div>
            );
          },
          rowExpandable: () => true,
          expandedRowKeys: expandedRowKeys,
          onExpand: handleExpand,
        }}
      />

      {!isAdding && (
        <Button
          type="dashed"
          style={{ marginTop: 20 }}
          onClick={() => {
            setIsAdding(true);
            setExpandedRowKeys([]);
            form.resetFields();
            setFileList([]); // 重置fileList
          }}
        >
          <PlusOutlined /> 新增使用记录
        </Button>
      )}

      {isAdding && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginTop: 20,
          }}
        >
          <Form layout="vertical" form={form} onFinish={handleAdd}>
            <Form.Item
              label="使用日期"
              name="recordTime"
              rules={[{ required: true, message: '请选择使用日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="开始里程数"
              name="startMileage"
              rules={[{ required: true, message: '请输入开始里程数' }]}
            >
              <Input type="number" placeholder="请输入开始里程数" />
            </Form.Item>
            <Form.Item
              label="结束里程数"
              name="endMileage"
              rules={[
                { required: true, message: '请输入结束里程数' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('startMileage') <= value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('结束里程数必须大于等于开始里程数'));
                  },
                }),
              ]}
            >
              <Input type="number" placeholder="请输入结束里程数" />
            </Form.Item>
            <Form.Item
              label="使用情况"
              name="usageStatus"
              rules={[{ required: true, message: '请选择使用情况' }]}
            >
              <Select placeholder="请选择使用情况">
                <Option value={0}>正常</Option>
                <Option value={1}>异常</Option>
              </Select>
            </Form.Item>
            <Form.Item label="车辆图片" name="vehicleImageUrls">
              <Upload
                customRequest={handleUpload}
                listType="picture-card"
                fileList={fileList} // 使用状态中的fileList
                onChange={({ fileList: newFileList }) => setFileList(newFileList)} // 同步更新fileList
                onPreview={(file) => window.open(file.url || file.thumbUrl)}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传照片</div>
                </div>
              </Upload>
            </Form.Item>
            <Form.Item label="备注信息" name="extend">
              <Input.TextArea placeholder="请输入备注信息" />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              {' '}
              {/* 这里的htmlType设置为submit */}
              保存
            </Button>
            <Button type="default" style={{ marginLeft: '8px' }} onClick={() => setIsAdding(false)}>
              取消
            </Button>
          </Form>
        </div>
      )}
    </Drawer>
  );
};

export default VehicleDrawer;
