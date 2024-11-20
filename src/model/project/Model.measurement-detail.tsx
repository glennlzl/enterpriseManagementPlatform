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

export interface MeasurementExcelSubItemVO {
  measurementItemId: number;
  subItemNumber: string;
  measurementBillNumber: string;
  name: string;
  position: string;
  lastCount: number;
  currentCount: number;
  totalCount: number;
  lastAmount: number;
  currentAmount: number;
  totalAmount: number;
  measurementComment: string;
}

export interface MeasurementExcelVO {
  name: string;
  price: number;
  unit: string;
  lastCount: number;
  currentCount: number;
  totalCount: number;
  lastAmount: number;
  currentAmount: number;
  totalAmount: number;
  measurementComment: string;
  subItems: MeasurementExcelSubItemVO[];
}
