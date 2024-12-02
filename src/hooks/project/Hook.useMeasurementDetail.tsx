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
  reviewMeasurementDetail, queryMeasurementDetailExcelDataList,
} from '@/api/project-managerment/Api.measurement-detail';
import {
  MeasurementDetailVO,
  AddOrUpdateMeasurementDetailRequest,
  ReviewRequest, MeasurementExcelVO,
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
      setProjectList([]);
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

  // 初始化加载数据
  useEffect(() => {
    fetchProjectList();
  }, [userId]);

  const generateCoverSheet = (
    sheet: ExcelJS.Worksheet,
    project: ProjectInfoVO | undefined,
    contract: ContractInfoVO | undefined,
    period: PeriodInfoVO | undefined
  ) => {
    let rowNumber = 1;

    // **第一行：项目名称**
    sheet.mergeCells(`B${rowNumber}:H${rowNumber}`);
    const projectNameCell = sheet.getCell(`B${rowNumber}`);
    projectNameCell.value = project?.name || '待定';
    projectNameCell.font = { name: '微软雅黑', size: 25, bold: true };
    projectNameCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(rowNumber).height = 60; // 增加行高以突出标题
    rowNumber += 6; // 留出足够空行，使项目名称和报表标题分隔开

    // **中期支付报表标题**
    sheet.mergeCells(`B${rowNumber}:H${rowNumber}`);
    const reportTitleCell = sheet.getCell(`B${rowNumber}`);
    reportTitleCell.value = '中   期   支   付   报   表';
    reportTitleCell.font = { name: '微软雅黑', size: 36, bold: true };  // 增加字体大小到36
    reportTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(rowNumber).height = 100; // 增加行高以突出标题
    rowNumber += 3; // 留出更多空行

    // **承包人**
    sheet.mergeCells(`B${rowNumber}:D${rowNumber}`);
    const contractorCell = sheet.getCell(`B${rowNumber}`);
    contractorCell.value = `承包人：  ${contract?.contractor || '广西丰意建设工程有限公司'}`;
    contractorCell.font = { name: '微软雅黑', size: 16 };
    contractorCell.alignment = { vertical: 'middle', horizontal: 'left' };
    rowNumber += 2; // 留出空行

    // **监理人**
    sheet.mergeCells(`B${rowNumber}:D${rowNumber}`);
    const supervisorCell = sheet.getCell(`B${rowNumber}`);
    supervisorCell.value = `监理人：  ${contract?.supervisingOrganization || ''}`;
    supervisorCell.font = { name: '微软雅黑', size: 16 };
    supervisorCell.alignment = { vertical: 'middle', horizontal: 'left' };
    rowNumber += 2; // 留出空行

    // **发包人**
    sheet.mergeCells(`B${rowNumber}:H${rowNumber}`);
    const employerCell = sheet.getCell(`B${rowNumber}`);
    employerCell.value = `发包人：  ${contract?.employer || '待定'}`;
    employerCell.font = { name: '微软雅黑', size: 16 };
    employerCell.alignment = { vertical: 'middle', horizontal: 'left' };
    rowNumber += 2; // 留出空行

    // **日期**
    sheet.mergeCells(`B${rowNumber}:D${rowNumber}`);
    const dateCell = sheet.getCell(`B${rowNumber}`);
    const currentDate = new Date();
    dateCell.value = `日    期：  ${currentDate.getFullYear()}年  ${currentDate.getMonth() + 1}月  ${currentDate.getDate()}日`;
    dateCell.font = { name: '微软雅黑', size: 16 };
    dateCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // **调整列宽**
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach((col, index) => {
      sheet.getColumn(col).width = [5, 15, 20, 20, 20, 20, 20, 20, 5][index];
    });

    // **设置行高**
    for (let i = 1; i <= rowNumber; i++) {
      if (i !== 7 && i !== 1) {
        sheet.getRow(i).height = 25; // 对于其他行使用标准高度
      }
    }

    // **使内容在页面中垂直居中**
    sheet.pageSetup.verticalCentered = true;
  };


// **生成数据工作表的函数**
  const generateDataSheet = (
    sheet: ExcelJS.Worksheet,
    data: MeasurementExcelVO[],
    project: ProjectInfoVO | undefined,
    contract: ContractInfoVO | undefined,
    period: PeriodInfoVO | undefined
  ) => {
    // 设置页面方向和纸张大小
    sheet.pageSetup.orientation = 'landscape';
    sheet.pageSetup.paperSize = 9; // A4

    // 定义列的宽度
    const columnWidths = [15, 10, 10, 10, 10, 10, 15, 15, 15, 15, 15, 15, 20];

    // 设置列宽
    sheet.columns = new Array(13).fill(null).map((_, index) => ({
      width: columnWidths[index] || 15,
    }));

    let rowNumber = 1;

    // **标题部分**
    sheet.mergeCells(`A${rowNumber}:M${rowNumber}`);
    const projectTitleCell = sheet.getCell(`A${rowNumber}`);
    projectTitleCell.value = project?.name || '';
    projectTitleCell.font = { name: '微软雅黑', size: 14, bold: true }; // 调小字体
    projectTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(rowNumber).height = 30; // 设置行高为30
    rowNumber++;

    // **中期支付汇总表标题**
    sheet.mergeCells(`A${rowNumber}:M${rowNumber}`);
    const reportTitleCell = sheet.getCell(`A${rowNumber}`);
    reportTitleCell.value = '中期支付汇总表';
    reportTitleCell.font = { name: '微软雅黑', size: 16, bold: true }; // 调小字体
    reportTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(rowNumber).height = 30; // 设置行高为30
    rowNumber += 2; // 留出空行

    // **期数信息：第几次支付**
    sheet.mergeCells(`A${rowNumber}:B${rowNumber}`);
    const periodInfoCell = sheet.getCell(`A${rowNumber}`);
    periodInfoCell.value = `第 ${period?.serialNumber || '1'} 次支付`;
    periodInfoCell.font = { name: '微软雅黑', size: 10 }; // 调小字体
    periodInfoCell.alignment = { vertical: 'middle', horizontal: 'left' };

    sheet.mergeCells(`K${rowNumber}:M${rowNumber}`);
    const amountUnitCell = sheet.getCell(`K${rowNumber}`);
    amountUnitCell.value = '金额单位：人民币元';
    amountUnitCell.font = { name: '微软雅黑', size: 10 }; // 调小字体
    amountUnitCell.alignment = { vertical: 'middle', horizontal: 'right' };
    sheet.getRow(rowNumber).height = 30; // 设置行高为30
    rowNumber += 2; // 留出空行

    // **承包人、监理人和发包人信息**
    const infoLabels = [
      `承包人： ${contract?.contractor || '广西丰意建设工程有限公司'}`,
      `监理人： ${contract?.supervisingOrganization || ''}`,
      `发包人： ${project?.constructionOrganization || ''}`,
    ];

    infoLabels.forEach((label) => {
      sheet.mergeCells(`A${rowNumber}:M${rowNumber}`);
      const cell = sheet.getCell(`A${rowNumber}`);
      cell.value = label;
      cell.font = { name: '微软雅黑', size: 10 }; // 调小字体
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      sheet.getRow(rowNumber).height = 30; // 设置行高为30
      rowNumber++;
    });

    // **申请日期**
    sheet.mergeCells(`A${rowNumber}:M${rowNumber}`);
    const dateCell = sheet.getCell(`A${rowNumber}`);
    const currentDate = new Date();
    dateCell.value = `申请日期：${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
    dateCell.font = { name: '微软雅黑', size: 10 }; // 调小字体
    dateCell.alignment = { vertical: 'middle', horizontal: 'left' };
    sheet.getRow(rowNumber).height = 30; // 设置行高为30
    rowNumber++;

    rowNumber += 1; // 留出空行

    // **表头部分**

    // 第一行表头
    const headerRow1 = sheet.getRow(rowNumber);
    headerRow1.height = 30;
    headerRow1.font = { name: '微软雅黑', size: 10, bold: true };
    headerRow1.alignment = { vertical: 'middle', horizontal: 'center' };

    sheet.mergeCells(`A${rowNumber}:A${rowNumber + 1}`); // 支付编号
    sheet.mergeCells(`B${rowNumber}:D${rowNumber}`); // 项目名称
    sheet.mergeCells(`E${rowNumber}:E${rowNumber + 1}`); // 单位
    sheet.mergeCells(`F${rowNumber}:F${rowNumber + 1}`); // 单价

    sheet.mergeCells(`G${rowNumber}:I${rowNumber}`); // 数量
    sheet.mergeCells(`J${rowNumber}:L${rowNumber}`); // 金额

    sheet.mergeCells(`M${rowNumber}:M${rowNumber + 1}`); // 备注

    headerRow1.getCell('A').value = '支付编号';
    headerRow1.getCell('B').value = '项目名称';
    headerRow1.getCell('E').value = '单位';
    headerRow1.getCell('F').value = '单价';
    headerRow1.getCell('G').value = '数量';
    headerRow1.getCell('J').value = '金额';
    headerRow1.getCell('M').value = '备注';

    // 设置边框和填充
    headerRow1.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' },
      };
    });

    rowNumber++;

    // 第二行表头（子标题）
    const headerRow2 = sheet.getRow(rowNumber);
    headerRow2.height = 30;
    headerRow2.font = { name: '微软雅黑', size: 10, bold: true };
    headerRow2.alignment = { vertical: 'middle', horizontal: 'center' };

    // 项目名称下的子标题
    headerRow2.getCell('B').value = '桩号';
    headerRow2.getCell('C').value = '位置';
    headerRow2.getCell('D').value = '名称';

    // 数量的子标题
    headerRow2.getCell('G').value = '上期计量';
    headerRow2.getCell('H').value = '本期计量';
    headerRow2.getCell('I').value = '累计计量';

    // 金额的子标题
    headerRow2.getCell('J').value = '上期计量';
    headerRow2.getCell('K').value = '本期计量';
    headerRow2.getCell('L').value = '累计计量';

    // 设置边框和填充
    headerRow2.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' },
      };
    });

    rowNumber++;

    // **添加数据行**

    data.forEach((item) => {
      // **父项行**
      const parentRow = sheet.getRow(rowNumber);
      parentRow.height = 30;
      parentRow.font = { name: '微软雅黑', size: 10, bold: true }; // 父项使用加粗字体
      parentRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // 合并父项的 B、C、D 列
      sheet.mergeCells(`B${rowNumber}:D${rowNumber}`);
      parentRow.getCell('B').value = item.name || ''; // 父项名称

      // 计算父项的合计值
      const lastQuantity = item.lastCount || 0;
      const currentQuantity = item.currentCount || 0;
      const totalQuantity = item.totalCount || 0;

      const lastAmount = item.lastAmount || 0;
      const currentAmount = item.currentAmount || 0;
      const totalAmount = item.totalAmount || 0;

      // 设置父项单元格值
      parentRow.getCell('A').value = ''; // 支付编号留空
      parentRow.getCell('E').value = item.unit || ''; // 单位
      parentRow.getCell('F').value = item.price || 0; // 单价

      parentRow.getCell('G').value = lastQuantity; // 上期计量（数量）
      parentRow.getCell('H').value = currentQuantity; // 本期计量（数量）
      parentRow.getCell('I').value = totalQuantity; // 累计计量（数量）

      parentRow.getCell('J').value = lastAmount; // 上期计量（金额）
      parentRow.getCell('K').value = currentAmount; // 本期计量（金额）
      parentRow.getCell('L').value = totalAmount; // 累计计量（金额）

      parentRow.getCell('M').value = item.measurementComment || ''; // 备注

      // 设置边框
      parentRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        // 父项行使用填充颜色，突出显示
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEFEFEF' }, // 淡灰色背景
        };
      });

      rowNumber++;

      // **子项行**
      item.subItems.forEach((subItem) => {
        const row = sheet.getRow(rowNumber);
        row.height = 30;
        row.font = { name: '微软雅黑', size: 10 };
        row.alignment = { vertical: 'middle', horizontal: 'center' };

        // 金额计算：单价 * 数量
        const lastQuantity = subItem.lastCount || 0;
        const currentQuantity = subItem.currentCount || 0;
        const totalQuantity = subItem.totalCount || 0;

        const unitPrice = item.price || 0; // 单价从父级获取

        const lastAmount = subItem.lastAmount || unitPrice * lastQuantity;
        const currentAmount = subItem.currentAmount || unitPrice * currentQuantity;
        const totalAmount = subItem.totalAmount || unitPrice * totalQuantity;

        // 设置单元格值
        row.getCell('A').value = subItem.measurementBillNumber || ''; // 支付编号
        row.getCell('B').value = subItem.subItemNumber || ''; // 子项编号
        row.getCell('C').value = subItem.position || ''; // 位置
        row.getCell('D').value = subItem.name || ''; // 名称
        row.getCell('E').value = item.unit || ''; // 单位（与父项相同）
        row.getCell('F').value = unitPrice; // 单价

        row.getCell('G').value = lastQuantity; // 上期计量（数量）
        row.getCell('H').value = currentQuantity; // 本期计量（数量）
        row.getCell('I').value = totalQuantity; // 累计计量（数量）

        row.getCell('J').value = lastAmount; // 上期计量（金额）
        row.getCell('K').value = currentAmount; // 本期计量（金额）
        row.getCell('L').value = totalAmount; // 累计计量（金额）

        row.getCell('M').value = subItem.measurementComment || ''; // 备注

        // 设置边框
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          // 子项名称缩进（可选）
          if (colNumber === 2 || colNumber === 3 || colNumber === 4) {
            cell.alignment = {
              vertical: 'middle',
              horizontal: 'left',
            };
          }
        });

        rowNumber++;
      });
    });


    // // **添加合计行**
    // const totalRow = sheet.getRow(rowNumber);
    // totalRow.height = 30;
    // totalRow.font = { name: '微软雅黑', size: 10, bold: true };
    // totalRow.alignment = { vertical: 'middle', horizontal: 'center' };
    //
    // totalRow.getCell('A').value = '合计';
    //
    // totalRow.getCell('E').value = {
    //   formula: `SUM(E${headerRow2.number + 1}:E${rowNumber - 1})`,
    // };
    // totalRow.getCell('F').value = {
    //   formula: `SUM(F${headerRow2.number + 1}:F${rowNumber - 1})`,
    // };
    // totalRow.getCell('G').value = {
    //   formula: `SUM(G${headerRow2.number + 1}:G${rowNumber - 1})`,
    // };
    //
    // totalRow.getCell('H').value = {
    //   formula: `SUM(H${headerRow2.number + 1}:H${rowNumber - 1})`,
    // };
    // totalRow.getCell('I').value = {
    //   formula: `SUM(I${headerRow2.number + 1}:I${rowNumber - 1})`,
    // };
    // totalRow.getCell('J').value = {
    //   formula: `SUM(J${headerRow2.number + 1}:J${rowNumber - 1})`,
    // };
    //
    // // 设置边框
    // totalRow.eachCell((cell) => {
    //   cell.border = {
    //     top: { style: 'thin' },
    //     left: { style: 'thin' },
    //     bottom: { style: 'thin' },
    //     right: { style: 'thin' },
    //   };
    // });

    rowNumber++;

    // **签名部分**
    rowNumber += 2; // 留出空行

    const signatureRows = [
      [
        { label: '承包人项目总工：', startCol: 'A', endCol: 'C' },
        { label: '承包人项目经理：', startCol: 'D', endCol: 'F' },
        { label: '总监办计量工程师：', startCol: 'G', endCol: 'I' },
      ],
      [
        { label: '建设办计量工程师：', startCol: 'A', endCol: 'C' },
        { label: '建设办计划合同部：', startCol: 'D', endCol: 'F' },
        { label: '建设办质量安全部：', startCol: 'G', endCol: 'I' },
      ],
    ];

    signatureRows.forEach((rowCells) => {
      rowCells.forEach(({ label, startCol, endCol }) => {
        sheet.mergeCells(`${startCol}${rowNumber}:${endCol}${rowNumber}`);
        const cell = sheet.getCell(`${startCol}${rowNumber}`);
        cell.value = label;
        cell.font = { name: '微软雅黑', size: 10 }; // 调小字体
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
      sheet.getRow(rowNumber).height = 40; // 设置行高为30
      rowNumber++;
    });

    // **设置打印区域和页眉页脚**
    sheet.headerFooter.oddHeader = '&C&16&"微软雅黑,加粗"中期支付汇总表';
    sheet.headerFooter.oddFooter = '&C第 &P 页  共 &N 页';
    sheet.pageSetup.printArea = `A1:K${sheet.lastRow.number}`;

    // 冻结窗格在表头行下面
    sheet.views = [{ state: 'frozen', ySplit: headerRow2.number }];

    // 设置列宽
    sheet.columns.forEach((column, index) => {
      column.width = columnWidths[index] || 15;
    });
  };


  const handleExportReport = async () => {
    if (!selectedContractId || !selectedProjectId) {
      message.error('请先选择项目和合同');
      return;
    }
    if (!selectedPeriodId) {
      message.error('请先选择一个周期');
      return;
    }
    try {
      setLoading(true);

      // 创建一个新的工作簿
      const workbook = new ExcelJS.Workbook();

      // 获取项目、合同信息
      const project = projectList.find(p => p.id === selectedProjectId);
      const contract = contractList.find(c => c.id === selectedContractId);

      // 添加封面页工作表
      const coverSheet = workbook.addWorksheet('封面');
      generateCoverSheet(coverSheet, project, contract, null); // period 传 null

      // 获取当前选择的周期
      const period = periodList.find(p => p.id === selectedPeriodId);

      if (!period) {
        message.error('未找到所选的周期信息');
        return;
      }

      // 获取当前周期的计量明细数据
      const data = await queryMeasurementDetailExcelDataList(
        selectedProjectId!,
        selectedContractId,
        period.id,
      );

      // 创建一个新的工作表，名称为周期名称或序号
      const sheetName = period.name || `第${period.serialNumber || ''}期`;
      const sheet = workbook.addWorksheet(sheetName);

      // 生成数据工作表
      generateDataSheet(sheet, data || [], project, contract, period);

      // 生成 Excel 文件并触发下载
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, `中间计量统计表-${moment().format('YYYYMMDD')}.xlsx`);
      message.success('导出成功');
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
