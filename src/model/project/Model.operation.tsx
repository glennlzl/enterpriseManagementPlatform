// src/model/operationlog.ts

export interface OperationLogVO {
  operator: string;
  operationType: string;
  operationField: string;
  operationFieldOriginalValue: string;
  operationFieldNewValue: string;
  createTime: string;
}
