<style lang="less">
  .manualRelease .ivu-table-fixed-header .ivu-checkbox-wrapper {
    display: none;
  }
</style>

<template>
  <div class="business-container manualRelease">
    <Input placeholder="车牌号" v-model="truckNo" clearable style="width: 200px;margin-top:5px;" />
    <Button v-auth="'transportProcess.manualRelease.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button v-auth="'transportProcess.manualRelease.add'" type="warning" icon="plus-round" @click="create()" style="margin-top:5px;">手动出场</Button>
    <br><br>
    <Table border @on-selection-change="onTableSelectChange" @on-select="onTableSelect" :columns="columns" :data="rows" :loading="loading"></Table>
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
  </div>
</template>

<script>
  export default {
    data() {
      return {
        dlgVisible: false,
        dlgTitle: "手动出场",
        loading: false, // 列表
        truckNo: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        vehicleList: [], //车辆列表
        yxStateList: {
          10:"派车",
          20:"排号",
          30:"放行",
          40:"入场",
          50:"除皮",
          60:"装车",
          70:"称重",
          80:"生成榜单",
          90:"出场",
          100:"终止"
        },
        formData:{
          "yxid": null,
          "truckNo": ""
        },
        formDataRules: {
          truckNo: [
            { required: true, message: "车牌号不能为空", trigger: "change" }
          ]
        },
        columns: [
          {
            type: "selection",
            key: "tid",
            fixed: "left",
            width: 53,
          },
          {
            title: "车牌号",
            key: "truckNo",
            fixed: "left",
            width: 95
          },
          {
            title: "车型",
            key: "truckTypeName",
            minWidth: 120
          },
          {
            title: "卡号",
            key: "cardNo",
            minWidth: 120
          },
          {
            title: "毛重时间",
            key: "mzTime",
            minWidth: 120
          },
          {
            title: "运销状态",
            key: "yxStatus",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.yxStateList[params.row.yxStatus]);
            }
          },
          {
            title: "客户名称",
            key: "customerName",
            minWidth: 160
          }
        ]
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getManualReleaseList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getManualReleaseList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getManualReleaseList();
      },
      // 表格选中变化
      onTableSelect(selection, row) {
        if (selection.length) {
          this.rows.map(item=>{
            item._checked = row.yxid == item.yxid;
            return item;
          })
          this.formData.yxid = row.yxid;
          this.formData.truckNo = row.truckNo;
        }
      },
      // 表格选中变化
      onTableSelectChange(selection) {
        if (selection.length == 0) {
          this.formData.yxid = null;
          this.formData.truckNo = "";
        }
      },
      // 新增
      create(){
        if (!this.formData.yxid) {
          this.$Message.warning("请先选择车辆！");
          return;
        }
        this.$Modal.confirm({
          title: '提示',
          content:  `<p>确定要对车牌号为<span style="color: red;font-size: 16px;"> ${this.formData.truckNo} </span>的车辆进行
            <span style="color: red;font-size: 16px;"> 手动出场 </span>操作吗？`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/assignTruck/outFactory", {
                yxId: this.formData.yxid
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success("手动出场成功！");
                this.getManualReleaseList();
              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }

        });
      },
      // 获取派车单列表
      getManualReleaseList(){
        this.loading = true;
        this.$commonService
          .post("/assignTruck/outFactoryTruck", {
            dto: {
              truckNo: this.truckNo,
              currentPage: this.currentPage,
              pageSize: this.pageSize,
              yxType: 2,
              yxStatus: 80
            }
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            res.data.map(item=>{
              item._checked = false;
              return item;
            });
            this.rows = res.data;
            this.totalCount = res.total;
          })
          .catch(err => {
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
    },
    mounted(){
      this.getManualReleaseList();
    }
  }
</script>