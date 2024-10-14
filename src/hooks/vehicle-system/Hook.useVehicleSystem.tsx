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
import {isLogin} from "@/api/usermanagement";
import {history} from "@@/core/history";

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
    mechanicalBondFilters: [],
    merchantInsturance: []
  });


  const handleOnChangeColumn = (map: any) => {
    setColumnsStateMap(map);
  }

  const fetchVehicleList = async (
    isWarning: boolean = false,
    generalQueryCondition?: string,
    project?: string,
    name?: string
  ) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    setLoading(true);
    try {
      // 检查 generalQueryCondition 是否为空
      const generalQueryConditionV2 = _.isEmpty(generalQueryCondition) ? undefined : generalQueryCondition;

      const response = await queryVehicleInfoList({
        userId,
        pageSize: 100,
        pageNum: 1,
        isWarning: isWarning,
        generalQueryCondition: generalQueryConditionV2, // 只在不为空时传递
        project,
        name,
      });

      setVehicleList(response);
    } catch (error) {
      message.error('加载车辆信息失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loginCheck = isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
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
    const merchantInsturance = [
      { text: '是', value: 1 },
      { text: '否', value: 0 }
    ];
    const mechanicalBondFilters = _.uniqBy(vehicleList.map(item => ({ text: item.mechanicalBond, value: item.mechanicalBond })), 'value');
    setFilters({
      vehicleTypeFilters,
      registrantFilters,
      isAuditedFilters,
      gpsFilters,
      mechanicalBondFilters,
      merchantInsturance
    });
  }, [userId, isWarning]);

  const handleWarningChange = async (checked: boolean) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    setIsWarning(checked);
    await fetchVehicleList(checked);
  };

  const handleDeleteVehicle = async (id: number) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
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
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
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
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
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
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
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
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
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
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
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
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
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

  const exportToCSV = (
    data: VehicleInfo[],
    filename: string,
    columns: ProColumns<VehicleInfo>[],
    columnsStateMap: any,
  ) => {
    const filteredColumns = columns.filter((col) => {
      const dataIndex = col.dataIndex as string;

      if (
        columnsStateMap[dataIndex] &&
        columnsStateMap[dataIndex].show === false
      ) {
        return false;
      }

      if (dataIndex === 'option') {
        return false;
      }

      return true;
    });

    const headers = filteredColumns
      .map((col) => {
        if (typeof col.title === 'string') {
          return escapeCsvCell(col.title);
        } else if (React.isValidElement(col.title)) {
          const titleText = col.title.props.children || col.title.props.id || '';
          return escapeCsvCell(titleText);
        }
        return '';
      })
      .join(',');

    const csvRows = data
      .map((item) =>
        filteredColumns
          .map((col) => {
            let value = item[col.dataIndex as keyof VehicleInfo];

            if (value === undefined || value === null) {
              value = '';
            }

            if (col.render) {
              const renderedValue = col.render(value, item, 0);

              if (React.isValidElement(renderedValue)) {
                const text = renderedValue.props.children || '';
                return escapeCsvCell(text);
              }

              if (Array.isArray(renderedValue)) {
                const text = renderedValue.join('; ');
                return escapeCsvCell(text);
              }

              return escapeCsvCell(renderedValue.toString());
            }

            if (Array.isArray(value)) {
              if (typeof value[0] === 'object' && value[0] !== null) {
                const text = value.map((item) => item.name).join('; ');
                return escapeCsvCell(text);
              } else {
                const text = value.join('; ');
                return escapeCsvCell(text);
              }
            }

            return escapeCsvCell(value.toString());
          })
          .join(','),
      )
      .join('\n');

    const csvContent = `${headers}\n${csvRows}`;

    const csvBlob = new Blob(
      [new Uint8Array([0xef, 0xbb, 0xbf]), csvContent],
      { type: 'text/csv;charset=utf-8;' }
    );

    const link = document.createElement('a');
    link.href = URL.createObjectURL(csvBlob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const escapeCsvCell = (value: string) => {
    if (typeof value !== 'string') {
      value = value.toString();
    }

    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      value = value.replace(/"/g, '""'); // Escape double quotes
      return `"${value}"`;
    }

    return value;
  };

  const handleBatchDelete = async () => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
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
    setFilters,
    fetchVehicleList,
    setCreateModalOpen,
    setEditModalOpen,
    setCurrentVehicle
  };
};
