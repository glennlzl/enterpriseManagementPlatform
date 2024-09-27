// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export interface EmployeeInfo {
  id?: number;
  name?: string;
  userId?: string;
  avatar?: string;
  stateCode?: string;
  managerId?: number;
  managerName?: string;
  managerUserId?: string;
  mobile?: string;
  telephone?: string;
  jobNumber?: string;
  title?: string;
  email?: string;
  workPlace?: string;
  remark?: string;
  orgEmail?: string;
  deptIdList?: number[];
  extension?: string;
  hiredDate?: number;
  role?: number;
  isAdmin?: number;
  isSenior?: number;
  isBoss?: number;
  isIncumbent?: number;
  isDeleted?: number;
  isUpdated?: number;
  token?: string;
}

export interface ApiResponse<T> {
  code: number;
  level?: string | null;
  msg: string;
  isSuccess: boolean;
  data: T;
  dataType?: number;
}

export interface EmployeeSimpleInfoResponse {
  id: number;
  name: string;
  userId: string;
  mobile: string;
  jobNumber: string;
}

export interface EmployeeInfoAddOrUpdateRequest {
  id?: number;
  name: string;
  stateCode?: string;
  managerId?: number;
  managerName?: string;
  managerUserId?: string;
  mobile?: string;
  telephone?: string;
  jobNumber?: string;
  title?: string;
  email?: string;
  deptIdList?: number[];
  role?: number;
  isIncumbent?: number;
}
// http://47.93.51.8/user/login
export const GENERAL_API_BASE_URL = 'http://47.93.51.8/api';
export const GENERAL_CLIENT_API_BASE_URL = 'http://47.93.51.8';

export const API_BASE_URL = `${GENERAL_API_BASE_URL}`;

export interface OssStsAccessInfo {
  accessKeyId: string;
  accessKeySecret: string;
  securityToken: string;
  expiration: string;
}

export async function fetchOssStsAccessInfo() {
  const url = new URL(`${API_BASE_URL}/system/oss/generateStsAccessInfo`);
  return request<ApiResponse<OssStsAccessInfo>>(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    withCredentials: true,
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 通过授权码登录 GET /api/loginWithAuth */
export async function loginWithAuth(authCode: string) {
  const url = `${API_BASE_URL}/system/login/auth`;
  return request<ApiResponse<EmployeeInfo>>(url, {
    method: 'GET',
    params: { authCode },
    headers: {
      Accept: 'application/json',
    },
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 获取员工列表 GET /system/employee-info/queryEmployeeList */
export async function getUsers(id: string, options?: { [key: string]: any }) {
  const url = `${API_BASE_URL}/system/employee-info/queryEmployeeList`;
  return request<ApiResponse<EmployeeInfo[]>>(url, {
    method: 'GET',
    params: { id },
    ...(options || {}),
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 检查是否登录 GET /system/login/isLogin */
export async function isLogin(options?: { [key: string]: any }) {
  const url = `${API_BASE_URL}/system/login/isLogin`;
  return request<ApiResponse<boolean>>(url, {
    method: 'GET',
    ...(options || {}),
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return response.data;
    }
  });
}

/** 添加员工 POST /system/employee-info/addEmployee */
export async function addEmployee(
  employeeData: EmployeeInfoAddOrUpdateRequest,
  options?: { [key: string]: any },
) {
  const url = `${API_BASE_URL}/system/employee-info/addEmployee`;
  return request<ApiResponse<boolean>>(url, {
    method: 'POST',
    data: employeeData,
    ...(options || {}),
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 更新员工信息 POST /system/employee-info/updateEmployee */
export async function updateEmployee(
  employeeData: EmployeeInfoAddOrUpdateRequest,
  options?: { [key: string]: any },
) {
  const url = `${API_BASE_URL}/system/employee-info/updateEmployee`;
  return request<ApiResponse<boolean>>(url, {
    method: 'POST',
    data: employeeData,
    ...(options || {}),
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 同步钉钉员工信息 GET /system/employee-info/syncDingtalkEmployeeInfo */
export async function syncDingtalkEmployeeInfo(options?: { [key: string]: any }) {
  const url = `${API_BASE_URL}/system/employee-info/syncDingtalkEmployeeInfo`;
  return request<ApiResponse<boolean>>(url, {
    method: 'GET',
    ...(options || {}),
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 同步单个钉钉员工信息 GET /system/employee-info/syncDingtalkSingleEmployeeInfo */
export async function syncDingtalkSingleEmployeeInfo(
  userId: number,
  options?: { [key: string]: any },
) {
  const url = `${API_BASE_URL}/system/employee-info/syncDingtalkSingleEmployeeInfo`;
  return request<ApiResponse<boolean>>(url, {
    method: 'GET',
    params: { userId },
    ...(options || {}),
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return Promise.reject(response.msg);
    }
  });
}

export async function queryAllEmployeeSimpleInfo() {
  const url = `${API_BASE_URL}/system/employee-info/queryAllEmployeeSimpleInfo`;
  return request<ApiResponse<EmployeeSimpleInfoResponse[]>>(url, {
    method: 'GET',
    withCredentials: true, // 如果需要传递凭证（如 Cookies）
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return Promise.reject(response.msg);
    }
  });
}
