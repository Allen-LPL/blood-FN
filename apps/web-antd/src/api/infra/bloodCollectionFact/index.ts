import type { PageParam, PageResult } from '@vben/request';
import { requestClient } from '#/api/request';

export namespace InfraBloodCollectionFactApi {
  export interface BloodCollectionFact {
    id: number;
    collectionDepartment: string;
    collectionSite: string;
    organizationMode: string;
    donationType: string;
    archiveId: string;
    gender: string;
    age: number;
    orgUnitName: string;
    unitProperty: string;
    systemName: string;
    unitLevel: string;
    parentUnit: string;
    unitAdminRegion: string;
    archiveCreatedDate: string;
    registrationTime: string;
    precheckTime: string;
    bloodCollectionTime: string;
    fullVolumeFlag: string;
    insufficientReason: string;
    donationCode: string;
    precheckResult: string;
    precheckFailItems: string;
    archiveBloodType: string;
    precheckBloodType: string;
    bloodVolume: string;
    baseUnitValue?: number;
    recheckResult: string;
    recheckFailItems: string;
    sourceFile: string;
    sheetName: string;
    sourceRowNum: number;
    loadBatchId: string;
    ingestedAt: string;
  }

  export interface PageReqVO extends PageParam {
    archiveId?: string;
    donationCode?: string;
    loadBatchId?: string;
    collectionDepartment?: string;
    collectionSite?: string;
    organizationMode?: string;
    donationType?: string;
    gender?: string;
    fullVolumeFlag?: string;
    archiveBloodType?: string;
    precheckBloodType?: string;
    unitAdminRegion?: string;
    age?: number[];
    registrationTime?: string[];
    precheckTime?: string[];
    bloodCollectionTime?: string[];
    ingestedAt?: string[];
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

export function getBloodCollectionFactPage(
  params: InfraBloodCollectionFactApi.PageReqVO,
) {
  return requestClient.get<
    PageResult<InfraBloodCollectionFactApi.BloodCollectionFact>
  >('/infra/blood-collection-fact/page', {
    params,
  });
}

export function aggregateBloodCollectionFact(
  data: InfraBloodCollectionFactApi.AggReqVO,
) {
  return requestClient.post<any>(
    '/infra/blood-collection-fact/aggregate',
    data,
  );
}
