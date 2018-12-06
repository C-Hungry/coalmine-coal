<style scoped lang="less">
  .res {
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
  <div class="res">
    <div class="tree">
      <ul class="switch-list">
        <li class="switch-item">
          <Switch v-model="props.isFold" size="small"></Switch>&nbsp;&nbsp;<span style="vertical-align: middle;">全部展开</span>
        </li>
        <li class="switch-item">
          <Switch v-model="props.showIndex" size="small"></Switch>&nbsp;&nbsp;<span style="vertical-align: middle;">显示序号</span>
        </li>
        <li class="switch-item">
          <Switch v-model="props.showHeader" size="small"></Switch>&nbsp;&nbsp;<span style="vertical-align: middle;">显示标题</span>
        </li>
      </ul>
      <div class="content">
        <Spin fix v-if="loading" size="large"></Spin>
        <zk-table
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
            <Button type="primary" size="small" @click="openDetail(scope.row.id)">详情</Button>
            <Dropdown trigger="click" :transfer="true">
              <Button type="ghost" size="small">
                更多
                <Icon type="arrow-down-b"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <!-- <DropdownItem name="create" style="text-align: center;">
                  <div @click="create(scope.row.id)">新增</div> 
                </DropdownItem> -->
                <DropdownItem name="edit" style="text-align: center;" v-auth="'system.res.modify'">
                  <div @click="edit(scope.row.id)">修改</div>
                </DropdownItem>
                <DropdownItem name="del" style="text-align: center;" v-auth="'system.res.delete'">
                  <div @click="del(scope.row.id)">删除</div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </template>
        </zk-table>
      </div>
    </div>

    <!-- 详情 -->
    <Modal v-model="dlgDetail.visible" title="详情">
      <Form :label-width="120">
        <FormItem label="资源名称：">
          {{dlgDetail.menuName}}
        </FormItem>
        <FormItem label="资源CODE：">
          {{dlgDetail.permission}}
        </FormItem>
        <FormItem label="资源类型：">
          {{dlgDetail.type==0?'菜单':dlgDetail.type==1?'按钮':dlgDetail.type==2?'快捷菜单':''}}
        </FormItem>
        <FormItem label="资源图标：" v-if="dlgDetail.type=='0'||dlgDetail.type=='2'">
          {{dlgDetail.icon}}
        </FormItem>
        <FormItem label="页面相对URL：" v-if="dlgDetail.type=='0'||dlgDetail.type=='2'||dlgDetail.type=='3'">
          {{dlgDetail.path}}
        </FormItem>
        <FormItem label="资源服务URL：" v-if="dlgDetail.type=='1'">
          {{dlgDetail.url}}
        </FormItem>
        <FormItem label="请求方式：" v-if="dlgDetail.type=='1'">
          {{dlgDetail.method}}
        </FormItem>
        <FormItem label="排序：">
          {{dlgDetail.sort}}
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="dlgDetail.visible=false">确定</Button>
      </div>
    </Modal>

    <!-- 修改或新增 -->
    <Modal v-model="dlgEdit.visible" :title="dlgEdit.title">
      <Form :label-width="120">
        <FormItem label="资源类型：">
          <RadioGroup v-model="dlgEdit.type">
            <Radio label="0" disabled>
                <span>菜单</span>
            </Radio>
            <Radio label="1" disabled>
                <span>按钮</span>
            </Radio>
            <Radio label="2" disabled>
                <span>快捷菜单</span>
            </Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="资源CODE：">
          <Input v-model="dlgEdit.permission" disabled placeholder="请选择资源CODE" />
        </FormItem>
        <FormItem label="资源名称：">
          <Input v-model="dlgEdit.menuName" placeholder="请输入资源名称" />
        </FormItem>
        <FormItem v-if="dlgEdit.type=='0'||dlgEdit.type=='2'" label="资源图标：">
          <Select v-model="dlgEdit.icon" placeholder="请选择资源图标">
            <Option value="-1">请选择</Option>
            <Option v-for="item in icons" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </FormItem>
        <FormItem v-if="dlgEdit.type=='0'||dlgEdit.type=='2'||dlgEdit.type=='3'" label="页面相对URL：">
          <Input v-model="dlgEdit.path" disabled placeholder="请输入页面相对URL" />
        </FormItem>
        <FormItem v-if="dlgEdit.type=='1'" label="资源服务URL：">
          <Input v-model="dlgEdit.url" disabled placeholder="请输入资源服务URL" />
        </FormItem>
        <FormItem v-if="dlgEdit.type=='1'" label="资源请求类型：">
          <Select v-model="dlgEdit.method" disabled placeholder="请选择资源请求类型">
            <Option value="-1">请选择</Option>
            <Option value="GET">GET</Option>
            <Option value="POST">POST</Option>
          </Select>
        </FormItem>
        <FormItem label="排序：">
          <Input v-model="dlgEdit.sort" placeholder="请输入排序" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="dlgEdit.title=='新增'?createSubmit():editSubmit()">确定</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  import resource from "../../../../libs/resource";
  export default {
    data() {
      return {
        props: {
          border: true,
          showHeader: true,
          showIndex: false,
          isFold: false,
          expandType: false,
          selectionType: false,
        },
        icons: resource.icons,
        loading: false,
        data: [],
        columns: [
          {
            label: '资源名称',
            prop: 'menuName',
            minWidth: '200px'
          },
          {
            label: '资源CODE',
            prop: 'permission',
            minWidth: '90px'
          },
          {
            label: '资源类型',
            prop: 'typeStr',
            minWidth: '80px'
          },
          {
            label: '资源图标',
            prop: 'icon',
            minWidth: '80px'
          },
          {
            label: '页面相对URL',
            prop: 'path',
            minWidth: '100px'
          },
          {
            label: '资源服务URL',
            prop: 'url',
            minWidth: '100px'
          },
          {
            label: '请求方式',
            prop: 'method',
            minWidth: '80px'
          },
          {
            label: "操作",
            prop: "operation",
            width: 112,
            type: 'template',
            template: 'operation'
          }
        ],

        dlgDetail:{
          visible: false,
          menuName: "",
          icon: "",
          permission: "",
          path: "",
          url: "",
          method: "",
          type: "",
          typeStr: "",
          sort: ""
        },
        
        dlgEdit:{
          visible: false,
          title: "",
          id: 0,
          menuName: "",
          icon: "",
          permission: "-1",
          companyId: 0,
          component: "",
          path: "",
          url: "",
          method: "-1",
          type: "",
          sort: "",
        },
      };
    },
    methods: {
      // 查看详情
      openDetail(menuId){
        
        this.$commonService
          .get("/menu/getCommonMenu", {
            menuId: menuId
          })
          .then(res => {

            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.dlgDetail.menuName = res.data.menuName || '--';
            this.dlgDetail.icon = res.data.icon || '--';
            this.dlgDetail.method = res.data.method || '--';
            this.dlgDetail.path = res.data.path || '--';
            this.dlgDetail.permission = res.data.permission || '--';
            this.dlgDetail.sort = res.data.sort || '--';
            this.dlgDetail.type = res.data.type || '--';
            this.dlgDetail.url = res.data.url || '--';
            this.dlgDetail.visible = true;
            
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });

      },
      create(pid){
        
        this.dlgEdit.pid = pid;
        this.dlgEdit.id = 0;
        this.dlgEdit.menuName = "";
        this.dlgEdit.icon = "-1";
        this.dlgEdit.permission = "-1";
        this.dlgEdit.companyId = 0;
        this.dlgEdit.component = "";
        this.dlgEdit.path = "";
        this.dlgEdit.url = "";
        this.dlgEdit.method = "-1";
        this.dlgEdit.type = "";
        this.dlgEdit.sort = "";

        this.dlgEdit.visible = true;
        this.dlgEdit.title = "新增";
      },
      createSubmit(pid){

        if(!this.dlgEdit.menuName){
          this.$Message.warning("资源名称不能为空！");
          return;
        }
        if (this.dlgEdit.menuName.replace(/[\x00-\xff]/g,'aa').length>20) {
          this.$Message.warning("资源名称长度不能超过20位半角字符符或10位全角字符！");
          return;
        }
        if(!this.dlgEdit.type){
          this.$Message.warning("资源类型不能为空！");
          return;
        }
        if(!this.dlgEdit.sort){
          this.$Message.warning("资源排序不能为空！");
          return;
        }

        this.$commonService
          .post("/menu/addCommonMenu", {
            commonMenuDto: {
              "component": this.dlgEdit.component,
              "icon": this.dlgEdit.icon == "-1" ? "" : this.dlgEdit.icon,
              // "id": this.dlgEdit.id,
              "menuName": this.dlgEdit.menuName,
              "method": this.dlgEdit.method,
              "path": this.dlgEdit.path,
              "permission": this.dlgEdit.permission,
              "pid": this.dlgEdit.pid,
              "sort": this.dlgEdit.sort,
              "type": this.dlgEdit.type,
              "url": this.dlgEdit.url
            }
          })
          .then(res => {

            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.dlgEdit.visible = false
            this.$Message.info("新增资源成功！");
            this.query();
            this.detail = null;
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      edit(menuId){
        
        this.$commonService
          .get("/menu/getCommonMenu", {
            menuId: menuId
          })
          .then(res => {

            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            Object.keys(res.data).forEach(key => {
              this.dlgEdit[key] = res.data[key];
            })

            this.dlgEdit.icon = this.dlgEdit.icon ? this.dlgEdit.icon : "-1";
            this.dlgEdit.permission = this.dlgEdit.permission ? this.dlgEdit.permission : "-1";
            this.dlgEdit.visible = true;
            this.dlgEdit.title = "修改";
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      editSubmit(){
        
        if(!this.dlgEdit.menuName){
          this.$Message.warning("资源名称不能为空！");
          return;
        }
        if (this.dlgEdit.menuName.replace(/[\x00-\xff]/g,'aa').length>20) {
          this.$Message.warning("资源名称长度不能超过20位半角字符符或10位全角字符！");
          return;
        }
        if(!this.dlgEdit.type){
          this.$Message.warning("资源类型不能为空！");
          return;
        }
        if(!this.dlgEdit.sort){
          this.$Message.warning("资源排序不能为空！");
          return;
        }
        this.$commonService
          .post("/menu/updateCommonMenu", {
            updateCommonMenu: {
              "companyId": this.dlgEdit.companyId,
              "component": this.dlgEdit.component,
              "icon": this.dlgEdit.icon == "-1" ? "" : this.dlgEdit.icon,
              "id": this.dlgEdit.id,
              "menuName": this.dlgEdit.menuName,
              "method": this.dlgEdit.method,
              "path": this.dlgEdit.path,
              "permission": this.dlgEdit.permission,
              "pid": this.dlgEdit.pid,
              "sort": this.dlgEdit.sort,
              "type": this.dlgEdit.type,
              "url": this.dlgEdit.url
            }
          })
          .then(res => {

            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            
            this.dlgEdit.visible = false;
            this.$Message.info("修改资源成功！");
            this.query();
            this.detail = null;
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      del(id){
        
        this.$Modal.confirm({
          title: '提示',
          content: '<p>确定删除此资源？</p>',
          loading: true,
          onOk: () => {

            this.$commonService
              .get("/menu/deleteCommonMenu", {
                id: id
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }

                this.$Message.info("删除成功！");
                this.query();
                this.detail = null;
              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }
        });
      },
      query(){
        this.loading = true;
        this.$commonService
          .get("/menu/getTreeAllCommonMenu", {
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

                // 菜单类型 （0菜单 1按钮 2快捷菜单）
                switch(item.type) {
                  case "0":
                    item.typeStr = "菜单";
                    break;
                  case "1":
                    item.typeStr = "按钮";
                    break;
                  case "2":
                    item.typeStr = "快捷菜单";
                    break;
                }
                
                // var row = self.$refs.table._data.bodyData.filter(row => row.id == item.id)[0];
                var row = (self.$refs.table && self.$refs.table._data && self.$refs.table._data.bodyData.filter(row => row.id == item.id)[0]) || null;
                
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
            // this.$Message.error("查询资源出现未知错误！");
          });
      }
    },
    mounted(){
      this.query();
    }
  }
</script>
