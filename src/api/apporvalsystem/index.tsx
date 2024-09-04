import { GENERAL_API_BASE_URL } from '@/api/usermanagement';
import {
  AddApprovalInfoRequest,
  ApprovalInfoVO,
  UpdateCommentRequest,
  UpdateDecisionRequest,
  UplodaFileUrlRequest,
} from '@/model/approvalsystem';
import { request } from '@umijs/max';

export const API_BASE_URL = `${GENERAL_API_BASE_URL}/business/approval-info`;

export interface ApiResponse<T> {
  code: number;
  level?: string | null;
  msg: string;
  isSuccess: boolean;
  data: T;
  dataType?: number;
}

/** 获取发起的审批信息列表 */
export async function fetchInitiatorData(userId: string) {
  const url = new URL(`${API_BASE_URL}/queryApprovalInfoListByInitiatorId`);
  return request<ApiResponse<ApprovalInfoVO[]>>(url.toString(), {
    method: 'GET',
    params: { initiatorId: userId },
    headers: {
      Accept: 'application/json',
    },
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data; // 访问返回的 `data` 字段
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 获取接收的审批信息列表 */
export async function fetchReceiverData(userId: string) {
  const url = new URL(`${API_BASE_URL}/queryApprovalInfoListByReceiverId`);
  return request<ApiResponse<ApprovalInfoVO[]>>(url.toString(), {
    method: 'GET',
    params: { receiverId: userId },
    headers: {
      Accept: 'application/json',
    },
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data; // 访问返回的 `data` 字段
    } else {
      console.log(response.msg);
      return Promise.reject(response.msg);
    }
  });
}

/** 添加审批信息 */
export async function addApproval(addApprovalInfoRequest: AddApprovalInfoRequest) {
  const url = new URL(`${API_BASE_URL}/addApproval`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'POST',
    data: addApprovalInfoRequest,
    headers: {
      Accept: 'application/json',
    },
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess || response.msg === '该用户无审批记录') {
      return response.data; // 访问返回的 `data` 字段
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 上传审批文件 */
export async function uploadFile(uplodaFileUrlRequest: UplodaFileUrlRequest) {
  const url = new URL(`${API_BASE_URL}/uploadFile`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'POST',
    data: uplodaFileUrlRequest,
    headers: {
      Accept: 'application/json',
    },
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data; // 访问返回的 `data` 字段
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 更新comment */
export async function updateComment(updateCommentRequest: UpdateCommentRequest) {
  const url = new URL(`${API_BASE_URL}/updateComment`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'POST',
    data: updateCommentRequest,
    headers: {
      Accept: 'application/json',
    },
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data; // 访问返回的 `data` 字段
    } else {
      return Promise.reject(response.msg);
    }
  });
}

/** 更新审批决策 */
export async function updateApprovalDecision(updateDecisionRequest: UpdateDecisionRequest) {
  const url = new URL(`${API_BASE_URL}/updateDecision`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'POST',
    data: updateDecisionRequest,
    headers: {
      Accept: 'application/json',
    },
    withCredentials: true, // 确保携带 Cookies
  }).then((response) => {
    if (response.isSuccess) {
      return response.data; // 访问返回的 `data` 字段
    } else {
      return Promise.reject(response.msg);
    }
  });
}
