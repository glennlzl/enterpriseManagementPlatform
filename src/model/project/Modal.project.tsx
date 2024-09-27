import {EmployeeSimpleInfoResponse} from "@/api/usermanagement";

export interface ProjectInfoVO {
  id?: number;
  name?: string;
  type?: string;
  constructionOrganization?: string;
  serialNumber?: number;
  region?: string;
  projectAddress?: string;
  totalInvestment?: string;
  buildingCost?: string;
  plannedDuration?: number;
  investmentType?: string;
  startDate?: string;
  endDate?: string;
  projectDescription?: string;
  contractDate?: string;
  businessRegistrationAddress?: string;
  projectStatus?: string;
  regulatoryLevel?: string;
  techLevel?: string;
  location?: string;
  adminList?: EmployeeSimpleInfoResponse[];
  attachmentList?: string[];
  updateTime?: string;
  createTime?: string;
}

export interface AddOrUpdateProjectInfoRequest {
  id?: number;
  name: string;
  type?: string;
  constructionOrganization?: string;
  serialNumber?: number;
  region?: string;
  projectAddress?: string;
  totalInvestment?: string;
  buildingCost?: string;
  plannedDuration?: number;
  investmentType?: string;
  startDate?: string;
  endDate?: string;
  projectDescription?: string;
  contractDate?: string;
  businessRegistrationAddress?: string;
  projectStatus?: string;
  regulatoryLevel?: string;
  techLevel?: string;
  location?: string;
  adminList?: EmployeeSimpleInfoResponse[];
  attachmentList?: string[];
}
