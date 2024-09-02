import { GENERAL_API_BASE_URL } from '@/api/usermanagement';
import {
  AddOrUpdateVehicleUsageInfoRequest,
  AddVehicleInfoRequest,
  AddVehicleTypeRequest,
  UpdateVehicleInfoRequest,
  VehicleInfo,
  VehicleType,
  VehicleUsageInfo,
} from '@/model/vehicle-management-system';
import { request } from '@umijs/max';

const API_BASE_URL = `${GENERAL_API_BASE_URL}/business/vehicle-info`;
const API_BASE_URL_USAGE = `${GENERAL_API_BASE_URL}/business/vehicle-usage-info`;
const API_BASE_URL_TYPE = `${GENERAL_API_BASE_URL}/business/vehicle-type`;

export interface ApiResponse<T> {
  code: number;
  level?: string | null;
  msg: string;
  isSuccess: boolean;
  data: T;
  dataType?: number;
}

/** 获取车辆信息列表 */
export async function queryVehicleInfoList(params: {
  isWarning?: boolean;
  userId?: number;
  pageNum?: number;
  pageSize?: number;
  generalQueryCondition?: string;
  project?: string;
  name?: string;
}) {
  const url = new URL(`${API_BASE_URL}/queryVehicleInfoList`);
  return request<ApiResponse<VehicleInfo[]>>(url.toString(), {
    method: 'GET',
    params,
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

/** 获取车辆详细信息 */
export async function getVehicleInfo(id: number) {
  const url = new URL(`${API_BASE_URL}/getVehicleInfo`);
  return request<ApiResponse<VehicleInfo>>(url.toString(), {
    method: 'GET',
    params: { id },
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

/** 添加新车辆 */
export async function addVehicleInfo(data: AddVehicleInfoRequest) {
  const url = new URL(`${API_BASE_URL}/addVehicleInfo`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'POST',
    data,
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

/** 更新车辆信息 */
export async function updateVehicleInfo(data: UpdateVehicleInfoRequest) {
  const url = new URL(`${API_BASE_URL}/updateVehicleInfo`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'POST',
    data,
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

/** 删除车辆信息 */
export async function deleteVehicleInfo(id: number) {
  const url = new URL(`${API_BASE_URL}/deleteVehicleInfo`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'GET',
    params: { id },
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

/** 废弃车辆信息 */
export async function deprecateVehicleInfo(id: number) {
  const url = new URL(`${API_BASE_URL}/deprecateVehicleInfo`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'GET',
    params: { id },
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

/** 获取车辆类型列表 */
export async function queryVehicleTypes() {
  const url = new URL(`${API_BASE_URL_TYPE}/queryVehicleTypes`);
  return request<ApiResponse<VehicleType[]>>(url.toString(), {
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

/** 添加车辆类型 */
export async function addVehicleType(data: AddVehicleTypeRequest) {
  const url = new URL(`${API_BASE_URL_TYPE}/addVehicleType`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'POST',
    data,
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

/** 删除车辆类型 */
export async function deleteVehicleType(id: number) {
  const url = new URL(`${API_BASE_URL_TYPE}/deleteVehicleType`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'GET',
    params: { id },
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

/** 获取车辆使用信息列表 */
export async function queryVehicleUsageInfoList(vehicleId: number) {
  const url = new URL(`${API_BASE_URL_USAGE}/queryVehicleUsageInfoList`);
  return request<ApiResponse<VehicleUsageInfo[]>>(url.toString(), {
    method: 'GET',
    params: { vehicleId },
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

/** 添加或更新车辆使用信息 */
export async function addVehicleUsageInfo(data: AddOrUpdateVehicleUsageInfoRequest) {
  const url = new URL(`${API_BASE_URL_USAGE}/addVehicleUsageInfo`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'POST',
    data,
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

/** 添加或更新车辆使用信息 */
export async function updateVehicleUsageInfo(data: AddOrUpdateVehicleUsageInfoRequest) {
  const url = new URL(`${API_BASE_URL_USAGE}/updateVehicleUsageInfo`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'POST',
    data,
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

/** 删除车辆使用信息 */
export async function deleteVehicleUsageInfo(id: number) {
  const url = new URL(`${API_BASE_URL_USAGE}/deleteVehicleUsageInfo`);
  return request<ApiResponse<boolean>>(url.toString(), {
    method: 'GET',
    params: { id },
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
