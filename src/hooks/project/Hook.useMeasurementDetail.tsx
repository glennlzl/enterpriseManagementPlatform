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
import { OperationLogVO } from "@/model/project/Model.operation";
import { deleteOperationLog, queryOperationLogList } from "@/api/project-managerment/Api.operation";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import moment from 'moment';

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

  const [selectedContract, setSelectedContract] = useState<ContractInfoVO | null>(null);
  const [measurementItemList, setMeasurementItemList] = useState<MeasurementItemVO[]>([]);
  const [measurementItemTreeData, setMeasurementItemTreeData] = useState<any[]>([]);

  const [selectedItem, setSelectedItem] = useState<{ id: number; type: string; item: MeasurementItemVO } | undefined>(undefined);
  const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
  const [currentReviewRecord, setCurrentReviewRecord] = useState<MeasurementDetailVO | null>(null);
  const [reviewComment, setReviewComment] = useState<string>('');

  const { initialState } = useModel('@@initialState');
  const userId = initialState?.currentUser?.id;


  // 生成 Excel 报表的函数
  const generateExcelReport = async (data: MeasurementDetailVO[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('计量支付汇总报表');

    // 设置列
    worksheet.columns = [
      { header: '序号', key: 'index', width: 8 },
      { header: '测量项', key: 'measurementItem', width: 20 },
      { header: '分项(桩号)', key: 'subItemNumber', width: 15 },
      { header: '部位', key: 'position', width: 15 },
      { header: '单价', key: 'price', width: 10 },
      { header: '单位', key: 'unit', width: 10 },
      { header: '本期计量', key: 'currentCount', width: 12 },
      { header: '总量', key: 'totalCount', width: 12 },
      { header: '本期余量', key: 'remainingCount', width: 12 },
      { header: '金额', key: 'currentAmount', width: 12 },
      { header: '上限量', key: 'upperLimitQuantity', width: 12 },
      { header: '状态', key: 'measurementStatus', width: 10 },
      { header: '审核意见', key: 'measurementComment', width: 20 },
    ];

    // 添加标题
    worksheet.mergeCells('A1:M1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '计量支付汇总报表';
    titleCell.font = { size: 18, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // 添加日期
    worksheet.mergeCells('A2:M2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `日期：${moment().format('YYYY年MM月DD日')}`;
    dateCell.alignment = { vertical: 'middle', horizontal: 'right' };

    // 添加表头
    const headerRow = worksheet.getRow(4);
    headerRow.values = worksheet.columns.map((col) => col.header);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;

    // 设置表头样式
    worksheet.columns.forEach((column) => {
      column.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 添加数据
    data.forEach((item, index) => {
      const measurementItem = measurementItemList.find((mi) => mi.id === item.measurementItemId);
      const statusText = item.measurementStatus === 0 ? '未审核' : item.measurementStatus === 1 ? '已审核' : '驳回';
      worksheet.addRow({
        index: index + 1,
        measurementItem: measurementItem?.itemName || '',
        subItemNumber: item.subItemNumber || '',
        position: item.position || '',
        price: item.price || 0,
        unit: item.unit || '',
        currentCount: item.currentCount || 0,
        totalCount: item.totalCount || 0,
        remainingCount: item.remainingCount || 0,
        currentAmount: item.currentAmount || 0,
        upperLimitQuantity: item.upperLimitQuantity || 0,
        measurementStatus: statusText,
        measurementComment: item.measurementComment || '',
      });
    });

    // 添加边框和样式
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 4) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      }
    });

    // 生成 Excel 文件并触发下载
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `计量支付汇总报表-${moment().format('YYYYMMDD')}.xlsx`);
  };

  const handleExportReport = async () => {
    if (!selectedContractId || !selectedPeriodId) {
      message.error('请先选择合同和周期');
      return;
    }
    try {
      setLoading(true);

      // 获取当前合同和周期下的计量明细数据
      const data = await queryMeasurementDetailList(
        selectedProjectId!,
        selectedContractId,
        selectedPeriodId,
        selectedItem?.id,
        selectedItem?.type,
      );

      // 生成报表
      await generateExcelReport(data || []);
    } catch (error) {
      console.error('导出报表失败:', error);
      message.error('导出报表失败');
    } finally {
      setLoading(false);
    }
  };

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
      const itemId = selectedItem?.id;
      const type = selectedItem?.type;
      console.log('Fetching measurement detail list with:', {
        selectedProjectId,
        selectedContractId,
        selectedPeriodId,
        itemId,
        type,
        generalQueryCondition,
      });
      const data = await queryMeasurementDetailList(
        selectedProjectId,
        selectedContractId,
        selectedPeriodId,
        itemId,
        type,
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

  const handleOpenReviewModal = (record: MeasurementDetailVO) => {
    setCurrentReviewRecord(record);
    setReviewComment(''); // 重置审核意见
    setReviewModalVisible(true);
  };

  // 修改 handleReviewMeasurementDetail 函数，增加 comment 参数
  const handleReviewMeasurementDetail = async (id: number, status: number, comment: string) => {
    if (!id) {
      message.error('计量明细ID缺失');
      return;
    }
    try {
      setLoading(true);
      const reviewData: ReviewRequest = {
        id,
        isPass: status === 1,
        comment, // 添加审核意见
      };
      await reviewMeasurementDetail(reviewData);
      // 审核完成后不需要再次调用 fetchMeasurementDetailList，因为在 handleSubmitReview 中已经调用
    } catch (error: any) {
      console.error('Error reviewing measurement detail:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理审核提交的函数
  const handleSubmitReview = async (status: number) => {
    if (!currentReviewRecord) {
      message.error('未选择计量明细');
      return;
    }
    try {
      await handleReviewMeasurementDetail(currentReviewRecord.id!, status, reviewComment);
      setReviewModalVisible(false);
      await fetchMeasurementDetailList();
      message.success(status === 1 ? '审核成功' : '驳回成功');
    } catch (error) {
      message.error('操作失败');
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
    if (selectedItem === undefined) {
      message.error('请选择一个测量项');
      return;
    }
    try {
      setLoading(true);
      const measurementData = {
        ...currentMeasurementDetail,
        ...values,
        measurementItemId: selectedItem.id,
        measurementType: selectedItem.type,
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
      fetchMeasurementDetailList();
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
      fetchMeasurementDetailList();
    } catch (error: any) {
      console.error('Error deleting measurement detail:', error);
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新测量项列表和树形数据
  const updateMeasurementItems = (contract: ContractInfoVO | null) => {
    if (contract) {
      const costItems = contract.contractCost || [];
      const materialItems = contract.projectSchedule || [];
      const allItems = [...costItems, ...materialItems];
      setMeasurementItemList(allItems);
      const treeData = generateTreeData(costItems, materialItems);
      setMeasurementItemTreeData(treeData);
    } else {
      setMeasurementItemList([]);
      setMeasurementItemTreeData([]);
    }
  };

  // 生成树形数据的函数
  const generateTreeData = (costItems: MeasurementItemVO[], materialItems: MeasurementItemVO[]): any[] => {
    return [
      {
        title: '合同成本',
        key: 'cost-folder',
        selectable: false,
        children: costItems.map((item) => ({
          title: item.itemName || '',
          key: `cost-${item.id}`,
          itemId: item.id,
          type: 'cost',
          item,
          isLeaf: true,
        })),
      },
      {
        title: '项目进度',
        key: 'material-folder',
        selectable: false,
        children: materialItems.map((item) => ({
          title: item.itemName || '',
          key: `material-${item.id}`,
          itemId: item.id,
          type: 'material',
          item,
          isLeaf: true,
        })),
      },
    ];
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
      fetchMeasurementDetailList();
    } else {
      setMeasurementDetailList([]);
    }
  }, [selectedPeriodId]);

  // 当 selectedItem 变化时，获取计量明细列表
  useEffect(() => {
    if (selectedPeriodId !== undefined) {
      fetchMeasurementDetailList();
    }
  }, [selectedItem, selectedPeriodId]);

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
    selectedItem,
    setSelectedItem,
    measurementItemList,
    measurementItemTreeData,
    operationLogModalOpen,
    setOperationLogModalOpen,
    operationLogs,
    operationLogLoading,
    handleDeleteOperationLog,
    handleOpenOperationLogModal,
    reviewModalVisible,
    setReviewModalVisible,
    currentReviewRecord,
    reviewComment,
    setReviewComment,
    handleOpenReviewModal,
    handleSubmitReview,
    handleExportReport
  };
}
