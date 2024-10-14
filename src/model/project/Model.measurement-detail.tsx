export interface MeasurementDetailVO {
  id?: number;
  name?: string;
  measurementItemId?: number;
  subItemNumber?: string;
  position?: string;
  price?: number;
  unit?: string;
  currentCount?: number;
  totalCount?: number;
  remainingCount?: number;
  currentAmount?: number;
  upperLimitQuantity?: number;
  measurementStatus?: number;
  measurementComment?: string;
  measurementBillNumber?: string;
  measurementType?: string;
  relatedProjectId?: number;
  relatedContractId?: number;
  relatedPeriodId?: number;
  attachmentList?: string[];
  updateTime?: string;
  createTime?: string;
  extend?: string;
  contractCostType?: string;
  transactionType?: string;
}

export interface AddOrUpdateMeasurementDetailRequest {
  id?: number;
  measurementItemId: number;
  subItemNumber?: string;
  position?: string;
  currentCount: number;
  measurementBillNumber?: string;
  relatedProjectId: number;
  relatedContractId: number;
  relatedPeriodId: number;
  attachmentList?: string[];
  extend?: string;
}

export interface ReviewRequest {
  id: number;
  comment?: string;
  isPass: boolean;
}
