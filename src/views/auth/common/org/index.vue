<style scoped lang="less">
  .org {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 0;
    .tree{
      height: 100%;
      margin: 0 10px;
      min-width: 300px;
      position: relative;
      .switch-list{
        padding: 0 15px;
        list-style: none;
        .switch-item {
          height: 40px;
          line-height: 40px;
          display: inline-block;
          margin-right: 16px;
        }
      }
      .content{
        position: absolute;
        top: 40px;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 10px;
        overflow-y: auto;
        overflow-x: hidden;
      }
    }
  }
</style>

<template>
  <div class="org">
    <div class="tree">
      <ul class="switch-list">
        <!-- <li class="switch-item">
          <Switch v-model="props.isFold" size="small"></Switch>&nbsp;&nbsp;<span style="vertical-align: middle;">展开表格</span>
        </li> -->
        <li class="switch-item">
          <RadioGroup v-model="deptType" type="button">
            <Radio :label="1"><span>公司机构</span></Radio>
            <Radio :label="2"><span>客户单位</span></Radio>
            <Radio :label="4"><span>承运单位</span></Radio>
          </RadioGroup>
        </li>
      </ul>
      <div class="content">
        <Spin fix v-if="loading" size="large"></Spin>
        <zk-table
          v-if="isShowTableTree"
          ref="table"
          :data="data"
          :columns="columns"
          :border="props.border"
          :show-header="props.showHeader"
          :show-index="props.showIndex"
          :is-fold="!props.isFold"
          :expand-type="props.expandType"
          :selection-type="props.selectionType">
          <template slot="operation" slot-scope="scope">
            <Button type="primary" size="small" @click="openDetail(scope.row)">详情</Button>
            <Dropdown trigger="click" :transfer="true">
              <Button type="ghost" size="small">
                更多
                <Icon type="arrow-down-b"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="create" style="text-align: center;" v-auth="'system.org.add'">
                  <div @click="create(scope.row)">新增</div> 
                </DropdownItem>
                <DropdownItem v-if="scope.row.pid != -1"  name="edit" style="text-align: center;" v-auth="'system.org.modify'">
                  <div @click="edit(scope.row)">修改</div>
                </DropdownItem>
                <DropdownItem v-if="scope.row.pid != -1" name="del" style="text-align: center;" v-auth="'system.org.delete'">
                  <div @click="del(scope.row)">删除</div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </template>
        </zk-table>
        <Table v-if="!isShowTableTree" border :columns="columns2" :data="tableData"></Table>
      </div>
    </div>
    <!-- 详情 -->
    <Modal v-model="dlgDetail.visible" title="详情">
      <Form :label-width="120">
        <FormItem label="名称：">
          {{dlgDetail.deptName}}
        </FormItem>
        <FormItem label="简称：">
          {{dlgDetail.deptShortName}}
        </FormItem>
        <FormItem label="编码：">
          {{dlgDetail.idCode}}
        </FormItem>
        <FormItem label="标识：">
          {{dlgDetail.taxNumber}}
        </FormItem>
        <FormItem label="类型：">
          {{dlgDetail.deptTypesStr}}
        </FormItem>
        <FormItem label="级别：">
          {{dlgDetail.deptLevelType}}
        </FormItem>
        <FormItem label="排序：">
          {{dlgDetail.orderNum}}
        </FormItem>
        <FormItem label="主要负责人：">
          {{dlgDetail.mainUserInfo.userName ? dlgDetail.mainUserInfo.userName + ' ' + dlgDetail.mainUserInfo.telephone : "--"}}
        </FormItem>
        <FormItem label="次要负责人：">
          {{dlgDetail.secondaryUserInfo.userName ? dlgDetail.secondaryUserInfo.userName + ' ' + dlgDetail.secondaryUserInfo.telephone : "--"}}
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="dlgDetail.visible=false">关闭</Button>
      </div>
    </Modal>

    <!-- 修改或新增 -->
    <Modal v-model="dlgVisible" :title="dlgTitle">
      <Form ref="formData" :model="formData" :rules="formDataRules" :label-width="120">
        <FormItem label="组织机构名称：" prop="deptName">
          <Input v-model="formData.deptName" placeholder="请输入（必填）" />
        </FormItem>
        <FormItem label="组织机构简称：" prop="deptShortName">
          <Input v-model="formData.deptShortName" placeholder="请输入" />
        </FormItem>
        <FormItem label="组织机构类型：" prop="deptTypes">
          <Select v-model="formData.deptTypes" multiple placeholder="请输入（必填）" >
            <Option :value="1" :key="1">公司机构</Option>
            <Option :value="2" :key="2">客户单位</Option>
            <Option :value="4" :key="4">承运单位</Option>
          </Select>
        </FormItem>
        <FormItem label="组织机构级别：" prop="deptLevelType">
          <RadioGroup v-model="formData.deptLevelType">
            <Radio :label="2">公司</Radio>
            <Radio :label="8">部门</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="唯一标识类型：" v-if="dlgTitle=='新增' && formData.deptLevelType==2">
          <RadioGroup v-model="taxNumberType">
            <Radio :label="1">企业纳税号</Radio>
            <Radio :label="2">身份证号码</Radio>
            <Radio :label="3">手机号码</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="唯一标识：" prop="taxNumber" v-if="formData.deptLevelType==2">
          <Input v-model="formData.taxNumber" :disabled="dlgTitle=='修改'" placeholder="请输入（必填，且不能修改）" />
        </FormItem>
        <FormItem label="排序：" prop="orderNum">
          <Input v-model.number="formData.orderNum" placeholder="请输入（必填）" />
        </FormItem>
        <FormItem label="主要负责人：">
          <Select
            ref="mainUserSelect"
            v-model="formData.mainUser"
            filterable
            clearable>
            <Option v-for="(option, index) in userList" :value="option.value" :key="index">{{option.label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="次要负责人：">
          <Select
            ref="secondaryUserSelect"
            v-model="formData.secondaryUser"
            filterable
            clearable>
            <Option v-for="(option, index) in userList" :value="option.value" :key="index">{{option.label}}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="dlgTitle=='新增'?createSubmit():editSubmit()" :loading="submitLoading">确定</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        props: {
          border: true,
          isFold: true,
          expandType: false,
          selectionType: false,
        },
        loading: false,
        isShowTableTree: true,
        submitLoading: false,
        data: [],
        tableData: [], 
        taxNumberType: 1,
        deptType: 1,
        columns: [
          {
            label: '名称',
            prop: 'deptName',
            minWidth: '200px'
          },
          {
            label: '唯一标识',
            prop: 'taxNumber',
            minWidth: '150px'
          },
          {
            label: '简称',
            prop: 'deptShortName',
            minWidth: '110px'
          },
          {
            label: '类型',
            prop: 'deptTypesStr',
          },
          {
            label: '级别',
            prop: 'deptLevelTypeStr',
          },
          {
            label: "操作",
            prop: "operation",
            width: 112,
            type: 'template',
            template: 'operation'
          }
        ],
        // table的col
        columns2: [
          {
            title: '名称',
            key: 'deptName',
            minWidth: 140
          },
          {
            title: '唯一标识',
            key: 'taxNumber',
            minWidth: 130
          },
          {
            title: '简称',
            key: 'deptShortName',
            minWidth: 50
          },
          {
            title: '类型',
            key: 'deptTypesStr',
            minWidth: 40
          },
          {
            title: '级别',
            key: 'deptLevelTypeStr',
            minWidth: 30
          },
          {
            title: "操作",
            width: 112,
            fixed: "right",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small"
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.openDetail(params.row);
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'system.org.list'
                      }
                    ],
                  },
                  "详情"
                ),
                h(
                  "Dropdown", {
                    props: {
                      trigger: "click",
                      transfer: true
                    },
                    on: {
                      "on-click": (type) => {
                        switch(type){
                          case "edit":
                            this.edit(params.row);
                            break;
                          case "delete":
                            this.del(params.row);
                            break;
                        }
                      }
                    },
                    scopedSlots: {
                      list: (props) => {
                        return h("DropdownMenu", [
                             h(
                              "DropdownItem", {
                                props: {
                                  name: "edit"
                                },
                                style: {
                                  textAlign: 'center'
                                },
                                directives: [
                                  {
                                  name: 'auth',
                                  value: 'system.org.modify'
                                  }
                                ],
                              },
                              "修改"
                            ),
                            h(
                              "DropdownItem", {
                                props: {
                                  name: "delete"
                                },
                                style: {
                                  textAlign: 'center',
                                },
                                directives: [
                                  {
                                  name: 'auth',
                                  value: 'system.org.delete'
                                  }
                                ],
                              },
                              "删除"
                            ),
                          ]);
                      }
                    }
                  }, 
                  [
                    h(
                      "Button", {
                        props: {
                          type: 'ghost',
                          size: 'small'
                        }
                      }, [
                        "更多",
                        h("Icon", {
                          style: {
                            marginLeft: "5px"
                          },
                          props: {
                            type: "arrow-down-b"
                          }
                        })
                      ]
                    )
                  ]
                )
              ]);
            }
          }
        ],
        dlgDetail:{
          visible: false,
          idCode: "",
          deptName: "",
          taxNumber: "",
          deptShortName: "",
          orderNum: "",
          deptTypes: [],
          deptTypesStr: "",
          deptLevelType: "",
          mainUser: "",
          secondaryUser: "",
          mainUserInfo: {},
          secondaryUserInfo: {}
        },
        userList: [], // 用户列表
        dlgVisible: false,
        dlgTitle: "",
        formData:{
          "deptName": "",
          "deptShortName": "",
          "deptTypes": [],
          "deptLevelType": 2,
          "id": 0,
          "orderNum": null,
          "pid": 0,
          "taxNumber": "",
          "mainUser": "",
          "secondaryUser": ""
        },
        formDataRules: {
          deptName: [
            { required: true, message: "组织机构名称不能为空", trigger: "blur" },
            { max: 40, message: "组织机构名称不能超过40个字", trigger: "blur" },
          ],
          deptShortName: [
            { max: 40, message: "简称不能超过40个字", trigger: "blur" },
          ],
          deptTypes: [
             { required: true, type: "array", message: "组织机构类型不能为空", trigger: "change" }
          ],
          deptLevelType: [
            { required: true, type: "number", message: "组织机构级别不能为空", trigger: "change" },
            {
              type: "method",
              validator: (rule, value, callback) => {
                if (value && value==8 && this.formData.deptTypes.length && (this.formData.deptTypes.includes(2) || this.formData.deptTypes.includes(4))){
                  callback(new Error("组织机构级别为部门时，组织机构类型不能是客户单位和承运单位"));
                } else {
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          taxNumber: [
            {
              required: true, 
              type: "method",
              validator: (rule, value, callback) => {
                if (!value) {
                  callback(new Error("组织机构级别为公司时，唯一标识不能为空"));
                } else if (this.taxNumberType==1 && this.dlgTitle=="新增" && !this.checkTax(value)) {
                  callback(new Error("企业纳税号由15或者17或者18或者20位字母、数字组成"));
                } else if (this.taxNumberType==2 && this.dlgTitle=="新增" && !this.checkIdCard(value)) {
                  callback(new Error("身份证号码为15、18位的全数字，或者17位全数字加字符X或x"));
                } else if (this.taxNumberType==3 && this.dlgTitle=="新增" && !new RegExp("^\\d{11}$").test(value)) {
                  callback(new Error("手机号码11位的全数字"));
                } else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          orderNum: [
            {
              required: true, 
              type: "method",
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error("排序不能为空"));
                }
                else if (!/^\+?[1-9][0-9]*$/.test(value)) {
                  callback(new Error("排序必须为>0的整数"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
        }
      };
    },
    methods: {
      /**
      * 验证税号
      * 15或者17或者18或者20位字母、数字组成
      * @param obj
      * @returns {Boolean}
      */
      checkTax(obj){
        return /^[A-Z0-9]{15}$|^[A-Z0-9]{17}$|^[A-Z0-9]{18}$|^[A-Z0-9]{20}$/.test(obj);
      },
      /**
      * 验证大陆的身份证号
      * 验证身份证号
      * 身份证号码为15位或18位的全数字，或者18位时前17位是数字，最后一位是校验位，可能是数字或字符X或x
      * @param obj
      */
      checkIdCard(obj){
        return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(obj);
      },
      // 获取用户列表
      queryUserList() {
        this.$commonService
          .post("/user/getCommonUser", {
            body: {
              "currentPage": 1,
              "pageSize": 0
            }
          })
          .then(res => {

            if (!res.success) {
              this.$Message.error(res.msg);
              return;
            }

            const list = res.data.map(item => {
              return {
                  id: item.id,
                  value: item.id,
                  label: item.userName + " " + item.telephone
              };
            });

            this.userList = list;
          })
          .catch(res => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 查看详情
      openDetail(dept){
        
        this.$commonService
          .get("/dept/getCommonDeptByDeptId", {
            deptId: dept.id
          })
          .then(res => {

            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.dlgDetail.deptName = res.data.deptName || '--';
            this.dlgDetail.idCode = res.data.idCode || '--';
            this.dlgDetail.taxNumber = res.data.taxNumber || '--';
            this.dlgDetail.deptShortName = res.data.deptShortName || '--';
            this.dlgDetail.orderNum = res.data.orderNum || '--';
            this.dlgDetail.deptTypes = res.data.deptTypes;
            this.dlgDetail.deptTypesStr = "--";
            this.dlgDetail.deptLevelType = res.data.deptLevelType == 2 ? "公司" : res.data.deptLevelType == 8 ? "部门" : "";

            if (res.data.deptTypes) {
              // 1:公司机构 2:客户单位 4:承运单位
              let deptTypes = [];
              res.data.deptTypes.forEach(item=>{
                switch(item) {
                  case 1:
                    deptTypes.push("公司机构");
                    break;
                  case 2:
                    deptTypes.push("客户单位");
                    break;
                  case 4:
                    deptTypes.push("承运单位");
                    break;
                }
              })
              
              this.dlgDetail.deptTypesStr = deptTypes.join("，");
            }

            this.dlgDetail.mainUserInfo = {
              userName: "",
              telephone: ""
            }
            this.dlgDetail.secondaryUserInfo = {
              userName: "",
              telephone: ""
            }
            // 0.无职位，1.主要负责人,主任，2.次要负责人,副主任'
            if(res.data.userSituation) {
              res.data.userSituation.forEach(item=>{
                switch (item.situation) {
                  case 1:
                    this.dlgDetail.mainUser = item.userId;
                    this.dlgDetail.mainUserInfo = {
                      userName: item.userName,
                      telephone: item.telephone
                    };
                  break;
                  case 2:
                    this.dlgDetail.secondaryUser = item.userId;
                    this.dlgDetail.secondaryUserInfo = {
                      userName: item.userName,
                      telephone: item.telephone
                    };
                  break;
                }
              }) 
            }

            this.dlgDetail.visible = true;

          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });

      },
      // 新增组织机构
      create(dept){

        this.$refs["formData"].resetFields();
        // 消除iview select组件filterable bug
        this.$refs["mainUserSelect"].setQuery(null);
        this.$refs["secondaryUserSelect"].setQuery(null);

        this.formData.pid = dept.id;
        this.formData.id = 0;
        this.formData.deptName = "";
        this.formData.deptShortName = "";
        this.formData.deptTypes = [];
        this.formData.deptLevelType = 2;
        this.formData.mainUser = null;
        this.formData.secondaryUser = null;
        this.formData.orderNum = "";
        this.formData.taxNumber = "";

        this.dlgTitle = "新增";
        this.dlgVisible = true;
        this.taxNumberType = 1;
      },
      // 新增组织机构提交
      createSubmit(){

        this.$refs["formData"].validate(valid => {
          if (valid) {
            
            this.submitLoading = true;
            this.$commonService
              .post("/dept/AddCommonDept", {
                commonDeptDto: {
                  "deptName": this.formData.deptName,
                  "deptShortName": this.formData.deptShortName,
                  "deptTypes": this.formData.deptTypes,
                  "deptLevelType": this.formData.deptLevelType,
                  "id": this.formData.id,
                  "orderNum": this.formData.orderNum,
                  "pid": this.formData.pid,
                  "taxNumber": this.formData.deptLevelType == 2 ? this.formData.taxNumber : "",
                  "mainUser": this.formData.mainUser,
                  "secondaryUser": this.formData.secondaryUser
                }
              })
              .then(res => {
                this.submitLoading = false;
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.dlgVisible = false
                this.$Message.success("新增组织机构成功！");
                this.query();
              })
              .catch(err => {
                this.submitLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });

      },
      // 修改组织机构
      edit(dept){
        
        this.$commonService
          .get("/dept/getCommonDeptByDeptId", {
            deptId: dept.id
          })
          .then(res => {

            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.$refs["formData"].resetFields();

            this.formData = {
              deptName: res.data.deptName,
              deptShortName: res.data.deptShortName,
              deptTypes: res.data.deptTypes,
              deptLevelType: res.data.deptLevelType,
              taxNumber: res.data.taxNumber,
              orderNum: res.data.orderNum,
              id: res.data.id,
              mainUser: null,
              secondaryUser: null
            }

            // 0.无职位，1.主要负责人,主任，2.次要负责人,副主任'
            if(res.data.userSituation) {
              res.data.userSituation.forEach(item=>{
                switch (item.situation) {
                  case 1:
                    this.formData.mainUser = item.userId;
                  break;
                  case 2:
                    this.formData.secondaryUser = item.userId;
                  break;
                }
              }) 
            }

            this.dlgTitle = "修改";
            this.dlgVisible = true;

          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
        
      },
      // 修改组织机构提交
      editSubmit(){

        this.$refs["formData"].validate(valid => {
          if (valid) {
            this.submitLoading = true;
            this.$commonService
              .post("/dept/updateCommonDept", {
                commonDeptDto: {
                  "deptName": this.formData.deptName,
                  "deptShortName": this.formData.deptShortName,
                  "deptTypes": this.formData.deptTypes,
                  "deptLevelType": this.formData.deptLevelType,
                  "id": this.formData.id,
                  "orderNum": this.formData.orderNum,
                  "pid": this.formData.pid,
                  "taxNumber": this.formData.deptLevelType == 2 ? this.formData.taxNumber : "",
                  "mainUser": this.formData.mainUser || null,
                  "secondaryUser": this.formData.secondaryUser || null
                }
              })
              .then(res => {
                this.submitLoading = false;
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.dlgVisible = false
                this.$Message.success("修改组织机构成功！");
                if(this.deptType == 1) {
                  this.query();
                }
                else if (this.deptType == 2) {
                  this.getDeptList(2);
                }
                else {
                  this.getDeptList(4);
                }
              })
              .catch(err => {
                this.submitLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });

      },
      // 删除组织机构
      del(dept){
        this.$Modal.confirm({
          title: '提示',
          content: '<p>确定删除此组织机构？</p>',
          loading: true,
          onOk: () => {

            this.$commonService
              .get("/dept/deleteCommonDept", {
                deptId: dept.id
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success("删除成功！");
                if(this.deptType == 1) {
                  this.query();
                }
                else if (this.deptType == 2) {
                  this.getDeptList(2);
                }
                else {
                  this.getDeptList(4);
                }
              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }
        });
      },
      // 查询组织机构列表
      query(){
        this.loading = true;
        this.$commonService
          .get("/dept/getTreeAllCommonDept", {
            deptType: this.deptType,
            pId: -1
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            
            var self = this;
            var formate = function(data, deep, isParentsFold) {
              data.forEach((item,index) => {

                if (item.deptTypes) {
                  // 1:公司机构 2:客户单位 4:承运单位
                  let deptTypes = [];
                  item.deptTypes.forEach(item=>{
                    switch(item) {
                      case 1:
                        deptTypes.push("公司机构");
                        break;
                      case 2:
                        deptTypes.push("客户单位");
                        break;
                      case 4:
                        deptTypes.push("承运单位");
                        break;
                    }
                  })
                  item.deptTypesStr = deptTypes.join("，");
                } else {
                  item.deptTypesStr = "";
                }

                item.deptLevelTypeStr = item.deptLevelType == 2 ? "公司": item.deptLevelType == 8 ? "部门" : "";
                
                // var row = self.$refs.table._data.bodyData.filter(row => row.id == item.id)[0];
                var row = (self.$refs.table._data && self.$refs.table._data.bodyData.filter(row => row.id == item.id)[0]) || null;
                if(row){
                  item._isHide = row._isHide;
                  item._isFold = row._isFold;
                }
                else if(self.$refs.table._data.bodyData.length > 0){
                  item._isHide = isParentsFold;
                  item._isFold = true;
                }

                if(item.children && item.children.length > 0) formate(item.children, deep + 1, (row && row._isFold) || isParentsFold)
              });
            };
            
            formate(res.data, 0, false);

            this.data = res.data;

          })
          .catch(err => {
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 获取承运商或者客户信息
      getDeptList(type) {
        this.loading = true;
        this.$commonService
          .post("/dept/getCommonDept", {
            dto: {
              "currentPage": 1,
              "deptType": type,
              "pageSize": 0
            }
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            res.data.map(item=> {
              if (item.deptTypes) {
                // 1:公司机构 2:客户单位 4:承运单位
                let deptTypes = [];
                item.deptTypes.forEach(item=>{
                  switch(item) {
                    case 1:
                      deptTypes.push("公司机构");
                      break;
                    case 2:
                      deptTypes.push("客户单位");
                      break;
                    case 4:
                      deptTypes.push("承运单位");
                      break;
                  }
                })
                item.deptTypesStr = deptTypes.join("，");
              } else {
                item.deptTypesStr = "";
              }

              item.deptLevelTypeStr = item.deptLevelType == 2 ? "公司": item.deptLevelType == 8 ? "部门" : "";
              return item; 
            })
            this.tableData = res.data;
          })
          .catch(err => {
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
    },
    watch: {
      deptType(newVal, oldVal) {
        if(newVal == 1) {
          this.isShowTableTree = true;
          this.query();
        }
        else if (newVal == 2) {
          this.isShowTableTree = false;
          this.getDeptList(2);
        }
        else {
          this.isShowTableTree = false;
          this.getDeptList(4);
        }
      }
    },
    mounted(){
      this.query();
      this.queryUserList();
    }
  }
</script>
