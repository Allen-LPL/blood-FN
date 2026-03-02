import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/infra/job/log',
    component: () => import('#/views/infra/job/logger/index.vue'),
    name: 'InfraJobLog',
    meta: {
      title: '调度日志',
      icon: 'ant-design:history-outlined',
      activePath: '/infra/job',
      keepAlive: false,
      hideInMenu: true,
    },
  },
  {
    path: '/infra/codegen/edit',
    component: () => import('#/views/infra/codegen/edit/index.vue'),
    name: 'InfraCodegenEdit',
    meta: {
      title: '生成配置修改',
      icon: 'ic:baseline-view-in-ar',
      activePath: '/infra/codegen',
      keepAlive: true,
      hideInMenu: true,
    },
  },
  {
    path: '/infra/blood-collection-fact',
    component: () => import('#/views/infra/bloodCollectionFact/index.vue'),
    name: 'BloodCollectionFact',
    meta: {
      title: '供血数据查询',
      icon: 'ant-design:file-text-outlined',
    },
  },
  {
    path: '/infra/blood-supply-fact',
    component: () => import('#/views/infra/bloodSupplyFact/index.vue'),
    name: 'BloodSupplyFact',
    meta: {
      title: '采血数据查询',
      icon: 'ant-design:file-text-outlined',
    },
  },
];

export default routes;
