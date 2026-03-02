<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { EchartsUIType } from '@vben/plugins/echarts';

import { ref } from 'vue';
import { Page } from '@vben/common-ui';
import { Card } from 'ant-design-vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  aggregateBloodSupplyFact,
  getBloodSupplyFactPage,
} from '#/api/infra/bloodSupplyFact';

import { useGridColumns, useGridFormSchema } from './data';

// --- 图表逻辑 ---
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const chartOptions: echarts.EChartsOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['采血人次', '采血量(U)'] },
  xAxis: { type: 'category', data: [] },
  yAxis: [
    { type: 'value', name: '人次', position: 'left' },
    { type: 'value', name: '采血量(U)', position: 'right' }
  ],
  series: [
    { name: '采血人次', type: 'bar', yAxisIndex: 0, data: [] },
    { name: '采血量(U)', type: 'line', smooth: true, yAxisIndex: 1, data: [] },
  ],
};

async function fetchChartData(formValues: any) {
  try {
    const filter = { ...formValues };

    if (filter.issueTime && filter.issueTime.length === 2) {
      const startStr = filter.issueTime[0];
      const endStr = filter.issueTime[1];
      filter.issueTime = [
        startStr.includes(':') ? startStr : `${startStr} 00:00:00`,
        endStr.includes(':') ? endStr : `${endStr} 23:59:59`
      ];
    }

    const res = await aggregateBloodSupplyFact({
      filter,
      groupBy: [30], // 30 = TIME_DAY 供血时间（发血日期）
      metrics: [
        { op: 1, field: 1, alias: 'totalCount' }, // COUNT *
        { op: 3, field: 4, alias: 'totalVolume' }, // SUM base_unit_value
      ],
      limit: 30,
    });

    let dataList = res?.data || res?.rows || res || [];
    
    if (dataList.length > 0 && dataList[0].keys) {
      dataList.sort((a: any, b: any) => {
        const timeA = a.keys?.timeDay || '';
        const timeB = b.keys?.timeDay || '';
        return timeA.localeCompare(timeB);
      });
      const xAxisData = dataList.map((item: any) => item.keys?.timeDay || '');
      const countData = dataList.map((item: any) => item.values?.totalCount || 0);
      const volumeData = dataList.map((item: any) => item.values?.totalVolume || 0);

      renderEcharts({
        ...chartOptions,
        xAxis: { ...chartOptions.xAxis, data: xAxisData },
        series: [
          { ...(chartOptions.series as any)[0], data: countData },
          { ...(chartOptions.series as any)[1], data: volumeData },
        ],
      });
    } else {
      dataList.sort((a: any, b: any) => {
        const timeA = a.timeDay || '';
        const timeB = b.timeDay || '';
        return timeA.localeCompare(timeB);
      });
      const xAxisData = dataList.map((item: any) => item.timeDay || '');
      const countData = dataList.map((item: any) => item.totalCount || 0);
      const volumeData = dataList.map((item: any) => item.totalVolume || 0);

      renderEcharts({
        ...chartOptions,
        xAxis: { ...chartOptions.xAxis, data: xAxisData },
        series: [
          { ...(chartOptions.series as any)[0], data: countData },
          { ...(chartOptions.series as any)[1], data: volumeData },
        ],
      });
    }
  } catch (error) {
    console.error('获取采血聚合图表数据失败:', error);
  }
}

// --- 表格逻辑 ---
const [Grid] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    collapsed: false,
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    minHeight: 400,
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          fetchChartData(formValues);

          const queryParams = {
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          };

          if (queryParams.issueTime && queryParams.issueTime.length === 2) {
            const startStr = queryParams.issueTime[0];
            const endStr = queryParams.issueTime[1];
            queryParams.issueTime = [
              startStr.includes(':') ? startStr : `${startStr} 00:00:00`,
              endStr.includes(':') ? endStr : `${endStr} 23:59:59`
            ];
          }

          const res = await getBloodSupplyFactPage(queryParams);
          return {
            items: res?.list || [],
            total: res?.total || 0,
          };
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      refresh: true,
      search: true,
    },
  } as VxeTableGridOptions,
});
</script>

<template>
  <Page auto-content-height>
    <div class="flex flex-col h-full gap-4">
      <Card title="采血趋势概览 (按发血日期)">
        <EchartsUI ref="chartRef" height="300px" />
      </Card>
      <div class="min-h-0 flex-1">
        <Grid table-title="采血数据列表" />
      </div>
    </div>
  </Page>
</template>