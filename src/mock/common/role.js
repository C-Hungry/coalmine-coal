import Mock from 'mockjs';

//列表
Mock.mock(/\/role\/getAllCommonRole/,{
  "data|10": [  
    {
      "createTime|1": ["2018-05-15 00:00:00","2018-05-30 00:00:00","2018-04-30 00:00:00"],
      "createUserId": 1,
      "id|+1": 1,
      "roleDesc|1": ["管理员","普通员工","主管"],
      "roleName|1": ["管理员","普通员工","主管"]
    }
  ],
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 30
});

//详情
Mock.mock(/\/role\/getCommonRoleById/,{
  "data": {
    "createTime|1": ["2018-05-15 00:00:00","2018-05-30 00:00:00","2018-04-30 00:00:00"],
    "createUserId": 1,
    "id|+1": 1,
    "roleDesc|1": ["普通员工","主管"],
    "roleName|1": ["普通员工","主管"]
  },
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//删除
Mock.mock(/\/role\/deleteCommonRole/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//新增
Mock.mock(/\/role\/addCommonRole/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//修改
Mock.mock(/\/role\/updateCommonRole/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});
