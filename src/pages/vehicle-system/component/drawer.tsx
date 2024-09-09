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
  Image,
} from 'antd';
import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import {useModel} from "@@/exports";
import { DateTime } from 'luxon';
import {ProFormSelect} from "@ant-design/pro-components";

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
                                                       isAdding,
                                                       setIsAdding,
                                                       expandedRowKeys,
                                                       setExpandedRowKeys,
                                                       editingKey,
                                                       setEditingKey,
                                                       showMore,
                                                       setShowMore,
                                                       form,
                                                       employeeOptions,
                                                       refreshCurrentInfo}) => {
  const { initialState } = useModel('@@initialState');
  const [filteredUsageList, setFilteredUsageList] = useState<VehicleUsageInfo[]>(usageInfoList);
  const [fileList, setFileList] = useState<any[]>([]); // 用于存储文件列表
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null); // 保存展开行的
  const [selectedImages, setSelectedImages] = useState<string[]>([]); // 保存展开行的图片
  const [editing, setEditing] = useState(false);
  const isAdmin = initialState?.currentUser?.role >= 2;
  const [thisLoading, setLoading] = useState(false);

  const compareDateWithToday = (dateStr) => {
    // 将输入的 YYYY-MM-DD 字符串解析为 Luxon 的 DateTime 对象
    const inputDate = DateTime.fromFormat(dateStr, 'yyyy-MM-dd');

    // 获取当前的日期时间
    const today = DateTime.now();

    // 计算两者之间的差异，以天为单位
    const diffInDays = today.diff(inputDate, 'days').days;

    // 判断是否超过一天
    return diffInDays > 1;
  };

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

  const handleExpand = (expanded: boolean, record: any) => {
    setExpandedRowKeys((prevKeys) => {
      if (expanded) {
        return [...prevKeys, record.id];
      } else {
        return prevKeys.filter((key) => key !== record.id);
      }
    });

    // 仅当展开时更新对应行的信息
    if (expanded) {
      form.setFieldsValue({
        startMileage: record.startMileage,
        endMileage: record.endMileage,
        usageStatus: record.usageStatus,
        vehicleImageUrls: record.vehicleImageUrls,
        extend: record.extend,
        recordTime: record.recordTime,
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
      setLoading(true);
      const ossStsAccessInfo = await fetchOssStsAccessInfo();
      const imageUrl = await uploadImageToOss(file, ossStsAccessInfo);

      setFileList((prevList) => [...prevList, imageUrl]);

      // 获取当前的 vehicleImageUrls 并确保它是一个数组
      const currentUrls = form.getFieldValue('vehicleImageUrls');
      form.setFieldsValue({
        vehicleImageUrls: _.isUndefined(currentUrls) ? [...currentUrls, imageUrl] : [imageUrl],
      });

      setSelectedImages((prevImages) => [...prevImages, imageUrl]);
      setLoading(false);

      onSuccess(imageUrl);
    } catch (error) {
      onError(error);
    }
  };

  const handleUpdate = async () => {
    console.log('sdfsdf');
    const values = await form.validateFields();
    console.log(values);
    const matchingEmployee = employeeOptions.filter((item) => item.value === values.responsiblePersonId)[0];
    await refreshCurrentInfo();
    try {
      const payload: AddOrUpdateVehicleUsageInfoRequest = {
        vehicleId: vehicleInfo?.id || 0,
        userId: matchingEmployee?.value || vehicleInfo?.registrantId || 0,
        userName: matchingEmployee?.name || vehicleInfo?.registrant || '',
        id: selectedRecordId || 0,
        startMileage: vehicleInfo?.currentMileage || 0,
        endMileage: Number(values.endMileage),
        usageStatus: values.usageStatus,
        vehicleImageUrls: selectedImages,
        extend: values.extend,
        recordTime: values.recordTime, // 保存使用日期
      };
      await updateVehicleUsageInfo(payload);
      message.success('车辆使用信息更新成功');
      setEditingKey(null); // 退出编辑模式
      setEditing(false);
      await refreshUsageInfoList(); // 更新数据
    } catch (error) {
      message.error(error);
    }
  };

  const handleAdd = async () => {
    const values = await form.validateFields();
    const matchingEmployee = employeeOptions.filter((item) => item.value === values.responsiblePersonId)[0];
    await refreshCurrentInfo();
    try {
      const payload: AddOrUpdateVehicleUsageInfoRequest = {
        vehicleId: vehicleInfo?.id || 0,
        userId: matchingEmployee?.value || vehicleInfo?.registrantId || 0,
        userName: matchingEmployee?.name || vehicleInfo?.registrant || '',
        startMileage: vehicleInfo?.currentMileage || 0,
        endMileage: Number(values.endMileage),
        usageStatus: values.usageStatus,
        vehicleImageUrls: selectedImages,
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

  const handleDelete = async (record: any) => {
    try {
      await deleteVehicleUsageInfo(record.id);
      setEditingKey(record.id); // 只设置当前行为编辑状态
      await refreshCurrentInfo();
      message.success('车辆使用信息删除成功');
      setFilteredUsageList(filteredUsageList.filter((item) => item.id !== record.id));
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
          return recordTime.isSameOrAfter(start, 'day') && recordTime.isSameOrBefore(end, 'day');
        }
        return false;
      });
      setFilteredUsageList(filteredList);
    } else {
      setFilteredUsageList(usageInfoList);
    }
  };

  const handleEdit = (record: any) => {
    console.log(record);
    setEditingKey(record.id); // 只设置当前行为编辑状态
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
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
        `${record.startMileage}/${_.isUndefined(record.endMileage) ? ' - ' : record.endMileage}`,
    },
    {
      title: '使用情况',
      dataIndex: 'usageStatus',
      key: 'usageStatus',
      render: (status: number) => (
        <Badge status={status === 0 || _.isUndefined(status) ? 'success' : 'error'} text={status === 0 ? '正常' : '异常'} />
      ),
    },
  ];

  console.log(showMore);

  return (
    <Drawer title="车辆详情" width={640} placement="right" onClose={onClose} visible={visible}>
      {vehicleInfo && (
        <>
          <Descriptions title="车辆基础信息" bordered size="small" column={2}>
            <Descriptions.Item label="车辆编号">{vehicleInfo.vehicleNumber}</Descriptions.Item>
            <Descriptions.Item label="工程车编号">{vehicleInfo.engineeingVehicleNumber}</Descriptions.Item>
            <Descriptions.Item label="车牌号码">{vehicleInfo.licenseNumber}</Descriptions.Item>
            <Descriptions.Item label="管理人姓名">{vehicleInfo.responsiblePersonName}</Descriptions.Item>
            {showMore && isAdmin && (
              <>
                <Descriptions.Item label="序号">{vehicleInfo.id}</Descriptions.Item>
                <Descriptions.Item label="警告等级">{vehicleInfo.warningLevel}</Descriptions.Item>
                <Descriptions.Item label="发动机号后6位">{vehicleInfo.engineNumber}</Descriptions.Item>
                <Descriptions.Item label="车辆类型">{vehicleInfo.vehicleType}</Descriptions.Item>
                <Descriptions.Item label="车辆型号">{vehicleInfo.vehicleSerialNumber}</Descriptions.Item>
                <Descriptions.Item label="车辆品牌">{vehicleInfo.vehicleBrand}</Descriptions.Item>
                <Descriptions.Item label="核定载质量">{vehicleInfo.approvedLoadCapacity}</Descriptions.Item>
                <Descriptions.Item label="登记人">{vehicleInfo.registrant}</Descriptions.Item>
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
                <Descriptions.Item label="负责人联系电话">{vehicleInfo.responsiblePersonMobile}</Descriptions.Item>
                <Descriptions.Item label="其他备注信息">{vehicleInfo.extend}</Descriptions.Item>
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
              <Form form={form}>
                <Form.Item name="dateRange">
                  <RangePicker
                    style={{ marginBottom: 20 }}
                    onChange={handleDateFilter}
                    format="MM-DD"
                  />
                </Form.Item>
            </Form>
          </div>
        )}
        expandable={{
          expandedRowRender: (record) => {
            return (
              <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                {(editingKey === record.id && (isAdmin || !compareDateWithToday(record.recordTime))) ? (
                  <Form layout="vertical" form={form} onFinish={handleUpdate}>
                    {
                      isAdmin && <ProFormSelect
                        name="responsiblePersonId"
                        label="负责人"
                        options={employeeOptions}
                        width="200px"
                        initialValue={vehicleInfo?.responsiblePersonId} // 设置初始选中值
                      />
                    }
                    <Form.Item
                      label="结束里程数"
                      name="endMileage"
                      rules={[
                        () => ({
                          validator(_, value) {
                            const startMileage = Number(vehicleInfo?.currentMileage ?? 0);
                            const endMileage = Number(value);
                            if (!value || startMileage <= endMileage) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('结束里程数必须大于等于当前里程数，当前里程数为 ' + startMileage + ' 公里'));
                          },
                        }),
                      ]}
                    >
                      <Input type="number" placeholder="请输入结束里程数" />
                    </Form.Item>
                    {isAdmin && (
                      <Form.Item label="使用情况" name="usageStatus">
                        <Select placeholder="请选择使用情况">
                          <Option value={0}>正常</Option>
                          <Option value={1}>异常</Option>
                        </Select>
                      </Form.Item>
                    )}
                    <Form.Item label="车辆图片" name="vehicleImageUrls">
                      <Upload
                        customRequest={handleUpload}
                        listType="picture-card"
                        fileList={fileList}
                        onChange={({ fileList: newFileList }) => setFileList(newFileList)}
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <Button type="primary" htmlType="submit" loading={thisLoading}>
                        保存
                      </Button>
                      <Button
                        type="default"
                        style={{ marginLeft: '8px' }}
                        onClick={handleCancelEdit}
                      >
                        取消
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div>
                    <p><strong>开始里程数: </strong>{record.startMileage}</p>
                    <p><strong>结束里程数: </strong>{record.endMileage}</p>
                    <p><strong>使用情况: </strong>{record.usageStatus === 0 ? '正常' : '异常'}</p>
                    <div style={{ marginBottom: '16px' }}>
                      <strong>车辆图片: </strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                        <Image.PreviewGroup>
                          {record.vehicleImageUrls && record.vehicleImageUrls.map((url, index) => (
                            <Image
                              key={index}
                              src={url}
                              alt={`车辆图片${index + 1}`}
                              width={100}
                              height={100}
                              style={{ objectFit: 'cover', borderRadius: '4px' }}
                            />
                          ))}
                        </Image.PreviewGroup>
                      </div>
                    </div>
                    <p><strong>备注信息: </strong>{record.extend}</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <Button type="default" onClick={() => handleEdit(record)}>编辑</Button>
                      <Button type="default" style={{ marginLeft: '8px' }} onClick={() => handleExpand(false, record)}>收起</Button>
                      {isAdmin || !compareDateWithToday(record.recordTime) ? <Button type="default" style={{ marginLeft: '8px' }} onClick={() => handleDelete(record)}>删除</Button> : null}
                    </div>
                  </div>
                )}
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
            setSelectedImages([]);
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
              label="结束里程数"
              name="endMileage"
              rules={[
                { message: '请输入结束里程数' },
                () => ({
                  validator(_, value) {
                    const startMileage = Number(vehicleInfo?.currentMileage ?? 0);
                    const endMileage = Number(value);
                    if (!value || startMileage <= endMileage) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('结束里程数必须大于等于当前里程数，当前里程数为 ' + startMileage + ' 公里'));
                  },
                }),
              ]}
            >
              <Input type="number" placeholder="请输入结束里程数" />
            </Form.Item>
            {
              isAdmin && <ProFormSelect
                name="responsiblePersonId"
                label="使用者"
                options={employeeOptions}
                fieldProps={{
                  labelInValue: false, // 只显示label
                }}
                width="200px"
              />
            }
            {isAdmin && (
              <Form.Item label="使用情况" name="usageStatus">
                <Select placeholder="请选择使用情况">
                  <Option value={0}>正常</Option>
                  <Option value={1}>异常</Option>
                </Select>
              </Form.Item>
            )}
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
