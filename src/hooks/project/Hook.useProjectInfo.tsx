// useProjectInfo.ts
import { useState, useEffect, useRef } from 'react';

import { message } from 'antd';
import { ActionType } from '@ant-design/pro-components';
import { Parser } from 'json2csv';
import {AddOrUpdateProjectInfoRequest, ProjectInfoVO} from "@/model/project/Modal.project";
import {
  addProjectInfo,
  deleteProjectInfo, queryProjectInfoList,
  updateProjectInfo
} from "@/api/project-managerment/Api.project";
import {useModel} from "@@/exports";
import {EmployeeSimpleInfoResponse} from "@/api/usermanagement";

export function useProjectInfo() {
  const { initialState } = useModel('@@initialState');
  // 检查用户是否已登录，如果未登录，返回 null 或者空组件
  if (!initialState?.currentUser) {
    return null; // 或者返回一个 loading 状态，或者重定向到登录页面
  }
  const [projectList, setProjectList] = useState<ProjectInfoVO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const actionRef = useRef<ActionType>();
  const userId = initialState.currentUser.id;

  // 获取项目列表
  const fetchProjectList = async (generalQueryCondition?: string) => {
    setLoading(true);
    try {
      const data = await queryProjectInfoList(initialState.currentUser?.id || '', generalQueryCondition);
      setProjectList(data || []);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  // 添加项目
  const handleAddProject = async (projectData: AddOrUpdateProjectInfoRequest) => {
    try {
      await addProjectInfo(projectData);
      message.success('添加项目成功');
      await fetchProjectList(initialState.currentUser?.id || '');
    } catch (error) {
      message.error(error);
    }
  };

  // 更新项目
  const handleUpdateProject = async (projectData: AddOrUpdateProjectInfoRequest) => {
    try {
      await updateProjectInfo(projectData);
      message.success('更新项目成功');
      await fetchProjectList();
    } catch (error) {
      message.error(error);
    }
  };

  const handleAuthorizeProject = async (
    project: ProjectInfoVO,
    selectedAdmins: EmployeeSimpleInfoResponse[],
  ) => {
    try {
      const updatedProject = { ...project, adminList: selectedAdmins };
      await handleUpdateProject(updatedProject as AddOrUpdateProjectInfoRequest);
      message.success('授权成功');
    } catch (error) {
      message.error('授权失败');
    }
  };

  // 删除项目
  const handleDeleteProject = async (id: number) => {
    try {
      await deleteProjectInfo(id);
      message.success('删除项目成功');
      await fetchProjectList();
    } catch (error) {
      message.error(error);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的项目');
      return;
    }
    try {
      for (const id of selectedRowKeys) {
        await deleteProjectInfo(id);
      }
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      await fetchProjectList();
    } catch (error) {
      message.error(error);
    }
  };

  // 批量导出
  const handleBatchExport = () => {
    const selectedData = projectList.filter((item) => selectedRowKeys.includes(item.id!));
    if (selectedData.length > 0) {
      const fields = [
        { label: 'ID', value: 'id' },
        { label: '项目名称', value: 'name' },
        { label: '类型', value: 'type' },
        { label: '施工单位', value: 'constructionOrganization' },
        { label: '流水号', value: 'serialNumber' },
        { label: '地区', value: 'region' },
        { label: '项目地址', value: 'projectAddress' },
        { label: '总投资', value: 'totalInvestment' },
        { label: '建造成本', value: 'buildingCost' },
        { label: '计划工期', value: 'plannedDuration' },
        { label: '投资类型', value: 'investmentType' },
        { label: '开始日期', value: 'startDate' },
        { label: '结束日期', value: 'endDate' },
        { label: '项目描述', value: 'projectDescription' },
        { label: '合同日期', value: 'contractDate' },
        { label: '工商注册地址', value: 'businessRegistrationAddress' },
        { label: '项目状态', value: 'projectStatus' },
        { label: '监管级别', value: 'regulatoryLevel' },
        { label: '技术级别', value: 'techLevel' },
        { label: '位置', value: 'location' },
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
      link.setAttribute('download', '项目列表.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      message.warning('请先选择要导出的项目');
    }
  };

  // 处理行选择变化
  const onSelectChange = (newSelectedRowKeys: number[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 刷新表格数据
  const reloadData = async (generalQueryCondition) => {
    await fetchProjectList(generalQueryCondition);
  };

  useEffect(() => {
    fetchProjectList();
  }, []);

  return {
    projectList,
    loading,
    fetchProjectList,
    handleAddProject,
    handleUpdateProject,
    handleDeleteProject,
    handleBatchDelete,
    handleBatchExport,
    selectedRowKeys,
    setSelectedRowKeys,
    onSelectChange,
    reloadData,
    handleAuthorizeProject,
    actionRef,
    userId
  };
}
