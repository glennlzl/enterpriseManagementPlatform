import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import {
  addApproval,
  fetchInitiatorData,
  fetchReceiverData,
  updateApprovalDecision,
  uploadFile
} from "@/api/apporvalsystem";
import {AddApprovalInfoRequest, ApprovalInfoVO, UplodaFileUrlRequest} from "@/model/approvalsystem";

export const useApprovalPage = (userId: string) => {
  const actionRef = useRef<ActionType>();

  const [state, setState] = useState({
    initiatorData: [] as ApprovalInfoVO[],
    receiverData: [] as ApprovalInfoVO[],
    createModalOpen: false,
    updateModalOpen: false,
    fileUrl: '', // 存储文件上传后的URL
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const initiatorResponse = await fetchInitiatorData(userId);
        const receiverResponse = await fetchReceiverData(userId);
        setState((prevState) => ({
          ...prevState,
          initiatorData: initiatorResponse,
          receiverData: receiverResponse,
        }));
      } catch (error) {
        message.error(`获取数据失败: ${error}`);
      }
    };

    fetchData();
  }, []);

  const handleApprovalChange = async (record: ApprovalInfoVO, value: number) => {
    try {
      const success = await updateApprovalDecision({ id: record.id, isAgree: value === 1 });
      if (success) {
        message.success('审批状态已更新');
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

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadFile({ fileUrl: file.name } as UplodaFileUrlRequest);
      if (response) {
        message.success('文件上传成功');
        setState((prevState) => ({
          ...prevState,
          fileUrl: file.name, // 更新上传的文件URL
        }));
      }
    } catch (error) {
      message.error('文件上传失败');
    }
  };

  const handleAddApproval = async (data: AddApprovalInfoRequest) => {
    try {
      const success = await addApproval(data);
      if (success) {
        message.success('审批信息添加成功');
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
    actionRef,
  };
};
