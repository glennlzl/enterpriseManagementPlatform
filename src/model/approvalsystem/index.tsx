export interface ApprovalInfoVO {
  id: number;
  approvalInitiatorId: number;
  approvalInitiatorName: string;
  approvalReceiverId: number;
  approvalReceiverName: string;
  approvalType: number;
  approvalStatus: number;
  approvalFileUrl: string;
  updateTime: string;
  createTime: string;
}

// 对应于 AddApprovalInfoRequest DO
export interface AddApprovalInfoRequest {
  approvalInitiatorId: number;
  approvalInitiatorName: string;
  approvalReceiverId: number;
  approvalReceiverName: string;
  approvalType: number;
  approvalStatus: number;
  approvalFileUrl: string;
}

// 对应于 UplodaFileUrlRequest DO
export interface UplodaFileUrlRequest {
  id: number;
  fileUrl: string;
}

// 对应于 UpdateDecisionRequest DO
export interface UpdateDecisionRequest {
  id: number;
  isAgree: boolean;
}
