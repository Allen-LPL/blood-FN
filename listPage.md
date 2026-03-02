# 带有搜索、图表和数据列表页面的开发指南 (List Page with Chart)

在企业级后台管理系统中，我们经常会遇到这样一种页面布局：

1. **顶部**：复杂的筛选和搜索表单。
2. **中间**：根据搜索结果聚合生成的数据趋势图表（如折线图、柱状图等）。
3. **底部**：符合搜索条件的详细数据列表，并支持分页。

在使用 `Vben Admin` (v5 / vben-vxe-grid) 开发时，推荐的实现思路是将它们集成在一个页面容器内，并使用表格的生命周期或查询动作来联动更新图表数据。

## 核心实现逻辑

### 1. 共享搜索表单参数

`useVbenVxeGrid` 提供了基于 JSON Schema 生成表单的能力。我们可以不单独手写一个表单组件，而是直接利用 `formOptions` 配置，生成搜索栏。表单提交时，参数将通过表格内部机制透传。

### 2. 利用插槽插入图表

由于 `VbenVxeGrid` 会将其封装的搜索表单、工具栏和列表表格结合在一起，如果我们在外部放一个 `Card` 装图表，表单会出现在图表下方（因为表单属于Grid组件内部）。

为了实现“表单 -> 图表 -> 列表”的顺序，我们应该利用 `VbenVxeGrid` 的 `<template #top>` 插槽：

- 在该插槽中，首先手动挂载表单实例：``
- 接着放入包含图表的容器（如 `Card` 组件）。

### 3. 请求联动触发机制

不要分开在表单的 `submit` 和表格的 `query` 事件中分别去拉数据，这样容易导致状态不一致和重复代码。 **最佳实践**是：拦截 `useVbenVxeGrid` 的 `proxyConfig.ajax.query` 回调。

当表格进行数据查询（包含初次渲染、点击搜索、分页切换等操作）时，该回调必定触发。我们在这个回调中：

1. **获取分页数据**：调用业务接口 `getPageList({ ...formValues, pageNo, pageSize })` 返回给表格。
2. **异步触发图表数据更新**：同时利用当前的 `formValues` 调用聚合查询接口 `fetchChartData(formValues)`，并在拿到数据后调用 `renderEcharts` 重绘图表。

这种方式确保了列表数据和图表数据永远根据同一次查询条件进行更新，且查询状态完全由表格内部的机制来驱动。

## 完整代码模板参考

```vue
<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { EchartsUIType } from '@vben/plugins/echarts';

import { ref } from 'vue';
import { Page } from '@vben/common-ui';
import { Card } from 'ant-design-vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
// 替换为具体的API
import { aggregateDataApi, getPageListApi } from '#/api/someModule';

import { useGridColumns, useGridFormSchema } from './data';

// --- 图表逻辑 ---
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const chartOptions: echarts.EChartsOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['指标A', '指标B'] },
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value' },
  series: [
    { name: '指标A', type: 'line', smooth: true, data: [] },
    { name: '指标B', type: 'line', smooth: true, data: [] },
  ],
};

async function fetchChartData(formValues: Record<string, any>) {
  try {
    const res = await aggregateDataApi({
      filter: formValues,
      groupBy: ['TIME_DAY'], // 具体根据业务配置
      metrics: [
        { name: 'SUM_A', alias: 'valA' },
        { name: 'COUNT_B', alias: 'valB' },
      ],
      limit: 30,
    });

    const dataList = res || [];
    const xAxisData = dataList.map((item: any) => item.timeDay || '');
    const valAData = dataList.map((item: any) => item.valA || 0);
    const valBData = dataList.map((item: any) => item.valB || 0);

    renderEcharts({
      ...chartOptions,
      xAxis: { ...chartOptions.xAxis, data: xAxisData },
      series: [
        { ...(chartOptions.series as any)[0], data: valAData },
        { ...(chartOptions.series as any)[1], data: valBData },
      ],
    });
  } catch (error) {
    console.error('Failed to fetch chart data:', error);
  }
}

// --- 表格逻辑 ---
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    collapsed: false, // 是否默认折叠表单
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    pagerConfig: { enabled: true },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          // 1. 同步刷新图表数据
          fetchChartData(formValues);

          // 2. 获取列表数据
          return await getPageListApi({
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: { keyField: 'id', isHover: true },
    toolbarConfig: { refresh: true, search: true },
  } as VxeTableGridOptions,
});
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="数据列表">
      <!-- 关键：利用 #form 插槽，将图表插入表单内部、实际表格上方 -->
      <template #top>
        <!-- 正常展示内置的搜索表单 -->

        <!-- 图表区域，通过 margin 隔开 -->
        <Card class="mb-2 mt-4" title="数据趋势与概览">
          <EchartsUI ref="chartRef" height="300px" />
        </Card>
      </template>
    </Grid>
  </Page>
</template>
```

## 注意事项

1. **`auto-content-height` 的运用**： `<Page>` 开启该属性后，会计算内部高度让子元素铺满剩余空间。 `<Grid>` 组件能够很好地适配这一高度进行表格滚动区的调整。放入 `Card` 图表后，依然能够自适应表格高度。
2. **图表更新防抖**：由于 `proxyConfig.ajax.query` 会在挂载时默认调用，因此不需要在 `onMounted` 里再去单独调用获取图表的接口，否则会导致请求重复发出。
3. **接口返回格式**：确保你的聚合查询 `aggregateDataApi` 和分页查询 `getPageListApi` 返回数据格式正确。尤其是分页接口，要符合 `PageResult<T>` 的格式以供 Vben Admin 解析总条数和当前页数据。


## 实战案例：供血数据查询页面 (Blood Supply Fact)

基于后端 `blood_supply_fact` 接口，我们可以实现一个完整的供血数据查询页面。该页面包含：
1. **顶部**：供血相关的多条件搜索表单。
2. **中间**：按发血时间聚合的供血量趋势图（支持柱状图和折线图双轴展示）。
3. **底部**：供血明细数据列表。

### 1. API 接口定义 (`#/api/bloodSupply.ts`)

```typescript
import { request } from '#/utils/request';

// 分页查询供血明细
export function getBloodSupplyPageApi(params: any) {
  return request.get({
    url: '/admin-api/infra/blood-supply-fact/page',
    params,
  });
}

// 聚合查询供血数据（用于图表）
export function aggregateBloodSupplyApi(data: any) {
  return request.post({
    url: '/admin-api/infra/blood-supply-fact/aggregate',
    data,
  });
}
```

### 2. 表格与表单配置 (`data.ts`)

```typescript
import type { VbenFormSchema } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'donationCode',
      label: '献血编号',
      component: 'Input',
    },
    {
      fieldName: 'productCode',
      label: '产品编号',
      component: 'Input',
    },
    {
      fieldName: 'bloodProductName',
      label: '血液产品名称',
      component: 'Input',
    },
    {
      fieldName: 'abo',
      label: 'ABO血型',
      component: 'Select',
      componentProps: {
        options: [
          { label: 'A型', value: 'A' },
          { label: 'B型', value: 'B' },
          { label: 'O型', value: 'O' },
          { label: 'AB型', value: 'AB' },
        ],
      },
    },
    {
      fieldName: 'issueTime',
      label: '发血时间',
      component: 'RangePicker',
    },
  ];
}

export function useGridColumns(): VxeGridProps['columns'] {
  return [
    { type: 'seq', width: 50 },
    { field: 'donationCode', title: '献血编号', minWidth: 150 },
    { field: 'productCode', title: '产品编号', minWidth: 150 },
    { field: 'bloodProductName', title: '血液产品名称', minWidth: 150 },
    { field: 'abo', title: 'ABO血型', width: 100 },
    { field: 'rhd', title: 'RhD血型', width: 100 },
    { field: 'bloodAmount', title: '血量', width: 100 },
    { field: 'baseUnitValue', title: '折合单位', width: 100 },
    { field: 'issueTime', title: '发血时间', minWidth: 150 },
    { field: 'issueType', title: '发血类型', minWidth: 120 },
    { field: 'issuingOrg', title: '发血机构', minWidth: 150 },
    { field: 'receivingOrg', title: '收血机构', minWidth: 150 },
  ];
}
```

### 3. 页面主逻辑 (`index.vue`)

```vue
<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { EchartsUIType } from '@vben/plugins/echarts';

import { ref } from 'vue';
import { Page } from '@vben/common-ui';
import { Card } from 'ant-design-vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { aggregateBloodSupplyApi, getBloodSupplyPageApi } from '#/api/bloodSupply';
import { useGridColumns, useGridFormSchema } from './data';

// --- 图表逻辑 ---
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const chartOptions: echarts.EChartsOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['发血单数', '发血折合单位(U)'] },
  xAxis: { type: 'category', data: [] },
  yAxis: [
    { type: 'value', name: '单数', position: 'left' },
    { type: 'value', name: '折合单位(U)', position: 'right' }
  ],
  series: [
    { name: '发血单数', type: 'bar', yAxisIndex: 0, data: [] },
    { name: '发血折合单位(U)', type: 'line', smooth: true, yAxisIndex: 1, data: [] },
  ],
};

async function fetchChartData(formValues: Record<string, any>) {
  try {
    // 拷贝表单数据避免污染
    const filter = { ...formValues };
    
    // 格式化时间范围参数为后端所需的格式 (如果有)
    if (filter.issueTime && filter.issueTime.length === 2) {
      filter.issueTime = [
        filter.issueTime[0] + ' 00:00:00',
        filter.issueTime[1] + ' 23:59:59'
      ];
    }

    // 构造聚合查询请求体
    const reqData = {
      filter,
      groupBy: [30], // 30 对应 TIME_DAY (按日聚合)
      metrics: [
        { op: 1, field: 1, alias: 'totalCount' }, // COUNT(*) -> 发血单数
        { op: 3, field: 4, alias: 'totalVolume' }, // SUM(base_unit_value) -> 发血总折合单位
      ],
      limit: 30,
    };

    const res = await aggregateBloodSupplyApi(reqData);
    // 假设后端返回的数据结构在 res.data 中
    const dataList = res?.data || res || [];
    
    // 解析返回的别名数据
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
  } catch (error) {
    console.error('获取供血聚合图表数据失败:', error);
  }
}

// --- 表格逻辑 ---
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    collapsed: false, // 默认展开搜索表单
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    pagerConfig: { enabled: true },
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
          if (queryParams.issueTime && queryParams.issueTime.length === 2) {
            queryParams.issueTime = [
              queryParams.issueTime[0] + ' 00:00:00',
              queryParams.issueTime[1] + ' 23:59:59'
            ];
          }

          // 3. 获取列表数据
          const res = await getBloodSupplyPageApi(queryParams);
          return {
            // 假设后端返回格式为 { list: [], total: 0 } 或直接在 res 内
            items: res?.list || res?.data?.list || [],
            total: res?.total || res?.data?.total || 0,
          };
        },
      },
    },
    rowConfig: { keyField: 'id', isHover: true },
    toolbarConfig: { refresh: true, search: true },
  } as VxeTableGridOptions,
});
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="供血明细数据列表">
      <!-- 关键：利用 #top 插槽，将图表插入表单与实际表格之间 -->
      <template #top>
        <Card class="mb-2 mt-4" title="供血趋势概览 (按发血日期)">
          <EchartsUI ref="chartRef" height="300px" />
        </Card>
      </template>
    </Grid>
  </Page>
</template>
```