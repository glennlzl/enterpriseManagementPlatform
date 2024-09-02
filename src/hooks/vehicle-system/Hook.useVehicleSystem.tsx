import React, { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import type { VehicleInfo, AddVehicleInfoRequest, AddVehicleTypeRequest, UpdateVehicleInfoRequest, VehicleUsageInfo } from "@/model/vehicle-management-system";
import {
  addVehicleInfo,
  addVehicleType,
  deleteVehicleInfo,
  deprecateVehicleInfo,
  queryVehicleInfoList,
  queryVehicleUsageInfoList,
  updateVehicleInfo
} from "@/api/vihicle-system";

export const useVehicleSystem = (userId: number) => {
  const actionRef = useRef<ActionType>();
  const [vehicleList, setVehicleList] = useState<VehicleInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentVehicle, setCurrentVehicle] = useState<VehicleInfo | undefined>(undefined);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [createTypeModalOpen, setCreateTypeModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [isWarning, setIsWarning] = useState<boolean>(false); // 添加isWarning状态
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [usageInfoList, setUsageInfoList] = useState<VehicleUsageInfo[]>([]);
  const [, setLoadingUsageInfo] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    vehicleTypeFilters: [],
    registrantFilters: [],
    isAuditedFilters: [],
    gpsFilters: [],
    mechanicalBondFilters: []
  });

  const fetchVehicleList = async (isWarning: boolean = false) => {
    setLoading(true);
    try {
      const response = await queryVehicleInfoList({ userId, pageSize: 10, pageNum: 1, isWarning });
      setVehicleList(response);
    } catch (error) {
      message.error('加载车辆信息失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleList(isWarning);
    const vehicleTypeFilters = _.uniqBy(vehicleList.map(item => ({ text: item.vehicleType, value: item.vehicleType })), 'value');
    const registrantFilters = _.uniqBy(vehicleList.map(item => ({ text: item.registrant, value: item.registrant })), 'value');
    const isAuditedFilters = [
      { text: '是', value: 1 },
      { text: '否', value: 0 }
    ];
    const gpsFilters = [
      { text: '是', value: 1 },
      { text: '否', value: 0 }
    ];
    const mechanicalBondFilters = _.uniqBy(vehicleList.map(item => ({ text: item.mechanicalBond, value: item.mechanicalBond })), 'value');
    setFilters({
      vehicleTypeFilters,
      registrantFilters,
      isAuditedFilters,
      gpsFilters,
      mechanicalBondFilters
    });
  }, [userId, isWarning]);

  const handleWarningChange = async (checked: boolean) => {
    setIsWarning(checked);
    await fetchVehicleList(checked);
  };

  const handleDeleteVehicle = async (id: number) => {
    try {
      await deleteVehicleInfo(id);
      message.success('删除车辆成功');
      await fetchVehicleList(isWarning); // 操作完成后刷新列表
      actionRef.current?.reload();
    } catch (error) {
      message.error(error);
    }
  };

  const handleDeprecateVehicle = async (id: number) => {
    try {
      await deprecateVehicleInfo(id);
      message.success('车辆已作废');
      await fetchVehicleList(isWarning); // 操作完成后刷新列表
      actionRef.current?.reload();
    } catch (error) {
      message.error(error);
    }
  };

  const handleRestoreVehicle = async (id: number) => {
    try {
      await deprecateVehicleInfo(id);
      message.success('车辆已恢复');
      await fetchVehicleList(isWarning); // 操作完成后刷新列表
      actionRef.current?.reload();
    } catch (error) {
      message.error(error);
    }
  };

  const handleAddVehicle = async (data: AddVehicleInfoRequest) => {
    try {
      await addVehicleInfo(data);
      message.success('添加车辆成功');
      setCreateModalOpen(false);
      await fetchVehicleList(isWarning); // 操作完成后刷新列表
      actionRef.current?.reload();
    } catch (error) {
      message.error(error);
    }
  };

  const handleEditVehicle = async (data: UpdateVehicleInfoRequest) => {
    try {
      await updateVehicleInfo(data);
      message.success('车辆信息更新成功');
      setEditModalOpen(false);
      await fetchVehicleList(isWarning); // 操作完成后刷新列表
      actionRef.current?.reload();
    } catch (error) {
      message.error(error);
    }
  };

  const handleAddVehicleType = async (data: AddVehicleTypeRequest) => {
    try {
      await addVehicleType(data);
      message.success('车辆类型添加成功');
      setCreateTypeModalOpen(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error(error);
    }
  };

  const fetchVehicleUsageInfoList = async (vehicleId: number) => {
    setLoadingUsageInfo(true);
    try {
      const response = await queryVehicleUsageInfoList(vehicleId);
      setUsageInfoList(response);
    } catch (error) {
      message.error(error);
    } finally {
      setLoadingUsageInfo(false);
    }
  };

  const handleModalOpen = (modalName: string, isOpen: boolean, record?: VehicleInfo) => {
    if (modalName === 'createModalOpen') {
      setCreateModalOpen(isOpen);
    } else if (modalName === 'createTypeModalOpen') {
      setCreateTypeModalOpen(isOpen);
    } else if (modalName === 'editModalOpen') {
      setEditModalOpen(isOpen);
      if (isOpen && record) {
        setCurrentVehicle(record);
      }
    } else if (modalName === 'drawerVisible') {
      setDrawerVisible(isOpen);
      if (isOpen && record) {
        setCurrentVehicle(record);
        fetchVehicleUsageInfoList(record.id);
      }
    }
  };

  // 导出CSV函数
  const exportToCSV = (data: any[], filename: string, columns: ProColumns<VehicleInfo>[]) => {
    const filteredColumns = columns.slice(0, -1);

    // 获取表头
    const headers = filteredColumns.map(col => {
      // 检查 col.title 是 React 元素还是字符串
      if (typeof col.title.props.id === 'string') {
        return col.title.props.id;
      } else if (React.isValidElement(col.title)) {
        return (col.title as React.ReactElement).props.children;
      }
      return '';
    }).join(',');
    console.log(headers);
    // 将数据转换为 CSV 格式
    const csvContent = data.map(item =>
      filteredColumns.map(col => {
        const value = item[col.dataIndex as keyof VehicleInfo];

        // 根据不同的字段进行布尔值转换
        if (col.render) {
          return col.render(value);
        }

        return value;
      }).join(',')
    ).join('\n');

    // 生成最终的 CSV 内容，包含表头
    const csv = `${headers}\n${csvContent}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchDelete = async () => {
    await Promise.all(selectedRowKeys.map(id => handleDeleteVehicle(id)));
    await fetchVehicleList(isWarning); // 操作完成后刷新列表
  };

  return {
    vehicleList,
    usageInfoList,
    loading,
    createModalOpen,
    createTypeModalOpen,
    editModalOpen,
    exportToCSV,
    drawerVisible,
    currentVehicle,
    isWarning,
    handleModalOpen,
    handleDeprecateVehicle,
    handleDeleteVehicle,
    handleAddVehicle,
    handleEditVehicle,
    handleAddVehicleType,
    handleWarningChange,
    actionRef,
    handleBatchDelete,
    setSelectedRowKeys,
    selectedRowKeys,
    handleRestoreVehicle,
    filters,
    setFilters
  };
};
