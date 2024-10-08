import { request } from '@umijs/max';
import { message } from 'antd';
import {AddOrUpdatePeriodInfoRequest, PeriodInfoVO} from "@/model/project/Model.period";
import {GENERAL_API_BASE_URL} from "@/api/usermanagement";

export interface ApiResponse<T> {
  code: number;
  level?: string | null;
  msg: string;
  isSuccess: boolean;
  data: T;
  dataType?: number;
}

export const API_BASE_URL = `${GENERAL_API_BASE_URL}/business/period-info`;

/** 添加周期信息 POST /api/business/period-info/addPeriodInfo */
export async function addPeriodInfo(
  addPeriodInfoRequest: AddOrUpdatePeriodInfoRequest,
  options?: { [key: string]: any },
) {
  return request<ApiResponse<boolean>>(`${API_BASE_URL}/addPeriodInfo`, {
    method: 'POST',
    data: addPeriodInfoRequest,
    ...(options || {}),
    withCredentials: true,
  })
    .then((response) => {
      if (response.isSuccess) {
        return response.data;
      } else {
        return Promise.reject(response.msg);
      }
    })
    .catch((error) => {
      message.error(`添加周期信息失败：${error}`);
      throw error;
    });
}

/** 更新周期信息 POST /api/business/period-info/updatePeriodInfo */
export async function updatePeriodInfo(
  updatePeriodInfoRequest: AddOrUpdatePeriodInfoRequest,
  options?: { [key: string]: any },
) {
  return request<ApiResponse<boolean>>(`${API_BASE_URL}/updatePeriodInfo`, {
    method: 'POST',
    data: updatePeriodInfoRequest,
    ...(options || {}),
    withCredentials: true,
  })
    .then((response) => {
      if (response.isSuccess) {
        return response.data;
      } else {
        return Promise.reject(response.msg);
      }
    })
    .catch((error) => {
      message.error(`更新周期信息失败：${error}`);
      throw error;
    });
}

/** 删除周期信息 GET /api/business/period-info/deletePeriodInfo */
export async function deletePeriodInfo(id: number, options?: { [key: string]: any }) {
  return request<ApiResponse<boolean>>(`${API_BASE_URL}/deletePeriodInfo`, {
    method: 'GET',
    params: { id },
    ...(options || {}),
    withCredentials: true,
  })
    .then((response) => {
      if (response.isSuccess) {
        return response.data;
      } else {
        return Promise.reject(response.msg);
      }
    })
    .catch((error) => {
      message.error(`删除周期信息失败：${error}`);
      throw error;
    });
}

/** 归档周期信息 GET /api/business/period-info/archivePeriodInfo */
export async function archivePeriodInfo(id: number, options?: { [key: string]: any }) {
  return request<ApiResponse<boolean>>(`${API_BASE_URL}/archivePeriodInfo`, {
    method: 'GET',
    params: { id },
    ...(options || {}),
    withCredentials: true,
  })
    .then((response) => {
      if (response.isSuccess) {
        return response.data;
      } else {
        return Promise.reject(response.msg);
      }
    })
    .catch((error) => {
      message.error(`归档周期信息失败：${error}`);
      throw error;
    });
}

/** 查询周期信息列表 GET /api/business/period-info/queryPeriodInfoList */
export async function queryPeriodInfoList(
  projectId?: number,
  contractId?: number,
  generalQueryCondition?: string,
  options?: { [key: string]: any },
) {
  return request<ApiResponse<PeriodInfoVO[]>>(
    `${API_BASE_URL}/queryPeriodInfoList`,
    {
      method: 'GET',
      params: { projectId, contractId, generalQueryCondition },
      ...(options || {}),
      withCredentials: true,
    },
  )
    .then((response) => {
      if (response.isSuccess) {
        return response.data;
      } else {
        return Promise.reject(response.msg);
      }
    })
    .catch((error) => {
      throw error;
    });
}
