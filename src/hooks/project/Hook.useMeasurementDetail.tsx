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
import _ from "lodash";
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

  const storageKeys = {
    projectId: `measurementDetail_selectedProjectId_${userId}`,
    contractId: `measurementDetail_selectedContractId_${userId}`,
    periodId: `measurementDetail_selectedPeriodId_${userId}`,
  };

  useEffect(() => {
    if (measurementItemTreeData && measurementItemTreeData.length > 0) {
      // 查找“工程清单”父节点
      const materialFolderNode = measurementItemTreeData.find(node => node.key === 'material-folder');
      if (materialFolderNode) {
        setSelectedItem({
          id: undefined,
          type: 'material',
          item: undefined,
        });
      }
    }
  }, [measurementItemTreeData]);

  // 处理项目选择变化
  const handleProjectChange = (value) => {
    setSelectedProjectId(value);
    setSelectedContractId(undefined);
    setSelectedPeriodId(undefined);
    localStorage.setItem(storageKeys.projectId, value);
    localStorage.removeItem(storageKeys.contractId);
    localStorage.removeItem(storageKeys.periodId);
  };

  // 处理合同选择变化
  const handleContractChange = (value) => {
    setSelectedContractId(value);
    setSelectedPeriodId(undefined);
    localStorage.setItem(storageKeys.contractId, value);
    localStorage.removeItem(storageKeys.periodId);
  };

  // 处理周期选择变化
  const handlePeriodChange = (value) => {
    setSelectedPeriodId(value);
    localStorage.setItem(storageKeys.periodId, value);
  };

  // 初始化时从缓存中读取
  useEffect(() => {
    const savedProjectId = localStorage.getItem(storageKeys.projectId);
    const savedContractId = localStorage.getItem(storageKeys.contractId);
    const savedPeriodId = localStorage.getItem(storageKeys.periodId);

    if (savedProjectId) {
      setSelectedProjectId(Number(savedProjectId));
    }
    if (savedContractId) {
      setSelectedContractId(Number(savedContractId));
    }
    if (savedPeriodId) {
      setSelectedPeriodId(Number(savedPeriodId));
    }
  }, [userId]);

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

      // 如果没有缓存的项目ID，自动选择第一个项目
      if (!localStorage.getItem(storageKeys.projectId) && data && data.length > 0) {
        const firstProjectId = data[0].id;
        setSelectedProjectId(firstProjectId);
        localStorage.setItem(storageKeys.projectId, firstProjectId.toString());
      }
    } catch (error: any) {
      console.error('Error fetching project list:', error);
      setProjectList([]);
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
      return;
    }
    try {
      setLoading(true);
      const data = await queryContractInfoList(projectId, userId);
      setContractList(data || []);

      const savedContractId = localStorage.getItem(storageKeys.contractId);
      if (savedContractId && data && data.length > 0) {
        const contractExists = data.some(contract => contract.id === Number(savedContractId));
        if (contractExists) {
          setSelectedContractId(Number(savedContractId));
        } else {
          const firstContractId = data[0].id;
          setSelectedContractId(firstContractId);
          localStorage.setItem(storageKeys.contractId, firstContractId.toString());
        }
      } else if (data && data.length > 0) {
        // 如果没有缓存的合同ID，自动选择第一个合同
        const firstContractId = data[0].id;
        setSelectedContractId(firstContractId);
        localStorage.setItem(storageKeys.contractId, firstContractId.toString());
      } else {
        setSelectedContractId(undefined);
        localStorage.removeItem(storageKeys.contractId);
      }
    } catch (error: any) {
      setContractList([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取周期信息列表
  const fetchPeriodList = async (generalQueryCondition?: string) => {
    if (selectedProjectId === undefined || selectedContractId === undefined) {
      console.warn('selectedProjectId 或 selectedContractId 未定义');
      setPeriodList([]);
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

      const savedPeriodId = localStorage.getItem(storageKeys.periodId);
      if (savedPeriodId && data && data.length > 0) {
        const periodExists = data.some(period => period.id === Number(savedPeriodId));
        if (periodExists) {
          setSelectedPeriodId(Number(savedPeriodId));
        } else {
          const firstPeriodId = data[0].id;
          setSelectedPeriodId(firstPeriodId);
          localStorage.setItem(storageKeys.periodId, firstPeriodId.toString());
        }
      } else if (data && data.length > 0) {
        // 如果没有缓存的周期ID，自动选择第一个周期
        const firstPeriodId = data[0].id;
        setSelectedPeriodId(firstPeriodId);
        localStorage.setItem(storageKeys.periodId, firstPeriodId.toString());
      } else {
        setSelectedPeriodId(undefined);
        localStorage.removeItem(storageKeys.periodId);
      }
    } catch (error: any) {
      console.error('Error fetching period list:', error);
      setPeriodList([]);
      if (error.response && error.response.status !== 404) {
        message.error('获取周期信息列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 当 selectedProjectId 变化时，获取合同列表
  useEffect(() => {
    if (selectedProjectId !== undefined) {
      fetchContractList(selectedProjectId);
    } else {
      setContractList([]);
      setSelectedContractId(undefined);
      localStorage.removeItem(storageKeys.contractId);
      setPeriodList([]);
      setSelectedPeriodId(undefined);
      localStorage.removeItem(storageKeys.periodId);
      setMeasurementDetailList([]);
      setSelectedContract(null);
      updateMeasurementItems(null);
    }
  }, [selectedProjectId]);

  // 当 selectedContractId 变化时，获取周期列表
  useEffect(() => {
    if (selectedContractId !== undefined) {
      fetchPeriodList();
      const contract = contractList.find((c) => c.id === selectedContractId) || null;
      setSelectedContract(contract);
      updateMeasurementItems(contract);
    } else {
      setPeriodList([]);
      setSelectedPeriodId(undefined);
      localStorage.removeItem(storageKeys.periodId);
      setMeasurementDetailList([]);
      setSelectedContract(null);
      updateMeasurementItems(null);
    }
  }, [selectedContractId, contractList]);

  // 当 selectedPeriodId 变化时，获取计量明细列表
  useEffect(() => {
    if (selectedPeriodId !== undefined) {
      fetchMeasurementDetailList();
    } else {
      setMeasurementDetailList([]);
    }
  }, [selectedPeriodId]);

  // 获取计量明细列表
  const fetchMeasurementDetailList = async (generalQueryCondition?: string) => {
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

      let data;
      if (itemId !== undefined) {
        // 如果选中了子项，传递 itemId
        data = await queryMeasurementDetailList(
          selectedProjectId,
          selectedContractId,
          selectedPeriodId,
          itemId,
          type,
          generalQueryCondition,
        );
      } else {
        // 如果未选中子项，获取该类型下的所有数据
        data = await queryMeasurementDetailList(
          selectedProjectId,
          selectedContractId,
          selectedPeriodId,
          null,
          type,
          generalQueryCondition,
        );
      }

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

  // 当 selectedItem 变化时，获取计量明细列表
  useEffect(() => {
    if (selectedPeriodId !== undefined) {
      fetchMeasurementDetailList();
    }
  }, [selectedItem, selectedPeriodId]);

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
        title: '工程清单',
        key: 'material-folder',
        children: materialItems.map((item) => ({
          title: item.itemName || '',
          key: `material-${item.id}`,
          itemId: item.id,
          type: 'material',
          item,
          isLeaf: true,
        })),
      },
      {
        title: '合同费用',
        key: 'cost-folder',
        children: costItems.map((item) => ({
          title: item.itemName || '',
          key: `cost-${item.id}`,
          itemId: item.id,
          type: 'cost',
          item,
          isLeaf: true,
        })),
      },
    ];
  };

  // 处理行选择变化
  const onSelectChange = (newSelectedRowKeys: number[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 其他函数和逻辑保持不变...
  // 您可以将之前的其他函数（如 handleAddOrUpdateMeasurementDetail、handleDeleteMeasurementDetail 等）保留在这里。

  // 初始化加载数据
  useEffect(() => {
    fetchProjectList();
  }, [userId]);


  const generateExcelReport = async (
    costData: MeasurementDetailVO[],
    materialData: MeasurementDetailVO[],
    project: ProjectInfoVO | undefined,
    contract: ContractInfoVO | undefined,
    period: PeriodInfoVO | undefined
  ) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('中间计量统计表');

    // 设置页面方向和纸张大小
    worksheet.pageSetup.orientation = 'landscape';
    worksheet.pageSetup.paperSize = 9; // A4

    // **首先设置列信息**
    worksheet.columns = [
      { header: '序号', key: 'index', width: 8 },
      { header: '测量项', key: 'measurementItem', width: 20 },
      { header: '分项(桩号)', key: 'subItemNumber', width: 15 },
      { header: '部位', key: 'position', width: 15 },
      { header: '单价', key: 'price', width: 10 },
      { header: '单位', key: 'unit', width: 10 },
      { header: '本期计量', key: 'currentCount', width: 12 },
      { header: '总量', key: 'totalCount', width: 12 },
      { header: '本期末累积量', key: 'remainingCount', width: 12 },
      { header: '金额', key: 'currentAmount', width: 12 },
      { header: '设计量', key: 'upperLimitQuantity', width: 12 },
      { header: '状态', key: 'measurementStatus', width: 10 },
      { header: '审核意见', key: 'measurementComment', width: 20 },
    ];

    // 设置全局字体
    workbook.eachSheet(sheet => {
      sheet.eachRow(row => {
        row.font = { name: '微软雅黑' };
      });
    });

    // **使用 currentRow 变量跟踪当前行号**
    let currentRow = 1;

    // 添加标题行（表的名称）
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    const reportTitleCell = worksheet.getCell(`A${currentRow}`);
    reportTitleCell.value = '中间计量统计表';
    reportTitleCell.font = { size: 16, bold: true };
    reportTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    currentRow++;

    // 添加项目名称
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    const projectTitleCell = worksheet.getCell(`A${currentRow}`);
    projectTitleCell.value = project?.name || '项目名称';
    projectTitleCell.font = { size: 14, bold: true };
    projectTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    currentRow++;

    // 添加其他描述信息
    worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
    const contractorCell = worksheet.getCell(`A${currentRow}`);
    contractorCell.value = `施工单位：${contract?.contractor || ''}`;
    contractorCell.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells(`G${currentRow}:J${currentRow}`);
    const periodCell = worksheet.getCell(`G${currentRow}`);
    periodCell.value = `第 ${period?.serialNumber || ''} 期 计 量`;
    periodCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells(`K${currentRow}:M${currentRow}`);
    const contractNumberCell = worksheet.getCell(`K${currentRow}`);
    contractNumberCell.value = `合同号：${contract?.contractSerialNumber || ''}`;
    contractNumberCell.alignment = { vertical: 'middle', horizontal: 'right' };
    currentRow++;

    // 添加监理单位
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    const supervisorCell = worksheet.getCell(`A${currentRow}`);
    supervisorCell.value = `监理单位：${contract?.supervisingOrganization || ''}`;
    supervisorCell.alignment = { vertical: 'middle', horizontal: 'left' };
    currentRow++;

    // 添加空行
    currentRow++;

    // **添加“合同费用”部分**

    // 添加 '合同费用' 标题
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    const costTitleCell = worksheet.getCell(`A${currentRow}`);
    costTitleCell.value = '合同费用';
    costTitleCell.font = { size: 14, bold: true };
    costTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    currentRow++;

    // 添加表头
    let headerRowNumber = currentRow;
    let headerRow = worksheet.getRow(headerRowNumber);
    headerRow.values = worksheet.columns.map(col => col.header);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;
    headerRow.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }, // 灰色背景
      };
    });
    currentRow++;

    // 添加 '合同费用' 数据
    const costDataStartRow = currentRow;
    costData.forEach((item, index) => {
      const measurementItem = measurementItemList.find(mi => mi.id === item.measurementItemId);
      const statusText = item.measurementStatus === 0 ? '未审核' : item.measurementStatus === 1 ? '已审核' : '驳回';
      const rowValues = {
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
      };
      const row = worksheet.addRow(rowValues);
      row.alignment = { vertical: 'middle', horizontal: 'center' };
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      currentRow++;
    });
    const costDataEndRow = worksheet.lastRow.number;

    // 添加 '合同费用' 合计行
    if (costData.length > 0) {
      const totalRow = worksheet.addRow({
        measurementItem: '合计',
        currentCount: { formula: `SUM(G${costDataStartRow}:G${costDataEndRow})` },
        totalCount: { formula: `SUM(H${costDataStartRow}:H${costDataEndRow})` },
        remainingCount: { formula: `SUM(I${costDataStartRow}:I${costDataEndRow})` },
        currentAmount: { formula: `SUM(J${costDataStartRow}:J${costDataEndRow})` },
        upperLimitQuantity: { formula: `SUM(K${costDataStartRow}:K${costDataEndRow})` },
      });
      totalRow.font = { bold: true };
      totalRow.alignment = { vertical: 'middle', horizontal: 'center' };
      totalRow.eachCell(cell => {
        cell.border = {
          top: { style: 'double' },
          left: { style: 'thin' },
          bottom: { style: 'double' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE699' }, // 黄色背景
        };
      });
      currentRow++;
    }

    // 添加空行
    currentRow++;

    // **添加“工程清单”部分**

    // 添加 '工程清单' 标题
    worksheet.mergeCells(`A${currentRow}:M${currentRow}`);
    const materialTitleCell = worksheet.getCell(`A${currentRow}`);
    materialTitleCell.value = '工程清单';
    materialTitleCell.font = { size: 14, bold: true };
    materialTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    currentRow++;

    // 添加表头
    headerRowNumber = currentRow;
    headerRow = worksheet.getRow(headerRowNumber);
    headerRow.values = worksheet.columns.map(col => col.header);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;
    headerRow.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }, // 灰色背景
      };
    });
    currentRow++;

    // 添加 '工程清单' 数据
    const materialDataStartRow = currentRow;
    materialData.forEach((item, index) => {
      const measurementItem = measurementItemList.find(mi => mi.id === item.measurementItemId);
      const statusText = item.measurementStatus === 0 ? '未审核' : item.measurementStatus === 1 ? '已审核' : '驳回';
      const rowValues = {
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
      };
      const row = worksheet.addRow(rowValues);
      row.alignment = { vertical: 'middle', horizontal: 'center' };
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      currentRow++;
    });
    const materialDataEndRow = worksheet.lastRow.number;

    // 添加 '工程清单' 合计行
    if (materialData.length > 0) {
      const totalRow = worksheet.addRow({
        measurementItem: '合计',
        currentCount: { formula: `SUM(G${materialDataStartRow}:G${materialDataEndRow})` },
        totalCount: { formula: `SUM(H${materialDataStartRow}:H${materialDataEndRow})` },
        remainingCount: { formula: `SUM(I${materialDataStartRow}:I${materialDataEndRow})` },
        currentAmount: { formula: `SUM(J${materialDataStartRow}:J${materialDataEndRow})` },
        upperLimitQuantity: { formula: `SUM(K${materialDataStartRow}:K${materialDataEndRow})` },
      });
      totalRow.font = { bold: true };
      totalRow.alignment = { vertical: 'middle', horizontal: 'center' };
      totalRow.eachCell(cell => {
        cell.border = {
          top: { style: 'double' },
          left: { style: 'thin' },
          bottom: { style: 'double' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE699' }, // 黄色背景
        };
      });
      currentRow++;
    }

    // 添加页眉和页脚
    worksheet.headerFooter.oddHeader = '&C&16&"微软雅黑,加粗"中间计量统计表';
    worksheet.headerFooter.oddFooter = '&C第 &P 页  共 &N 页';

    // 设置打印区域
    worksheet.pageSetup.printArea = `A1:M${worksheet.lastRow.number}`;

    // 冻结窗格
    worksheet.views = [{ state: 'frozen', ySplit: 6 }];

    // 生成 Excel 文件并触发下载
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `中间计量统计表-${moment().format('YYYYMMDD')}.xlsx`);
  };

  const handleExportReport = async () => {
    if (!selectedContractId || !selectedPeriodId) {
      message.error('请先选择合同和周期');
      return;
    }
    try {
      setLoading(true);

      // 获取所有计量明细数据
      const costData = await queryMeasurementDetailList(
        selectedProjectId!,
        selectedContractId,
        selectedPeriodId,
        null,    // 不传递 itemId
        'cost',  // 传递 type 为 'cost'
      );

      const materialData = await queryMeasurementDetailList(
        selectedProjectId!,
        selectedContractId,
        selectedPeriodId,
        null,        // 不传递 itemId
        'material',  // 传递 type 为 'material'
      );

      // 获取项目、合同和周期信息
      const project = projectList.find(p => p.id === selectedProjectId);
      const contract = contractList.find(c => c.id === selectedContractId);
      const period = periodList.find(p => p.id === selectedPeriodId);

      // 生成报表，传递项目、合同和周期数据
      await generateExcelReport(costData || [], materialData || [], project, contract, period);
    } catch (error) {
      console.error('导出报表失败:', error);
      message.error('导出报表失败');
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
      message.error(error);
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
      message.error(error);
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

  const handleRemoveAttachment = async (fileUrl: string, measurementDetailId: number) => {
    try {
      // 查找对应的计量明细
      const measurementDetail = measurementDetailList.find(detail => detail.id === measurementDetailId);
      if (!measurementDetail) {
        message.error('未找到对应的计量明细');
        return;
      }

      // 更新 attachmentList
      const updatedAttachmentList = (measurementDetail.attachmentList || []).filter(url => url !== fileUrl);

      // 调用后端 API 更新数据
      await updateMeasurementDetail({
        ...currentMeasurementDetail,
        attachmentList: updatedAttachmentList,
      });

      // 更新本地状态
      const updatedMeasurementDetailList = measurementDetailList.map(detail => {
        if (detail.id === measurementDetailId) {
          return { ...detail, attachmentList: updatedAttachmentList };
        }
        return detail;
      });
      setMeasurementDetailList(updatedMeasurementDetailList);

      // 如果当前编辑的计量明细是被更新的那个，也需要更新它的 attachmentList
      if (currentMeasurementDetail && currentMeasurementDetail.id === measurementDetailId) {
        setCurrentMeasurementDetail({
          ...currentMeasurementDetail,
          attachmentList: updatedAttachmentList,
        });
      }

      message.success('附件删除成功');
    } catch (error) {
      console.error('删除附件失败:', error);
      message.error('附件删除失败');
    }
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
    setCurrentReviewRecord,
    reviewComment,
    setReviewComment,
    handleOpenReviewModal,
    handleSubmitReview,
    handleExportReport,
    handleProjectChange,
    handleContractChange,
    handlePeriodChange,
    fetchContractList,
    handleRemoveAttachment
  };
}
