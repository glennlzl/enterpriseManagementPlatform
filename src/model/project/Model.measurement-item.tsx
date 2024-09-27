// models.ts

export interface AddOrUpdateMeasurementItemRequest {
  id?: number;
  itemType: string;
  itemName: string;
  itemPrice: number;
  itemUnit: string;
  contractCostType?: string;
  transactionType?: string;
  designCount?: number;
}

export interface MeasurementItemVO {
  id?: number;
  itemType?: string;
  itemName?: string;
  itemPrice?: number;
  itemUnit?: string;
  contractCostType?: string;
  transactionType?: string;
  designCount?: number;
  updateTime?: string;
  createTime?: string;
}
