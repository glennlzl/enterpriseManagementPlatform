export interface PeriodInfoVO {
  id?: number;
  name?: string;
  type?: string;
  serialNumber?: string;
  startDate?: string;
  endDate?: string;
  measurementMonth?: string;
  periodStatus?: string;
  relatedProjectId?: number;
  relatedContractId?: number;
  isArchived?: number;
  attachmentList?: string[];
  updateTime?: string;
  createTime?: string;
}

export interface AddOrUpdatePeriodInfoRequest {
  id?: number;
  name: string;
  type?: string;
  serialNumber?: string;
  startDate?: string;
  endDate?: string;
  measurementMonth?: string;
  periodStatus?: string;
  relatedProjectId: number;
  relatedContractId: number;
  attachmentList?: string[];
}
