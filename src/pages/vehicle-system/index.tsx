import { queryAllEmployeeSimpleInfo } from '@/api/usermanagement';
import { queryVehicleTypes } from '@/api/vihicle-system';
import { useVehicleSystem } from '@/hooks/vehicle-system/Hook.useVehicleSystem';
import type {
  UpdateVehicleInfoRequest,
  VehicleInfo,
} from '@/model/vehicle-management-system';
import VehicleDrawer from '@/pages/vehicle-system/component/drawer';
import { useModel } from '@@/exports';
import { PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProTable, StepsForm,
} from '@ant-design/pro-components';
import { ProFormDatePicker, ProFormDigit } from '@ant-design/pro-form/lib';
import { FormattedMessage, useIntl } from '@umijs/max';
import {
  Button,
  Space,
  Switch,
  message,
  Form,
  Input,
  Row,
  Col,
  Tooltip,
  Modal,
  InputNumber,
  DatePicker,
  Select,
  Divider,
} from 'antd';import _ from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import { DateTime } from 'luxon';
import moment from 'moment';
import {AddVehicleInfoRequest} from "@/model/vehicle-management-system";

const VehicleManagement: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState?.currentUser) {
    return null; // 或者返回一个 loading 状态，或者重定向到登录页面
  }
  const [isAdding, setIsAdding] = useState(false); // 控制新记录的展开
  const [showMore, setShowMore] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [editingKey, setEditingKey] = useState<number | null>(null); // 用于控制是否处于编辑模式
  const [currentCreateStep, setCurrentCreateStep] = useState(0);
  const [currentEditStep, setCurrentEditStep] = useState(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();


  const {
    vehicleList,
    loading,
    createModalOpen,
    editModalOpen,
    exportToCSV,
    drawerVisible,
    currentVehicle,
    usageInfoList,
    handleModalOpen,
    handleAddVehicle,
    handleEditVehicle,
    handleWarningChange,
    isWarning,
    handleDeleteVehicle,
    handleDeprecateVehicle,
    actionRef,
    setSelectedRowKeys,
    fetchVehicleList,
    selectedRowKeys,
    handleRestoreVehicle,
    setCreateModalOpen,
    setEditModalOpen,
    filters,
    setCurrentVehicle
  } = useVehicleSystem(initialState.currentUser?.id || '');

  const intl = useIntl();

  const [queryParams, setQueryParams] = useState({});

  const [employeeOptions, setEmployeeOptions] = useState<
    { label: string; value: number; name: string, mobile: string }[]
  >([]);


  const nameOptions = _.uniqBy(vehicleList.map(item => ({ text: item.responsiblePersonName, value: item.responsiblePersonName })), 'value');
  const registantNameOptions = _.uniqBy(vehicleList.map(item => ({ text: item.registrant, value: item.registrant })), 'value');

  const [vehicleTypeOptions, setVehicleTypeOptions] = useState<{ label: string; value: string }[]>(
    [],
  );

  const [columnsStateMap, setColumnsStateMap] = useState(() => {
    const vehicleInfoTableSettings: any = localStorage.getItem('vehicleInfoTableSettings');
    return JSON.parse(vehicleInfoTableSettings) || {};
  });

  const handleOnChangeColumn = (map: any) => {
    if (JSON.stringify(map) !== JSON.stringify(columnsStateMap)) {
      setColumnsStateMap(map);
      // 手动更新 localStorage
      localStorage.setItem('vehicleInfoTableSettings', JSON.stringify(map));
    }
  };

  useEffect(() => {
    if (editModalOpen && currentVehicle) {
      editForm.setFieldsValue({
        ...currentVehicle,
        purchaseDate: currentVehicle.purchaseDate ? moment(currentVehicle.purchaseDate) : null,
        trafficInsuranceDate: currentVehicle.trafficInsuranceDate
          ? moment(currentVehicle.trafficInsuranceDate)
          : null,
        commercialInsuranceDate: currentVehicle.commercialInsuranceDate
          ? moment(currentVehicle.commercialInsuranceDate)
          : null,
        vehicleTypeSelection: currentVehicle
          ? `${currentVehicle.vehicleType} - ${currentVehicle.vehicleSerialNumber} - ${currentVehicle.vehicleBrand} - ${currentVehicle.approvedLoadCapacity || ''
          }`
          : '',
        responsiblePersonId: currentVehicle.responsiblePersonId,
        driverList: currentVehicle.driverList?.map((driver) => driver.id),
        gps: currentVehicle.gps || 0,
      });
    }
  }, [currentVehicle, editModalOpen]);


  const formatDate = (dateString: string) => {
    // 如果日期字符串长度为10，表示格式为 'yyyy-MM-dd'
    if (dateString.length === 10) {
      return dateString; // 返回原始格式
    }

    // 如果日期字符串是 'YYYY-MM-DD HH:mm:ss' 格式
    if (dateString.length === 19) {
      return DateTime.fromFormat(dateString, "yyyy-MM-dd HH:mm:ss").toFormat("yyyy-MM-dd");
    }

    // 如果日期格式不匹配，返回一个默认值或错误
    return "Invalid date format";
  };

  useEffect(() => {
    // 加载车辆类型信息
    const loadVehicleTypes = async () => {
      try {
        const response = await queryVehicleTypes();
        const options = response.map((type) => ({
          label: `${type.vehicleType} - ${type.vehicleSerialNumber} - ${type.vehicleBrand} - ${type.approvedLoadCapacity || ''
            }`,
          value: JSON.stringify(type), // 将整个对象作为字符串传递
        }));
        setVehicleTypeOptions(options);
      } catch (error) {
        console.error('加载车辆类型失败:', error);
      }
    };
    const loadEmployeeInfo = async () => {
      try {
        const response = await queryAllEmployeeSimpleInfo();
        const options = response.map((employee) => ({
          label: employee.name, // 显示的名字
          value: employee.id, // 实际选择的ID
          name: employee.name, // 保存的名字
          mobile: employee.mobile // 保存电话
        }));
        setEmployeeOptions(options);
      } catch (error) {
        console.error(error);
      }
    };

    loadVehicleTypes();
    loadEmployeeInfo();
  }, []);

  const columns: ProColumns<VehicleInfo>[] = [
    {
      title: <FormattedMessage id="序号" />,
      dataIndex: 'id',
      valueType: 'text',
      fixed: 'left',
      width: '100px',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.id - b.id,
    },
    {
      title: <FormattedMessage id="工程车编号" />,
      dataIndex: 'engineeingVehicleNumber',
      valueType: 'text',
      fixed: 'left',
      width: '120px',
      sorter: (a: VehicleInfo, b: VehicleInfo) =>
        a.engineeingVehicleNumber.localeCompare(b.engineeingVehicleNumber),
    },
    {
      title: <FormattedMessage id="车辆编号" />,
      dataIndex: 'vehicleNumber',
      valueType: 'text',
      fixed: 'left',
      width: '120px',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.vehicleNumber.localeCompare(b.vehicleNumber),
    },
    {
      title: <FormattedMessage id="车牌号码" />,
      dataIndex: 'licenseNumber',
      valueType: 'text',
      width: '120px',
      fixed: 'left',
      sorter: (a: VehicleInfo, b: VehicleInfo) =>
        _.isUndefined(a.licenseNumber) || _.isUndefined(b.licenseNumber)
          ? {}
          : a.licenseNumber.localeCompare(b.licenseNumber),
    },
    {
      title: <FormattedMessage id="发动机号后6位" />,
      dataIndex: 'engineNumber',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.engineNumber.localeCompare(b.engineNumber),
      width: '150px',
    },
    {
      title: <FormattedMessage id="车辆类型" />,
      dataIndex: 'vehicleType',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.vehicleType.localeCompare(b.vehicleType),
      filters: filters.vehicleTypeFilters,
      onFilter: (value, record) => record.vehicleType.includes(value as string),
      width: '120px',
      filterSearch: true,
    },
    {
      title: <FormattedMessage id="车辆型号" />,
      dataIndex: 'vehicleSerialNumber',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) =>
        a.vehicleSerialNumber.localeCompare(b.vehicleSerialNumber),
      width: '120px',
    },
    {
      title: <FormattedMessage id="车辆品牌" />,
      dataIndex: 'vehicleBrand',
      valueType: 'text',
      width: '120px',
    },
    {
      title: <FormattedMessage id="核定载质量(吨)" />,
      dataIndex: 'approvedLoadCapacity',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) =>
        _.isUndefined(a.approvedLoadCapacity) || _.isUndefined(b.approvedLoadCapacity)
          ? {}
          : a.approvedLoadCapacity.localeCompare(b.approvedLoadCapacity),
      width: '150px',
    },
    {
      title: <FormattedMessage id="登记人" />,
      dataIndex: 'registrant',
      valueType: 'text',
      filters: registantNameOptions,
      onFilter: (value, record) => record.registrant === value,
      width: '120px',
      filterSearch: true,
      filterMode: 'menu', // 立即应用模式
    },
    {
      title: <FormattedMessage id="购车日期" />,
      dataIndex: 'purchaseDate',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.purchaseDate.localeCompare(b.purchaseDate),
      width: '120px',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
        const [startDate, endDate] = selectedKeys[0] || [];
        return (
          <div style={{ padding: 8 }}>
            <DatePicker.RangePicker
              value={[
                startDate ? moment(startDate, 'YYYY-MM-DD') : null,
                endDate ? moment(endDate, 'YYYY-MM-DD') : null,
              ]}
              onChange={(dates) => {
                if (dates) {
                  setSelectedKeys([
                    dates.map((date) => date.format('YYYY-MM-DD')),
                  ]);
                } else {
                  setSelectedKeys([]);
                }
              }}
              style={{ marginBottom: 8, display: 'block' }}
              format="YYYY-MM-DD"
            />
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
                style={{ width: 90 }}
              >
                筛选
              </Button>
              <Button
                onClick={() => {
                  if (clearFilters) {
                    clearFilters();
                  }
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                重置
              </Button>
            </Space>
          </div>
        );
      },
      onFilter: (value, record) => {
        if (!value || value.length === 0) return true;
        const [start, end] = value;

        const recordDate = DateTime.fromISO(record.purchaseDate);
        const startDate = DateTime.fromFormat(start, 'yyyy-MM-dd').startOf('day');
        const endDate = DateTime.fromFormat(end, 'yyyy-MM-dd').endOf('day');

        if (!recordDate.isValid || !startDate.isValid || !endDate.isValid) {
          return false;
        }

        // 比较日期范围，忽略时间部分
        return recordDate >= startDate && recordDate <= endDate;
      },
    },
    {
      title: <FormattedMessage id="年检月份" />,
      dataIndex: 'auditMonth',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.auditMonth.localeCompare(b.auditMonth),
      width: '120px',
    },
    {
      title: <FormattedMessage id="是否年检" />,
      dataIndex: 'isAudited',
      valueType: 'text',
      render: (value: number) => (value === 1 ? '是' : '否'),
      filters: filters.isAuditedFilters,
      onFilter: (value, record) => record.isAudited === value,
      width: '120px',
      filterSearch: true,
    },
    {
      title: <FormattedMessage id="是否有交强险" />,
      dataIndex: 'trafficInsurance',
      valueType: 'text',
      render: (value: number) => (value === 1 ? '是' : '否'),
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.trafficInsurance - b.trafficInsurance,
      width: '120px',
    },
    {
      title: <FormattedMessage id="交强险日期" />,
      dataIndex: 'trafficInsuranceDate',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.trafficInsurance.localeCompare(b.trafficInsuranceDate),
      width: '150px',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
        const [startDate, endDate] = selectedKeys[0] || [];
        return (
          <div style={{ padding: 8 }}>
            <DatePicker.RangePicker
              value={[
                startDate ? moment(startDate, 'YYYY-MM-DD') : null,
                endDate ? moment(endDate, 'YYYY-MM-DD') : null,
              ]}
              onChange={(dates) => {
                if (dates) {
                  setSelectedKeys([
                    dates.map((date) => date.format('YYYY-MM-DD')),
                  ]);
                } else {
                  setSelectedKeys([]);
                }
              }}
              style={{ marginBottom: 8, display: 'block' }}
              format="YYYY-MM-DD"
            />
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
                style={{ width: 90 }}
              >
                筛选
              </Button>
              <Button
                onClick={() => {
                  if (clearFilters) {
                    clearFilters();
                  }
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                重置
              </Button>
            </Space>
          </div>
        );
      },
      onFilter: (value, record) => {
        if (!value || value.length === 0) return true;
        const [start, end] = value;

        const recordDate = DateTime.fromISO(record.trafficInsuranceDate);
        const startDate = DateTime.fromFormat(start, 'yyyy-MM-dd').startOf('day');
        const endDate = DateTime.fromFormat(end, 'yyyy-MM-dd').endOf('day');

        if (!recordDate.isValid || !startDate.isValid || !endDate.isValid) {
          return false;
        }

        // 比较日期范围，忽略时间部分
        return recordDate >= startDate && recordDate <= endDate;
      },
    },
    {
      title: <FormattedMessage id="是否有商业险" />,
      dataIndex: 'commercialInsurance',
      valueType: 'text',
      render: (value: number) => (value === 1 ? '是' : '否'),
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.commercialInsurance - b.commercialInsurance,
      width: '120px',
    },
    {
      title: <FormattedMessage id="商业险日期" />,
      dataIndex: 'commercialInsuranceDate',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.commercialInsuranceDate.localeCompare(b.commercialInsuranceDate),
      width: '150px',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
        const [startDate, endDate] = selectedKeys[0] || [];
        return (
          <div style={{ padding: 8 }}>
            <DatePicker.RangePicker
              value={[
                startDate ? moment(startDate, 'YYYY-MM-DD') : null,
                endDate ? moment(endDate, 'YYYY-MM-DD') : null,
              ]}
              onChange={(dates) => {
                if (dates) {
                  setSelectedKeys([
                    dates.map((date) => date.format('YYYY-MM-DD')),
                  ]);
                } else {
                  setSelectedKeys([]);
                }
              }}
              style={{ marginBottom: 8, display: 'block' }}
              format="YYYY-MM-DD"
            />
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
                style={{ width: 90 }}
              >
                筛选
              </Button>
              <Button
                onClick={() => {
                  if (clearFilters) {
                    clearFilters();
                  }
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                重置
              </Button>
            </Space>
          </div>
        );
      },
      onFilter: (value, record) => {
        if (!value || value.length === 0) return true;
        const [start, end] = value;
        const recordDate = DateTime.fromISO(record.commercialInsuranceDate);
        const startDate = DateTime.fromFormat(start, 'yyyy-MM-dd').startOf('day');
        const endDate = DateTime.fromFormat(end, 'yyyy-MM-dd').endOf('day');

        if (!recordDate.isValid || !startDate.isValid || !endDate.isValid) {
          return false;
        }

        // 比较日期范围，忽略时间部分
        return recordDate >= startDate && recordDate <= endDate;
      },
    },
    {
      title: <FormattedMessage id="是否安装GPS" />,
      dataIndex: 'gps',
      valueType: 'text',
      render: (value: number) => (value === 1 ? '是' : '否'),
      filters: filters.gpsFilters,
      onFilter: (value, record) => record.gps === value,
      width: '150px',
      filterSearch: true,
    },
    {
      title: <FormattedMessage id="机械邦" />,
      dataIndex: 'mechanicalBond',
      valueType: 'text',
      filters: filters.mechanicalBondFilters,
      onFilter: (value, record) => record.mechanicalBond.includes(value as string),
      width: '120px',
    },
    {
      title: <FormattedMessage id="使用项目" />,
      dataIndex: 'usageProject',
      valueType: 'text',
      width: '120px',
    },
    {
      title: <FormattedMessage id="上次保养公里数" />,
      dataIndex: 'lastMaintenanceMileage',
      valueType: 'text',
      width: '150px',
      sorter: (a, b) => Number(a.lastMaintenanceMileage) - Number(b.lastMaintenanceMileage),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Row gutter={8}>
            <Col span={12}>
              <InputNumber
                placeholder="最小值"
                value={selectedKeys[0]?.min}
                onChange={(value) => {
                  setSelectedKeys([{ ...selectedKeys[0], min: value }]);
                }}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <InputNumber
                placeholder="最大值"
                value={selectedKeys[0]?.max}
                onChange={(value) => {
                  setSelectedKeys([{ ...selectedKeys[0], max: value }]);
                }}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
                style={{ width: 90 }}
              >
                筛选
              </Button>
              <Button
                onClick={() => {
                  clearFilters();
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                重置
              </Button>
            </Space>
          </div>
        </div>
      ),
      onFilter: (value, record) => {
        const min = Number(value.min);
        const max = Number(value.max);
        const mileage = Number(record.lastMaintenanceMileage) || 0;
        if (!isNaN(min) && !isNaN(max)) {
          return mileage >= min && mileage <= max;
        } else if (!isNaN(min)) {
          return mileage >= min;
        } else if (!isNaN(max)) {
          return mileage <= max;
        }
        return true;
      },
    },
    {
      title: <FormattedMessage id="当前公里数" />,
      dataIndex: 'currentMileage',
      valueType: 'text',
      sorter: (a, b) => Number(a.currentMileage) - Number(b.currentMileage),
      width: '150px',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Row gutter={8}>
            <Col span={12}>
              <InputNumber
                placeholder="最小值"
                value={selectedKeys[0]?.min}
                onChange={(value) => {
                  setSelectedKeys([{ ...selectedKeys[0], min: value }]);
                }}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <InputNumber
                placeholder="最大值"
                value={selectedKeys[0]?.max}
                onChange={(value) => {
                  setSelectedKeys([{ ...selectedKeys[0], max: value }]);
                }}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
                style={{ width: 90 }}
              >
                筛选
              </Button>
              <Button
                onClick={() => {
                  clearFilters();
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                重置
              </Button>
            </Space>
          </div>
        </div>
      ),
      onFilter: (value, record) => {
        const min = Number(value.min);
        const max = Number(value.max);
        const mileage = Number(record.currentMileage) || 0;
        if (!isNaN(min) && !isNaN(max)) {
          return mileage >= min && mileage <= max;
        } else if (!isNaN(min)) {
          return mileage >= min;
        } else if (!isNaN(max)) {
          return mileage <= max;
        }
        return true;
      },
    },
    {
      title: <FormattedMessage id="下次保养公里数" />,
      dataIndex: 'nextMaintenanceMileage',
      valueType: 'text',
      sorter: (a, b) => Number(a.nextMaintenanceMileage) - Number(b.nextMaintenanceMileage),
      width: '150px',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Row gutter={8}>
            <Col span={12}>
              <InputNumber
                placeholder="最小值"
                value={selectedKeys[0]?.min}
                onChange={(value) => {
                  setSelectedKeys([{ ...selectedKeys[0], min: value }]);
                }}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <InputNumber
                placeholder="最大值"
                value={selectedKeys[0]?.max}
                onChange={(value) => {
                  setSelectedKeys([{ ...selectedKeys[0], max: value }]);
                }}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
                style={{ width: 90 }}
              >
                筛选
              </Button>
              <Button
                onClick={() => {
                  clearFilters();
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                重置
              </Button>VehicleDrawer
            </Space>
          </div>
        </div>
      ),
      onFilter: (value, record) => {
        const min = Number(value.min);
        const max = Number(value.max);
        const mileage = Number(record.nextMaintenanceMileage) || 0;
        if (!isNaN(min) && !isNaN(max)) {
          return mileage >= min && mileage <= max;
        } else if (!isNaN(min)) {
          return mileage >= min;
        } else if (!isNaN(max)) {
          return mileage <= max;
        }
        return true;
      },
    },
    {
      title: <FormattedMessage id="负责人姓名" />,
      dataIndex: 'responsiblePersonName',
      valueType: 'text',
      width: '120px',
      filters: nameOptions,
      onFilter: (value, record) => record.responsiblePersonName === value,
      filterSearch: true,
      filterMode: 'menu', // 立即应用模式
    },
    {
      title: <FormattedMessage id="负责人联系电话" />,
      dataIndex: 'responsiblePersonMobile',
      valueType: 'text',
      width: '120px',
    },
    {
      title: <FormattedMessage id="司机" />,
      dataIndex: 'driverList',
      valueType: 'text',
      width: '120px',
      render: (value) => {
        if (!Array.isArray(value) || _.isEmpty(value)) {
          return '';
        }
        return value.map(driver => driver.name).join(', ') || '-';
      },
    },
    {
      title: <FormattedMessage id="其他备注信息" />,
      dataIndex: 'extend',
      valueType: 'text',
      width: '120px',
    },
    {
      title: <FormattedMessage id="是否废弃" />,
      dataIndex: 'isDeprecated',
      valueType: 'text',
      render: (value: number) => (value === 1 ? '是' : '否'),
      width: '120px',
    },
    {
      title: <FormattedMessage id="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <a onClick={() => {
            handleModalOpen('drawerVisible', true, record);
            setExpandedRowKeys([]);
            setIsAdding(false);
            setShowMore(false);
            // setEditingKey([]);
            form.resetFields();
          }}>详情</a>
          <a onClick={() => handleModalOpen('editModalOpen', true, record)}>编辑</a>
          {(initialState.currentUser?.role > 1 && record.isDeprecated) ? (
            <a onClick={() => handleDeleteVehicle(record.id)}>删除</a>
          ) : <></>}
          {record.isDeprecated ? (
            <a onClick={() => handleRestoreVehicle(record.id)}>恢复</a>
          ) : (
            <a onClick={() => handleDeprecateVehicle(record.id)}>作废</a>
          )}
        </Space>
      ),
    },
  ];

  const memoizedColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      onCell: (record) => {
        let backgroundColor = '';

        if (isWarning && record.warningLevel >= 3) {
          backgroundColor = '#ffcccc';
        } else if (record.isDeprecated) {
          backgroundColor = '#cccccc'; // 灰色
        }

        return {
          style: {
            backgroundColor,
          },
        };
      },
    }));
  }, [columns, isWarning]);


  const handleBatchExport = () => {
    const selectedData = vehicleList.filter((item) =>
      selectedRowKeys.includes(item.id),
    );
    if (selectedData.length > 0) {
      exportToCSV(
        selectedData,
        '车辆信息导出',
        columns,
        columnsStateMap, // 传入 columnsStateMap
      );
    } else {
      message.warning('请先选择要导出的车辆信息');
    }
  };
  return (
    <PageContainer breadcrumbRender={false}>
      <Form
        layout="vertical"  // 设置表单为垂直布局
        onValuesChange={(changedValues) => {
          const { generalQueryCondition, project, name } = changedValues;
          fetchVehicleList(isWarning, generalQueryCondition, project, name);
        }}
        style={{ marginBottom: 16 }}  // 调整表单的下边距，确保与表格有足够的间距
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="查询" name="generalQueryCondition">
              <Input placeholder="这里可以输入序号、工程车编号、车牌号码等内容" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="项目筛选" name="project">
              <Input placeholder="这里输入项目的名称" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="负责人姓名筛选" name="name">
              <Input placeholder="这里输入姓名" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <ProTable<VehicleInfo, API.PageParams>
        headerTitle={
          <div>
            {intl.formatMessage({ id: '车辆管理', defaultMessage: '车辆管理' })}
            <Tooltip title={intl.formatMessage({ id: '点击打开预警', defaultMessage: '点击显示警报中车辆' })}>
              <Switch
                style={{ marginLeft: 16 }}
                checkedChildren="预警开"
                unCheckedChildren="预警关"
                onChange={handleWarningChange}
                checked={isWarning}
              />
            </Tooltip>
            {selectedRowKeys.length > 0 && (
              <Button onClick={handleBatchExport} style={{ marginLeft: 16 }}>
                批量导出
              </Button>
            )}
            {/*{selectedRowKeys.length > 0 && (*/}
            {/*  <Button onClick={handleBatchDelete} style={{ marginLeft: 16 }}>*/}
            {/*    批量删除*/}
            {/*  </Button>*/}
            {/*)}*/}
          </div>
        }
        columnsState={{
          value: columnsStateMap,
          onChange: (map) => handleOnChangeColumn(map),
        }}
        scroll={{ x: 3000 }}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        cardBordered
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys as number[]),
          preserveSelectedRowKeys: true,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => handleModalOpen('createModalOpen', true)}
          >
            <PlusOutlined /> <FormattedMessage id="新增车辆信息" defaultMessage="新增车辆信息" />
          </Button>,
        ]}
        loading={loading}
        dataSource={vehicleList}
        columns={memoizedColumns}
      />

      {/* Drawer 和 Modals */}
      <VehicleDrawer
        visible={drawerVisible}
        onClose={() => handleModalOpen('drawerVisible', false)}
        vehicleInfo={currentVehicle!}
        usageInfoList={usageInfoList}
        loading={loading}
        isAdding={isAdding}
        setIsAdding={setIsAdding}
        expandedRowKeys={expandedRowKeys}
        setExpandedRowKeys={setExpandedRowKeys}
        editingKey={editingKey}
        setEditingKey={setEditingKey}
        showMore={showMore}
        setShowMore={setShowMore}
        form={form}
        employeeOptions={employeeOptions}
        setVehicleInfo={setCurrentVehicle}
        fetchVehicleList={fetchVehicleList}
      />

      {/* 新增车辆 Modal */}
      <Modal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={() => createForm.submit()}
        title={intl.formatMessage({
          id: '新增车辆信息',
        })}
        destroyOnClose
        width={800}
      >
        <Form
          form={createForm}
          onFinish={async (values) => {
            const selectedEmployee = employeeOptions.find(
              (emp) => emp.value === values.responsiblePersonId,
            );

            const selectedDrivers = (values.driverList || []).map((id) => {
              const selectedEmployee = employeeOptions.find((emp) => emp.value === id);
              return {
                id: selectedEmployee?.value || 0,
                name: selectedEmployee?.name || 'Unknown',
              };
            });
            const selectedType = JSON.parse(values.vehicleTypeSelection);
            const data = {
              ...values,
              driverList: selectedDrivers,
              purchaseDate: formatDate(values.purchaseDate.format('YYYY-MM-DD')),
              trafficInsuranceDate: formatDate(values.trafficInsuranceDate.format('YYYY-MM-DD')),
              commercialInsuranceDate: formatDate(
                values.commercialInsuranceDate.format('YYYY-MM-DD'),
              ),
              vehicleType: selectedType.vehicleType,
              vehicleSerialNumber: selectedType.vehicleSerialNumber,
              vehicleBrand: selectedType.vehicleBrand,
              approvedLoadCapacity: selectedType.approvedLoadCapacity,
              responsiblePersonName: selectedEmployee?.name || '',
              responsiblePersonId: selectedEmployee?.value || 0,
              responsiblePersonMobile: selectedEmployee?.mobile || '',
              registrantId: initialState.currentUser?.id || 0,
              registrant: initialState.currentUser?.name || '',
              nextMaintenanceMileage:
                Number(values.lastMaintenanceMileage) + Number(selectedType.maintenanceInterval),
            };
            await handleAddVehicle(data as AddVehicleInfoRequest);
            setCreateModalOpen(false); // 关闭模态框
            createForm.resetFields(); // 重置表单
          }}
          initialValues={{
            gps: 0,
          }}
          layout="vertical"
        >
          <Divider>车辆基本信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vehicleNumber"
                label="车辆编号"
                rules={[{ required: true, message: '请输入车辆编号' }]}
              >
                <Input placeholder="请输入车辆编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="engineeingVehicleNumber"
                label="工程车编号"
                rules={[{ required: true, message: '请输入工程车编号' }]}
              >
                <Input placeholder="请输入工程车编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="licenseNumber"
                label="车牌号码"
                rules={[{ required: true, message: '请输入车牌号码' }]}
              >
                <Input placeholder="请输入车牌号码" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>维护信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="engineNumber"
                label="发动机号后6位"
                rules={[{ required: true, message: '请输入发动机号后6位' }]}
              >
                <Input placeholder="请输入发动机号后6位" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vehicleTypeSelection"
                label="车辆类型选择"
                rules={[{ required: true, message: '请选择车辆类型' }]}
              >
                <Select
                  options={vehicleTypeOptions}
                  placeholder="请选择车辆类型"
                  showSearch
                  filterOption={(input, option) =>
                    option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="purchaseDate"
                label="购车日期"
                rules={[{ required: true, message: '请选择购车日期' }]}
              >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} placeholder="请选择购车日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="auditMonth"
                label="年检月份"
                rules={[{ required: true, message: '请输入年检月份' }]}
              >
                <Input placeholder="请输入年检月份" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isAudited"
                label="是否年检"
                rules={[{ required: true, message: '请选择是否年检' }]}
              >
                <Select options={[{ label: '是', value: 1 }, { label: '否', value: 0 }]} placeholder="请选择" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>保险与其他信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="trafficInsuranceDate"
                label="交强险日期"
                rules={[{ required: true, message: '请输入交强险日期' }]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  placeholder="请输入交强险日期"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="commercialInsuranceDate"
                label="商业险日期"
                rules={[{ required: true, message: '请输入商业险日期' }]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  placeholder="请输入商业险日期"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gps" label="是否安装GPS">
                <Select options={[{ label: '是', value: 1 }, { label: '否', value: 0 }]} placeholder="请选择" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mechanicalBond"
                label="机械邦"
                rules={[{ required: true, message: '请输入机械邦信息' }]}
              >
                <Input placeholder="请输入机械邦信息" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>使用与管理信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="usageProject"
                label="使用项目"
                rules={[{ required: true, message: '请输入使用项目' }]}
              >
                <Input placeholder="请输入使用项目" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastMaintenanceMileage" label="上次保养公里数">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入上次保养公里数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currentMileage" label="当前公里数">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入当前公里数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="responsiblePersonId"
                label="负责人"
                rules={[{ required: true, message: '请选择负责人' }]}
              >
                <Select
                  options={employeeOptions}
                  placeholder="请选择负责人"
                  showSearch
                  filterOption={(input, option) =>
                    option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="driverList" label="司机">
                <Select
                  mode="multiple"
                  options={employeeOptions}
                  placeholder="请选择司机"
                  showSearch
                  filterOption={(input, option) =>
                    option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 编辑车辆 Modal */}
      <Modal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => editForm.submit()}
        title={intl.formatMessage({
          id: '编辑车辆信息',
        })}
        destroyOnClose
        width={800}
      >
        <Form
          form={editForm}
          onFinish={async (values) => {
            const selectedEmployee = employeeOptions.find(
              (emp) => emp.value === values.responsiblePersonId,
            );

            const selectedDrivers = (values.driverList || []).map((id: number) => {
              const employee = employeeOptions.find((emp) => emp.value === id);
              return {
                id: employee?.value || 0,
                name: employee?.name || 'Unknown',
              };
            });

            let selectedType;

            try {
              selectedType = JSON.parse(values.vehicleTypeSelection);
            } catch (error) {
              selectedType = {
                vehicleType: currentVehicle?.vehicleType || '',
                vehicleSerialNumber: currentVehicle?.vehicleSerialNumber || '',
                vehicleBrand: currentVehicle?.vehicleBrand || '',
                approvedLoadCapacity: currentVehicle?.approvedLoadCapacity || '',
              };
            }

            const data: UpdateVehicleInfoRequest = {
              ...values,
              driverList: selectedDrivers,
              purchaseDate: formatDate(values.purchaseDate.format('YYYY-MM-DD')),
              trafficInsuranceDate: formatDate(values.trafficInsuranceDate.format('YYYY-MM-DD')),
              commercialInsuranceDate: formatDate(
                values.commercialInsuranceDate.format('YYYY-MM-DD'),
              ),
              vehicleType: selectedType.vehicleType,
              vehicleSerialNumber: selectedType.vehicleSerialNumber,
              vehicleBrand: selectedType.vehicleBrand,
              approvedLoadCapacity: selectedType.approvedLoadCapacity,
              responsiblePersonName: selectedEmployee?.name || '',
              responsiblePersonId: selectedEmployee?.value || 0,
              responsiblePersonMobile: selectedEmployee?.mobile || '',
              registrantId: initialState.currentUser?.id || 0,
              registrant: initialState.currentUser?.name || '',
              id: currentVehicle?.id || 0, // 更新时需要车辆 ID
              nextMaintenanceMileage:
                Number(values.lastMaintenanceMileage) + Number(selectedType.maintenanceInterval),
            };
            await handleEditVehicle(data);
            setEditModalOpen(false); // 关闭模态框
            editForm.resetFields(); // 重置表单
          }}
          layout="vertical"
        >
          <Divider>车辆基本信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vehicleNumber"
                label="车辆编号"
                rules={[{ required: true, message: '请输入车辆编号' }]}
              >
                <Input placeholder="请输入车辆编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="engineeingVehicleNumber"
                label="工程车编号"
                rules={[{ required: true, message: '请输入工程车编号' }]}
              >
                <Input placeholder="请输入工程车编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="licenseNumber"
                label="车牌号码"
                rules={[{ required: true, message: '请输入车牌号码' }]}
              >
                <Input placeholder="请输入车牌号码" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>维护信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="engineNumber"
                label="发动机号后6位"
                rules={[{ required: true, message: '请输入发动机号后6位' }]}
              >
                <Input placeholder="请输入发动机号后6位" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vehicleTypeSelection"
                label="车辆类型选择"
                rules={[{ required: true, message: '请选择车辆类型' }]}
              >
                <Select
                  options={vehicleTypeOptions}
                  placeholder="请选择车辆类型"
                  showSearch
                  filterOption={(input, option) =>
                    option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="purchaseDate"
                label="购车日期"
                rules={[{ required: true, message: '请选择购车日期' }]}
              >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} placeholder="请选择购车日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="auditMonth"
                label="年检月份"
                rules={[{ required: true, message: '请输入年检月份' }]}
              >
                <Input placeholder="请输入年检月份" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isAudited"
                label="是否年检"
                rules={[{ required: true, message: '请选择是否年检' }]}
              >
                <Select options={[{ label: '是', value: 1 }, { label: '否', value: 0 }]} placeholder="请选择" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>保险与其他信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="trafficInsuranceDate"
                label="交强险日期"
                rules={[{ required: true, message: '请输入交强险日期' }]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  placeholder="请输入交强险日期"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="commercialInsuranceDate"
                label="商业险日期"
                rules={[{ required: true, message: '请输入商业险日期' }]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  placeholder="请输入商业险日期"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gps" label="是否安装GPS">
                <Select options={[{ label: '是', value: 1 }, { label: '否', value: 0 }]} placeholder="请选择" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mechanicalBond"
                label="机械邦"
                rules={[{ required: true, message: '请输入机械邦信息' }]}
              >
                <Input placeholder="请输入机械邦信息" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>使用与管理信息</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="usageProject"
                label="使用项目"
                rules={[{ required: true, message: '请输入使用项目' }]}
              >
                <Input placeholder="请输入使用项目" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastMaintenanceMileage" label="上次保养公里数">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入上次保养公里数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currentMileage" label="当前公里数">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入当前公里数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="responsiblePersonId"
                label="负责人"
                rules={[{ required: true, message: '请选择负责人' }]}
              >
                <Select
                  options={employeeOptions}
                  placeholder="请选择负责人"
                  showSearch
                  filterOption={(input, option) =>
                    option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="driverList" label="司机">
                <Select
                  mode="multiple"
                  options={employeeOptions}
                  placeholder="请选择司机"
                  showSearch
                  filterOption={(input, option) =>
                    option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default VehicleManagement;
