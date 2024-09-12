import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import {
  addEmployee,
  EmployeeInfoAddOrUpdateRequest,
  EmployeeSimpleInfoResponse,
  getUsers,
  queryAllEmployeeSimpleInfo, syncDingtalkEmployeeInfo, syncDingtalkSingleEmployeeInfo,
  updateEmployee
} from "@/api/usermanagement"; // 之前定义的接口路径
import { isLogin } from '@/api/usermanagement';
import { history } from "@@/core/history";


export const useEmployeeManagement = (currentUserId: string) => {
  const actionRef = useRef<ActionType>();

  const [state, setState] = useState({
    createModalOpen: false,
    updateModalOpen: false,
    showDetail: false,
    currentRow: undefined as EmployeeInfoAddOrUpdateRequest | undefined,
    selectedRowsState: [] as EmployeeInfoAddOrUpdateRequest[],
    employeeList: [] as EmployeeSimpleInfoResponse[],
  });
  const { location } = history;


  useEffect(() => {
    // Fetch all employees when the component is mounted
    const fetchAllEmployees = async () => {
      try {
        // const loginCheck = await isLogin();
        // if (!loginCheck) {
        //   message.error('请重新登录');
        //   history.push('/user/login');
        // }
        const employeeList = await queryAllEmployeeSimpleInfo();
        setState((prevState) => ({
          ...prevState,
          employeeList,
        }));
      } catch (error) {
        message.error(error);
      }
    };

    fetchAllEmployees();
  }, []);

  const handleModalOpen = (modalName: 'createModalOpen' | 'updateModalOpen', isOpen: boolean) => {
    setState((prevState) => ({
      ...prevState,
      [modalName]: isOpen,
    }));
  };

  const handleAdd = async (fields: EmployeeInfoAddOrUpdateRequest) => {
    const hide = message.loading('正在添加');
    try {
      const loginCheck = await isLogin();
      if (!loginCheck) {
        message.error('请重新登录');
        history.push('/user/login');
      }
      await addEmployee(fields);
      hide();
      message.success('添加成功');
      return true;
    } catch (error) {
      hide();
      message.error(error);
      return false;
    }
  };

  const handleUpdate = async (formData: Partial<EmployeeInfoAddOrUpdateRequest>) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    const hide = message.loading('正在更新');
    try {
      const fullData: EmployeeInfoAddOrUpdateRequest = {
        ...state.currentRow, // 从全局状态获取默认值
        ...formData, // 覆盖用户更新的数据
      } as EmployeeInfoAddOrUpdateRequest;
      await updateEmployee(fullData);
      hide();
      message.success('更新成功');
      actionRef.current?.reload(); // 触发表格重新加载
      return true;
    } catch (error) {
      hide();
      message.error(error);
      return false;
    }
  };

  const fetchUsers = async () => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    try {
      return await getUsers(currentUserId);
    } catch (error) {
      message.error('获取用户信息失败');
      return [];
    }
  };

  const handleSyncAll = async (id: number) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    const hide = message.loading('正在同步钉钉员工信息');
    try {
      const res = await syncDingtalkEmployeeInfo();
      hide();
      message.success('同步成功');
      actionRef.current?.reload();
      return true;
    } catch (error) {
      hide();
      message.error(error);
      return false;
    }
  };

  const handleSyncSingle = async (userId: number) => {
    const loginCheck = await isLogin();
    if (!loginCheck) {
      message.error('请重新登录');
      history.push('/user/login');
    }
    console.log("userId");
    console.log(userId);
    const hide = message.loading('正在同步单个钉钉员工信息');
    try {
      console.log("asfasdfasdfasdfsdaf");
      await syncDingtalkSingleEmployeeInfo(userId);
      hide();
      message.success('单个同步成功');
      actionRef.current?.reload();
    } catch (error) {
      hide();
      message.error(error);
    }
  };

  return {
    state,
    setState,
    actionRef,
    handleModalOpen,
    handleAdd,
    handleUpdate,
    fetchUsers,
    handleSyncAll,
    handleSyncSingle
  };
};
