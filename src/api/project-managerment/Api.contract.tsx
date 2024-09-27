import { request } from '@umijs/max';
import {GENERAL_API_BASE_URL} from "@/api/usermanagement";
import {AddOrUpdateContractInfoRequest, ContractInfoVO} from "@/model/project/Model.contract";

export const API_BASE_URL = `${GENERAL_API_BASE_URL}`;

export interface ApiResponse<T> {
  code: number;
  level?: string | null;
  msg: string;
  isSuccess: boolean;
  data: T;
  dataType?: number;
}

/** 添加合同 POST /api/business/contract-info/addContractInfo */
export async function addContractInfo(
  contractData: AddOrUpdateContractInfoRequest,
  options?: { [key: string]: any },
) {
  const url = `${API_BASE_URL}/business/contract-info/addContractInfo`;
  return request<ApiResponse<boolean>>(url, {
    method: 'POST',
    data: contractData,
    ...(options || {}),
    withCredentials: true,
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 更新合同 POST /api/business/contract-info/updateContractInfo */
export async function updateContractInfo(
  contractData: AddOrUpdateContractInfoRequest,
  options?: { [key: string]: any },
) {
  const url = `${API_BASE_URL}/business/contract-info/updateContractInfo`;
  return request<ApiResponse<boolean>>(url, {
    method: 'POST',
    data: contractData,
    ...(options || {}),
    withCredentials: true,
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 删除合同 GET /api/business/contract-info/deleteContractInfo */
export async function deleteContractInfo(id: number, options?: { [key: string]: any }) {
  const url = `${API_BASE_URL}/business/contract-info/deleteContractInfo`;
  return request<ApiResponse<boolean>>(url, {
    method: 'GET',
    params: { id },
    ...(options || {}),
    withCredentials: true,
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 查询合同列表 GET /api/business/contract-info/queryContractInfoList */
export async function queryContractInfoList(
  projectId: number,
  userId: number,
  generalQueryCondition?: string,
  options?: { [key: string]: any },
) {
  const url = `${API_BASE_URL}/business/contract-info/queryContractInfoList`;
  return request<ApiResponse<ContractInfoVO[]>>(url, {
    method: 'GET',
    params: { projectId, userId, generalQueryCondition },
    ...(options || {}),
    withCredentials: true,
  }).then((response) => {
    if (response.isSuccess) {
      return response.data;
    } else {
      return Promise.reject(response.msg);
    }
  });
}
