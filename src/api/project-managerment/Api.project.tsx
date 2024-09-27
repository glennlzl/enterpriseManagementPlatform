import { request } from '@umijs/max';
import {GENERAL_API_BASE_URL} from "@/api/usermanagement";
import {AddOrUpdateProjectInfoRequest, ProjectInfoVO} from "@/model/project/Modal.project";

export interface ApiResponse<T> {
  code: number;
  level?: string | null;
  msg: string;
  isSuccess: boolean;
  data: T;
  dataType?: number;
}

// 基础URL配置
export const API_BASE_URL = `${GENERAL_API_BASE_URL}`;

/** 添加项目 POST /api/business/project-info/addProjectInfo */
export async function addProjectInfo(
  projectData: AddOrUpdateProjectInfoRequest,
  options?: { [key: string]: any },
) {
  const url = `${API_BASE_URL}/business/project-info/addProjectInfo`;
  return request<ApiResponse<boolean>>(url, {
    method: 'POST',
    data: projectData,
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

/** 更新项目 POST /api/business/project-info/updateProjectInfo */
export async function updateProjectInfo(
  projectData: AddOrUpdateProjectInfoRequest,
  options?: { [key: string]: any },
) {
  const url = `${API_BASE_URL}/business/project-info/updateProjectInfo`;
  return request<ApiResponse<boolean>>(url, {
    method: 'POST',
    data: projectData,
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

/** 删除项目 GET /api/business/project-info/deleteProjectInfo */
export async function deleteProjectInfo(id: number, options?: { [key: string]: any }) {
  const url = `${API_BASE_URL}/business/project-info/deleteProjectInfo`;
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

/** 查询项目列表 GET /api/business/project-info/queryProjectInfoList */
export async function queryProjectInfoList(
  userId: number,
  generalQueryCondition?: string,
  options?: { [key: string]: any },
) {
  const url = `${API_BASE_URL}/business/project-info/queryProjectInfoList`;
  return request<ApiResponse<ProjectInfoVO[]>>(url, {
    method: 'GET',
    params: { userId, generalQueryCondition },
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
