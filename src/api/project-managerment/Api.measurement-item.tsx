import { request } from '@umijs/max';
import {API_BASE_URL} from "@/api/apporvalsystem";
import {AddOrUpdateMeasurementItemRequest} from "@/model/project/Model.measurement-item";
import {MeasurementItemVO} from "@/model/project/Model.contract";

export interface ApiResponse<T> {
  code: number;
  level?: string | null;
  msg: string;
  isSuccess: boolean;
  data: T;
  dataType?: number;
}


/** 添加计量项 POST /api/business/measurement-item/addMeasurementItem */
export async function addMeasurementItem(
  addMeasurementItemRequest: AddOrUpdateMeasurementItemRequest,
  options?: { [key: string]: any },
) {
  return request<ApiResponse<MeasurementItemVO>>(
    `${API_BASE_URL}/business/measurement-item/addMeasurementItem`,
    {
      method: 'POST',
      data: addMeasurementItemRequest,
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
      message.error(`添加计量项失败：${error}`);
      throw error;
    });
}

/** 更新计量项 POST /api/business/measurement-item/updateMeasurementItem */
export async function updateMeasurementItem(
  updateMeasurementItemRequest: AddOrUpdateMeasurementItemRequest,
  options?: { [key: string]: any },
) {
  return request<ApiResponse<MeasurementItemVO>>(
    `${API_BASE_URL}/business/measurement-item/updateMeasurementItem`,
    {
      method: 'POST',
      data: updateMeasurementItemRequest,
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
      message.error(`更新计量项失败：${error}`);
      throw error;
    });
}

/** 删除计量项 GET /api/business/measurement-item/deleteMeasurementItem */
export async function deleteMeasurementItem(id: number, options?: { [key: string]: any }) {
  return request<ApiResponse<boolean>>(
    `${API_BASE_URL}/business/measurement-item/deleteMeasurementItem`,
    {
      method: 'GET',
      params: { id },
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
      message.error(`删除计量项失败：${error}`);
      throw error;
    });
}
