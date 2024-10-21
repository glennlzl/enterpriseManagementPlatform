// src/api/operationlog.ts

import { request } from '@umijs/max';
import {OperationLogVO} from "@/model/project/Model.operation";
import {GENERAL_API_BASE_URL} from "@/api/usermanagement";

export const API_BASE_URL = `${GENERAL_API_BASE_URL}`;

export interface ApiResponse<T> {
  code: number;
  level?: string | null;
  msg: string;
  isSuccess: boolean;
  data: T;
  dataType?: number;
}

/** 查询操作日志列表 */
export async function queryOperationLogList(operationModule: string, operationModuleId: number) {
  const url = `${API_BASE_URL}/business/operation-log/queryOperationLogList`;
  return request<ApiResponse<OperationLogVO[]>>(url, {
    method: 'GET',
    params: {
      operationModule,
      operationModuleId,
    },
    headers: {
      Accept: 'application/json',
    },
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data; // 返回 data 字段
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 删除操作日志 */
export async function deleteOperationLog(id: number) {
  const url = `${API_BASE_URL}/business/operation-log/deleteOperationLog`;
  return request<ApiResponse<boolean>>(url, {
    method: 'GET',
    params: { id },
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
