import Mock from 'mockjs';

Mock.mock(/\/user\/getCommonUser$/,{
  "data": [  
    {
      "avatar": /[a-zA-Z0-9]+/,
      "companyId": 0,
      "createUserId": 0,
      "deptId": 0,
      "email": /[a-zA-Z0-9]+/,
      "id": "147",
      "loginAccount": /[a-zA-Z0-9]+/,
      "telephone": /159[0-9]{8}/,
      "userDesc": /[a-zA-Z0-9]+/,
      "userName": /[a-zA-Z0-9]+/,
      "userType": /[1-9][0-9]*/,
      "workNumber": /[a-zA-Z0-9]+/
    },
    {
      "avatar": /[a-zA-Z0-9]+/,
      "companyId": 0,
      "createUserId": 0,
      "deptId": 0,
      "email": /[a-zA-Z0-9]+/,
      "id": "146",
      "loginAccount": /[a-zA-Z0-9]+/,
      "telephone": /159[0-9]{8}/,
      "userDesc": /[a-zA-Z0-9]+/,
      "userName": /[a-zA-Z0-9]+/,
      "userType": /[1-9][0-9]*/,
      "workNumber": /[a-zA-Z0-9]+/
    }
  ],
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 30
});

//详情
Mock.mock(/\/user\/getCommonUserById/,{
  "data": {
    "avatar": /[a-zA-Z0-9]+/,
    "companyId": 0,
    "createUserId": 0,
    "deptId": 0,
    "email": /[a-zA-Z0-9]+/,
    "id": 0,
    "loginAccount": /[a-zA-Z0-9]+/,
    "telephone": /159[0-9]{8}/,
    "userDesc": /[a-zA-Z0-9]+/,
    "userName": /[a-zA-Z0-9]+/,
    "userType": /[1-9][0-9]*/,
    "workNumber": /[a-zA-Z0-9]+/
  },
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});


//删除
Mock.mock(/\/user\/deleteCommonUser/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//新增
Mock.mock(/\/user\/addCommonUser/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//获取用户角色
Mock.mock(/\/role\/getCommonUserRoleById/,{
  "data|5": [  
    {
      "createTime|1": ["2018-05-15 00:00:00","2018-05-30 00:00:00","2018-04-30 00:00:00"],
      "createUserId": 0,
      "id|+1": 1,
      "roleDesc": ["管理员","普通用户"],
      "roleName": ["管理员","普通用户"]
    }
  ],
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 30
});

//设置用户角色
Mock.mock(/\/role\/setCommonUserRoleById/,{
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});