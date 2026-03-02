import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import dayjs from 'dayjs';

import { getRangePickerDefaultProps } from '#/utils';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'donationCode',
      label: '献血码',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入献血码',
      },
    },
    {
      fieldName: 'productCode',
      label: '产品码',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入产品码',
      },
    },
    {
      fieldName: 'bloodProductName',
      label: '血液品种',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入血液品种',
      },
    },
    {
      fieldName: 'abo',
      label: 'ABO血型',
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择ABO血型',
        options: [
          { label: 'A型', value: 'A' },
          { label: 'B型', value: 'B' },
          { label: 'O型', value: 'O' },
          { label: 'AB型', value: 'AB' },
        ],
      },
    },
    {
      fieldName: 'rhd',
      label: 'Rh(D)血型',
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择Rh(D)',
        options: [
          { label: '阳性(+)', value: '阳性' },
          { label: '阴性(-)', value: '阴性' },
        ],
      },
    },
    {
      fieldName: 'issueType',
      label: '发血类型',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入发血类型',
      },
    },
    {
      fieldName: 'issuingOrg',
      label: '发血机构',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入发血机构',
      },
    },
    {
      fieldName: 'receivingOrg',
      label: '收血机构',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入收血机构',
      },
    },
    {
      fieldName: 'issueTime',
      label: '发血时间',
      component: 'RangePicker',
      componentProps: {
        ...getRangePickerDefaultProps(),
      },
      defaultValue: [
        dayjs().subtract(6, 'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      ],
    },
  ];
}

export function useGridColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', title: '序号', width: 60 },
    { field: 'donationCode', title: '献血码', minWidth: 120 },
    { field: 'productCode', title: '产品码', minWidth: 120 },
    { field: 'bloodProductName', title: '血液品种', minWidth: 120 },
    { field: 'abo', title: 'ABO血型', minWidth: 80 },
    { field: 'rhd', title: 'Rh(D)', minWidth: 80 },
    { field: 'bloodAmount', title: '血量(规格)', minWidth: 100 },
    { field: 'baseUnitValue', title: '基本单位值(U)', minWidth: 120 },
    { field: 'issueTime', title: '发血时间', minWidth: 150 },
    { field: 'bloodExpiryTime', title: '失效时间', minWidth: 150 },
    { field: 'issueType', title: '发血类型', minWidth: 100 },
    { field: 'issuingOrg', title: '发血机构', minWidth: 120 },
    { field: 'receivingOrg', title: '收血机构', minWidth: 120 },
    { field: 'receivingOrgAdminRegion', title: '收血机构所在区', minWidth: 120 },
  ];
}