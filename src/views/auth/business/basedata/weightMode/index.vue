<style scoped lang="less">
  
</style>

<template>
  <div class="business-container">
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
  </div>
</template>

<script>
  export default {
    data() {
      return {
        loading: false, // 列表
        keywords: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        columns: [
          {
            title: "磅秤名称",
            key: "weighbridgeName",
            minWidth: 120
          },
          {
            title: "当前过磅模式",
            key: "weighbridgeType",
            minWidth: 120,
            render: (h, params) => {
              return h("span", params.row.weighbridgeType == 1 ? "有人值守" : "无人值守");
            }
          },
          {
            title: "安装位置",
            key: "address",
            minWidth: 120
          },
          {
            title: "磅秤标识",
            key: "weighbridgeFlag",
            minWidth: 120
          },
          {
            title: "描述",
            key: "memo",
            minWidth: 120
          }
        ],
        rows: []
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getWeightModeList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getWeightModeList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getWeightModeList();
      },
      // 获取过磅模式列表
      getWeightModeList(){
        this.loading = true;
        this.$commonService
          .get("/coalSite/listWeightScale", {
            currentPage: this.currentPage,
            pageSize: this.pageSize
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
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
      this.getWeightModeList();
    }
  }
</script>