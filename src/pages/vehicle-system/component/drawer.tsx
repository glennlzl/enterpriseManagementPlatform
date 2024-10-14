import { fetchOssStsAccessInfo, OssStsAccessInfo } from '@/api/usermanagement';
import {
  addVehicleUsageInfo,
  deleteVehicleUsageInfo,
  getVehicleInfo,
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
  InputNumber,
} from 'antd';
import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import { useModel } from '@@/exports';
import { DateTime } from 'luxon';
import { ProFormSelect } from '@ant-design/pro-components';
import { isNull } from 'lodash';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OSSClient = OSS.default || OSS;

interface VehicleDrawerProps {
  visible: boolean;
  onClose: () => void;
  vehicleInfo: VehicleInfo | null;
  usageInfoList: VehicleUsageInfo[];
  loading: boolean;
  isAdding: boolean;
  setIsAdding: (value: boolean) => void;
  expandedRowKeys: number[];
  setExpandedRowKeys: (keys: number[]) => void;
  editingKey: number | null;
  setEditingKey: (key: number | null) => void;
  showMore: boolean;
  setShowMore: (value: boolean) => void;
  employeeOptions: { value: number; name: string }[];
  setVehicleInfo: (info: VehicleInfo) => void;
  fetchVehicleList: () => void;
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
                                                       employeeOptions,
                                                       setVehicleInfo,
                                                       fetchVehicleList,
                                                     }) => {
  const { initialState } = useModel('@@initialState');
  const [filteredUsageList, setFilteredUsageList] = useState<VehicleUsageInfo[]>(usageInfoList);
  const [selectedImages, setSelectedImages] = useState<string[]>([]); // 保存图片链接
  const isAdmin = initialState?.currentUser?.role >= 2;
  const [thisLoading, setLoading] = useState(false);

  // 创建单独的Form实例
  const [addForm] = Form.useForm();

  const isCreateButtonDisabled = filteredUsageList.length > 0 && !filteredUsageList[0].endMileage;


  // 在组件内部
  const sortedUsageList = [...filteredUsageList].sort((a, b) => {
    const dateA = DateTime.fromFormat(a.recordTime, 'yyyy-MM-dd');
    const dateB = DateTime.fromFormat(b.recordTime, 'yyyy-MM-dd');
    return dateB.toMillis() - dateA.toMillis(); // 按日期从新到旧排序
  });

  // 获取最新的记录（列表的第一项）
  const latestRecord = sortedUsageList.length > 0 ? sortedUsageList[0] : null;
  const latestRecordId = latestRecord ? latestRecord.id : null;

  // 假设每个员工对象包含 id 和 username 属性
  const employeeOptionsWithUsername = employeeOptions.map((employee) => ({
    value: employee.value,
    label: employee.name, // 使用用户名作为显示标签
  }));
  const responsibleEmployeeOptions =
    !vehicleInfo || !employeeOptionsWithUsername || isNull(vehicleInfo?.driverList)
      ? []
      : employeeOptionsWithUsername.filter(
        (item) =>
          item.value === vehicleInfo?.responsiblePersonId ||
          item.value === vehicleInfo?.registrantId ||
          vehicleInfo.driverList?.some((driver) => driver.id === item.value),
      );

  const compareDateWithToday = (dateStr: string) => {
    const inputDate = DateTime.fromFormat(dateStr, 'yyyy-MM-dd');
    const today = DateTime.now();
    const diffInDays = today.diff(inputDate, 'days').days;
    return diffInDays > 1;
  };

  useEffect(() => {
    setFilteredUsageList(usageInfoList);
  }, [usageInfoList]);

  const refreshUsageInfoList = async () => {
    const updateVehicleInfo = await getVehicleInfo(vehicleInfo?.id || 0);
    setVehicleInfo(updateVehicleInfo);
    fetchVehicleList();
    if (vehicleInfo) {
      try {
        const updatedUsageList = await queryVehicleUsageInfoList(vehicleInfo.id);
        setFilteredUsageList(updatedUsageList);
      } catch (error) {
        message.error(error as string);
      }
    }
  };

  const handleUpdate = async (id: number, values: any, selectedImages: string[]) => {
    try {
      const matchingEmployee = employeeOptions.find(
        (item) => item.value === values.responsiblePersonId,
      );

      // 在更新时，使用原始记录的 startMileage
      const originalRecord = filteredUsageList.find((item) => item.id === id);
      const startMileage = originalRecord?.startMileage;

      const payload: AddOrUpdateVehicleUsageInfoRequest = {
        vehicleId: vehicleInfo?.id || 0,
        userId: matchingEmployee?.value || vehicleInfo?.registrantId || 0,
        userName: matchingEmployee?.name || vehicleInfo?.registrant || '',
        id: id || 0,
        startMileage: startMileage, // 使用原始记录的 startMileage
        endMileage: values.endMileage || undefined,
        usageStatus: values.usageStatus || undefined,
        vehicleImageUrls: selectedImages,
        extend: values.extend,
        recordTime: values.recordTime, // 保存使用日期
      };
      await updateVehicleUsageInfo(payload);
      message.success('车辆使用信息更新成功');
      setEditingKey(null); // 退出编辑模式
      await refreshUsageInfoList(); // 更新数据
    } catch (error) {
      message.error('请检查表单字段');
    }
  };


  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      const matchingEmployee = employeeOptions.find(
        (item) => item.value === values.responsiblePersonId,
      );

      // 获取上一个记录的结束里程数
      const lastUsageRecord = filteredUsageList[0]; // 假设列表已按日期降序排序
      const startMileage = lastUsageRecord
        ? Number(lastUsageRecord.endMileage)
        : Number(vehicleInfo?.currentMileage ?? 0);

      const payload: AddOrUpdateVehicleUsageInfoRequest = {
        vehicleId: vehicleInfo?.id || 0,
        userId: matchingEmployee?.value || initialState?.currentUser.id || 0,
        userName: matchingEmployee?.name ||initialState?.currentUser.name || '',
        startMileage: startMileage, // 使用上一个记录的结束里程数作为开始里程数
        endMileage: values.endMileage || undefined,
        usageStatus: values.usageStatus || undefined,
        vehicleImageUrls: selectedImages,
        extend: values.extend,
        recordTime: values.recordTime, // 保存使用日期
      };
      await addVehicleUsageInfo(payload);
      message.success('车辆使用信息添加成功');
      setIsAdding(false);
      await refreshUsageInfoList(); // 更新数据
    } catch (error) {
      message.error('请检查表单字段');
    }
  };

  const handleDelete = async (record: any) => {
    try {
      await deleteVehicleUsageInfo(record.id);
      message.success('车辆使用信息删除成功');
      setFilteredUsageList(filteredUsageList.filter((item) => item.id !== record.id));
      await refreshUsageInfoList(); // 更新数据
    } catch (error) {
      message.error(error as string);
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
        `${record.startMileage}/${record.endMileage ?? ' - '}`,
    },
    {
      title: '使用情况',
      dataIndex: 'usageStatus',
      key: 'usageStatus',
      render: (status: number) => (
        <Badge
          status={status === 0 || isNull(status) ? 'success' : 'error'}
          text={status === 0 || isNull(status) ? '正常' : '异常'}
        />
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
            {showMore && isAdmin && (
              <>
                <Descriptions.Item label="序号">{vehicleInfo.id}</Descriptions.Item>
                <Descriptions.Item label="警告等级">{vehicleInfo.warningLevel}</Descriptions.Item>
                <Descriptions.Item label="发动机号后6位">
                  {vehicleInfo.engineNumber}
                </Descriptions.Item>
                <Descriptions.Item label="车辆类型">{vehicleInfo.vehicleType}</Descriptions.Item>
                <Descriptions.Item label="车辆型号">
                  {vehicleInfo.vehicleSerialNumber}
                </Descriptions.Item>
                <Descriptions.Item label="车辆品牌">{vehicleInfo.vehicleBrand}</Descriptions.Item>
                <Descriptions.Item label="核定载质量">
                  {vehicleInfo.approvedLoadCapacity}
                </Descriptions.Item>
                <Descriptions.Item label="登记人">{vehicleInfo.registrant}</Descriptions.Item>
                <Descriptions.Item label="购车日期">{vehicleInfo.purchaseDate}</Descriptions.Item>
                <Descriptions.Item label="年检月份">{vehicleInfo.auditMonth}</Descriptions.Item>
                <Descriptions.Item label="是否年检">
                  {vehicleInfo.isAudited ? '是' : '否'}
                </Descriptions.Item>
                <Descriptions.Item label="是否有交强险">
                  {vehicleInfo.trafficInsurance ? '是' : '否'}
                </Descriptions.Item>
                <Descriptions.Item label="是否有商业险">
                  {vehicleInfo.commercialInsurance ? '是' : '否'}
                </Descriptions.Item>
                <Descriptions.Item label="是否安装GPS">
                  {vehicleInfo.gps ? '是' : '否'}
                </Descriptions.Item>
                <Descriptions.Item label="机械邦">{vehicleInfo.mechanicalBond}</Descriptions.Item>
                <Descriptions.Item label="使用项目">{vehicleInfo.usageProject}</Descriptions.Item>
                <Descriptions.Item label="上次保养公里数">
                  {vehicleInfo.lastMaintenanceMileage}
                </Descriptions.Item>
                <Descriptions.Item label="当前公里数">
                  {vehicleInfo.currentMileage}
                </Descriptions.Item>
                <Descriptions.Item label="下次保养公里数">
                  {vehicleInfo.nextMaintenanceMileage}
                </Descriptions.Item>
                <Descriptions.Item label="负责人姓名">
                  {vehicleInfo.responsiblePersonName}
                </Descriptions.Item>
                <Descriptions.Item label="负责人联系电话">
                  {vehicleInfo.responsiblePersonMobile}
                </Descriptions.Item>
                <Descriptions.Item label="其他备注信息">{vehicleInfo.extend}</Descriptions.Item>
                <Descriptions.Item label="是否废弃">
                  {vehicleInfo.isDeprecated ? '是' : '否'}
                </Descriptions.Item>
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
            <Form>
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
            const isLatestRecord = record.id === latestRecordId;
            return (
              <EditableUsageRecord
                record={record}
                isLatestRecord={isLatestRecord}
                isAdmin={isAdmin}
                editingKey={editingKey}
                setEditingKey={setEditingKey}
                handleUpdate={handleUpdate}
                handleDelete={handleDelete}
                handleCancelEdit={handleCancelEdit}
                compareDateWithToday={compareDateWithToday}
                responsibleEmployeeOptions={responsibleEmployeeOptions}
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
              />
            );
          },
          rowExpandable: () => true,
          expandedRowKeys: expandedRowKeys,
          onExpand: (expanded, record) => {
            setExpandedRowKeys((prevKeys) => {
              if (expanded) {
                return [...prevKeys, record.id];
              } else {
                return prevKeys.filter((key) => key !== record.id);
              }
            });
          },
        }}
      />

      {!isAdding && (
        <div>
          <Button
            type="dashed"
            style={{ marginTop: 20 }}
            disabled={isCreateButtonDisabled}
            onClick={() => {
              setIsAdding(true);
              setExpandedRowKeys([]);
              setSelectedImages([]);
              addForm.resetFields();
            }}
          >
            <PlusOutlined /> 新增使用记录
            {isCreateButtonDisabled && (
              <span style={{ marginLeft: 10, color: 'rgba(0, 0, 0, 0.45)' }}>
                请先将第一条记录的结束里程数填写完整
              </span>
            )}
          </Button>
        </div>
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
          <Form layout="vertical" form={addForm} onFinish={handleAdd}>
            <Form.Item
              label="结束里程数"
              name="endMileage"
              rules={[
                () => ({
                  validator(_: any, value: any) {
                    const lastUsageRecord = filteredUsageList[filteredUsageList.length - 1];
                    const startMileage = lastUsageRecord
                      ? Number(lastUsageRecord.endMileage)
                      : Number(vehicleInfo?.currentMileage ?? 0);
                    const endMileage = Number(value);
                    if (!value || startMileage <= endMileage) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        '结束里程数必须大于等于开始里程数，当前开始里程数为 ' +
                        Number(vehicleInfo?.currentMileage ?? 0) +
                        ' 公里',
                      ),
                    );
                  },
                }),
              ]}
            >
              <InputNumber placeholder="请输入结束里程数" />
            </Form.Item>
            {isAdmin && (
              <ProFormSelect
                name="responsiblePersonId"
                label="使用者"
                options={responsibleEmployeeOptions}
                fieldProps={{
                  labelInValue: false, // 只显示label
                }}
                width="200px"
              />
            )}
            {isAdmin && (
              <Form.Item label="使用情况" name="usageStatus">
                <Select placeholder="请选择使用情况">
                  <Option value={0}>正常</Option>
                  <Option value={1}>异常</Option>
                </Select>
              </Form.Item>
            )}
            <Form.Item label="车辆图片" name="vehicleImageUrls">
              <ImageUploader
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                setLoading={setLoading}
              />
            </Form.Item>
            <Form.Item label="备注信息" name="extend">
              <Input.TextArea placeholder="请输入备注信息" />
            </Form.Item>
            <Button type="primary" htmlType="submit">
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

interface EditableUsageRecordProps {
  record: VehicleUsageInfo;
  isLatestRecord: boolean;
  isAdmin: boolean;
  editingKey: number | null;
  setEditingKey: (key: number | null) => void;
  handleUpdate: (id: number, values: any, selectedImages: string[]) => void;
  handleDelete: (record: any) => void;
  handleCancelEdit: () => void;
  compareDateWithToday: (dateStr: string) => boolean;
  responsibleEmployeeOptions: any[];
  selectedImages: string[];
  setSelectedImages: (images: string[]) => void;
}

const EditableUsageRecord: React.FC<EditableUsageRecordProps> = ({
                                                                   record,
                                                                   isLatestRecord,
                                                                   isAdmin,
                                                                   editingKey,
                                                                   setEditingKey,
                                                                   handleUpdate,
                                                                   handleDelete,
                                                                   handleCancelEdit,
                                                                   compareDateWithToday,
                                                                   responsibleEmployeeOptions,
                                                                   selectedImages,
                                                                   setSelectedImages,
                                                                 }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>(
    record.vehicleImageUrls?.map((url: string, index: number) => ({
      uid: index.toString(),
      name: `Image-${index + 1}`,
      status: 'done',
      url: url,
    })) || [],
  );

  const [thisLoading, setLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      startMileage: record.startMileage,
      endMileage: record.endMileage,
      usageStatus: record.usageStatus,
      vehicleImageUrls: record.vehicleImageUrls,
      extend: record.extend,
      recordTime: record.recordTime,
      responsiblePersonId: record.userId,
    });
    setSelectedImages(record.vehicleImageUrls || []);
  }, [form, record, setSelectedImages]);

  const handleUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      setLoading(true);
      const ossStsAccessInfo = await fetchOssStsAccessInfo();
      const imageUrl = await uploadImageToOss(file, ossStsAccessInfo);

      setFileList((prevList) => [
        ...prevList,
        {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: imageUrl,
        },
      ]);

      setSelectedImages((prevImages) => [...prevImages, imageUrl]);
      setLoading(false);

      onSuccess(imageUrl);
    } catch (error) {
      onError(error);
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

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
      }}
    >
      {editingKey === record.id && (isAdmin || !compareDateWithToday(record.recordTime)) ? (
        <Form
          layout="vertical"
          form={form}
          onFinish={(values) => handleUpdate(record.id, values, selectedImages)}
        >
          {isAdmin && (
            <ProFormSelect
              name="responsiblePersonId"
              label="使用者"
              options={responsibleEmployeeOptions}
              width="200px"
              initialValue={{
                value: record.userId,
                label: record.userName,
              }}
            />
          )}
          <Form.Item
            label="结束里程数"
            name="endMileage"
            rules={[
              () => ({
                validator(_: any, value: any) {
                  const startMileage = Number(record.startMileage ?? 0);
                  const endMileage = Number(value);
                  if (!value || startMileage <= endMileage) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      '结束里程数必须大于等于开始里程数，当前开始里程数为 ' + startMileage + ' 公里',
                    ),
                  );
                },
              }),
            ]}
          >
            <InputNumber placeholder="请输入结束里程数" />
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '16px',
            }}
          >
            <Button type="primary" htmlType="submit" loading={thisLoading}>
              保存
            </Button>
            <Button type="default" style={{ marginLeft: '8px' }} onClick={handleCancelEdit}>
              取消
            </Button>
          </div>
        </Form>
      ) : (
        <div>
          <p>
            <strong>开始里程数: </strong>
            {record.startMileage}
          </p>
          <p>
            <strong>结束里程数: </strong>
            {record.endMileage}
          </p>
          <p>
            <strong>使用情况: </strong>
            {record.usageStatus === 0 || isNull(record.endMileage) ? '正常' : '异常'}
          </p>
          <div style={{ marginBottom: '16px' }}>
            <strong>车辆图片: </strong>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '8px',
              }}
            >
              <Image.PreviewGroup>
                {record.vehicleImageUrls &&
                  record.vehicleImageUrls.map((url: string, index: number) => (
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
          <p>
            <strong>备注信息: </strong>
            {record.extend}
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '16px',
            }}
          >
            {isLatestRecord && (
              <>
                <Button
                  type="default"
                  style={{ marginLeft: '8px' }}
                  onClick={() => setEditingKey(null)}
                >
                  收起
                </Button>
                <Button
                  type="default"
                  style={{ marginLeft: '8px' }}
                  onClick={() => handleDelete(record)}
                >
                  删除
                </Button>
              </>
            )}
            <Button type="default" onClick={() => setEditingKey(record.id)}>
              编辑
            </Button>
            {!isLatestRecord && (
              <Button type="default" onClick={() => setEditingKey(null)}>
                收起
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface ImageUploaderProps {
  selectedImages: string[];
  setSelectedImages: (images: string[]) => void;
  setLoading: (loading: boolean) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
                                                       selectedImages,
                                                       setSelectedImages,
                                                       setLoading,
                                                     }) => {
  const [fileList, setFileList] = useState<any[]>(
    selectedImages.map((url: string, index: number) => ({
      uid: index.toString(),
      name: `Image-${index + 1}`,
      status: 'done',
      url: url,
    })) || [],
  );

  const handleUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      setLoading(true);
      const ossStsAccessInfo = await fetchOssStsAccessInfo();
      const imageUrl = await uploadImageToOss(file, ossStsAccessInfo);

      setFileList((prevList) => [
        ...prevList,
        {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: imageUrl,
        },
      ]);

      setSelectedImages((prevImages) => [...prevImages, imageUrl]);
      setLoading(false);

      onSuccess(imageUrl);
    } catch (error) {
      onError(error);
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

  return (
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
  );
};

export default VehicleDrawer;
