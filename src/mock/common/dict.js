import Mock from 'mockjs';
// 列表
Mock.mock(/\/basisType\/getBasisTypeList/, {
  "success": true,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "code": "carType",
      "name": "车辆类型",
      "sortNum": 0,
      "parameter": "",
      "remark": "车辆类型",
      "children": [
        {
          "id": 60,
          "code": "01",
          "name": "前四后八",
          "sortNum": 1,
          "parameter": "",
          "remark": "前四后八",
          "children": [],
          "pid": 1
        },
        {
          "id": 85,
          "code": "85",
          "name": "前四后四",
          "sortNum": 1,
          "remark": "123",
          "parameter": "sss",
          "children": [],
          "pid": 1
        },
        {
          "id": 61,
          "code": "02",
          "name": "双桥",
          "sortNum": 2,
          "parameter": "",
          "remark": "双桥",
          "children": [],
          "pid": 1
        }
      ],
      "pid": null
    },
    {
      "id": 62,
      "code": "settlement",
      "name": "结算方式",
      "sortNum": 1,
      "parameter": "",
      "remark": "结算方式",
      "children": [
        {
          "id": 67,
          "code": "03",
          "name": "承兑6月",
          "sortNum": 1,
          "parameter": "666",
          "remark": "承兑6月",
          "children": [],
          "pid": 62
        },
        {
          "id": 66,
          "code": "02",
          "name": "承兑3月",
          "sortNum": 3,
          "parameter": "",
          "remark": "承兑3月",
          "children": [],
          "pid": 62
        }
      ],
      "pid": null
    },
    {
      "id": 75,
      "code": "calculate",
      "name": "计量单位",
      "parameter": "",
      "sortNum": 1,
      "remark": "计量单位",
      "children": [
        {
          "id": 81,
          "code": "81",
          "name": "吨",
          "sortNum": 1,
          "parameter": "",
          "remark": "吨",
          "children": [],
          "pid": 75
        },
        {
          "id": 83,
          "code": "83",
          "name": "千克",
          "sortNum": 1,
          "parameter": "",
          "remark": "千克",
          "children": [],
          "pid": 75
        }
      ],
      "pid": null
    }
  ],
  "total": 0
});
// 按照code查询
Mock.mock(/\/basisType\/getBasisTypeListByCode/, {
  "data|5": [{
    "value|+1": 0,
    "label": /[a-zA-Z0-9]+/
  }],
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});
// 修改
Mock.mock(/\/basisType\/updateBasisType/, {
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});
// 新增
Mock.mock(/\/basisType\/addBasisType/, {
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});
// 删除
Mock.mock(/\/basisType\/deleteByPIdAndId/, {
  "data": null,
  "msg": /[a-zA-Z0-9]+/,
  "success": true,
  "total": 0
});