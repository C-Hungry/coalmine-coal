<style scoped lang="less">
  .user {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    overflow-y: auto;
  }
</style>

<template>
  <div class="user">
    <Input placeholder="关键字" v-model="keywords" clearable style="width: 200px;margin-top:5px;" />
    <Button type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button type="warning" icon="plus-round" v-auth="'system.user.add'" @click="create()" style="margin-top:5px;">新增</Button>
    <br><br>
    <Table border :columns="columns" :data="rows" :loading="loading"></Table>
    <br>
    <div style="position: relative;">
      <Page 
      :total="totalCount" 
      show-elevator 
      show-total 
      show-sizer
      :page-size="pageSize"
      :page-size-opts="[10, 20, 50]"
      :current="currentPage" 
      @on-change="onPageChanged"
      @on-page-size-change="onPageSizeChanged"
      ></Page>
    </div>
    <!-- 详情 -->
    <Modal v-model="dlgDetail.visible" title="详情">
      <Form :label-width="120" >
        <FormItem label="账户：">
          {{dlgDetail.loginAccount}}
        </FormItem>
        <FormItem label="组织机构：">
          {{dlgDetail.deptNames}}
        </FormItem>
        <FormItem label="姓名：">
          {{dlgDetail.userName}}
        </FormItem>
        <FormItem label="手机号：">
          {{dlgDetail.telephone}}
        </FormItem>
        <FormItem label="简介：">
          {{dlgDetail.userDesc}}
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="dlgDetail.visible=false">确定</Button>
      </div>
    </Modal>

    <!-- 修改或新增 -->
    <Modal v-model="dlgEdit.visible" :title="dlgEdit.title">
      <Form :label-width="80">
        <FormItem label="账户：">
          <Input v-model="dlgEdit.loginAccount" :disabled="dlgEdit.title=='修改'" placeholder="请输入（必填）" />
        </FormItem>
        <FormItem label="组织机构：">
          <a href="javascript:void(0);" @click="changeDepts()">{{dlgEdit.deptIds.length==0?'选择':'已选择'}}</a>
        </FormItem>
        <FormItem label="姓名：">
          <Input v-model="dlgEdit.userName" placeholder="请输入姓名" />
        </FormItem>
        <FormItem label="手机号：">
          <Input v-model="dlgEdit.telephone" placeholder="请输入手机号" />
        </FormItem>
        <FormItem label="简介：">
          <Input v-model="dlgEdit.userDesc" placeholder="请输入简介" type="textarea" />
        </FormItem>
      </Form>
      <div slot="footer">
          <Button type="primary" @click="createSubmit()" :loading="modifyLoading">确定</Button>
      </div>
    </Modal>

    <!-- 角色 -->
    <Modal v-model="dlgRole.visible" title="角色" width="600">
      <CheckboxGroup v-model="dlgRole.roleIDs" style="line-height: 40px;">
        <Checkbox v-for="item in dlgRole.allRoles" :key="item.id" :label="item.id" style="width: 130px;">{{item.name}}</Checkbox>
      </CheckboxGroup>
      <div slot="footer">
          <Button type="primary" @click="changeRole()" :loading="roleLoading">确定</Button>
      </div>
    </Modal>

    <!-- 组织机构 -->
    <Modal v-model="dlgDepts.visible" title="组织机构">
      <!-- <Tree :data="dlgDepts.data" show-checkbox ref="userDeptRelation" style="padding: 0 20px;"></Tree> -->
      <Tree :data="dlgDepts.data" :show-checkbox="false" :render="renderContent" ref="userDeptRelation" style="padding: 0 20px;"></Tree>
      <div slot="footer">
        <Button type="primary" @click="changeDeptsSubmit()">确定</Button>
      </div>
    </Modal>

    <!-- 修改密码 -->
      <Modal v-model="isShowPasswordVisible" :closable="false" title="修改密码">
        <Form :label-width="100" ref="dlgUpdatePassword" :model="dlgUpdatePassword" :rules="dlgUpdatePasswordRules">
          <FormItem  label="新密码：" prop="password">
            <Input type="password" v-model="dlgUpdatePassword.password" placeholder="请输入新密码" />
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="primary" @click="confirmPassword()" :loading="updatePasswordLoading">确定</Button>
          <Button @click="isShowPasswordVisible=false;updatePasswordLoading=false;">取消</Button>
        </div>
      </Modal>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        roleLoading: false, // 角色
        keywords: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        columns: [
          {
            title: "账户",
            key: "loginAccount",
            minWidth: 80,
          },
          {
            title: "姓名",
            key: "userName",
            minWidth: 80,
          },
          {
            title: "手机号",
            key: "telephone",
            minWidth: 80,
          },
          {
            title: "描述",
            key: "userDesc",
            minWidth: 80,
          },
          {
            title: "操作",
            width: 114,
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
                        this.detail(params.row.id);
                      }
                    }
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
                        if(params.row.id==this.$storage.getUserInfo().userId){
                          this.$Message.warning("无法修改或删除当前账户的信息！");
                          return;
                        }
                        if(params.row.loginAccount=="admin"){
                          this.$Message.warning("无法修改或删除系统默认账户的信息！");
                          return;
                        }
                        switch(type){
                          case "edit":
                            this.edit(params.row.id);
                            break;
                          case "updatePassword":
                            this.updatePassword(params.row.id);
                            break;
                          case "role":
                            this.role(params.row.id);
                            break;
                          case "delete":
                            this.delete(params.row);
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
                                    value: 'system.user.modify'
                                  }
                                ],
                              },
                              "修改"
                            ),
                            h(
                              "DropdownItem", {
                                props: {
                                  name: "updatePassword"
                                },
                                style: {
                                  textAlign: 'center'
                                },
                                directives: [
                                  {
                                    name: 'auth',
                                    value: 'system.user.resetPassword'
                                  }
                                ],
                              },
                              "修改密码"
                            ),
                            h(
                              "DropdownItem", {
                                props: {
                                  name: "role"
                                },
                                style: {
                                  textAlign: 'center'
                                },
                                directives: [
                                  {
                                    name: 'auth',
                                    value: 'system.user.modify'
                                  }
                                ],
                              },
                              "角色"
                            ),
                            h(
                              "DropdownItem", {
                                props: {
                                  name: "delete",
                                },
                                style: {
                                  textAlign: 'center',
                                },
                                directives: [
                                  {
                                    name: 'auth',
                                    value: 'system.user.delete'
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
          },
        ],
        rows: [],

        dlgDetail:{
          visible: false,
          loginAccount: "",
          userName: "",
          telephone: "",
          userDesc: "",
          deptNames: "",
        },

        dlgEdit:{
          visible: false,
          title: "",
          id: 0,
          loginAccount: "",
          userName: "",
          telephone: "",
          userDesc: "",
          deptIds: [],
        },

        dlgRole:{
          visible: false,
          userID: 0,
          roleIDs: [],
          allRoles: [],
        },

        dlgDepts:{
          visible: false,
          data: [],
        },
        isShowPasswordVisible: false,
        updatePasswordLoading: false,
        dlgUpdatePassword: {
          userId: null,
          password: ""
        },
        dlgUpdatePasswordRules: {
          password: [
            {
              required: true, 
              type: "method",
              validator: (rule, value, callback) => {
                if (!value) {
                  callback(new Error("密码不能为空"));
                }         
                else if (value.length < 6 || value.length > 12 || !/^[0-9a-zA-Z]*$/.test(value)) {
                  callback(new Error("密码必须为6-12位长度字母或数字组合"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ]
        }
      };
    },
    methods:{
      onSearch() {
        this.currentPage = 1;
        this.query();
      },
      onPageChanged(page){
        this.currentPage = page;
        this.query();
      },
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.query();
      },
      updatePassword(id) {
        this.$refs["dlgUpdatePassword"].resetFields();
        this.dlgUpdatePassword = {
          userId: id,
          password: ""
        }
        this.isShowPasswordVisible = true;
      },
      confirmPassword() {
        this.$refs["dlgUpdatePassword"].validate(valid => {
          if (valid) {
            this.$commonService
              .post("/user/updatePassword", {
                userId: this.dlgUpdatePassword.userId,
                password: this.dlgUpdatePassword.password
              })
              .then(res => {
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success("修改密码成功！");
                this.isShowPasswordVisible = false;
                this.updatePasswordLoading = false;
              })
              .catch(err => {
                console.log(err);
                err.msg && this.$Message.error(err.msg);
              });
          }
        })
      },
      detail(id){
        this.$commonService
          .get("/user/getCommonUserById", {
            id: id
          })
          .then(res => {
            
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.dlgDetail.loginAccount = res.data.loginAccount;
            this.dlgDetail.userName = res.data.userName;
            this.dlgDetail.telephone = res.data.telephone;
            this.dlgDetail.userDesc = res.data.userDesc;
            this.dlgDetail.deptNames = res.data.commonDeptDto.map(x=>x.deptName).join(",")
            this.dlgDetail.visible = true;
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      delete(row){

        this.$Modal.confirm({
          title: '提示',
          content: `<p>确定删除账户为<span style="color: red;font-size: 16px;"> ${row.loginAccount} </span>的用户吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/user/deleteCommonUser", {
                id: row.id
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("删除成功！");
                this.query();
              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }
        });
      },
      role(id){
        this.$commonService
          .post("/role/getAllCommonRole", {
            list:{
              "createUserId": 0,
              "currentPage": 1,
              "keywords": "",
              "pageSize": 999
            }
          })
          .then(res => {

            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            
            this.dlgRole.allRoles = res.data.map(x=>{
              return { id: x.id, name: x.roleName};
            })
            
            this.$commonService
              .get("/user/getCommonUserRoleById", {
                userId: id
              })
              .then(res2 => {

                if(!res2.success){
                  this.$Message.error(res2.msg);
                  return;
                }
                
                this.dlgRole.roleIDs = res2.data.map(x=>{
                  return x.id;
                })

                this.dlgRole.userID = id;
                this.dlgRole.visible = true;
              })
              .catch(err => {
                err.msg && this.$Message.error(err.msg);
              });
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      changeRole(){
        this.roleLoading = true;
        this.$commonService
          .post("/user/setUserRoleByUserId", {
            commonUserRoleDto:{
              "roleIds": this.dlgRole.roleIDs,
              "userId": this.dlgRole.userID
            }
          })
          .then(res2 => {
            this.roleLoading = false;
            if(!res2.success){
              this.$Message.error(res2.msg);
              return;
            }
            
            this.$Message.success("修改角色成功！");
            this.dlgRole.visible = false;
          })
          .catch(err => {
            this.roleLoading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      edit(id){

        this.$commonService
          .get("/user/getCommonUserById", {
            id: id
          })
          .then(res => {
            
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.dlgEdit.id = res.data.id;
            this.dlgEdit.loginAccount = res.data.loginAccount;
            this.dlgEdit.userName = res.data.userName;
            this.dlgEdit.telephone = res.data.telephone;
            this.dlgEdit.userDesc = res.data.userDesc;
            this.dlgEdit.deptIds = res.data.commonDeptDto.map(x=>x.id);

            this.dlgEdit.visible = true;
            this.dlgEdit.title = "修改";

          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      create(){
        this.dlgEdit.id = 0;
        this.dlgEdit.loginAccount = "";
        this.dlgEdit.telephone = "";
        this.dlgEdit.userDesc = "";
        this.dlgEdit.userName = "";
        this.dlgEdit.deptIds = [];
        this.dlgEdit.visible = true;
        this.dlgEdit.title = "新增";
      },
      createSubmit(){
        
        if(!this.dlgEdit.loginAccount){
          this.$Message.warning("账户不能为空！");
          return;
        }
        if (!/^[0-9a-zA-Z_]{5,20}$/.test(this.dlgEdit.loginAccount)) {
          this.$Message.warning("账户只能由5到20位字母数字下划线组成！");
          return;
        }
        if(this.dlgEdit.deptIds.length<=0){
          this.$Message.warning("请选择所属组织机构！");
          return;
        }
        if(!this.dlgEdit.userName){
          this.$Message.warning("姓名不能为空！");
          return;
        }
        if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(this.dlgEdit.userName)) {
          this.$Message.warning("姓名格式不正确！");
          return;
        }
        if (this.dlgEdit.userName.replace(/[\x00-\xff]/g,'aa').length>20) {
          this.$Message.warning("姓名长度不能超过20位半角字符符或10位全角字符！");
          return;
        }
        if(!this.dlgEdit.telephone){
          this.$Message.warning("手机号不能为空！");
          return;
        }
        if (!new RegExp("^\\d{11}$").test(this.dlgEdit.telephone)) {
          this.$Message.warning("手机号格式不正确！");
          return;
        }

        var userInfo = this.$storage.getUserInfo();

        this.modifyLoading = true;

        if(this.dlgEdit.title=='修改'){
          this.$commonService
            .post("/user/updateCommonUser", {
              commonUserInDto:{
                "id": this.dlgEdit.id,
                "loginAccount": this.dlgEdit.loginAccount,
                "telephone": this.dlgEdit.telephone,
                "userDesc": this.dlgEdit.userDesc,
                "userName": this.dlgEdit.userName,
                // "deptId": userInfo.deptId,
                "deptId": this.dlgEdit.deptIds,
              }
            })
            .then(res => {
              this.modifyLoading = false;
              
              if(!res.success){
                this.$Message.error(res.msg);
                return;
              }
              
              this.$Message.success("修改成功！");
              this.query();
              this.dlgEdit.visible = false;
            })
            .catch(err => {
              this.modifyLoading = false;
              err.msg && this.$Message.error(err.msg);
            });
        } else {
          this.$commonService
            .post("/user/addCommonUser", {
              commonUserInDto:{
                "id": 0,
                "loginAccount": this.dlgEdit.loginAccount,
                "telephone": this.dlgEdit.telephone,
                "userDesc": this.dlgEdit.userDesc,
                "userName": this.dlgEdit.userName,
                // "deptId": userInfo.deptId,
                "deptId": this.dlgEdit.deptIds,
              }
            })
            .then(res => {
              this.modifyLoading = false;

              if(!res.success){
                this.$Message.error(res.msg);
                return;
              }
              
              this.$Message.success("新增成功！");
              this.query();
              this.dlgEdit.visible = false;
            })
            .catch(err => {
              this.modifyLoading = false;
              err.msg && this.$Message.error(err.msg);
            });
        }
      },
      query(){
        this.loading = true;
        this.$commonService
          .post("/user/getCommonUser", {
            list:{
              "currentPage": this.currentPage,
              "keywords": this.keywords,
              "pageSize": this.pageSize
            }
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.rows = res.data;
            this.totalCount = res.total;

            if(this.totalCount <= this.pageSize * (this.currentPage - 1) && this.currentPage > 1){
              this.currentPage = this.currentPage - 1;
              setTimeout(()=>{
                this.query();
              },100)
            }
          })
          .catch(err => {
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      changeDepts(){

        this.$commonService
          .get("/dept/getTreeAllCommonDept", {
            deptType: 0,
            pId: -1
          })
          .then(res => {
            
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            
            var deptIds = this.dlgEdit.deptIds;

            var formate = function(data, deep) {
              data.forEach(item => {
                item.title = item.deptName;
                if(deep<1) item.expand = true;
                item.mychecked = deptIds.indexOf(item.id) >= 0;
                if(item.children && item.children.length > 0) formate(item.children, deep+1);
              });
            };
            formate(res.data, 0);

            this.dlgDepts.data = res.data;
            this.dlgDepts.visible = true;
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      changeDeptsSubmit(){
        var deptIds = [];

        var getCheckedNodeIDs = function(items, deptIds){
          if(!items) return;
          items.forEach(item=>{
            if(item.mychecked) { 
              deptIds.push(item.id); 
              getCheckedNodeIDs(item.children, deptIds);
            }
            else {
              getCheckedNodeIDs(item.children, deptIds);
            };
          });
        }
        
        getCheckedNodeIDs(this.dlgDepts.data, deptIds);

        if(deptIds.length<=0){
          this.$Message.warning("请选择部门！");
          return;
        }

        this.dlgEdit.deptIds = deptIds;
        this.dlgDepts.visible = false;
      },
      renderContent (h, { root, node, data }) {
        return h('span', {
            style: {
                display: 'inline-block',
                width: '100%'
            }
        }, [
            h('span', [
              h('Checkbox', {
                props: {
                  value: data.mychecked
                },
                on: {
                  "on-change": (val) => { 
                    data.mychecked = val;
                  }
                }
              })
            ]),
            h('span', [
                h('span', data.title)
            ]),
        ]);
      }
    },
    mounted(){
      this.query();
    }
  }
</script>
