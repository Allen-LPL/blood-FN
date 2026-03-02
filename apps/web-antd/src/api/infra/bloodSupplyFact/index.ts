import type { PageParam, PageResult } from '@vben/request';
import { requestClient } from '#/api/request';

export namespace InfraBloodSupplyFactApi {
  export interface BloodSupplyFact {
    id: number;
    donationCode: string;
    productCode: string;
    bloodProductName: string;
    abo: string;
    rhd: string;
    bloodAmount: string;
    baseUnitValue?: number;
    bloodExpiryTime: string;
    issueTime: string;
    issueType: string;
    returnReason: string;
    issuingOrg: string;
    receivingOrg: string;
    receivingOrgAdminRegion: string;
    sourceFile: string;
    sheetName: string;
    sourceRowNum: number;
    loadBatchId: string;
    ingestedAt: string;
  }

  export interface PageReqVO extends PageParam {
    donationCode?: string;
    productCode?: string;
    loadBatchId?: string;
    abo?: string;
    rhd?: string;
    bloodProductName?: string;
    issueType?: string;
    issuingOrg?: string;
    receivingOrg?: string;
    receivingOrgAdminRegion?: string;
    issueTime?: string[];
    bloodExpiryTime?: string[];
    ingestedAt?: string[];
    keyword?: string;
  }

  export interface AggReqVO {
    filter: Partial<PageReqVO>;
    groupBy?: number[];
    metrics?: { op: number; field: number; alias?: string }[];
    orderBy?: { key: string; direction: 'ASC' | 'DESC' };
    limit?: number;
  }

  export interface AggRespVO {
    data: any[];
  }
}

export function getBloodSupplyFactPage(
  params: InfraBloodSupplyFactApi.PageReqVO,
) {
  return requestClient.get<
    PageResult<InfraBloodSupplyFactApi.BloodSupplyFact>
  >('/infra/blood-supply-fact/page', {
    params,
  });
}

export function aggregateBloodSupplyFact(
  data: InfraBloodSupplyFactApi.AggReqVO,
) {
  return requestClient.post<any>(
    '/infra/blood-supply-fact/aggregate',
    data,
  );
}
