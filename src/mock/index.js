import Mock from 'mockjs';

Mock.setup({
  timeout: '200-600'
})

require("./common/login");     // 登录
require("./common/user");      // 用户管理
require("./common/role");      // 角色管理
require("./common/menu");      // 资源管理
require("./common/org");       // 组织机构  
require("./common/dict");      // 数据字典  

require("./basedata/coalType");    // 煤种管理
require("./basedata/coalBunker");    // 煤仓管理
require("./basedata/vehicle");    // 车辆管理
require("./basedata/vehicleCapacity");   // 场区容量车数设置
require("./basedata/vehicleRelease");    // 车辆放行模式

// require("./basedata/coalBunker");    // 煤仓管理
// require("./basedata/coalBunker");    // 煤仓管理
// require("./basedata/coalBunker");    // 煤仓管理
// require("./basedata/coalBunker");    // 煤仓管理
// require("./basedata/coalBunker");    // 煤仓管理