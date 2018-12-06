import Mock from 'mockjs';

// 列表
Mock.mock(/\/coal\/getCoalList$/,{
  "data|5": [
    {
      "id|+1": 1,
      "coalName|1": ["煤种1","煤种2","煤种3"],
      "coalNo": /[a-zA-Z0-9]+/,
      "coalTypeId|+1": 0,
      "coalTypeName|+1": Mock.mock('@cname'),
      "coalmine|1": ["煤矿1","煤矿2","煤矿3"],
      "creationTime": Mock.mock('@datetime'),
      "creatorUserId|+1": 1,
      "creatorUserName": Mock.mock('@cname'),
      "isvalid|1": [0,1,2],
      "memo": Mock.mock('@csentence(5)')
    }
  ],
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 5
});

//删除
Mock.mock(/\/coal\/deleteCoalById/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//新增
Mock.mock(/\/coal\/addCoalType/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//编辑
Mock.mock(/\/coal\/updateCoalType/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//启用
Mock.mock(/\/coal\/startCoalById/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//禁用
Mock.mock(/\/coal\/stopCoalById/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});