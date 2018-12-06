## 柴家沟矿运销系统

```
煤场管理系统主要解决的问题

1、平台界面及权限；
2、基础数据维护；
3、煤炭销售调拨管理；
4、托运订单管理；
5、运输卡管理；
6、运销过程管理；
7、煤炭盘煤调运管理

```
### 安装及运行


```

安装依赖包推荐使用cnpm  

npm install -g cnpm --registry=https://registry.npm.taobao.org

切换cnpm地址为私有仓储

cnpm config set registry http://192.168.3.253:4873/

配置后

cnpm install   // 安装依赖包

npm run init  // 项目第一次启动需创建 index.html 

npm run dev   // 运行

npm run build  // 打包

在iis上启动生产环境：
下载安装：https://www.iis.net/downloads/microsoft/url-rewrite
创建网站目录指向当前文件夹

```

### 目录结构


```

请参照标准及时更新...


├── dist                        // 编译后的压缩包
├── src                      
│   ├── components              // 公共组件
│   │   │ 
│   │   ├── multipleVehicleModal       // 选择多个车辆（销售派车）
│   │   ├── multipleVehicleTpModal     // 选择多个内部车辆（调运派车）
│   │   ├── selectTransferOrderModal   // 选择调拨单
│   │   ├── selectTransPlanModal       // 选择调运计划
│   │   ├── selectVehicleModal         // 选择单个车辆（销售派车）
│   │   ├── selectVehicleYXModal       // 选择运销过程中多个车辆（销售）
│   │   ├── selectWaybillModal         // 选择托运订单
│   │   └── ...
│   │ 
│   ├── config                  // 公共配置
│   │   │ 
│   │   └──config-plugin.js     // 资源服务URL地址配置
│   │ 
│   ├── directive               // 公共指令
│   ├── images                  // 图片
│   ├── libs   
│   │   │  
│   │   ├──service.plugin.js    // XHR封装           
│   │   ├──utils.plugin.js      // 常用工具函数
│   │   ├──storage.plugin.js    // storage封装     
│   │   └──resource.js          // 资源配置
│   │ 
│   ├── mock                    // mock数据
│   │   │
│   │   ├── basedata            // 基础数据
│   │   ├── common              // 系统管理
│   │   └── ...                 // 登录
│   │
│   ├── router                  // 路由
│   ├── store                   // vux状态管理
│   ├── styles                  // 公共css
│   ├── template                // index.html编译模板
│   ├── views                   // 主业务开发区域
│   │   │  
│   │   ├── auth                // 登录后业务区域
│   │   │   │  
│   │   │   ├── business        // 主业务区
│   │   │   │   │  
│   │   │   │   ├── basedata             // 基础数据模块
│   │   │   │   │   │  
│   │   │   │   │   ├── coalAnalysis     // 煤质化验(待确定开发)
│   │   │   │   │   ├── coalBunker       // 煤仓管理
│   │   │   │   │   ├── coalType         // 煤种管理
│   │   │   │   │   ├── customerLevel    // 客户级别设置（待确认开发）
│   │   │   │   │   ├── customerSales    // 客户销售控制
│   │   │   │   │   ├── vehicle          // 车辆管理
│   │   │   │   │   ├── innerVehicle     // 内部车辆管理
│   │   │   │   │   ├── weightMode       // 过磅模式
│   │   │   │   │   ├── vehicleCapacity  // 场区容量车数设置
│   │   │   │   │   ├── vehicleRelease   // 车辆放行模式
│   │   │   │   │   ├── vechicleParam    // 车型参数设置
│   │   │   │   │   └── ...   
│   │   │   │   │  
│   │   │   │   ├── coalTransfer         // 煤炭调拨
│   │   │   │   │   │  
│   │   │   │   │   ├── orderApproval    // 调拨单审批
│   │   │   │   │   ├── orderManage      // 调拨单管理
│   │   │   │   │   └── ...   
│   │   │   │   │  
│   │   │   │   ├── coalTransportation       // 煤炭调运
│   │   │   │   │   │  
│   │   │   │   │   ├── transPlanApproval    // 调运计划审批
│   │   │   │   │   ├── transPlanDispatch    // 调运计划派车
│   │   │   │   │   ├── transPlanManage      // 调运计划管理
│   │   │   │   │   └── ...        
│   │   │   │   │  
│   │   │   │   ├── transportCard    // 运输卡
│   │   │   │   │   │  
│   │   │   │   │   ├── cardGrant    // 发卡管理
│   │   │   │   │   ├── cardInit     // 卡初始化
│   │   │   │   │   ├── cardQuery    // 运输卡查询
│   │   │   │   │   ├── cardRefund   // 退卡管理
│   │   │   │   │   └── ...
│   │   │   │   │             
│   │   │   │   ├── transportProcess       // 运销过程
│   │   │   │   │   │  
│   │   │   │   │   ├── abnormalInfo           // 异常信息查询
│   │   │   │   │   ├── processForbid          // 运销过程终止
│   │   │   │   │   ├── vehicleDispatch        // 派车
│   │   │   │   │   ├── manualRelease          // 手动出场
│   │   │   │   │   ├── measurementModify      // 计量数据修改
│   │   │   │   │   ├── transforbidApproval    // 运销过程终止审批
│   │   │   │   │   ├── transportState         // 运销过程查询
│   │   │   │   │   └── ...
│   │   │   │   │             
│   │   │   │   ├── waybill               // 托运订单
│   │   │   │   │   │  
│   │   │   │   │   ├── waybillManage     // 托运订单管理
│   │   │   │   │   └── ...
│   │   │   │   │             
│   │   │   │   └── ...                  // 待开发
│   │   │   │
│   │   │   └── common          // 公共业务区
│   │   │       │  
│   │   │       ├── dict        // 数据字典
│   │   │       ├── home        // 首页
│   │   │       ├── org         // 组织机构
│   │   │       ├── res         // 资源管理
│   │   │       ├── role        // 角色管理
│   │   │       └── user        // 用户管理
│   │   │
│   │   └── pub                 // 首页登录
│   │ 
│   ├── app.vue                 // 路由入口
│   ├── main.js                 // 项目入口
│   └── vendors.js              // 第三方库引入
│   
├── .babelrc                    // babel配置
├── .gitignore                  // git配置文件
├── index.html                  // 项目启动入口 
├── package-lock.json           // 依赖包当前版本
├── package.json                // npm配置
├── README.md                   // 项目描述
├── webpack.base.config.js      // webpack基础配置
├── webpack.dev.config.js       // webpack开发环境配置
└── webpack.prod.config.js      // webpack生产环境配置

```

### 版本内容更新内容


```

请参照标准及时更新...

v1.0.0

1、新增功能

    - [1] 平台界面及权限  
    - [2] 基础数据维护
    - [3] 煤炭销售调拨管理 
    - [4] 托运订单管理 
    - [5] 运输卡管理 
    - [6] 运销过程管理 
    - [7] 煤炭盘煤调运管理 

2、 BUG修复及优化

    - [1] ...   
    - [2] ...

```

