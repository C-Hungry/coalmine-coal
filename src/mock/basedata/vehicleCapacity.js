import Mock from 'mockjs';

// 列表
Mock.mock(/\/vehicleCapacity\/getCoalList$/,{
  "data|5": [
    {
      "id|+1": 1,
      "coal_name|1": ["煤种1","煤种2","煤种3"],
      "coal_no": /[a-zA-Z0-9]+/,
      "coal_type|+1": 0,
      "coal_type_name|+1": Mock.mock('@cname'),
      "max_trucknum": 5,
      "coalmine|1": ["煤矿1","煤矿2","煤矿3"],
      "creationTime": Mock.mock('@datetime'),
      "creatorUserId|+1": 1,
      "creatorUserName": Mock.mock('@cname')
    }
  ],
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 5
});

// 容量设置
Mock.mock(/\/vehicleCapacity\/updateMaxTruckNum/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});