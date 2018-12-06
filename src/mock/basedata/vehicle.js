import Mock from 'mockjs';

// 列表
Mock.mock(/\/car\/getCarList$/,{
  "data|10": [
    {
      "truck_colour|1": ["红色","军绿色","灰色"],
      "truck_length|1-50": 50,
      "truck_no": /[a-zA-Z0-9]+/,
      "owner": Mock.mock('@cname'),
      "owner_add": Mock.mock('@city(true)'),
      "owner_tel": /\d{11}/,
      "isvalid|1": [0,1,2],
      "truck_type|1": [0,1,2],
      "truck_type_name|1": ["前四后八","双桥","前四后四"],
      "truck_width": /\d{2}/,
      "create_time": Mock.mock('@datetime'),
      "creator_user_id|+1": 1,
      "creator_user_name": Mock.mock('@cname'),
      "driver": Mock.mock('@cname'),
      "driver_tel": /\d{11}/,
      "id|+1": 1,
      "memo": Mock.mock('@csentence(5)'),
      "rated_load": /\d{2}/,
      "tare": /\d{2}/,
    }
  ],
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 10
});

// 详情
Mock.mock(/\/car\/getCoalBunkersDetail/,{
  "data": {
      "bunkerName": /[a-zA-Z0-9]+/,
      "bunkerNumber": /[a-zA-Z0-9]+/,
      "id|+1": 1,
      "position": /[a-zA-Z0-9]+/,
      "remark": /159[0-9]{8}/,
      "status|1": [1,2,3]
  },
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 10
});

//删除
Mock.mock(/\/car\/deleteCar/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//新增
Mock.mock(/\/car\/addCar/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//编辑
Mock.mock(/\/car\/updateCar/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//启用
Mock.mock(/\/car\/enableCar/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//禁用
Mock.mock(/\/car\/disableCar/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});