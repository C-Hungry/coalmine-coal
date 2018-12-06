<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <!-- <DatePicker format="yyyy/MM/dd" type="daterange" placeholder="创建时间" style="width: 200px"></DatePicker> -->
    <Input placeholder="关键字（客户名称、税号）" v-model="keywords" clearable style="width: 200px" />
    <Button type="primary" icon="ios-search" @click="onSearch()" :loading="loading">查询</Button>
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
    <!-- 修改或新增 -->
    <Modal v-model="dlgEdit.visible" :title="dlgEdit.title">
      <Form :label-width="80">
        <FormItem label="级别：">
          <Select filterable clearable placeholder="请选择级别">
            <Option v-for="i in 10" :key="i" :value="i + 1">{{i}}</Option>
          </Select>
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
        keywords: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        columns: [
          {
            title: "客户名称",
            key: "bunkerNumber",
            minWidth: 120
          },
          {
            title: "客户级别",
            key: "bunkerName",
            minWidth: 120
          },
          {
            title: "法人",
            key: "position",
            minWidth: 120
          },
          {
            title: "公司电话",
            key: "statusStr",
            minWidth: 120
          },
          {
            title: "联系人",
            key: "statusStr",
            minWidth: 120
          },
          {
            title: "联系电话",
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
            width: 150,
            align: "center",
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
                        this.edit(params.row.id);
                      }
                    }
                  },
                  "详情"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "warning",
                      size: "small"
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.edit(params.row.id);
                      }
                    }
                  },
                  "级别设置"
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
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getCoalBunkersList();
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
            err.msg && this.$Message.error(err.msg);
          });
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
              err.msg && this.$Message.error(err.msg);
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
              err.msg && this.$Message.error(err.msg);
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
            err.msg && this.$Message.error(err.msg);
          });
      }
    },
    mounted(){
      this.getCoalBunkersList();
    }
  }
</script>