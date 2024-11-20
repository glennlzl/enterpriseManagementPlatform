import { message } from 'antd';
import {
  AddOrUpdateMeasurementDetailRequest,
  MeasurementDetailVO, MeasurementExcelVO,
  ReviewRequest
} from "@/model/project/Model.measurement-detail";
import {request} from "@umijs/max";
import {GENERAL_API_BASE_URL} from "@/api/usermanagement";

export interface ApiResponse<T> {
  code: number;
  level?: string | null;
  msg: string;
  isSuccess: boolean;
  data: T;
  dataType?: number;
}

export const API_BASE_URL = `${GENERAL_API_BASE_URL}/business/measurement-detail`;

/** 添加计量明细 POST /api/business/measurement-detail/addMeasurementDetail */
export async function addMeasurementDetail(
  addMeasurementDetailRequest: AddOrUpdateMeasurementDetailRequest,
  options?: { [key: string]: any },
) {
  return request<ApiResponse<boolean>>(`${API_BASE_URL}/addMeasurementDetail`, {
    method: 'POST',
    data: addMeasurementDetailRequest,
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
      message.error(`添加计量明细失败：${error}`);
      throw error;
    });
}

/** 更新计量明细 POST /api/business/measurement-detail/updateMeasurementDetail */
export async function updateMeasurementDetail(
  updateMeasurementDetailRequest: AddOrUpdateMeasurementDetailRequest,
  options?: { [key: string]: any },
) {
  return request<ApiResponse<boolean>>(`${API_BASE_URL}/updateMeasurementDetail`, {
    method: 'POST',
    data: updateMeasurementDetailRequest,
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
      message.error(`更新计量明细失败：${error}`);
      throw error;
    });
}

/** 删除计量明细 GET /api/business/measurement-detail/deleteMeasurementDetail */
export async function deleteMeasurementDetail(id: number, options?: { [key: string]: any }) {
  return request<ApiResponse<boolean>>(`${API_BASE_URL}/deleteMeasurementDetail`, {
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
      message.error(`删除计量明细失败：${error}`);
      throw error;
    });
}

/** 审核计量明细 POST /api/business/measurement-detail/reviewMeasurementDetail */
export async function reviewMeasurementDetail(
  reviewRequest: ReviewRequest,
  options?: { [key: string]: any },
) {
  return request<ApiResponse<boolean>>(`${API_BASE_URL}/reviewMeasurementDetail`, {
    method: 'POST',
    data: reviewRequest,
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
      message.error(`审核计量明细失败：${error}`);
      throw error;
    });
}

/** 查询计量明细列表 GET /api/business/measurement-detail/queryMeasurementDetailList */
export async function queryMeasurementDetailList(
  projectId?: number,
  contractId?: number,
  periodId?: number,
  itemId?: number,
  type: string = 'cost',
  generalQueryCondition?: string,
  options?: { [key: string]: any },
) {
  return request<ApiResponse<MeasurementDetailVO[]>>(
    `${API_BASE_URL}/queryMeasurementDetailList`,
    {
      method: 'GET',
      params: { projectId, contractId, periodId, itemId, type, generalQueryCondition },
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
      message.error(`获取计量明细列表失败：${error}`);
      throw error;
    });
}

/** 查询生成 Excel 所需的数据 GET /api/business/measurement-detail/queryMeasurementDetailExcelDataList */
export async function queryMeasurementDetailExcelDataList(
  projectId: number,
  contractId: number,
  periodId: number,
  options?: { [key: string]: any },
) {
  return request<ApiResponse<MeasurementExcelVO[]>>(
    `${API_BASE_URL}/queryMeasurementDetailExcelDataList`,
    {
      method: 'GET',
      params: { projectId, contractId, periodId },
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
      message.error(`获取 Excel 数据列表失败：${error}`);
      throw error;
    });
}


