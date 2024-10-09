import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useModel } from 'umi';
import { queryProjectInfoList } from '@/api/project-managerment/Api.project';
import { queryContractInfoList } from '@/api/project-managerment/Api.contract';
import { queryPeriodInfoList } from '@/api/project-managerment/Api.period';
import {
  addMeasurementDetail,
  deleteMeasurementDetail,
  queryMeasurementDetailList,
  updateMeasurementDetail,
  reviewMeasurementDetail,
} from '@/api/project-managerment/Api.measurement-detail';
import {
  MeasurementDetailVO,
  AddOrUpdateMeasurementDetailRequest,
  ReviewRequest,
} from '@/model/project/Model.measurement-detail';
import { ProjectInfoVO } from '@/model/project/Modal.project';
import { ContractInfoVO, MeasurementItemVO } from '@/model/project/Model.contract';
import { PeriodInfoVO } from '@/model/project/Model.period';
import {OperationLogVO} from "@/model/project/Model.operation";
import {deleteOperationLog, queryOperationLogList} from "@/api/project-managerment/Api.operation";

export function useMeasurementDetail() {
  const [measurementDetailList, setMeasurementDetailList] = useState<MeasurementDetailVO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [projectList, setProjectList] = useState<ProjectInfoVO[]>([]);
  const [contractList, setContractList] = useState<ContractInfoVO[]>([]);
  const [periodList, setPeriodList] = useState<PeriodInfoVO[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [selectedContractId, setSelectedContractId] = useState<number | undefined>(undefined);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | undefined>(undefined);
  const [currentMeasurementDetail, setCurrentMeasurementDetail] = useState<MeasurementDetailVO | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // 新增的状态
  const [selectedContract, setSelectedContract] = useState<ContractInfoVO | null>(null);
  const [measurementItemList, setMeasurementItemList] = useState<MeasurementItemVO[]>([]);
  const [measurementItemTreeData, setMeasurementItemTreeData] = useState<any[]>([]);

  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined);

  const { initialState } = useModel('@@initialState');
  const userId = initialState?.currentUser?.id;

  // 获取项目列表
  const fetchProjectList = async () => {
    if (!userId) {
      message.error('用户信息未加载');
      return;
    }
    try {
      setLoading(true);
      const data = await queryProjectInfoList(userId);
      setProjectList(data || []);
      if (data && data.length > 0) {
        setSelectedProjectId(data[0].id);
      } else {
        setSelectedProjectId(undefined);
        setContractList([]);
        setSelectedContractId(undefined);
        setPeriodList([]);
        setMeasurementDetailList([]);
      }
    } catch (error: any) {
      console.error('Error fetching project list:', error);
      setProjectList([]);
      setContractList([]);
      setPeriodList([]);
      setMeasurementDetailList([]);
      message.error('获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取合同列表
  const fetchContractList = async (projectId: number) => {
    if (!projectId || !userId) {
      message.error('项目ID或用户ID缺失');
      setContractList([]);
      setSelectedContractId(undefined);
      setPeriodList([]);
      setMeasurementDetailList([]);
      return;
    }
    try {
      setLoading(true);
      const data = await queryContractInfoList(projectId, userId);
      setContractList(data || []);
      if (data && data.length > 0) {
        setSelectedContractId(data[0].id);
      } else {
        setSelectedContractId(undefined);
        setPeriodList([]);
        setMeasurementDetailList([]);
      }
    } catch (error: any) {
      console.error('Error fetching contract list:', error);
      setContractList([]);
      setSelectedContractId(undefined);
      setPeriodList([]);
      setMeasurementDetailList([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取周期信息列表
  const fetchPeriodList = async (generalQueryCondition?: string) => {
    if (selectedProjectId === undefined || selectedContractId === undefined) {
      console.warn('selectedProjectId 或 selectedContractId 未定义');
      setPeriodList([]);
      setSelectedPeriodId(undefined);
      setMeasurementDetailList([]);
      return;
    }
    setLoading(true);
    try {
      console.log('Fetching period list with:', {
        selectedProjectId,
        selectedContractId,
        generalQueryCondition,
      });
      const data = await queryPeriodInfoList(
        selectedProjectId,
        selectedContractId,
        generalQueryCondition,
      );
      console.log('Received period list:', data);
      setPeriodList(data || []);
      if (data && data.length > 0) {
        setSelectedPeriodId(data[0].id);
      } else {
        setSelectedPeriodId(undefined);
        setMeasurementDetailList([]);
      }
    } catch (error: any) {
      console.error('Error fetching period list:', error);
      setPeriodList([]);
      setSelectedPeriodId(undefined);
      setMeasurementDetailList([]);
      if (error.response && error.response.status !== 404) {
        message.error('获取周期信息列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取计量明细列表
  const fetchMeasurementDetailList = async (
    generalQueryCondition?: string,
    itemId?: number,
  ) => {
    if (
      selectedProjectId === undefined ||
      selectedContractId === undefined ||
      selectedPeriodId === undefined
    ) {
      console.warn('selectedProjectId、selectedContractId 或 selectedPeriodId 未定义');
      setMeasurementDetailList([]);
      return;
    }
    setLoading(true);
    try {
      console.log('Fetching measurement detail list with:', {
        selectedProjectId,
        selectedContractId,
        selectedPeriodId,
        itemId,
        generalQueryCondition,
      });
      const data = await queryMeasurementDetailList(
        selectedProjectId,
        selectedContractId,
        selectedPeriodId,
        25,
        'cost', // 根据需要调整 type 参数
        generalQueryCondition,
      );
      console.log('Received measurement detail list:', data);
      setMeasurementDetailList(data || []);
    } catch (error: any) {
      console.error('Error fetching measurement detail list:', error);
      setMeasurementDetailList([]);
      if (error.response && error.response.status !== 404) {
        message.error('获取计量明细列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 添加或更新计量明细
  const handleAddOrUpdateMeasurementDetail = async (
    values: AddOrUpdateMeasurementDetailRequest,
  ) => {
    if (
      selectedProjectId === undefined ||
      selectedContractId === undefined ||
      selectedPeriodId === undefined
    ) {
      message.error('项目、合同或周期信息未选择');
      return;
    }
    try {
      setLoading(true);
      const measurementData: AddOrUpdateMeasurementDetailRequest = {
        ...currentMeasurementDetail,
        ...values,
        relatedProjectId: selectedProjectId!,
        relatedContractId: selectedContractId!,
        relatedPeriodId: selectedPeriodId!,
      };
      if (currentMeasurementDetail?.id) {
        await updateMeasurementDetail(measurementData);
        message.success('更新计量明细成功');
      } else {
        await addMeasurementDetail(measurementData);
        message.success('添加计量明细成功');
      }
      setModalOpen(false);
      fetchMeasurementDetailList(undefined, selectedItemId);
    } catch (error: any) {
      console.error('Error adding/updating measurement detail:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除计量明细
  const handleDeleteMeasurementDetail = async (id: number) => {
    if (!id) {
      message.error('计量明细ID缺失');
      return;
    }
    try {
      setLoading(true);
      await deleteMeasurementDetail(id);
      message.success('删除计量明细成功');
      fetchMeasurementDetailList(undefined, selectedItemId);
    } catch (error: any) {
      console.error('Error deleting measurement detail:', error);
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 审核或驳回计量明细
  const handleReviewMeasurementDetail = async (id: number, status: number) => {
    if (!id) {
      message.error('计量明细ID缺失');
      return;
    }
    try {
      setLoading(true);
      const reviewData: ReviewRequest = {
        id,
        isPass: status === 1,
      };
      await reviewMeasurementDetail(reviewData);
      message.success(status === 1 ? '审核成功' : '驳回成功');
      fetchMeasurementDetailList(undefined, selectedItemId);
    } catch (error: any) {
      console.error('Error reviewing measurement detail:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新测量项列表和树形数据
  const updateMeasurementItems = (contract: ContractInfoVO | null) => {
    if (contract) {
      const items = contract.projectSchedule || [];
      setMeasurementItemList(items);
      const treeData = generateTreeData(items);
      setMeasurementItemTreeData(treeData);
    } else {
      setMeasurementItemList([]);
      setMeasurementItemTreeData([]);
    }
  };

  // 生成树形数据的函数
  const generateTreeData = (items: MeasurementItemVO[]): any[] => {
    return items.map((item) => ({
      title: item.name || '', // 根据你的实际字段
      key: item.id?.toString() || '',
      children: item.children ? generateTreeData(item.children) : [],
    }));
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
      setMeasurementDetailList([]);
      setSelectedContract(null);
      updateMeasurementItems(null);
    }
  }, [selectedProjectId]);

  // 当选择合同时，获取对应的周期列表，并更新选定的合同和测量项
  useEffect(() => {
    if (selectedContractId !== undefined) {
      fetchPeriodList();
      const contract = contractList.find((c) => c.id === selectedContractId) || null;
      setSelectedContract(contract);
      updateMeasurementItems(contract);
    } else {
      setPeriodList([]);
      setSelectedPeriodId(undefined);
      setMeasurementDetailList([]);
      setSelectedContract(null);
      updateMeasurementItems(null);
    }
  }, [selectedContractId, contractList]);

  // 当选择周期时，获取对应的计量明细列表
  useEffect(() => {
    if (selectedPeriodId !== undefined) {
      fetchMeasurementDetailList(undefined, selectedItemId);
    } else {
      setMeasurementDetailList([]);
    }
  }, [selectedPeriodId]);

  // 当 selectedItemId 变化时，获取计量明细列表
  useEffect(() => {
    if (selectedPeriodId !== undefined) {
      fetchMeasurementDetailList(undefined, selectedItemId);
    }
  }, [selectedItemId]);

  // 处理行选择变化
  const onSelectChange = (newSelectedRowKeys: number[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const [operationLogModalOpen, setOperationLogModalOpen] = useState<boolean>(false);
  const [operationLogs, setOperationLogs] = useState<OperationLogVO[]>([]);
  const [currentMeasurementDetailForLogs, setCurrentMeasurementDetailForLogs] = useState<MeasurementDetailVO | null>(null);
  const [operationLogLoading, setOperationLogLoading] = useState<boolean>(false);

  // 获取操作日志的函数
  const fetchOperationLogs = async (measurementDetail: MeasurementDetailVO) => {
    try {
      setOperationLogLoading(true);
      const logs = await queryOperationLogList('计量', measurementDetail.id!);
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
      if (currentMeasurementDetailForLogs) {
        fetchOperationLogs(currentMeasurementDetailForLogs);
      }
    } catch (error) {
      message.error(`删除失败：${error}`);
    }
  };

  // 打开操作日志模态框的函数
  const handleOpenOperationLogModal = (measurementDetail: MeasurementDetailVO) => {
    setCurrentMeasurementDetailForLogs(measurementDetail);
    setOperationLogModalOpen(true);
    fetchOperationLogs(measurementDetail);
  };

  return {
    measurementDetailList,
    loading,
    selectedRowKeys,
    projectList,
    contractList,
    periodList,
    selectedProjectId,
    setSelectedProjectId,
    selectedContractId,
    setSelectedContractId,
    selectedPeriodId,
    setSelectedPeriodId,
    currentMeasurementDetail,
    setCurrentMeasurementDetail,
    modalOpen,
    setModalOpen,
    fetchMeasurementDetailList,
    handleAddOrUpdateMeasurementDetail,
    handleDeleteMeasurementDetail,
    handleReviewMeasurementDetail,
    onSelectChange,
    selectedItemId,
    setSelectedItemId,
    measurementItemList,
    measurementItemTreeData,
    operationLogModalOpen,
    setOperationLogModalOpen,
    operationLogs,
    operationLogLoading,
    handleDeleteOperationLog,
    handleOpenOperationLogModal,
  };
}
