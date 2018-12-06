import Mock from 'mockjs';

//列表
Mock.mock(/\/dept\/getTreeAllCommonDept/, {
	"success": true,
	"msg": "查询成功！",
	"total": 0,
	"data": [{
		"id": 1,
		"userId": 0,
		"deptName": "mock测试公司",
		"taxNumber": "1",
		"linkman": null,
		"linkmanTelephone": null,
		"idCode": "-1.1",
		"deptShortName": "测试公司",
		"children": [{
			"id": 277,
			"userId": 0,
			"deptName": "mock部门01",
			"taxNumber": "",
			"linkman": null,
			"linkmanTelephone": null,
			"idCode": "-1.1.277",
			"deptShortName": "mock部",
			"children": [],
			"createUserId": 1,
			"createTime": "2018-08-21 17:24:16.0",
			"deptType": 1,
			"deptTypes": [1],
			"deptLevelType": 8,
			"userSituation": null,
			"situation": 0,
			"pid": 1
		}, {
			"id": 292,
			"userId": 0,
			"deptName": "mock部门02",
			"taxNumber": "",
			"linkman": null,
			"linkmanTelephone": null,
			"idCode": "-1.1.292",
			"deptShortName": "",
			"children": [],
			"createUserId": 1,
			"createTime": "2018-08-27 10:40:52.0",
			"deptType": 1,
			"deptTypes": [1],
			"deptLevelType": 8,
			"userSituation": null,
			"situation": 0,
			"pid": 1
		}, {
			"id": 278,
			"userId": 0,
			"deptName": "mock部门03",
			"taxNumber": "",
			"linkman": null,
			"linkmanTelephone": null,
			"idCode": "-1.1.278",
			"deptShortName": "财务部",
			"children": [],
			"createUserId": 1,
			"createTime": "2018-08-21 17:25:02.0",
			"deptType": 1,
			"deptTypes": [1],
			"deptLevelType": 8,
			"userSituation": null,
			"situation": 0,
			"pid": 1
		}],
		"createUserId": 1,
		"createTime": "2018-06-28 15:00:03.0",
		"deptType": 1,
		"deptTypes": [1],
		"deptLevelType": 2,
		"userSituation": null,
		"situation": 0,
		"pid": -1
	}]
});

//新增
Mock.mock(/\/dept\/AddCommonDept/, {
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//修改
Mock.mock(/\/dept\/updateCommonDept/, {
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});

//删除
Mock.mock(/\/dept\/deleteCommonDept/, {
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});
