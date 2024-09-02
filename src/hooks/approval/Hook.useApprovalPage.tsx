import { useEffect, useRef, useState } from 'react';
import OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';
import { message } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import {
  addApproval,
  fetchInitiatorData,
  fetchReceiverData,
  updateApprovalDecision,
  uploadFile
} from "@/api/apporvalsystem";
import { AddApprovalInfoRequest, ApprovalInfoVO, UplodaFileUrlRequest } from "@/model/approvalsystem";
import {EmployeeSimpleInfoResponse, queryAllEmployeeSimpleInfo} from "@/api/usermanagement";

// const client = new OSS({
//   region: '<your-region>',
//   accessKeyId: '<your-access-key-id>',
//   accessKeySecret: '<your-access-key-secret>',
//   bucket: 'my-bucket123' // 使用符合规则的 Bucket 名称
// });

export const useApprovalPage = (userId: string) => {
  const actionRef = useRef<ActionType>();

  const [state, setState] = useState({
    initiatorData: [] as ApprovalInfoVO[],
    receiverData: [] as ApprovalInfoVO[],
    createModalOpen: false,
    updateModalOpen: false,
    fileUrl: '', // 存储文件上传后的URL
    loadingInitiator: true, // Initiator data loading state
    loadingReceiver: true,  // Receiver data loading state
    employeeList: [] as EmployeeSimpleInfoResponse[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [initiatorResponse, receiverResponse, employeeList] = await Promise.all([
          fetchInitiatorData(userId),
          fetchReceiverData(userId),
          queryAllEmployeeSimpleInfo()
        ]);

        setState((prevState) => ({
          ...prevState,
          initiatorData: initiatorResponse,
          receiverData: receiverResponse,
          loadingInitiator: false, // Data loaded, stop spinner
          loadingReceiver: false,  // Data loaded, stop spinner
          employeeList
        }));
      } catch (error) {
        message.error(`获取数据失败: ${error}`);
        setState((prevState) => ({
          ...prevState,
          loadingInitiator: false, // Stop spinner even if there's an error
          loadingReceiver: false,  // Stop spinner even if there's an error
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
          fetchReceiverData(userId)
        ]);

        setState((prevState) => ({
          ...prevState,
          initiatorData: initiatorResponse,
          receiverData: receiverResponse,
          loadingInitiator: false, // Data loaded, stop spinner
          loadingReceiver: false,  // Data loaded, stop spinner
        }));
        actionRef.current?.reload();
      } else {
        message.error('更新失败，请重试');
      }
    } catch (error) {
      message.error('更新失败，请重试');
    }
  };

  const handleModalOpen = (modalName: 'createModalOpen' | 'updateModalOpen', isOpen: boolean) => {
    setState((prevState) => ({
      ...prevState,
      [modalName]: isOpen,
    }));
  };

  // export const uploadToOSS = async (file) => {
  //   try {
  //     // 生成文件路径
  //     const filePath = `uploads/${file.name}`;
  //
  //     // 上传文件
  //     const result = await client.put(filePath, file);
  //
  //     return result.url; // 返回文件的 URL
  //   } catch (error) {
  //     console.error('文件上传到 OSS 失败:', error);
  //     throw error;
  //   }
  // };

   const uploadToOSS = async (file) => {
    // 模拟 OSS 上传的延迟
    await new Promise((resolve) => {setTimeout(resolve, 1000)});

    // 模拟 OSS 返回的 URL
    return `https://mock-oss-url.com/${file.name}`;
  };

  // 模拟从 OSS 下载文件
   const downloadFromOSS = async (fileUrl: string) => {
     try {
       // 模拟文件内容
       const fileContent = 'This is a mock file content for testing purposes.';
       const blob = new Blob([fileContent], { type: 'text/plain' });

       // 使用 `File` 构造函数创建一个 File 对象
       const file = new File([blob], fileUrl, { type: 'text/plain' });

       console.log('Mock downloaded file:', file);
       return file;
     } catch (err) {
       console.error('Error downloading file:', err);
       throw err;
     }
  };

  const handleFileUpload = async (file: File, recordId?: number) => {
    try {
      const fileUrl = await uploadToOSS(file); // 假设有一个上传到 OSS 的函数

      const response = await uploadFile({ id: recordId ?? uuidv4(), fileUrl: 'https://mock-oss-url.com/mock.txt' } as UplodaFileUrlRequest);
      if (response) {
        message.success('文件上传成功');
        const [initiatorResponse, receiverResponse] = await Promise.all([
          fetchInitiatorData(userId),
          fetchReceiverData(userId)
        ]);

        setState((prevState) => ({
          ...prevState,
          initiatorData: initiatorResponse,
          receiverData: receiverResponse,
          loadingInitiator: false, // Data loaded, stop spinner
          loadingReceiver: false,  // Data loaded, stop spinner
        }));
        actionRef.current?.reload();
        return 'https://mock-oss-url.com/mock.txt'; // 返回上传的文件URL
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
          fetchReceiverData(userId)
        ]);

        setState((prevState) => ({
          ...prevState,
          initiatorData: initiatorResponse,
          receiverData: receiverResponse,
          loadingInitiator: false, // Data loaded, stop spinner
          loadingReceiver: false,  // Data loaded, stop spinner
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
  };
};
