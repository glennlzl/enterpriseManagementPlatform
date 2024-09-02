import React, { useEffect, useState } from 'react';
import OSS from 'ali-oss';
import { Drawer, Descriptions, Table, Button, DatePicker, Badge, Select, Input, Form, Upload, message } from 'antd';
import type {
  AddOrUpdateVehicleUsageInfoRequest,
  VehicleInfo,
  VehicleUsageInfo
} from "@/model/vehicle-management-system";
import moment, { Moment } from 'moment';
import { PlusOutlined } from '@ant-design/icons';
import { addOrUpdateVehicleUsageInfo, deleteVehicleUsageInfo, queryVehicleUsageInfoList } from "@/api/vihicle-system";
import { fetchOssStsAccessInfo, OssStsAccessInfo } from "@/api/usermanagement";

const { RangePicker } = DatePicker;
const { Option } = Select;

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
    if (expanded) {
      form.setFieldsValue({
        startMileage: record.startMileage,
        endMileage: record.endMileage,
        usageStatus: record.usageStatus,
        vehicleImageUrls: record.vehicleImageUrls,
        extend: record.extend,
        recordTime: record.recordTime, // 新增的字段
      });
    }
  };

  const uploadImageToOss = async (file: File, ossStsAccessInfo: OssStsAccessInfo) => {
    const client = new OSS({
      region: 'your-oss-region',
      accessKeyId: ossStsAccessInfo.accessKeyId,
      accessKeySecret: ossStsAccessInfo.accessKeySecret,
      stsToken: ossStsAccessInfo.securityToken,
      bucket: 'your-bucket-name',
    });

    try {
      const result = await client.put(`your-folder-name/${file.name}`, file);
      return result.url;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const handleUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      const ossStsAccessInfo = await fetchOssStsAccessInfo();
      const imageUrl = await uploadImageToOss(file, ossStsAccessInfo);
      onSuccess(imageUrl);
    } catch (error) {
      onError(error);
    }
  };

  const handleSave = async (values: any) => {
    try {
      const payload: AddOrUpdateVehicleUsageInfoRequest = {
        vehicleId: vehicleInfo?.id || 0,
        userId: vehicleInfo?.responsiblePersonId || 0,
        userName: vehicleInfo?.responsiblePersonName || '',
        startMileage: values.startMileage,
        endMileage: values.endMileage,
        usageStatus: values.usageStatus,
        vehicleImageUrls: values.vehicleImageUrls || [],
        extend: values.extend,
        recordTime: values.recordTime, // 保存使用日期
      };
      await addOrUpdateVehicleUsageInfo(payload);
      message.success('车辆使用信息添加成功');
      setIsAdding(false);
      await refreshUsageInfoList();  // 更新数据
    } catch (error) {
      message.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicleUsageInfo(id);
      message.success('车辆使用信息删除成功');
      setFilteredUsageList(filteredUsageList.filter(item => item.id !== id));
      await refreshUsageInfoList();  // 更新数据
    } catch (error) {
      message.error(error);
    }
  };

  const handleDateFilter = (dates: [Moment, Moment] | null) => {
    if (dates) {
      const [start, end] = dates;
      const filteredList = usageInfoList.filter(item => {
        console.log('recordTime:', item.recordTime); // 输出调试信息
        const recordTime = moment(item.recordTime, 'YYYY-MM-DD'); // 根据格式解析
        console.log('recordTime as Moment:', recordTime); // 检查Moment对象
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
      render: (text: string, record: VehicleUsageInfo) => `${record.startMileage}/${record.endMileage}`,
    },
    {
      title: '使用情况',
      dataIndex: 'usageStatus',
      key: 'usageStatus',
      render: (status: number) => (
        <Badge
          status={status === 0 ? 'success' : 'error'}
          text={status === 0 ? '正常' : '异常'}
        />
      ),
    },
  ];

  return (
    <Drawer
      title="车辆详情"
      width={640}
      placement="right"
      onClose={onClose}
      visible={visible}
    >
      {vehicleInfo && (
        <>
          <Descriptions title="车辆基础信息" bordered size="small" column={2}>
            <Descriptions.Item label="车辆编号">{vehicleInfo.vehicleNumber}</Descriptions.Item>
            <Descriptions.Item label="工程车编号">{vehicleInfo.engineeingVehicleNumber}</Descriptions.Item>
            <Descriptions.Item label="车牌号码">{vehicleInfo.licenseNumber}</Descriptions.Item>
            <Descriptions.Item label="管理人姓名">{vehicleInfo.responsiblePersonName}</Descriptions.Item>
            {showMore && (
              <>
                <Descriptions.Item label="序号">{vehicleInfo.id}</Descriptions.Item>
                <Descriptions.Item label="警告等级">{vehicleInfo.warningLevel}</Descriptions.Item>
                <Descriptions.Item label="发动机号后6位">{vehicleInfo.engineNumber}</Descriptions.Item>
                <Descriptions.Item label="车辆类型">{vehicleInfo.vehicleType}</Descriptions.Item>
                <Descriptions.Item label="车辆型号">{vehicleInfo.vehicleSerialNumber}</Descriptions.Item>
                <Descriptions.Item label="车辆品牌">{vehicleInfo.vehicleBrand}</Descriptions.Item>
                <Descriptions.Item label="核定载质量">{vehicleInfo.approvedLoadCapacity}</Descriptions.Item>
                <Descriptions.Item label="登记人">{vehicleInfo.registrant}</Descriptions.Item>
                <Descriptions.Item label="登记人ID">{vehicleInfo.registrantId}</Descriptions.Item>
                <Descriptions.Item label="购车日期">{vehicleInfo.purchaseDate}</Descriptions.Item>
                <Descriptions.Item label="年检月份">{vehicleInfo.auditMonth}</Descriptions.Item>
                <Descriptions.Item label="是否年检">{vehicleInfo.isAudited ? '是' : '否'}</Descriptions.Item>
                <Descriptions.Item label="是否有交强险">{vehicleInfo.trafficInsurance ? '是' : '否'}</Descriptions.Item>
                <Descriptions.Item label="是否有商业险">{vehicleInfo.commercialInsurance ? '是' : '否'}</Descriptions.Item>
                <Descriptions.Item label="是否安装GPS">{vehicleInfo.gps ? '是' : '否'}</Descriptions.Item>
                <Descriptions.Item label="机械邦">{vehicleInfo.mechanicalBond}</Descriptions.Item>
                <Descriptions.Item label="使用项目">{vehicleInfo.usageProject}</Descriptions.Item>
                <Descriptions.Item label="上次保养公里数">{vehicleInfo.lastMaintenanceMileage}</Descriptions.Item>
                <Descriptions.Item label="当前公里数">{vehicleInfo.currentMileage}</Descriptions.Item>
                <Descriptions.Item label="下次保养公里数">{vehicleInfo.nextMaintenanceMileage}</Descriptions.Item>
                <Descriptions.Item label="负责人姓名">{vehicleInfo.responsiblePersonName}</Descriptions.Item>
                <Descriptions.Item label="负责人ID">{vehicleInfo.responsiblePersonId}</Descriptions.Item>
                <Descriptions.Item label="负责人联系电话">{vehicleInfo.responsiblePersonMobile}</Descriptions.Item>
                <Descriptions.Item label="其他备注信息">{vehicleInfo.extend}</Descriptions.Item>
                <Descriptions.Item label="是否删除">{vehicleInfo.isDeleted ? '是' : '否'}</Descriptions.Item>
                <Descriptions.Item label="是否废弃">{vehicleInfo.isDeprecated ? '是' : '否'}</Descriptions.Item>
              </>
            )}
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
            <RangePicker
              style={{ marginBottom: 20 }}
              onChange={handleDateFilter}
              format="MM-DD"
            />
          </div>
        )}
        expandable={{
          expandedRowRender: record => {
            // 确保 recordTime 是一个 Moment 对象
            const initialValues = {
              ...record,
              recordTime: record.recordTime ? moment(record.recordTime, 'YYYY-MM-DD') : moment(record.recordTime, '2024-01-01'),
            };
            return (
              <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <Form layout="vertical" form={form} initialValues={initialValues}>
                  {/*<Form.Item*/}
                  {/*  label="使用日期"*/}
                  {/*  name="recordTime"*/}
                  {/*  rules={[{ required: true, message: '请选择使用日期' }]}*/}
                  {/*>*/}
                  {/*  <DatePicker style={{ width: '100%' }} />*/}
                  {/*</Form.Item>*/}
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
                      fileList={record.vehicleImageUrls ? record.vehicleImageUrls.map((url, index) => ({
                        uid: index.toString(),
                        name: `Image-${index + 1}`,
                        status: 'done',
                        url: url,
                      })) : []}
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
                  <Button type="primary" onClick={() => handleSave(record)}>
                    保存
                  </Button>
                  <Button type="primary" style={{ marginLeft: '8px' }} onClick={() => handleDelete(record.id)}>
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

      {/* 新增部分 */}
      {!isAdding && (
        <Button type="dashed" style={{ marginTop: 20 }} onClick={() => {
          setIsAdding(true);
          setExpandedRowKeys([]);
          form.resetFields(); // 重置表单
        }}>
          <PlusOutlined /> 新增使用记录
        </Button>
      )}

      {isAdding && (
        <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginTop: 20 }}>
          <Form
            layout="vertical"
            form={form}
            onFinish={handleSave}  // 将表单提交事件直接与 handleSave 函数绑定
          >
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
            <Button type="primary" htmlType="submit">  {/* 这里的htmlType设置为submit */}
              保存
            </Button>
            <Button
              type="default"
              style={{ marginLeft: '8px' }}
              onClick={() => setIsAdding(false)}
            >
              取消
            </Button>
          </Form>
        </div>
      )}
    </Drawer>
  );
};

export default VehicleDrawer;
