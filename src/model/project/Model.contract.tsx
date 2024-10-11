import {EmployeeSimpleInfoResponse} from "@/api/usermanagement";

export interface wMeasurementItemVO {
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


export interface ContractInfoVO {
  id?: number;
  name?: string;
  contractSerialNumber?: string;
  type?: string;
  contractor?: string;
  contractAmount?: string;
  startDate?: string;
  endDate?: string;
  contractOrder?: number;
  extend?: string;
  contractProvisionalPrice?: string;
  contractTermType?: string;
  supervisingOrganization?: string;
  monitoringOrganization?: string;
  consultingOrganization?: string;
  accountName?: string;
  accountBank?: string;
  accountNumber?: string;
  financialResponsiblePerson?: string;
  financialResponsiblePersonId?: number;
  financialResponsiblePersonMobile?: string;
  relatedProjectId?: number;
  projectSchedule?: MeasurementItemVO[];
  contractCost?: MeasurementItemVO[];
  adminList?: EmployeeSimpleInfoResponse[];
  attachmentList?: string[];
  updateTime?: string;
  createTime?: string;
}

export interface AddOrUpdateContractInfoRequest extends Omit<ContractInfoVO, 'id'> {
  id?: number;
}
