import ExportComponent from "@ant-design/pro-form/es/components/DatePicker";

export interface AddVehicleInfoRequest {
  vehicleNumber: string;
  engineeingVehicleNumber: string;
  licenseNumber: string;
  engineNumber: string;
  vehicleType: string;
  vehicleSerialNumber: string;
  vehicleBrand: string;
  approvedLoadCapacity?: string;
  registrant: string;
  registrantId: number;
  purchaseDate: string;
  auditMonth: string;
  isAudited?: number;
  trafficInsurance?: number;
  commercialInsurance?: number;
  trafficInsuranceDate: string;
  commercialInsuranceDate: string;
  gps?: number;
  mechanicalBond: string;
  usageProject: string;
  lastMaintenanceMileage?: number;
  currentMileage?: number;
  nextMaintenanceMileage?: number;
  responsiblePersonName?: string;
  responsiblePersonId?: number;
  responsiblePersonMobile?: string;
  extend?: string;
  driverList?: Driver[];
}

export interface UpdateVehicleInfoRequest extends Partial<AddVehicleInfoRequest> {
  id: number;
  warningLevel?: number;
}

export interface AddVehicleTypeRequest {
  vehicleType: string;
  vehicleSerialNumber: string;
  vehicleBrand: string;
  approvedLoadCapacity?: string;
}

export interface AddOrUpdateVehicleUsageInfoRequest {
  id?: number;
  vehicleId: number;
  userId: number;
  userName: string;
  startMileage: number;
  endMileage: number;
  usageStatus?: number;
  vehicleImageUrls: string[];
  extend?: string;
}

export interface VehicleInfo {
  id: number;
  vehicleNumber: string;
  engineeingVehicleNumber: string;
  licenseNumber?: string;
  engineNumber: string;
  vehicleType: string;
  vehicleSerialNumber: string;
  vehicleBrand: string;
  approvedLoadCapacity?: string;
  registrant: string;
  registrantId: number;
  purchaseDate: string;
  auditMonth: string;
  isAudited?: number;
  trafficInsurance: number;
  trafficInsuranceDate?: string;
  commercialInsurance: number;
  commercialInsuranceDate?: string;
  gps?: number;
  mechanicalBond: string;
  usageProject: string;
  lastMaintenanceMileage?: number;
  currentMileage?: number;
  nextMaintenanceMileage?: number;
  responsiblePersonName?: string;
  responsiblePersonId?: number;
  responsiblePersonMobile?: string;
  extend?: string;
  isDeleted?: number;
  isDeprecated?: number;
  warningLevel?: number;
  driverList?: Driver[];
}

export interface VehicleType {
  vehicleType: string;
  vehicleSerialNumber: string;
  vehicleBrand: string;
  approvedLoadCapacity?: string;
  maintenanceInterval: number;
}

export interface VehicleUsageInfo {
  id: number;
  vehicleId: number;
  userId: number;
  userName: string;
  startMileage: number;
  endMileage: number;
  usageStatus: number;
  vehicleImageUrls: string[];
  extend?: string;
  recordTime: string;
}

export interface Driver {
  id: number;
  name: string;
}

