import { queryAllEmployeeSimpleInfo } from '@/api/usermanagement';
import { queryVehicleTypes } from '@/api/vihicle-system';
import { useVehicleSystem } from '@/hooks/vehicle-system/Hook.useVehicleSystem';
import type {
  AddVehicleInfoRequest,
  UpdateVehicleInfoRequest,
  VehicleInfo,
} from '@/model/vehicle-management-system';
import VehicleDrawer from '@/pages/vehicle-system/component/drawer';
import { useModel } from '@@/exports';
import { PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import {ProFormDatePicker, ProFormDigit, ProFormGroup} from '@ant-design/pro-form/lib';
import { FormattedMessage, useIntl } from '@umijs/max';
import {Button, Space, Switch, message, Form, Input, Row, Col, Tooltip} from 'antd';
import _ from 'lodash';
import React, {useEffect, useRef, useState} from 'react';
import { DateTime } from 'luxon';
import {css} from "antd-style";
const VehicleManagement: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState?.currentUser) {
    return null; // 或者返回一个 loading 状态，或者重定向到登录页面
  }
  const [isAdding, setIsAdding] = useState(false); // 控制新记录的展开
  const [showMore, setShowMore] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [editingKey, setEditingKey] = useState<number | null>(null); // 用于控制是否处于编辑模式
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [form] = Form.useForm();

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
    handleBatchDelete,
    setSelectedRowKeys,
    fetchVehicleList,
    selectedRowKeys,
    handleRestoreVehicle,
    filters,
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

  // 处理表单输入变化
  const handleFormChange = (changedValues: any) => {
    const newQueryParams = { ...queryParams, ...changedValues };
    setQueryParams(newQueryParams);

    actionRef.current?.reload();
  };

  useEffect(() => {
    // 加载车辆类型信息
    const loadVehicleTypes = async () => {
      try {
        const response = await queryVehicleTypes();
        const options = response.map((type) => ({
          label: `${type.vehicleType} - ${type.vehicleSerialNumber} - ${type.vehicleBrand} - ${
            type.approvedLoadCapacity || ''
          }`,
          value: JSON.stringify(type), // 将整个对象作为字符串传递
        }));
        setVehicleTypeOptions(options);
      } catch (error) {
        console.error('加载车辆类型失败:', error);
      }
    };

    loadVehicleTypes();
  }, []);

  useEffect(() => {
    // 加载员工信息
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
      title: <FormattedMessage id="核定载质量" />,
      dataIndex: 'approvedLoadCapacity',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) =>
        _.isUndefined(a.approvedLoadCapacity) || _.isUndefined(b.approvedLoadCapacity)
          ? {}
          : a.approvedLoadCapacity.localeCompare(b.approvedLoadCapacity),
      width: '120px',
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
      title: <FormattedMessage id="是否有商业险" />,
      dataIndex: 'commercialInsurance',
      valueType: 'text',
      render: (value: number) => (value === 1 ? '是' : '否'),
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.commercialInsurance - b.commercialInsurance,
      width: '120px',
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
      width: '120px',
    },
    {
      title: <FormattedMessage id="当前公里数" />,
      dataIndex: 'currentMileage',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) =>
        _.isUndefined(a.currentMileage) || _.isUndefined(b.currentMileage)
          ? {}
          : a.currentMileage - b.currentMileage,
      width: '120px',
    },
    {
      title: <FormattedMessage id="下次保养公里数" />,
      dataIndex: 'nextMaintenanceMileage',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) =>
        _.isUndefined(a.nextMaintenanceMileage) || _.isUndefined(b.nextMaintenanceMileage)
          ? {}
          : a.nextMaintenanceMileage - b.nextMaintenanceMileage,
      width: '150px',
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

  const handleBatchExport = () => {
    const selectedData = vehicleList.filter((item) => selectedRowKeys.includes(item.id));
    if (selectedData.length > 0) {
      exportToCSV(selectedData, '车辆信息导出', columns); // 传递 columns 作为参数
    } else {
      message.warning('请先选择要导出的车辆信息');
    }
  };

  console.log(selectedRowKeys);

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
        scroll={{ x: 3000 }}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        cardBordered
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys as number[]),
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
        columns={columns.map((col) => ({
          ...col,
          onCell: (record) => {
            // 这里你可以添加多个条件
            let backgroundColor = '';

            // 如果 warningLevel >= 3 并且 isWarning 为 true，背景设置为红色
            if (isWarning && record.warningLevel >= 3) {
              backgroundColor = '#ffcccc';
            }

            // 如果满足其他条件，背景设置为灰色
            else if (record.isDeprecated) {
              backgroundColor = '#cccccc'; // 灰色
            }

            return {
              style: {
                backgroundColor,
              },
            };
          },
        }))}
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
        refreshCurrentInfo={() => fetchVehicleList(isWarning)}
      />

      {/* 新增车辆 Modal */}
      <ModalForm
        title="新加入车辆"
        modalProps={{
          destroyOnClose: true
        }}
        width="750px"
        open={createModalOpen}
        onOpenChange={(isOpen) => handleModalOpen('createModalOpen', isOpen)}
        onFinish={async (values) => {
          const selectedEmployee = employeeOptions.find(
            (emp) => emp.value === values.responsiblePersonId,
          );
          const selectedType = JSON.parse(values.vehicleTypeSelection);
          console.log(selectedType);
          const data: AddVehicleInfoRequest = {
            ...values,
            purchaseDate: DateTime.fromFormat(values.purchaseDate, "yyyy-MM-dd HH:mm:ss").toFormat("yyyy-MM-dd"),
            vehicleType: selectedType.vehicleType,
            vehicleSerialNumber: selectedType.vehicleSerialNumber,
            vehicleBrand: selectedType.vehicleBrand,
            approvedLoadCapacity: selectedType.approvedLoadCapacity,
            responsiblePersonName: selectedEmployee?.name || '',
            responsiblePersonId: selectedEmployee?.value || 0,
            responsiblePersonMobile: selectedEmployee?.mobile || '',
            registrantId: initialState.currentUser?.id || 0,
            registrant: initialState.currentUser?.name || '',
          };
          await handleAddVehicle(data);
        }}
      >
        <ProFormGroup>
          <ProFormText
            name="vehicleNumber"
            label="车辆编号"
            rules={[{ required: true, message: '请输入车辆编号' }]}
            width="200px"
          />
          <ProFormText
            name="engineeingVehicleNumber"
            label="工程车编号"
            rules={[{ required: true, message: '请输入工程车编号' }]}
            width="200px"
          />
          <ProFormText
            name="licenseNumber"
            label="车牌号码"
            rules={[{ required: true, message: '请输入车牌号码' }]}
            width="200px"
          />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormText
            name="engineNumber"
            label="发动机号后6位"
            rules={[{ required: true, message: '请输入发动机号后6位' }]}
            width="200px"
          />
          <ProFormSelect
            name="vehicleTypeSelection"
            label="车辆类型选择"
            options={vehicleTypeOptions}
            rules={[{ required: true, message: '请选择车辆类型' }]}
            width="200px"
            fieldProps={{
              dropdownMatchSelectWidth: false, // 只显示label
            }}
          />
          <ProFormDatePicker
            name="purchaseDate"
            label="购车日期"
            rules={[{ required: true, message: '请选择购车日期' }]}
            width="200px"
          />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormText
            name="auditMonth"
            label="年检月份"
            rules={[{ required: true, message: '请输入年检月份' }]}
            width="200px"
          />
          <ProFormSelect
            name="isAudited"
            label="是否年检"
            options={[
              { label: '是', value: 1 },
              { label: '否', value: 0 },
            ]}
            rules={[{ required: true, message: '请输入是否年检' }]}
            width="200px"
          />
          <ProFormSelect
            name="trafficInsurance"
            label="是否有交强险"
            options={[
              { label: '是', value: 1 },
              { label: '否', value: 0 },
            ]}
            rules={[{ required: true, message: '请输入是否有交强险' }]}
            width="200px"
          />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormSelect
            name="commercialInsurance"
            label="是否有商业险"
            options={[
              { label: '是', value: 1 },
              { label: '否', value: 0 },
            ]}
            rules={[{ required: true, message: '请输入是否有商业险' }]}
            width="200px"
          />
          <ProFormSelect
            name="gps"
            label="是否安装GPS"
            options={[
              { label: '是', value: 1 },
              { label: '否', value: 0 },
            ]}
            width="200px"
          />
          <ProFormText
            name="mechanicalBond"
            label="机械邦"
            rules={[{ required: true, message: '请输入机械邦信息' }]}
            width="200px"
          />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormText
            name="usageProject"
            label="使用项目"
            rules={[{ required: true, message: '请输入使用项目' }]}
            width="200px"
          />
          <ProFormDigit name="lastMaintenanceMileage" label="上次保养公里数" min={0} width="200px"/>
          <ProFormDigit name="currentMileage" label="当前公里数" min={0} width="200px" />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormDigit name="nextMaintenanceMileage" label="下次保养公里数" min={0} width="200px" />
          <ProFormSelect
            name="responsiblePersonId"
            label="负责人"
            options={employeeOptions}
            fieldProps={{
              labelInValue: false, // 只显示label
            }}
            rules={[{ required: true, message: '请选择负责人' }]}
            width="200px"
          />
        </ProFormGroup>
      </ModalForm>

      {/* 编辑车辆信息 Modal */}
      <ModalForm
        title="编辑车辆信息"
        width="750px"
        modalProps={{
          destroyOnClose: true
        }}
        open={editModalOpen}
        key={currentVehicle?.id || 'new'}  // 使用 key 来强制重新渲染
        initialValues={{
          ...currentVehicle,
          vehicleTypeSelection: `${!(currentVehicle) || currentVehicle.vehicleType || ''} - ${!(currentVehicle) || currentVehicle.vehicleSerialNumber || ''} - ${!(currentVehicle) || currentVehicle.vehicleBrand || ''} - ${
            !(currentVehicle) || currentVehicle.approvedLoadCapacity || ''}`, // 设置默认值
        }}
        onOpenChange={(isOpen) => handleModalOpen('editModalOpen', isOpen)}
        onFinish={async (values) => {
          const selectedEmployee = employeeOptions.find(
            (emp) => emp.value === values.responsiblePersonId,
          );
          let selectedType;

          try {
            // 尝试解析 `vehicleTypeSelection` 字段
            selectedType = JSON.parse(values.vehicleTypeSelection);
          } catch (error) {
            // 如果解析失败，则使用初始值
            selectedType = {
              vehicleType: currentVehicle?.vehicleType || '',
              vehicleSerialNumber: currentVehicle?.vehicleSerialNumber || '',
              vehicleBrand: currentVehicle?.vehicleBrand || '',
              approvedLoadCapacity: currentVehicle?.approvedLoadCapacity || '',
            };
          }

          const data: UpdateVehicleInfoRequest = {
            ...values,
            purchaseDate: DateTime.fromFormat(values.purchaseDate, "yyyy-MM-dd HH:mm:ss").toFormat("yyyy-MM-dd"),
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
          };
          await handleEditVehicle(data);
        }}
      >
        <ProFormGroup>
          <ProFormText
            name="vehicleNumber"
            label="车辆编号"
            rules={[{ required: true, message: '请输入车辆编号' }]}
            width="200px"
          />
          <ProFormText
            name="engineeingVehicleNumber"
            label="工程车编号"
            rules={[{ required: true, message: '请输入工程车编号' }]}
            width="200px"
          />
          <ProFormText
            name="licenseNumber"
            label="车牌号码"
            rules={[{ required: true, message: '请输入车牌号码' }]}
            width="200px"
          />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormText
            name="engineNumber"
            label="发动机号后6位"
            rules={[{ required: true, message: '请输入发动机号后6位' }]}
            width="200px"
          />
          <ProFormSelect
            name="vehicleTypeSelection"
            label="车辆类型选择"
            options={vehicleTypeOptions}
            rules={[{ required: true, message: '请选择车辆类型' }]}
            width="200px"
            fieldProps={{
              dropdownMatchSelectWidth: false, // 只显示label
            }}
          />
          <ProFormDatePicker
            name="purchaseDate"
            label="购车日期"
            rules={[{ required: true, message: '请选择购车日期' }]}
            width="200px"
          />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormText
            name="auditMonth"
            label="年检月份"
            rules={[{ required: true, message: '请输入年检月份' }]}
            width="200px"
          />
          <ProFormSelect
            name="isAudited"
            label="是否年检"
            options={[
              { label: '是', value: 1 },
              { label: '否', value: 0 },
            ]}
            rules={[{ required: true, message: '请输入是否年检' }]}
            width="200px"
          />
          <ProFormSelect
            name="trafficInsurance"
            label="是否有交强险"
            options={[
              { label: '是', value: 1 },
              { label: '否', value: 0 },
            ]}
            rules={[{ required: true, message: '请输入是否有交强险' }]}
            width="200px"
          />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormSelect
            name="commercialInsurance"
            label="是否有商业险"
            options={[
              { label: '是', value: 1 },
              { label: '否', value: 0 },
            ]}
            rules={[{ required: true, message: '请输入是否有商业险' }]}
            width="200px"
          />
          <ProFormSelect
            name="gps"
            label="是否安装GPS"
            options={[
              { label: '是', value: 1 },
              { label: '否', value: 0 },
            ]}
            width="200px"
          />
          <ProFormText
            name="mechanicalBond"
            label="机械邦"
            rules={[{ required: true, message: '请输入机械邦信息' }]}
            width="200px"
          />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormText
            name="usageProject"
            label="使用项目"
            rules={[{ required: true, message: '请输入使用项目' }]}
            width="200px"
          />
          <ProFormDigit name="lastMaintenanceMileage" label="上次保养公里数" min={0} width="200px"/>
          <ProFormDigit name="currentMileage" label="当前公里数" min={0} width="200px" />
        </ProFormGroup>

        <ProFormGroup>
          <ProFormDigit name="nextMaintenanceMileage" label="下次保养公里数" min={0} width="200px" />
          <ProFormSelect
            name="responsiblePersonId"
            label="负责人"
            options={employeeOptions}
            fieldProps={{
              labelInValue: false, // 只显示label
            }}
            rules={[{ required: true, message: '请选择负责人' }]}
            width="200px"
          />
          <ProFormText name="extend" label="其他备注信息" width="200px" />
        </ProFormGroup>
      </ModalForm>
    </PageContainer>
  );
};

export default VehicleManagement;
