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
      fieldName: 'archiveId',
      label: '档案ID',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入档案ID',
      },
    },
    {
      fieldName: 'collectionDepartment',
      label: '采血部门',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入采血部门',
      },
    },
    {
      fieldName: 'collectionSite',
      label: '采血地点',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入采血地点',
      },
    },
    {
      fieldName: 'donationType',
      label: '献血类型',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入献血类型',
      },
    },
    {
      fieldName: 'gender',
      label: '性别',
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择性别',
        options: [
          { label: '男', value: '男' },
          { label: '女', value: '女' },
        ],
      },
    },
    {
      fieldName: 'bloodCollectionTime',
      label: '采血时间',
      component: 'RangePicker',
      componentProps: {
        ...getRangePickerDefaultProps(),
      },
      defaultValue: [
        dayjs().subtract(6, 'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      ],
    },
    {
      fieldName: 'fullVolumeFlag',
      label: '是否足量',
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择是否足量',
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ],
      },
    },
    {
      fieldName: 'archiveBloodType',
      label: '档案血型',
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择档案血型',
        options: [
          { label: 'A型', value: 'A' },
          { label: 'B型', value: 'B' },
          { label: 'O型', value: 'O' },
          { label: 'AB型', value: 'AB' },
        ],
      },
    },
    {
      fieldName: 'precheckBloodType',
      label: '初筛血型',
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择初筛血型',
        options: [
          { label: 'A型', value: 'A' },
          { label: 'B型', value: 'B' },
          { label: 'O型', value: 'O' },
          { label: 'AB型', value: 'AB' },
        ],
      },
    },
  ];
}

export function useGridColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', title: '序号', width: 60 },
    { field: 'donationCode', title: '献血码', minWidth: 120 },
    { field: 'archiveId', title: '档案ID', minWidth: 120 },
    { field: 'collectionDepartment', title: '采血部门', minWidth: 120 },
    { field: 'collectionSite', title: '采血地点', minWidth: 120 },
    { field: 'donationType', title: '献血类型', minWidth: 100 },
    { field: 'gender', title: '性别', minWidth: 60 },
    { field: 'age', title: '年龄', minWidth: 60 },
    { field: 'registrationTime', title: '登记时间', minWidth: 150 },
    { field: 'precheckTime', title: '初筛时间', minWidth: 150 },
    { field: 'bloodCollectionTime', title: '采血时间', minWidth: 150 },
    { field: 'fullVolumeFlag', title: '足量', minWidth: 80 },
    { field: 'archiveBloodType', title: '档案血型', minWidth: 100 },
    { field: 'precheckBloodType', title: '初筛血型', minWidth: 100 },
    { field: 'baseUnitValue', title: '基本单位值', minWidth: 100 },
    { field: 'sourceFile', title: '来源文件', minWidth: 150 },
  ];
}
