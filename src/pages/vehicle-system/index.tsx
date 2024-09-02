import { useModel } from '@@/exports';
import { PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer, ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import {Button, Switch, Space, message} from 'antd';
import React, {useEffect, useState} from 'react';
import type { AddVehicleInfoRequest, VehicleInfo, UpdateVehicleInfoRequest } from "@/model/vehicle-management-system";
import { useVehicleSystem } from "@/hooks/vehicle-system/Hook.useVehicleSystem";
import VehicleDrawer from "@/pages/vehicle-system/component/drawer";
import '/Users/glennlzsml/workplace/enterpriseManagementPlatform/src/global.less';
import _ from 'lodash';
import {ProFormDatePicker, ProFormDigit} from "@ant-design/pro-form/lib";
import {queryAllEmployeeSimpleInfo} from "@/api/usermanagement";
import {queryVehicleTypes} from "@/api/vihicle-system";



const VehicleManagement: React.FC = () => {
  const { initialState } = useModel('@@initialState');
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
    selectedRowKeys,
    handleRestoreVehicle,
    filters,
  } = useVehicleSystem(initialState.currentUser?.id || '');

  const intl = useIntl();

  const [employeeOptions, setEmployeeOptions] = useState<{ label: string, value: number, name: string }[]>([]);

  const [vehicleTypeOptions, setVehicleTypeOptions] = useState<{ label: string, value: string }[]>([]);

  useEffect(() => {
    // 加载车辆类型信息
    const loadVehicleTypes = async () => {
      try {
        const response = await queryVehicleTypes();
        const options = response.map(type => ({
          label: `${type.vehicleType} - ${type.vehicleSerialNumber} - ${type.vehicleBrand} - ${type.approvedLoadCapacity || ''}`,
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
        const options = response.map(employee => ({
          label: employee.name, // 显示的名字
          value: employee.id,   // 实际选择的ID
          name: employee.name,  // 保存的名字
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
      width: 'auto',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.id - b.id,
    },
    {
      title: <FormattedMessage id="警告等级" />,
      dataIndex: 'warningLevel',
      valueType: 'text',
      fixed: 'left',
      width: 'auto',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.warningLevel - b.warningLevel
    },
    {
      title: <FormattedMessage id="工程车编号" />,
      dataIndex: 'engineeingVehicleNumber',
      valueType: 'text',
      fixed: 'left',
      width: 'auto',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.engineeingVehicleNumber.localeCompare(b.engineeingVehicleNumber),
    },
    {
      title: <FormattedMessage id="车辆编号" />,
      dataIndex: 'vehicleNumber',
      valueType: 'text',
      fixed: 'left',
      width: 'auto',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.vehicleNumber.localeCompare(b.vehicleNumber),
    },
    {
      title: <FormattedMessage id="车牌号码" />,
      dataIndex: 'licenseNumber',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => _.isUndefined(a.licenseNumber) || _.isUndefined(b.licenseNumber) ? {} : a.licenseNumber.localeCompare(b.licenseNumber),
    },
    {
      title: <FormattedMessage id="发动机号后6位" />,
      dataIndex: 'engineNumber',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.engineNumber.localeCompare(b.engineNumber),
    },
    {
      title: <FormattedMessage id="车辆类型" />,
      dataIndex: 'vehicleType',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.vehicleType.localeCompare(b.vehicleType),
      filters: filters.vehicleTypeFilters,
      onFilter: (value, record) => record.vehicleType.includes(value as string),
    },
    {
      title: <FormattedMessage id="车辆型号" />,
      dataIndex: 'vehicleSerialNumber',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.vehicleSerialNumber.localeCompare(b.vehicleSerialNumber),
    },
    {
      title: <FormattedMessage id="车辆品牌" />,
      dataIndex: 'vehicleBrand',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="核定载质量" />,
      dataIndex: 'approvedLoadCapacity',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => _.isUndefined(a.approvedLoadCapacity) || _.isUndefined(b.approvedLoadCapacity) ? {} : a.approvedLoadCapacity.localeCompare(b.approvedLoadCapacity),
    },
    {
      title: <FormattedMessage id="登记人" />,
      dataIndex: 'registrant',
      valueType: 'text',
      onFilter: (value, record) => record.registrant.includes(value as string),
    },
    {
      title: <FormattedMessage id="登记人ID" />,
      dataIndex: 'registrantId',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="购车日期" />,
      dataIndex: 'purchaseDate',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.purchaseDate.localeCompare(b.purchaseDate),
    },
    {
      title: <FormattedMessage id="年检月份" />,
      dataIndex: 'auditMonth',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.auditMonth.localeCompare(b.auditMonth),
    },
    {
      title: <FormattedMessage id="是否年检" />,
      dataIndex: 'isAudited',
      valueType: 'text',
      render: (value: number) => (value === 1 ? '是' : '否'),
      filters: filters.isAuditedFilters,
      onFilter: (value, record) => record.isAudited === value,
    },
    {
      title: <FormattedMessage id="是否有交强险" />,
      dataIndex: 'trafficInsurance',
      valueType: 'text',
      render: (value: number) => (value === 1 ? '是' : '否'),
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.trafficInsurance - b.trafficInsurance
    },
    {
      title: <FormattedMessage id="是否有商业险" />,
      dataIndex: 'commercialInsurance',
      valueType: 'text',
      render: (value: number) => (value === 1 ? '是' : '否'),
      sorter: (a: VehicleInfo, b: VehicleInfo) => a.commercialInsurance - b.commercialInsurance
    },
    {
      title: <FormattedMessage id="是否安装GPS" />,
      dataIndex: 'gps',
      valueType: 'text',
      render: (value: number) => (value === 1 ? '是' : '否'),
      filters: filters.gpsFilters,
      onFilter: (value, record) => record.gps === value,
    },
    {
      title: <FormattedMessage id="机械邦" />,
      dataIndex: 'mechanicalBond',
      valueType: 'text',
      filters: filters.mechanicalBondFilters,
      onFilter: (value, record) => record.mechanicalBond.includes(value as string),
    },
    {
      title: <FormattedMessage id="使用项目" />,
      dataIndex: 'usageProject',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="上次保养公里数" />,
      dataIndex: 'lastMaintenanceMileage',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="当前公里数" />,
      dataIndex: 'currentMileage',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => _.isUndefined(a.currentMileage) || _.isUndefined(b.currentMileage) ? {} : a.currentMileage - b.currentMileage,
    },
    {
      title: <FormattedMessage id="下次保养公里数" />,
      dataIndex: 'nextMaintenanceMileage',
      valueType: 'text',
      sorter: (a: VehicleInfo, b: VehicleInfo) => _.isUndefined(a.nextMaintenanceMileage) || _.isUndefined(b.nextMaintenanceMileage) ? {} : a.nextMaintenanceMileage - b.nextMaintenanceMileage,
    },
    {
      title: <FormattedMessage id="负责人姓名" />,
      dataIndex: 'responsiblePersonName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="负责人ID" />,
      dataIndex: 'responsiblePersonId',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="负责人联系电话" />,
      dataIndex: 'responsiblePersonMobile',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="其他备注信息" />,
      dataIndex: 'extend',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="是否删除" />,
      dataIndex: 'isDeleted',
      valueType: 'text',
      render: (value: number) => (value === 1 ? '是' : '否'),
    },
    {
      title: <FormattedMessage id="是否废弃" />,
      dataIndex: 'isDeprecated',
      valueType: 'text',
      render: (value: number) => (value === 1 ? '是' : '否'),
    },
    {
      title: <FormattedMessage id="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <a onClick={() => handleModalOpen('drawerVisible', true, record)}>详情</a>
          <a onClick={() => handleModalOpen('editModalOpen', true, record)}>编辑</a>
          {initialState.currentUser?.role > 1 && <a onClick={() => handleDeleteVehicle(record.id)}>删除</a>}
          {record.isDeprecated ? (<a onClick={() => handleRestoreVehicle(record.id)}>恢复</a>) : (<a onClick={() => handleDeprecateVehicle(record.id)}>作废</a>)}
        </Space>
      ),
    },
  ];

  const handleBatchExport = () => {
    const selectedData = vehicleList.filter(item => selectedRowKeys.includes(item.id));
    if (selectedData.length > 0) {
      exportToCSV(selectedData, '车辆信息导出', columns);  // 传递 columns 作为参数
    } else {
      message.warning('请先选择要导出的车辆信息');
    }
  };

  return (
    <PageContainer>
      <ProTable<VehicleInfo, API.PageParams>
        headerTitle={
          <div>
            {intl.formatMessage({ id: '车辆管理', defaultMessage: '车辆管理' })}
            <Switch
              style={{ marginLeft: 16 }}
              checkedChildren="预警开"
              unCheckedChildren="预警关"
              onChange={handleWarningChange}
              checked={isWarning}
            />
            {selectedRowKeys.length > 0 && (
              <Button onClick={handleBatchExport} style={{ marginLeft: 16 }}>
                批量导出
              </Button>
            )}
            {selectedRowKeys.length > 0 && (
              <Button onClick={handleBatchDelete} style={{ marginLeft: 16 }}>
                批量删除
              </Button>
            )}
          </div>
        }
        onRow={(record) => {
          return {
            style: {
              backgroundColor: isWarning && record.warningLevel >= 3 ? '#ffcccc' : '', // 根据条件设置背景颜色
            },
          };
        }}
        scroll={{ x: 3000 }}  // 设置横向滚动，宽度可以根据你的需要调整
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          filterType: 'query',
        }}
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
          </Button>
        ]}
        loading={loading}
        dataSource={vehicleList}
        columns={columns}
      />

      {/* Drawer 和 Modals */}
      <VehicleDrawer
        visible={drawerVisible}
        onClose={() => handleModalOpen('drawerVisible', false)}
        vehicleInfo={currentVehicle!}
        usageInfoList={usageInfoList}
        loading={loading}
      />

      {/* 新增车辆 Modal */}
      <ModalForm
        title="新加入车辆"
        width="400px"
        open={createModalOpen}
        onOpenChange={(isOpen) => handleModalOpen('createModalOpen', isOpen)}
        onFinish={async (values) => {
          const selectedEmployee = employeeOptions.find(emp => emp.value === values.responsiblePersonId);
          const selectedType = JSON.parse(values.vehicleTypeSelection);

          const data: AddVehicleInfoRequest = {
            ...values,
            vehicleType: selectedType.vehicleType,
            vehicleSerialNumber: selectedType.vehicleSerialNumber,
            vehicleBrand: selectedType.vehicleBrand,
            approvedLoadCapacity: selectedType.approvedLoadCapacity,
            responsiblePersonName: selectedEmployee?.name || '',
            responsiblePersonId: selectedEmployee?.value || 0,
            registrantId: initialState.currentUser?.id || 0,
            registrant: initialState.currentUser?.name || '',
          };
          await handleAddVehicle(data);
        }}
      >
        <ProFormText
          name="vehicleNumber"
          label="车辆编号"
          rules={[{ required: true, message: '请输入车辆编号' }]}
        />
        <ProFormText
          name="engineeingVehicleNumber"
          label="工程车编号"
          rules={[{ required: true, message: '请输入工程车编号' }]}
        />
        <ProFormText
          name="licenseNumber"
          label="车牌号码"
          rules={[{ required: true, message: '请输入车牌号码' }]}
        />
        <ProFormText
          name="engineNumber"
          label="发动机号后6位"
          rules={[{ required: true, message: '请输入发动机号后6位' }]}
        />
        <ProFormSelect
          name="vehicleTypeSelection"
          label="车辆类型选择"
          options={vehicleTypeOptions}
          rules={[{ required: true, message: '请选择车辆类型' }]}
        />
        <ProFormDatePicker
          name="purchaseDate"
          label="购车日期"
          rules={[{ required: true, message: '请选择购车日期' }]}
        />
        <ProFormText
          name="auditMonth"
          label="年检月份"
          rules={[{ required: true, message: '请输入年检月份' }]}
        />
        <ProFormSelect
          name="isAudited"
          label="是否年检"
          valueEnum={{ 1: '是', 0: '否' }}
          rules={[{ required: true, message: '请输入是否年检' }]}
        />
        <ProFormSelect
          name="trafficInsurance"
          label="是否有交强险"
          valueEnum={{ 1: '是', 0: '否' }}
          rules={[{ required: true, message: '请输入是否有交强险' }]}
        />
        <ProFormSelect
          name="commercialInsurance"
          label="是否有商业险"
          valueEnum={{ 1: '是', 0: '否' }}
          rules={[{ required: true, message: '请输入是否有商业险' }]}
        />
        <ProFormSelect
          name="gps"
          label="是否安装GPS"
          valueEnum={{ 1: '是', 0: '否' }}
        />
        <ProFormText
          name="mechanicalBond"
          label="机械邦"
          rules={[{ required: true, message: '请输入机械邦信息' }]}
        />
        <ProFormText
          name="usageProject"
          label="使用项目"
          rules={[{ required: true, message: '请输入使用项目' }]}
        />
        <ProFormDigit
          name="lastMaintenanceMileage"
          label="上次保养公里数"
          min={0}
        />
        <ProFormDigit
          name="currentMileage"
          label="当前公里数"
          min={0}
        />
        <ProFormDigit
          name="nextMaintenanceMileage"
          label="下次保养公里数"
          min={0}
        />
        <ProFormSelect
          name="responsiblePersonId"
          label="负责人"
          options={employeeOptions}
          fieldProps={{
            labelInValue: false, // 只显示label
          }}
          rules={[{ required: true, message: '请选择负责人' }]}
        />
        <ProFormText
          name="responsiblePersonMobile"
          label="负责人联系电话"
        />
        <ProFormText
          name="extend"
          label="其他备注信息"
        />
      </ModalForm>

      {/* 编辑车辆信息 Modal */}
      <ModalForm
        title="编辑车辆信息"
        width="400px"
        open={editModalOpen}
        initialValues={currentVehicle} // 选中的车辆信息
        onOpenChange={(isOpen) => handleModalOpen('editModalOpen', isOpen)}
        onFinish={async (values) => {
          const selectedEmployee = employeeOptions.find(emp => emp.value === values.responsiblePersonId);
          const selectedType = JSON.parse(values.vehicleTypeSelection);

          const data: UpdateVehicleInfoRequest = {
            ...values,
            vehicleType: selectedType.vehicleType,
            vehicleSerialNumber: selectedType.vehicleSerialNumber,
            vehicleBrand: selectedType.vehicleBrand,
            approvedLoadCapacity: selectedType.approvedLoadCapacity,
            responsiblePersonName: selectedEmployee?.name || '',
            responsiblePersonId: selectedEmployee?.value || 0,
            registrantId: initialState.currentUser?.id || 0,
            registrant: initialState.currentUser?.name || '',
            id: currentVehicle?.id || 0, // 更新时需要车辆 ID
          };
          await handleEditVehicle(data);
        }}
      >
        <ProFormText
          name="vehicleNumber"
          label="车辆编号"
          rules={[{ required: true, message: '请输入车辆编号' }]}
        />
        <ProFormText
          name="engineeingVehicleNumber"
          label="工程车编号"
          rules={[{ required: true, message: '请输入工程车编号' }]}
        />
        <ProFormText
          name="licenseNumber"
          label="车牌号码"
          rules={[{ required: true, message: '请输入车牌号码' }]}
        />
        <ProFormText
          name="engineNumber"
          label="发动机号后6位"
          rules={[{ required: true, message: '请输入发动机号后6位' }]}
        />
        <ProFormSelect
          name="vehicleTypeSelection"
          label="车辆类型选择"
          options={vehicleTypeOptions}
          rules={[{ required: true, message: '请选择车辆类型' }]}
        />
        <ProFormDatePicker
          name="purchaseDate"
          label="购车日期"
          rules={[{ required: true, message: '请选择购车日期' }]}
        />
        <ProFormText
          name="auditMonth"
          label="年检月份"
          rules={[{ required: true, message: '请输入年检月份' }]}
        />
        <ProFormSelect
          name="isAudited"
          label="是否年检"
          options={[
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ]}
          rules={[{ required: true, message: '请输入是否年检' }]}
        />
        <ProFormSelect
          name="trafficInsurance"
          label="是否有交强险"
          options={[
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ]}
          rules={[{ required: true, message: '请输入是否有交强险' }]}

        />
        <ProFormSelect
          name="commercialInsurance"
          label="是否有商业险"
          options={[
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ]}
          rules={[{ required: true, message: '请输入是否有商业险' }]}
        />
        <ProFormSelect
          name="gps"
          label="是否安装GPS"
          options={[
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ]}        />
        <ProFormText
          name="mechanicalBond"
          label="机械邦"
          rules={[{ required: true, message: '请输入机械邦信息' }]}
        />
        <ProFormText
          name="usageProject"
          label="使用项目"
          rules={[{ required: true, message: '请输入使用项目' }]}
        />
        <ProFormDigit
          name="lastMaintenanceMileage"
          label="上次保养公里数"
          min={0}
        />
        <ProFormDigit
          name="currentMileage"
          label="当前公里数"
          min={0}
        />
        <ProFormDigit
          name="nextMaintenanceMileage"
          label="下次保养公里数"
          min={0}
        />
        <ProFormSelect
          name="responsiblePersonId"
          label="负责人"
          options={employeeOptions}
          fieldProps={{
            labelInValue: false, // 只显示label
          }}
          rules={[{ required: true, message: '请选择负责人' }]}
        />
        <ProFormText
          name="responsiblePersonMobile"
          label="负责人联系电话"
        />
        <ProFormText
          name="extend"
          label="其他备注信息"
        />
        <ProFormDigit
          name="warningLevel"
          label="警告等级"
          min={0}
          max={5}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default VehicleManagement;
