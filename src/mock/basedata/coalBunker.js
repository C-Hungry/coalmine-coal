import Mock from 'mockjs';

// 列表
Mock.mock(/\/bunker\/getBunkerList$/,{
  "data|10": [  
    {
      "address": /[a-zA-Z0-9]+/,
      "bcode": /[a-zA-Z0-9]+/,
      "bname": /[a-zA-Z0-9]+/,
      "coalIds": [1],
      "coalName": /[a-zA-Z0-9]+/,
      "creatorUserName": /[a-zA-Z0-9]+/,
      "createTime": Mock.mock('@datetime'),
      "id|+1": 1,
      "memo": /[a-zA-Z0-9]+/,
      "isvalid|1": [0,1,2]
    }
  ],
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 10
});

//删除
Mock.mock(/\/bunker\/deleteBunkerById/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//新增
Mock.mock(/\/bunker\/addBunker/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//编辑
Mock.mock(/\/bunker\/updateBunker/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//启动煤仓
Mock.mock(/\/bunker\/startBunkerById/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//禁用
Mock.mock(/\/bunker\/stopBunkerById/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});