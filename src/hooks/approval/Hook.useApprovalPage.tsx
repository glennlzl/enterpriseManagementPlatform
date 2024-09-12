import {
  addApproval,
  fetchInitiatorData,
  fetchReceiverData,
  updateApprovalDecision,
  updateComment,
  uploadFile,
} from '@/api/apporvalsystem';
import {
  EmployeeSimpleInfoResponse,
  fetchOssStsAccessInfo, isLogin,
  queryAllEmployeeSimpleInfo,
} from '@/api/usermanagement';
import {
  AddApprovalInfoRequest,
  ApprovalInfoVO,
  UplodaFileUrlRequest,
} from '@/model/approvalsystem';
import type { ActionType } from '@ant-design/pro-components';
import OSS from 'ali-oss';
import { message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {history} from "@@/core/history";
import {ProColumns} from "@ant-design/pro-components";
import {VehicleInfo} from "@/model/vehicle-management-system";
import {approvalStatusConfig, approvalTypeConfig} from "@/pages/ApprovalSystem";

export const useApprovalPage = (userId: string) => {
  const actionRef = useRef<ActionType>();

  const [state, setState] = useState({
    initiatorData: [] as ApprovalInfoVO[],
    receiverData: [] as ApprovalInfoVO[],
    commentModalOpen: false, // 用于控制评论 Modal
    createModalOpen: false,
    updateModalOpen: false,
    fileUrl: '', // 存储文件上传后的URL
    loadingInitiator: true, // Initiator data loading state
    loadingReceiver: true, // Receiver data loading state
    employeeList: [] as EmployeeSimpleInfoResponse[],
    isLoading: false
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      const loginCheck = await isLogin();
      if (!loginCheck) {
        message.error('请重新登录');
        history.push('/user/login');
      }
      try {
        const employeeList = await queryAllEmployeeSimpleInfo();
        setState((prevState) => ({
          ...prevState,
          employeeList,
        }));
      } catch (error) {
        message.error(error);
      }
    }
    const fetchData = async () => {
      try {
        const [initiatorResponse, receiverResponse] = await Promise.all([
          fetchInitiatorData(userId),
          fetchReceiverData(userId),
        ]);

        setState((prevState) => ({
          ...prevState,
          initiatorData: initiatorResponse,
          receiverData: receiverResponse,
          loadingInitiator: false, // Data loaded, stop spinner
          loadingReceiver: false, // Data loaded, stop spinner
        }));
      } catch (error) {
        if (error !== '该用户无审批记录') {
          message.error(`获取数据失败: ${error}`);
        }
        setState((prevState) => ({
          ...prevState,
          loadingInitiator: false, // Stop spinner even if there's an error
          loadingReceiver: false, // Stop spinner even if there's an error
        }));
      }
    };

    fetchEmployees();
    fetchData();
  }, [userId]);

  const handleApprovalChange = async (record: ApprovalInfoVO, value: number) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    try {
      console.log(record);
      const success = await updateApprovalDecision({ id: record.id, isAgree: value === 1 });
      if (success) {
        message.success('审批状态已更新');
        const [initiatorResponse, receiverResponse] = await Promise.all([
          fetchInitiatorData(userId),
          fetchReceiverData(userId),
        ]);

        setState((prevState) => ({
          ...prevState,
          initiatorData: initiatorResponse,
          receiverData: receiverResponse,
          loadingInitiator: false, // Data loaded, stop spinner
          loadingReceiver: false, // Data loaded, stop spinner
        }));
        actionRef.current?.reload();
      } else {
        message.error('更新失败，请重试');
      }
    } catch (error) {
      message.error('更新失败，请重试');
    }
  };

  const handleUpdateComment = async (record: ApprovalInfoVO, value: string) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    try {
      console.log(record);
      const success = await updateComment({ id: record.id, comment: value });
      if (success) {
        message.success('已上传评论');
        const [initiatorResponse, receiverResponse] = await Promise.all([
          fetchInitiatorData(userId),
          fetchReceiverData(userId),
        ]);

        setState((prevState) => ({
          ...prevState,
          initiatorData: initiatorResponse,
          receiverData: receiverResponse,
          loadingInitiator: false, // Data loaded, stop spinner
          loadingReceiver: false, // Data loaded, stop spinner
        }));
        actionRef.current?.reload();
      } else {
        message.error(error);
      }
    } catch (error) {
      message.error(error);
    }
  };

  // 导出CSV函数
  const exportToCSV = (data: any[], filename: string, columns: ProColumns<ApprovalInfoVO>[]) => {
    // 过滤掉 title 为 "操作" 的列
    const filteredColumns = columns.slice(0, -1).filter(col => {
      if (typeof col.title === 'string') {
        return col.title !== '操作';
      }
      if (React.isValidElement(col.title) && col.title.props?.children) {
        return col.title.props.children !== '操作';
      }
      return true;
    });

    // 获取表头
    const headers = filteredColumns.map(col => {
      if (typeof col.title === 'string') {
        return col.title;
      }
      if (React.isValidElement(col.title) && typeof col.title.props?.id === 'string') {
        return col.title.props.id;
      }
      if (React.isValidElement(col.title)) {
        return col.title.props.children;
      }
      return '';
    }).join(',');

    // 将数据转换为 CSV 格式
    const csvContent = data.map(item =>
      filteredColumns.map(col => {
        let value = item[col.dataIndex as keyof ApprovalInfoVO];

        // 特别处理 approvalStatus 和 approvalType 字段
        if (col.dataIndex === 'approvalStatus') {
          value = approvalStatusConfig[value]?.text || value; // 获取审批状态文字
        } else if (col.dataIndex === 'approvalType') {
          value = approvalTypeConfig[value]?.text || value; // 获取审批类型文字
        } else if (col.dataIndex === 'approvalFileUrl') {
          value = item.approvalFileUrl;
        }

        return value !== undefined ? value : '';
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

  const handleModalOpen = (modalName: 'createModalOpen' | 'updateModalOpen' | 'commentModalOpen', isOpen: boolean) => {
    setState((prevState) => ({
      ...prevState,
      [modalName]: isOpen,
    }));
  };

  // 初始化OSS客户端
  const createOSSClient = async () => {
    const ossStsAccessInfo = await fetchOssStsAccessInfo();
    return new OSS({
      region: 'oss-cn-beijing',
      accessKeyId: ossStsAccessInfo.accessKeyId,
      accessKeySecret: ossStsAccessInfo.accessKeySecret,
      stsToken: ossStsAccessInfo.securityToken,
      bucket: 'rohana-erp', // 替换为你的 bucket 名称
    });
  };

  // 上传文件到OSS
  const uploadToOSS = async (file: File) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    try {
      setState((prevState) => ({
        ...prevState,
        isLoading: true
      }));
      const client = await createOSSClient();
      const result = await client.put(`files/${uuidv4()}_${file.name}`, file);
      setState((prevState) => ({
        ...prevState,
        isLoading: false
      }));
      return result.url; // 返回文件的 URL
    } catch (error) {
      console.error('文件上传到 OSS 失败:', error);
      throw error;
    }
  };

  const downloadFromOSS = async (fileUrl: string) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    try {
      // 通过文件URL直接下载
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const fileName = fileUrl.split('/').pop();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName || 'downloaded_file';
      link.click();
    } catch (err) {
      console.error('文件下载失败:', err);
      throw err;
    }
  };

  const handleFileUpload = async (file: File, recordId?: number) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    try {
      const fileUrl = await uploadToOSS(file); // 使用OSS进行上传
      const response = await uploadFile({ id: recordId, fileUrl } as UplodaFileUrlRequest);
      if (response) {
        message.success('文件上传成功');
        const [initiatorResponse, receiverResponse] = await Promise.all([
          fetchInitiatorData(userId),
          fetchReceiverData(userId),
        ]);

        setState((prevState) => ({
          ...prevState,
          initiatorData: initiatorResponse,
          receiverData: receiverResponse,
          loadingInitiator: false, // Data loaded, stop spinner
          loadingReceiver: false, // Data loaded, stop spinner
        }));
        actionRef.current?.reload();
        return fileUrl; // 返回上传的文件URL
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      message.error('文件上传失败');
      return '';
    }
  };

  const handleAddApproval = async (data: AddApprovalInfoRequest) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    try {
      const success = await addApproval(data);
      if (success) {
        message.success('审批信息添加成功');
        const [initiatorResponse, receiverResponse] = await Promise.all([
          fetchInitiatorData(userId),
          fetchReceiverData(userId),
        ]);

        setState((prevState) => ({
          ...prevState,
          initiatorData: initiatorResponse,
          receiverData: receiverResponse,
          loadingInitiator: false, // Data loaded, stop spinner
          loadingReceiver: false, // Data loaded, stop spinner
        }));
        handleModalOpen('createModalOpen', false);
        if (actionRef.current) {
          actionRef.current.reload();
        }
      }
    } catch (error) {
      message.error('审批信息添加失败');
    }
  };

  return {
    state,
    setState,
    handleApprovalChange,
    handleModalOpen,
    handleFileUpload,
    handleAddApproval,
    downloadFromOSS,
    actionRef,
    uploadToOSS,
    handleUpdateComment,
    exportToCSV
  };
};
