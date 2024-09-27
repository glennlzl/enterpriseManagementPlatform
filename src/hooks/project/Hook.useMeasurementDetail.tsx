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
import { ContractInfoVO } from '@/model/project/Model.contract';
import { PeriodInfoVO } from '@/model/project/Model.period';

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

  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined);

  const { initialState } = useModel('@@initialState');
  const userId = initialState?.currentUser?.id;

  // 获取项目列表
  const fetchProjectList = async () => {
    try {
      const data = await queryProjectInfoList(userId);
      setProjectList(data || []);
      if (data && data.length > 0) {
        setSelectedProjectId(data[0].id);
      }
    } catch (error) {
      message.error('获取项目列表失败');
    }
  };

  // 获取合同列表
  const fetchContractList = async (projectId: number) => {
    try {
      const data = await queryContractInfoList(projectId, userId);
      setContractList(data || []);
      if (data && data.length > 0) {
        setSelectedContractId(data[0].id);
      } else {
        setSelectedContractId(undefined);
        setPeriodList([]);
        setSelectedPeriodId(undefined);
      }
    } catch (error) {
      message.error('获取合同列表失败');
    }
  };

  // 获取周期信息列表
  const fetchPeriodList = async (generalQueryCondition?: string) => {
    if (selectedProjectId === undefined || selectedContractId === undefined) {
      return;
    }
    setLoading(true);
    try {
      const data = await queryPeriodInfoList(
        selectedProjectId,
        selectedContractId,
        generalQueryCondition,
      );
      setPeriodList(data || []);
      if (data && data.length > 0) {
        setSelectedPeriodId(data[0].id);
      } else {
        setSelectedPeriodId(undefined);
      }
    } catch (error) {
      // 错误处理
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
      return;
    }
    setLoading(true);
    try {
      const data = await queryMeasurementDetailList(
        selectedProjectId,
        selectedContractId,
        selectedPeriodId,
        itemId,
        '1', // 根据需要调整 type 参数
        generalQueryCondition,
      );
      setMeasurementDetailList(data || []);
    } catch (error) {
      // 错误处理
    } finally {
      setLoading(false);
    }
  };

  // 添加或更新计量明细
  const handleAddOrUpdateMeasurementDetail = async (
    values: AddOrUpdateMeasurementDetailRequest,
  ) => {
    try {
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
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 删除计量明细
  const handleDeleteMeasurementDetail = async (id: number) => {
    try {
      await deleteMeasurementDetail(id);
      message.success('删除计量明细成功');
      fetchMeasurementDetailList(undefined, selectedItemId);
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 审核或驳回计量明细
  const handleReviewMeasurementDetail = async (id: number, status: number) => {
    try {
      const reviewData: ReviewRequest = {
        id,
        isPass: status === 1,
      };
      await reviewMeasurementDetail(reviewData);
      message.success(status === 1 ? '审核成功' : '驳回成功');
      fetchMeasurementDetailList(undefined, selectedItemId);
    } catch (error) {
      message.error('操作失败');
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
    }
  }, [selectedProjectId]);

  // 当选择合同时，获取对应的周期列表
  useEffect(() => {
    if (selectedContractId !== undefined) {
      fetchPeriodList();
    }
  }, [selectedContractId]);

  // 当选择周期时，获取对应的计量明细列表
  useEffect(() => {
    fetchMeasurementDetailList(undefined, selectedItemId);
  }, [selectedPeriodId]);

  // 当 selectedItemId 变化时，获取计量明细列表
  useEffect(() => {
    fetchMeasurementDetailList(undefined, selectedItemId);
  }, [selectedItemId]);

  // 处理行选择变化
  const onSelectChange = (newSelectedRowKeys: number[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
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
  };
}
