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

/** 获取当前的用户 GET /api/currentUser */
export async function getUser(userId: string) {
  const url = new URL('http://localhost:8081/system/login/getUserInfo');
  return request<ApiResponse<EmployeeInfo>>(url.toString(), {
    method: 'GET',
    params: {
      userId,
    },
    headers: {
      Accept: 'application/json',
    },
    credentials: true, // 确保携带 Cookies
  }).then((response) => {
    console.log(response);
    if (response.isSuccess) {
      return response.data; // 访问返回的 `data` 字段
    } else {
      return response.msg;
    }
  });
}

export async function loginWithAuth(authCode: string) {
  const url = new URL('http://localhost:8081/system/login/auth');
  return request<ApiResponse<EmployeeInfo>>(url.toString(), {
    method: 'GET',
    params: {
      authCode,
    },
    headers: {
      Accept: 'application/json',
    },
    credentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data; // 访问返回的 `data` 字段
    } else {
      return response.msg;
    }
  });
}

export async function getUsers(id: string, options?: { [key: string]: any }) {
  return request<API.EmployeeList>('http://localhost:8081/system/employee-info/queryEmployeeList', {
    method: 'GET',
    params: {
      id,
    },
    ...(options || {}),
  }).then((response) => {
    console.log(response);
    if (response.isSuccess) {
      return response.data; // 访问返回的 `data` 字段
    } else {
      return response.msg;
    }
  });
}

export async function isLogin(options?: { [key: string]: any }) {
  return request<API.EmployeeList>('http://localhost:8081/system/login/isLogin', {
    method: 'GET',
    ...(options || {}),
    credentials: true, // 确保携带 Cookies
  }).then((response) => {
    console.log(response);
    if (response.isSuccess) {
      return response.data; // 访问返回的 `data` 字段
    } else {
      return response.msg;
    }
  });
}

export async function addEmployee(options?: { [key: string]: any }) {
  return request<API.EmployeeList>('http://localhost:8081/system/login/isLogin', {
    method: 'GET',
    ...(options || {}),
  }).then((response) => {
    console.log(response);
    if (response.isSuccess) {
      return response.data; // 访问返回的 `data` 字段
    } else {
      return response.msg;
    }
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.EmployeeList>('/api/rule', {
    method: 'POST',
    data: {
      method: 'update',
      ...(options || {}),
    },
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.EmployeeList>('/api/rule', {
    method: 'POST',
    data: {
      method: 'post',
      ...(options || {}),
    },
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data: {
      method: 'delete',
      ...(options || {}),
    },
  });
}
