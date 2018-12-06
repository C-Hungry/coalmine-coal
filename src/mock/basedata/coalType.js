import Mock from 'mockjs';

// 列表
Mock.mock(/\/coalType\/getCoalTypeList$/,{
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
Mock.mock(/\/coalType\/deleteCoalTypeById/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//新增
Mock.mock(/\/coalType\/addCoalType/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//编辑
Mock.mock(/\/coalType\/updateCoalType/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//启用
Mock.mock(/\/coalType\/startCoalTypeById/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//禁用
Mock.mock(/\/coalType\/stopCoalTypeById/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});