<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker format="yyyy/MM/dd" type="daterange" placeholder="采样时间" style="width: 200px;vertical-align: middle;margin-top: 5px;"></DatePicker>
    <Select filterable clearable style="width:200px" placeholder="煤种">
      <Option :value="1">煤种1</Option>
      <Option :value="2">煤种2</Option>
      <Option :value="3">煤种3</Option>
    </Select>
    <Button type="primary" icon="ios-search" @click="onSearch()" :loading="loading">查询</Button>
    <Button type="warning" icon="plus-round" @click="create()">新增</Button>
    <br><br>
    <Table border :columns="columns" :data="rows" :loading="loading"></Table>
    <br>
    <Page 
      :total="totalCount" 
      show-elevator 
      show-total 
      :page-size="pageSize" 
      :current="currentPage" 
      @on-change="onPageChanged"
    ></Page>

    <!-- 修改或新增 -->
    <Modal v-model="dlgEdit.visible" :title="dlgEdit.title">
      <Form :label-width="80">
        <FormItem label="煤种名称：">
          <Input v-model="dlgEdit.loginAccount" :disabled="dlgEdit.title=='修改'" placeholder="请输入（必填）" />
        </FormItem>
        <FormItem label="煤种分类：">
          <Select filterable placeholder="请选择（必填）">
            <Option :value="1">煤种1</Option>
            <Option :value="2">煤种2</Option>
            <Option :value="3">煤种3</Option>
          </Select>
        </FormItem>
        <FormItem label="矿区：">
          <Input v-model="dlgEdit.userName" placeholder="请输入（必填）" />
        </FormItem>
        <FormItem label="备注：">
          <Input v-model="dlgEdit.userDesc" placeholder="请输入" type="textarea" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="createSubmit()" :loading="modifyLoading">提交</Button>
        <Button type="default" @click="dlgEdit.visible = false" >取消</Button>
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
        startTime: "",
        endTime: "",
        status: 0,
        keywords: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        columns: [
          {
            title: "煤种名称",
            key: "bunkerNumber",
            minWidth: 120
          },
          {
            title: "化验单号",
            key: "bunkerName",
            minWidth: 120
          },
          {
            title: "采样时间",
            key: "position",
            minWidth: 120
          },
          {
            title: "全水分MT%",
            key: "statusStr",
            minWidth: 120
          },
          {
            title: "空干基水分Mad%",
            key: "statusStr",
            minWidth: 120
          },
          {
            title: "干基灰分Ad%",
            key: "remark",
            minWidth: 120
          },
           {
            title: "干燥无灰基Vdaf%",
            key: "remark",
            minWidth: 120
          },
          {
            title: "粘结指数G",
            key: "remark",
            minWidth: 120
          },
          {
            title: "全硫St.ad%",
            key: "remark",
            minWidth: 120
          },
          {
            title: "低位热值Qnet.ar（MJ/kg）",
            key: "remark",
            minWidth: 120
          },
          {
            title: "低位热值Qnet.ar（cal/g）",
            key: "remark",
            minWidth: 120
          },
          {
            title: "创建时间",
            key: "remark",
            minWidth: 120
          },
          {
            title: "创建人",
            key: "remark",
            minWidth: 120
          },
          {
            title: "状态",
            key: "remark",
            minWidth: 120
          },
          {
            title: "备注",
            key: "remark",
            minWidth: 120
          },
          {
            title: "操作",
            width: 143,
            fixed: "right",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: params.row.status == 1 ? "warning" : "success",
                      size: "small"
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.changeStatus(params.row);
                      }
                    }
                  },
                  params.row.status == 1 ? "禁用" : "启用"
                ),
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
                  "修改"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small"
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.delete(params.row);
                      }
                    }
                  },
                  "删除"
                )
              ]);
            }
          },
        ],
        rows: [],
        dlgEdit:{
          visible: false,
          bunkerName: "",
          id: 0,
          bunkerNumber: "",
          position: "",
          remark: "",
          status: "",
        }
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getCoalBunkersList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getCoalBunkersList();
      },
      // 详情
      detail(id){
        this.$commonService
          .get("/basedata/getCoalBunkersDetail", {
            id: id
          })
          .then(res => {
            
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.dlgDetail = res.data;

            this.dlgDetail.visible = true;
          })
          .catch(err => {
            this.$Message.error("获取煤仓详情出现未知错误！");
          });
      },
      // 删除
      delete(data){

        this.$Modal.confirm({
          title: '提示',
          content: `<p>确定<span style="color: red;font-size: 16px;"> 删除 </span>
                    编号为<span style="color: red;font-size: 16px;"> ${data.bunkerNumber} </span>煤仓吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/basedata/deleteCoalBunker", {
                id: data.id
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("删除成功！");
                this.getCoalBunkersList();
              })
              .catch(err => {
                this.$Modal.remove();
                this.$Message.error("删除出现未知错误！");
              });
          }
        });
      },
      // 改变状态
      changeStatus(data) {
        this.$Modal.confirm({
          title: '提示',
          content: `<p>确定<span style="color: red;font-size: 16px;"> ${data.status == 1 ? '禁用':'启用'} </span>
                  编号为<span style="color: red;font-size: 16px;"> ${data.bunkerNumber} </span>煤仓吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/basedata/deleteCoalBunker", {
                id: data.id
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("删除成功！");
                this.getCoalBunkersList();
              })
              .catch(err => {
                this.$Modal.remove();
                this.$Message.error("删除出现未知错误！");
              });
          }
        });
      },
      // 修改
      edit(id){

        this.$commonService
          .get("/basedata/getCoalBunkersDetail", {
            id: id
          })
          .then(res => {
            
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.dlgEdit = res.data;
            this.dlgEdit.visible = true;
            this.dlgEdit.title = "修改";

          })
          .catch(err => {
            this.$Message.error("获取煤仓详情出现未知错误！");
          });
      },
      // 新增
      create(){

        this.dlgEdit = {
          visible: true,
          title: "新增",
          bunkerName: "",
          id: 0,
          bunkerNumber: "",
          position: "",
          remark: "",
          status: 3
        }

      },
      // 新增或者修改
      createSubmit(){
        
        if(!this.dlgEdit.bunkerName){
          this.$Message.warning("煤仓名称不能为空！");
          return;
        }
        if(!this.dlgEdit.position){
          this.$Message.warning("煤仓位置不能为空！");
          return;
        }

        this.modifyLoading = true;

        if(this.dlgEdit.title=='修改'){
          this.$commonService
            .post("/user/updateCommonUser", {
              commonUserInDto:{
                "id": this.dlgEdit.id,
                "bunkerName": this.dlgEdit.bunkerName,
                "bunkerNumber": this.dlgEdit.bunkerNumber,
                "position": this.dlgEdit.position,
                "remark": this.dlgEdit.remark,
                "status": this.dlgEdit.status
              }
            })
            .then(res => {
              this.modifyLoading = false;
              
              if(!res.success){
                this.$Message.error(res.msg);
                return;
              }
              
              this.$Message.success("修改成功！");
              this.getCoalBunkersList();
              this.dlgEdit.visible = false;
            })
            .catch(err => {
              this.modifyLoading = false;
              this.$Message.error("修改出现未知错误！");
            });
        } else {
          this.$commonService
            .post("/basedata/addCoalBunker", {
              commonUserInDto:{
                "bunkerName": this.dlgEdit.bunkerName,
                "bunkerNumber": this.dlgEdit.bunkerNumber,
                "position": this.dlgEdit.position,
                "remark": this.dlgEdit.remark,
                "status": this.dlgEdit.status
              }
            })
            .then(res => {
              this.modifyLoading = false;

              if(!res.success){
                this.$Message.error(res.msg);
                return;
              }
              
              this.$Message.success("新增成功！");
              this.getCoalBunkersList();
              this.dlgEdit.visible = false;
            })
            .catch(err => {
              this.modifyLoading = false;
              this.$Message.error("新增出现未知错误！");
            });
        }
      },
      getCoalBunkersList(){
        this.loading = true;
        this.$commonService
          .post("/basedata/getCoalBunkersList", {
            dto: {
              "startTime": this.startTime,
              "endTime": this.endTime,
              "keywords": this.keywords,
              "currentPage": this.currentPage,
              "pageSize": this.pageSize
            }
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            res.data.map(item=>{
              switch(item.status) {
                case 1: 
                  item.statusStr = "启用中"
                  break;
                case 2: 
                  item.statusStr = "禁用中"
                  break;
                case 3: 
                  item.statusStr = "草稿"
                  break;
              }
            })

            this.rows = res.data;
            this.totalCount = res.total;

          })
          .catch(err => {
            this.loading = false;
            this.$Message.error("查询用户出现未知错误！");
          });
      }
    },
    mounted(){
      this.getCoalBunkersList();
    }
  }
</script>