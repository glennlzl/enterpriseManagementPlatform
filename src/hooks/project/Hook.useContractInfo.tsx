import { useState, useRef } from 'react';
import { message } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import { Parser } from 'json2csv';
import {
  addContractInfo,
  deleteContractInfo,
  queryContractInfoList,
  updateContractInfo
} from "@/api/project-managerment/Api.contract";
import {useModel} from "@@/exports";
import {AddOrUpdateContractInfoRequest, ContractInfoVO} from "@/model/project/Model.contract";
import {EmployeeSimpleInfoResponse} from "@/api/usermanagement";

export function useContractInfo() {
  const [contractList, setContractList] = useState<ContractInfoVO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const actionRef = useRef<ActionType>();

  const { initialState } = useModel('@@initialState');
  const userId = initialState?.currentUser?.id;
  const fetchContractList = async (
    projectId?: number,
    generalQueryCondition?: string,
  ) => {
    setLoading(true);
    try {
      const data = await queryContractInfoList(projectId!, userId, generalQueryCondition);
      setContractList(data || []);
    } catch (error) {
      setContractList([]);
    } finally {
      setLoading(false);
    }
  };

  // 添加合同
  const handleAddContract = async (contractData: AddOrUpdateContractInfoRequest) => {
    try {
      await addContractInfo(contractData);
      message.success('添加合同成功');
      await fetchContractList(contractData.relatedProjectId);
    } catch (error) {
      message.error('添加合同失败');
    }
  };

  // 更新合同
  const handleUpdateContract = async (contractData: AddOrUpdateContractInfoRequest) => {
    try {
      await updateContractInfo(contractData);
      message.success('更新合同成功');
      await fetchContractList(contractData.relatedProjectId);
    } catch (error) {
      message.error('更新合同失败');
    }
  };

  // 删除合同
  const handleDeleteContract = async (id: number) => {
    try {
      await deleteContractInfo(id);
      message.success('删除合同成功');
      await fetchContractList();
    } catch (error) {
      message.error('删除合同失败');
    }
  };


  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的合同');
      return;
    }
    try {
      for (const id of selectedRowKeys) {
        await deleteContractInfo(id);
      }
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      await fetchContractList();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 批量导出
  const handleBatchExport = () => {
    const selectedData = contractList.filter((item) => selectedRowKeys.includes(item.id!));
    if (selectedData.length > 0) {
      const fields = [
        { label: 'ID', value: 'id' },
        { label: '合同名称', value: 'name' },
        { label: '合同编号', value: 'contractSerialNumber' },
        { label: '合同类型', value: 'type' },
        { label: '承包商', value: 'contractor' },
        { label: '合同金额', value: 'contractAmount' },
        { label: '开始日期', value: 'startDate' },
        { label: '结束日期', value: 'endDate' },
        { label: '合同序号', value: 'contractOrder' },
        { label: '合同内容', value: 'extend' },
        { label: '合同临时价格', value: 'contractProvisionalPrice' },
        { label: '合同期限类型', value: 'contractTermType' },
        { label: '监理单位', value: 'supervisingOrganization' },
        { label: '监测单位', value: 'monitoringOrganization' },
        { label: '咨询单位', value: 'consultingOrganization' },
        { label: '账户名称', value: 'accountName' },
        { label: '开户行', value: 'accountBank' },
        { label: '账号', value: 'accountNumber' },
        { label: '财务负责人', value: 'financialResponsiblePerson' },
        { label: '财务负责人ID', value: 'financialResponsiblePersonId' },
        { label: '财务负责人电话', value: 'financialResponsiblePersonMobile' },
        { label: '关联项目ID', value: 'relatedProjectId' },
        { label: '项目进度', value: 'projectSchedule' },
        { label: '合同成本', value: 'contractCost' },
        { label: '管理员列表', value: 'adminList' },
        { label: '附件列表', value: 'attachmentList' },
        { label: '更新时间', value: 'updateTime' },
        { label: '创建时间', value: 'createTime' },
      ];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(selectedData);

      // 创建下载链接并触发下载
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '合同列表.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      message.warning('请先选择要导出的合同');
    }
  };

  // 处理行选择变化
  const onSelectChange = (newSelectedRowKeys: number[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 刷新表格数据
  const reloadData = async (projectId?: number, generalQueryCondition?: string) => {
    await fetchContractList(projectId, generalQueryCondition);
  };

  // 授权合同
  const handleAuthorizeContract = async (
    contract: ContractInfoVO,
    selectedAdmins: EmployeeSimpleInfoResponse[],
  ) => {
    try {
      const updatedContract = { ...contract, adminList: selectedAdmins };
      await handleUpdateContract(updatedContract as any);
      message.success('授权成功');
    } catch (error) {
      message.error('授权失败');
    }
  };

  return {
    contractList,
    loading,
    fetchContractList,
    handleAddContract,
    handleUpdateContract,
    handleDeleteContract,
    handleBatchDelete,
    handleBatchExport,
    handleAuthorizeContract,
    selectedRowKeys,
    setSelectedRowKeys,
    onSelectChange,
    reloadData,
    actionRef
  };
}
