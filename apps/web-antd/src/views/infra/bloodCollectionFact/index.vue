<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { EchartsUIType } from '@vben/plugins/echarts';

import { ref } from 'vue';
import { Page } from '@vben/common-ui';
import { Card } from 'ant-design-vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  aggregateBloodCollectionFact,
  getBloodCollectionFactPage,
} from '#/api/infra/bloodCollectionFact';

import { useGridColumns, useGridFormSchema } from './data';

// --- 图表逻辑 ---
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const chartOptions: echarts.EChartsOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['供血次数', '供血量(U)'] },
  xAxis: { type: 'category', data: [] },
  yAxis: [
    { type: 'value', name: '次数', position: 'left' },
    { type: 'value', name: '供血量(U)', position: 'right' }
  ],
  series: [
    { name: '供血次数', type: 'bar', yAxisIndex: 0, data: [] },
    { name: '供血量(U)', type: 'line', smooth: true, yAxisIndex: 1, data: [] },
  ],
};

async function fetchChartData(formValues: any) {
  try {
    // 拷贝表单数据避免污染
    const filter = { ...formValues };

    // 格式化时间范围参数为后端所需的格式 (如果有)
    if (filter.bloodCollectionTime && filter.bloodCollectionTime.length === 2) {
      // 检查是否已经包含时分秒，如果只有日期则补充
      const startStr = filter.bloodCollectionTime[0];
      const endStr = filter.bloodCollectionTime[1];
      filter.bloodCollectionTime = [
        startStr.includes(':') ? startStr : `${startStr} 00:00:00`,
        endStr.includes(':') ? endStr : `${endStr} 23:59:59`
      ];
    }

    const res = await aggregateBloodCollectionFact({
      filter,
      groupBy: [30], // 30 对应 TIME_DAY (按日聚合)
      metrics: [
        { op: 1, field: 1, alias: 'totalCount' }, // COUNT * -> 献血人次
        { op: 3, field: 4, alias: 'totalVolume' }, // SUM base_unit_value -> 采血量(U)
      ],
      limit: 30,
    });

    // 假设后端返回的数据结构在 res.data 或 res.rows 或直接在 res 中
    let dataList = res?.data || res?.rows || res || [];
    
    // 如果返回数据格式带有 keys/values 结构 (例如 { keys: { timeDay: '...' }, values: { totalVolume: 1 } })
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
      // 如果返回数据结构是平铺的 (例如 { timeDay: '...', totalVolume: 1 })
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
    console.error('获取供血聚合图表数据失败:', error);
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
          // 1. 同步刷新图表数据
          fetchChartData(formValues);

          // 2. 构造分页查询条件
          const queryParams = {
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          };

          // 格式化时间范围参数
          if (queryParams.bloodCollectionTime && queryParams.bloodCollectionTime.length === 2) {
            const startStr = queryParams.bloodCollectionTime[0];
            const endStr = queryParams.bloodCollectionTime[1];
            queryParams.bloodCollectionTime = [
              startStr.includes(':') ? startStr : `${startStr} 00:00:00`,
              endStr.includes(':') ? endStr : `${endStr} 23:59:59`
            ];
          }

          // 3. 获取列表数据
          const res = await getBloodCollectionFactPage(queryParams);
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
      <Card title="供血趋势概览 (按采血日期)">
        <EchartsUI ref="chartRef" height="300px" />
      </Card>
      <div class="flex-1 min-h-0">
        <Grid table-title="供血数据列表" />
      </div>
    </div>
  </Page>
</template>