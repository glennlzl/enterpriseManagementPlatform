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
  fetchOssStsAccessInfo,
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
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useApprovalPage = (userId: string) => {
  const actionRef = useRef<ActionType>();

  const [state, setState] = useState({
    initiatorData: [] as ApprovalInfoVO[],
    receiverData: [] as ApprovalInfoVO[],
    createModalOpen: false,
    updateModalOpen: false,
    fileUrl: '', // 存储文件上传后的URL
    loadingInitiator: true, // Initiator data loading state
    loadingReceiver: true, // Receiver data loading state
    employeeList: [] as EmployeeSimpleInfoResponse[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [initiatorResponse, receiverResponse, employeeList] = await Promise.all([
          fetchInitiatorData(userId),
          fetchReceiverData(userId),
          queryAllEmployeeSimpleInfo(),
        ]);

        setState((prevState) => ({
          ...prevState,
          initiatorData: initiatorResponse,
          receiverData: receiverResponse,
          loadingInitiator: false, // Data loaded, stop spinner
          loadingReceiver: false, // Data loaded, stop spinner
          employeeList,
        }));
      } catch (error) {
        message.error(`获取数据失败: ${error}`);
        setState((prevState) => ({
          ...prevState,
          loadingInitiator: false, // Stop spinner even if there's an error
          loadingReceiver: false, // Stop spinner even if there's an error
        }));
      }
    };

    fetchData();
  }, [userId]);

  const handleApprovalChange = async (record: ApprovalInfoVO, value: number) => {
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

  const handleModalOpen = (modalName: 'createModalOpen' | 'updateModalOpen', isOpen: boolean) => {
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
    try {
      const client = await createOSSClient();
      const result = await client.put(`files/${uuidv4()}_${file.name}`, file);
      return result.url; // 返回文件的 URL
    } catch (error) {
      console.error('文件上传到 OSS 失败:', error);
      throw error;
    }
  };

  const downloadFromOSS = async (fileUrl: string) => {
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
  };
};
