import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useModel } from 'umi';
import { queryProjectInfoList } from "@/api/project-managerment/Api.project";
import { AddOrUpdatePeriodInfoRequest, PeriodInfoVO } from "@/model/project/Model.period";
import { ProjectInfoVO } from "@/model/project/Modal.project";
import { ContractInfoVO } from "@/model/project/Model.contract";
import { queryContractInfoList } from "@/api/project-managerment/Api.contract";
import {
  addPeriodInfo,
  archivePeriodInfo,
  deletePeriodInfo,
  queryPeriodInfoList,
  updatePeriodInfo,
} from "@/api/project-managerment/Api.period";
import {OperationLogVO} from "@/model/project/Model.operation";
import {deleteOperationLog, queryOperationLogList} from "@/api/project-managerment/Api.operation";

export function usePeriodInfo() {
  const [periodList, setPeriodList] = useState<PeriodInfoVO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [projectList, setProjectList] = useState<ProjectInfoVO[]>([]);
  const [contractList, setContractList] = useState<ContractInfoVO[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [selectedContractId, setSelectedContractId] = useState<number | undefined>(undefined);
  const [currentPeriod, setCurrentPeriod] = useState<PeriodInfoVO | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { initialState } = useModel('@@initialState');
  const userId = initialState?.currentUser?.id;

  // 获取项目列表
  const fetchProjectList = async () => {
    try {
      setLoading(true);
      const data = await queryProjectInfoList(userId);
      setProjectList(data || []);
      if (data && data.length > 0) {
        setSelectedProjectId(data[0].id); // 设置默认项目
      } else {
        setSelectedProjectId(undefined);
        setContractList([]);
        setSelectedContractId(undefined);
        setPeriodList([]);
      }
    } catch (error) {
      setProjectList([]);
      setContractList([]);
      setPeriodList([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取合同列表
  const fetchContractList = async (projectId: number) => {
    try {
      setLoading(true);
      const data = await queryContractInfoList(projectId, userId);
      setContractList(data || []);
      if (data && data.length > 0) {
        setSelectedContractId(data[0].id); // 设置默认选中的合同为第一个合同
      } else {
        setSelectedContractId(undefined); // 如果没有合同，重置选中的合同
        setPeriodList([]);
      }
    } catch (error) {
      setContractList([]);
      setSelectedContractId(undefined);
      setPeriodList([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取周期信息列表
  const fetchPeriodList = async (generalQueryCondition?: string) => {
    // if (!selectedProjectId || !selectedContractId) {
    //   setPeriodList([]);
    //   return;
    // }
    setLoading(true);
    try {
      const data = await queryPeriodInfoList(
        selectedProjectId,
        selectedContractId,
        generalQueryCondition,
      );
      setPeriodList(data || []);
    } catch (error: any) {
      console.error('Error fetching period list:', error);
      setPeriodList([]);
    } finally {
      setLoading(false);
    }
  };

  // 添加或更新周期信息
  const handleAddOrUpdatePeriod = async (values: AddOrUpdatePeriodInfoRequest) => {
    try {
      const periodData: AddOrUpdatePeriodInfoRequest = {
        ...currentPeriod,
        ...values,
        relatedProjectId: selectedProjectId!,
        relatedContractId: selectedContractId!,
      };
      if (currentPeriod?.id) {
        await updatePeriodInfo(periodData);
        message.success('更新周期信息成功');
      } else {
        await addPeriodInfo(periodData);
        message.success('添加周期信息成功');
      }
      setModalOpen(false);
      fetchPeriodList();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 删除周期信息
  const handleDeletePeriod = async (id: number) => {
    try {
      await deletePeriodInfo(id);
      message.success('删除周期信息成功');
      fetchPeriodList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 归档周期信息
  const handleArchivePeriod = async (id: number) => {
    try {
      await archivePeriodInfo(id);
      message.success('归档周期信息成功');
      fetchPeriodList();
    } catch (error) {
      message.error('归档失败');
    }
  };

  // 初始化加载数据
  useEffect(() => {
    fetchProjectList();
  }, [userId]);

  // 当选择项目时，获取对应的合同列表
  useEffect(() => {
    if (selectedProjectId !== undefined) {
      fetchContractList(selectedProjectId);
    } else {
      setContractList([]);
      setSelectedContractId(undefined);
      setPeriodList([]);
    }
  }, [selectedProjectId]);

  // 当选择合同时，获取对应的周期列表
  useEffect(() => {
    fetchPeriodList();
  }, [selectedContractId]);

  // 处理行选择变化
  const onSelectChange = (newSelectedRowKeys: number[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };


  const [operationLogModalOpen, setOperationLogModalOpen] = useState<boolean>(false);
  const [operationLogs, setOperationLogs] = useState<OperationLogVO[]>([]);
  const [currentPeriodForLogs, setCurrentPeriodForLogs] = useState<PeriodInfoVO | null>(null);
  const [operationLogLoading, setOperationLogLoading] = useState<boolean>(false);

  // 获取操作日志的函数
  const fetchOperationLogs = async (period: PeriodInfoVO) => {
    try {
      setOperationLogLoading(true);
      const logs = await queryOperationLogList('周期', period.id!);
      setOperationLogs(logs);
    } catch (error) {
      message.error(`获取操作日志失败：${error}`);
    } finally {
      setOperationLogLoading(false);
    }
  };

  // 删除操作日志的函数
  const handleDeleteOperationLog = async (record: OperationLogVO) => {
    try {
      await deleteOperationLog(record.id);
      message.success('删除成功');
      if (currentPeriodForLogs) {
        fetchOperationLogs(currentPeriodForLogs);
      }
    } catch (error) {
      message.error(`删除失败：${error}`);
    }
  };

  // 打开操作日志模态框的函数
  const handleOpenOperationLogModal = (period: PeriodInfoVO) => {
    setCurrentPeriodForLogs(period);
    setOperationLogModalOpen(true);
    fetchOperationLogs(period);
  };

  return {
    periodList,
    loading,
    selectedRowKeys,
    projectList,
    contractList,
    selectedProjectId,
    setSelectedProjectId,
    selectedContractId,
    setSelectedContractId,
    currentPeriod,
    setCurrentPeriod,
    modalOpen,
    setModalOpen,
    fetchPeriodList,
    handleAddOrUpdatePeriod,
    handleDeletePeriod,
    handleArchivePeriod,
    onSelectChange,
    operationLogModalOpen,
    setOperationLogModalOpen,
    operationLogs,
    operationLogLoading,
    handleDeleteOperationLog,
    handleOpenOperationLogModal,
  };
}
