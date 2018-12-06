<style scoped lang="less">
  .role {
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
  <div class="role">
    <Input placeholder="关键字" v-model="keywords" clearable style="width: 200px;margin-top:5px;" />
    <Button type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button type="warning" icon="plus-round" @click="create()" v-auth="'system.role.add'" style="margin-top:5px;">新增</Button>
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
      <Form :label-width="120">
        <FormItem label="角色名：">
          {{dlgDetail.roleName}}
        </FormItem>
        <!-- <FormItem label="角色Code：">
          {{dlgDetail.roleCode}}
        </FormItem> -->
        <FormItem label="角色描述：">
          {{dlgDetail.roleDesc}}
        </FormItem>
        <FormItem label="创建时间：">
          {{dlgDetail.createTime}}
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="dlgDetail.visible=false">确定</Button>
      </div>
    </Modal>

    <!-- 修改或新增 -->
    <Modal v-model="dlgEdit.visible" :title="dlgEdit.title">
      <Form :label-width="80" ref="formData" :model="dlgEdit" :rules="formDataRules">
        <FormItem label="角色名：" prop="roleName">
          <Input v-model="dlgEdit.roleName" placeholder="请输入用户名" />
        </FormItem>
        <!-- <FormItem label="角色Code：">
          <Input v-model="dlgEdit.roleCode" placeholder="请输入用户名"></Input>
        </FormItem> -->
        <FormItem label="角色描述：">
          <Input v-model="dlgEdit.roleDesc" placeholder="请输入描述" type="textarea" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="dlgEdit.title=='新增'?createSubmit():editSubmit()" :loading="modifyLoading">确定</Button>
      </div>
    </Modal>

    <!-- 角色 -->
    <Modal v-model="dlgRights.visible" title="权限">
      <Tree :data="dlgRights.data" show-checkbox ref="roleRightsRelation" style="padding: 0 20px;"></Tree>
      <div slot="footer">
        <Button type="primary" @click="changeRights()" :loading="rightLoading">确定</Button>
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
        rightLoading: false, // 权限
        keywords: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        columns: [
          {
            title: "角色名",
            key: "roleName",
            minWidth: 80,
          },
          {
            title: "描述",
            key: "roleDesc",
            minWidth: 80,
          },
          {
            title: "创建时间",
            key: "createTime",
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
                        // if(params.row.createUserId != 0 && params.row.createUserId != getUserInfo().id){
                        //   this.$Message.warning("此角色不是由您创建，无法修改或删除！");
                        //   return;
                        // }
                        // if((type == "edit" || type == "delete") && params.row.createUserId == 0){
                        //   this.$Message.warning("此角色是系统内置角色无法修改或删除！");
                        //   return;
                        // }
                        switch(type){
                          case "edit":
                            this.edit(params.row.id);
                            break;
                          case "rights":
                            this.rights(params.row.id);
                            break;
                          case "delete":
                            this.delete(params.row);
                            break;
                        }
                      }
                    },
                    scopedSlots: {
                      list: function (props) {
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
                                  value: 'system.role.modify'
                                }
                              ],
                            },
                            "修改"
                          ),
                          h(
                            "DropdownItem", {
                              props: {
                                name: "rights"
                              },
                              style: {
                                textAlign: 'center'
                              },
                              directives: [
                                {
                                  name: 'auth',
                                  value: 'system.role.modify'
                                }
                              ],
                            },
                            "权限"
                          ),
                          h(
                            "DropdownItem", {
                              props: {
                                name: "delete"
                              },
                              style: {
                                textAlign: 'center'
                              },
                              directives: [
                                {
                                  name: 'auth',
                                  value: 'system.role.delete'
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
          roleCode: "",
          roleName: "",
          roleDesc: "",
          createTime: "",
        },

        dlgEdit:{
          visible: false,
          title: "",
          id: 0,
          roleCode: "",
          roleName: "",
          roleDesc: "",
        },

        formDataRules: {
          roleName: [
            { required: true, message: "角色名称不能为空", trigger: "blur" },
            { max: 40, message: "角色名称不能超过40个字", trigger: "blur" },
          ]
        },

        dlgRights:{
          visible: false,
          roleId: 0,
          data: [],
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
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.query();
      },
      query(){
        this.loading = true;
        this.$commonService
          .post("/role/getAllCommonRole", {
            list:{
              "createUserId": 0,
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
            console.log(err);
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      detail(id){
        
        this.$commonService
          .get("/role/getCommonRoleById", {
            roleId: id
          })
          .then(res => {

            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.dlgDetail.roleName = res.data.roleName;
            this.dlgDetail.roleDesc = res.data.roleDesc;
            this.dlgDetail.createTime = res.data.createTime;
            this.dlgDetail.visible = true;
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      delete(row){
        this.$Modal.confirm({
          title: '提示',
          content: `<p>确定删除角色名为<span style="color: red;font-size: 16px;"> ${row.roleName} </span>的角色吗？</p>`,
          loading: true,
          onOk: () => {

            this.$commonService
              .get("/role/deleteCommonRole", {
                roleId: row.id
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
      rights(roleId){
        
        this.$commonService
          .get("/menu/getTreeCurrentUserMenu", {
            pId: -1
          })
          .then(res => {

            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            
            var formate = function(data, deep) {
              data.forEach(item => {
                item.title = item.menuName;
                // if(deep<1) item.expand = true;
                if(item.children && item.children.length > 0) formate(item.children, deep+1)
              });
            };
            formate(res.data, 0);

            this.$commonService
              .get("/menu/getCurrentRoleMenu", {
                roleId: roleId
              })
              .then(res2 => {

                if(!res2.success){
                  this.$Message.error(res2.msg);
                  return;
                }
                
                var ids = res2.data.map(item=>item.id);
                var initCheckStatus = function(data){
                  data.forEach(item => {
                    if(ids.indexOf(item.id)>=0 && item.children.length <= 0){
                      item.checked = true;
                    }
                    if(item.children && item.children.length > 0) initCheckStatus(item.children)
                  });
                }
                initCheckStatus(res.data);

                this.dlgRights.data = res.data;
                this.dlgRights.roleId = roleId;
                this.dlgRights.visible = true;
              })
              .catch(err => {
                err.msg && this.$Message.error(err.msg);
              });

          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
          
      },
      changeRights(){

        var menuIds = [];

        var getCheckedNodeIDs = function(items, menuIds){
          var baseFlag = false;
          items.forEach(item=>{
            var flag = false;
            if(item.children && item.children.length > 0) {
              flag = getCheckedNodeIDs(item.children, menuIds) || flag;
            }
            flag = item.checked || flag;
            if(flag) {
              menuIds.push(item.id);
              baseFlag = true;
            }
          });
          return baseFlag;
        }
        
        getCheckedNodeIDs(this.dlgRights.data, menuIds);

        // var menuIds = this.$refs.roleRightsRelation.getCheckedNodes().map(x=>x.id);
        this.rightLoading = true;

        this.$commonService
          .post("/menu/setRoleMenu", {
            commonMenuRoleDto: {
              "menuIds": menuIds,
              "roleId": this.dlgRights.roleId
            }
          })
          .then(res => {

            this.rightLoading = false;
            
            if(!res.success){
              this.$Message.error(res2.msg);
              return;
            }
            
            this.dlgRights.visible = false;
            this.$Message.success("修改角色权限成功！");
          })
          .catch(err => {
            this.rightLoading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      edit(id){
        
        this.$commonService
          .get("/role/getCommonRoleById", {
            roleId: id
          })
          .then(res => {

            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.$refs["formData"].resetFields();

            this.dlgEdit.id = res.data.id;
            this.dlgEdit.roleName = res.data.roleName;
            this.dlgEdit.roleDesc = res.data.roleDesc;
            this.dlgEdit.visible = true;
            this.dlgEdit.title = "修改";
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      create(){
        this.$refs["formData"].resetFields();
        this.dlgEdit.roleName = "";
        this.dlgEdit.roleDesc = "";
        this.dlgEdit.visible = true;
        this.dlgEdit.title = "新增";
      },
      editSubmit(){

        this.$refs["formData"].validate(valid => {
          if (valid) {
            this.modifyLoading = true;

            this.$commonService
              .post("/role/updateCommonRole", {
                roleId: this.dlgEdit.id,
                updateCommonRole: {
                  "roleCode": this.dlgEdit.roleCode,
                  "roleDesc": this.dlgEdit.roleDesc,
                  "roleName": this.dlgEdit.roleName
                }
              })
              .then(res => {

                this.modifyLoading = false;

                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }

                this.$Message.success("修改成功！");
                this.dlgEdit.visible = false;
                this.query();
              })
              .catch(err => {
                this.modifyLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });

      },
      createSubmit(){
        
        this.$refs["formData"].validate(valid => {
          if (valid) {
            this.modifyLoading = true;

            this.$commonService
              .post("/role/addCommonRole", {
                commonRoleInDto: {
                  "roleCode": this.dlgEdit.roleCode,
                  "roleDesc": this.dlgEdit.roleDesc,
                  "roleName": this.dlgEdit.roleName
                }
              })
              .then(res => {

                this.modifyLoading = false;
                
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }

                this.$Message.success("新增成功！");
                this.dlgEdit.visible = false;
                this.query();
              })
              .catch(err => {
                this.modifyLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });
        
      }
    },
    mounted(){
      this.query();
    }
  }
</script>
