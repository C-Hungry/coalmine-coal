const routers = [
    {
        path: '/',
        redirect: "/pub/login",
    },
    // // 检测兼容界面
    // {
    //     path: '/notSupport',
    //     component: (resolve) => require(['../components/zkNotSupport.vue'], resolve),
    // },
    {
        path: '/pub',
        component: (resolve) => require(['../views/pub/index.vue'], resolve),
        children: [
            // 登录
            {
                path: '/pub/login',
                component: (resolve) => require(['../views/pub/login'], resolve),
            }
        ]
    },
    {
        path: '/auth',
        component: (resolve) => require(['../views/auth/index.vue'], resolve),
        children: [
            // 首页
            {
                path: '/auth/home',
                component: (resolve) => require(['../views/auth/common/home'], resolve),
            },
            // 组织机构
            {
                path: '/auth/org',
                component: (resolve) => require(['../views/auth/common/org'], resolve),
            },
            // 资源管理
            {
                path: '/auth/res',
                component: (resolve) => require(['../views/auth/common/res'], resolve),
            },
            // 角色管理
            {
                path: '/auth/role',
                component: (resolve) => require(['../views/auth/common/role'], resolve),
            },
            // 用户管理
            {
                path: '/auth/user',
                component: (resolve) => require(['../views/auth/common/user'], resolve),
            },
            // 数据字典
            {
                path: '/auth/dict',
                component: (resolve) => require(['../views/auth/common/dict'], resolve),
            },
            // 车辆管理
            {
                path: '/auth/vehicle',
                component: (resolve) => require(['../views/auth/business/basedata/vehicle'], resolve),
            },
            // 内部车辆管理
            {
                path: '/auth/innerVehicle',
                component: (resolve) => require(['../views/auth/business/basedata/innerVehicle'], resolve),
            },
            // 煤种管理
            {
                path: '/auth/coalType',
                component: (resolve) => require(['../views/auth/business/basedata/coalType'], resolve),
            },
            // 煤仓管理
            {
                path: '/auth/coalBunker',
                component: (resolve) => require(['../views/auth/business/basedata/coalBunker'], resolve),
            },
            // 场区容量车数设置
            {
                path: '/auth/vehicleCapacity',
                component: (resolve) => require(['../views/auth/business/basedata/vehicleCapacity'], resolve),
            },
            // 车辆放行模式
            {
                path: '/auth/vehicleRelease',
                component: (resolve) => require(['../views/auth/business/basedata/vehicleRelease'], resolve),
            },
            // 客户销售控制
            {
                path: '/auth/customerSales',
                component: (resolve) => require(['../views/auth/business/basedata/customerSales'], resolve),
            },
            // 车型参数设置
            {
                path: '/auth/vechicleParamSetting',
                component: (resolve) => require(['../views/auth/business/basedata/vechicleParam'], resolve),
            },
            // 过磅模式
            {
                path: '/auth/weightMode',
                component: (resolve) => require(['../views/auth/business/basedata/weightMode'], resolve),
            },
            // 调煤单管理
            {
                path: '/auth/transferOrderManage',
                component: (resolve) => require(['../views/auth/business/coalTransfer/orderManage'], resolve),
            },
            // 调煤单审批
            {
                path: '/auth/transferOrderApproval',
                component: (resolve) => require(['../views/auth/business/coalTransfer/orderApproval'], resolve),
            },
            // 运单管理
            {
                path: '/auth/waybillManage',
                component: (resolve) => require(['../views/auth/business/waybill/waybillManage'], resolve),
            },
            // 卡初始化
            {
                path: '/auth/cardInit',
                component: (resolve) => require(['../views/auth/business/transportCard/cardInit'], resolve),
            },
            // 发卡管理
            {
                path: '/auth/cardGrant',
                component: (resolve) => require(['../views/auth/business/transportCard/cardGrant'], resolve),
            },
            // 退卡管理
            {
                path: '/auth/cardRefund',
                component: (resolve) => require(['../views/auth/business/transportCard/cardRefund'], resolve),
            },
            // 运输卡查询
            {
                path: '/auth/cardQuery',
                component: (resolve) => require(['../views/auth/business/transportCard/cardQuery'], resolve),
            },
            // 派车管理
            {
                path: '/auth/vehicleDispatch',
                component: (resolve) => require(['../views/auth/business/transportProcess/vehicleDispatch'], resolve),
            },
            // 运销过程终止
            {
                path: '/auth/processForbid',
                component: (resolve) => require(['../views/auth/business/transportProcess/processForbid'], resolve),
            },
            // 运销终止审批
            {
                path: '/auth/transforbidApproval',
                component: (resolve) => require(['../views/auth/business/transportProcess/transforbidApproval'], resolve),
            },
            // 运销状态查询
            {
                path: '/auth/transportProcessState',
                component: (resolve) => require(['../views/auth/business/transportProcess/transportState'], resolve),
            },
            // 异常信息管理
            {
                path: '/auth/abnormalInfo',
                component: (resolve) => require(['../views/auth/business/transportProcess/abnormalInfo'], resolve),
            },
            // 手动放行
            {
                path: '/auth/manualRelease',
                component: (resolve) => require(['../views/auth/business/transportProcess/manualRelease'], resolve),
            },
            // 计量数据修改
            {
                path: '/auth/measurementModify',
                component: (resolve) => require(['../views/auth/business/transportProcess/measurementModify'], resolve),
            },
            // 计量数据修改审批
            {
                path: '/auth/measurementApprove',
                component: (resolve) => require(['../views/auth/business/transportProcess/measurementApprove'], resolve),
            },
            // 调运计划管理
            {
                path: '/auth/transPlanManage',
                component: (resolve) => require(['../views/auth/business/coalTransportation/transPlanManage'], resolve),
            },
            // 调运计划审批
            {
                path: '/auth/transPlanApproval',
                component: (resolve) => require(['../views/auth/business/coalTransportation/transPlanApproval'], resolve),
            },
            // 调运计划派车
            {
                path: '/auth/transPlanDispatch',
                component: (resolve) => require(['../views/auth/business/coalTransportation/transPlanDispatch'], resolve),
            },
            // 调运手动出场
            {
                path: '/auth/tpManualRelease',
                component: (resolve) => require(['../views/auth/business/coalTransportation/tpManualRelease'], resolve),
            },
            // 矿发销售明细表
            {
                path: '/auth/coalSendSalesStatement',
                component: (resolve) => require(['../views/auth/business/statement/coalSendSales'], resolve),
            },
            // 2号煤台销售明细表
            {
                path: '/auth/coalPlat2SalesStatement',
                component: (resolve) => require(['../views/auth/business/statement/coalPlat2Sales'], resolve),
            },
            // 矿发销售煤种统计表
            {
                path: '/auth/coalTypeSendStatement',
                component: (resolve) => require(['../views/auth/business/statement/coalTypeSend'], resolve),
            },
            // 煤台销售煤种统计表
            {
                path: '/auth/coalTypePlatStatement',
                component: (resolve) => require(['../views/auth/business/statement/coalTypePlat'], resolve),
            },
            // 矸石明细表
            {
                path: '/auth/gangueStatement',
                component: (resolve) => require(['../views/auth/business/statement/gangue'], resolve),
            },
            // 煤台调运明细表
            {
                path: '/auth/coalPlatTransportStatement',
                component: (resolve) => require(['../views/auth/business/statement/coalPlatTransport'], resolve),
            },
            // 过磅明细表
            {
                path: '/auth/weighStatement',
                component: (resolve) => require(['../views/auth/business/statement/weigh'], resolve),
            },
            // 打印磅单
            {
                path: '/auth/printWeightBill',
                component: (resolve) => require(['../views/auth/business/print/printWeightBill'], resolve),
            },
            // 调运运销过程查询
            {
                path: '/auth/dyProcessQuery',
                component: (resolve) => require(['../views/auth/business/coalTransportation/dyProcessQuery'], resolve),
            },
            // 计量数据补录
            {
                path: '/auth/measureSupplement',
                component: (resolve) => require(['../views/auth/business/transportProcess/measureSupplement'], resolve),
            },
            // 调运计划卸煤计量数据修改
            {
                path: '/auth/xmMeasureModify',
                component: (resolve) => require(['../views/auth/business/coalTransportation/xmMeasureModify'], resolve),
            },
        ]
    },
];
export default routers;