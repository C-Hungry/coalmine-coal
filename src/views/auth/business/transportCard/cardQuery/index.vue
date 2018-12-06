<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm placement="bottom-start" placeholder="发卡时间" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <!-- <Select v-model="cardType" filterable clearable style="width:200px;margin-top:5px;" placeholder="卡类型">
      <Option v-for="(item, index) in cardTypeList" :key="index" :value="index+1">{{item}}</Option>
    </Select> -->
    <Select v-model="truckUseType" filterable clearable style="width:200px;margin-top:5px;" placeholder="车辆使用类型">
      <Option :value="0">外部车辆</Option>
      <Option :value="1">内部车辆</Option>
    </Select>
    <Select v-model="cardState" filterable clearable style="width:200px;margin-top:5px;" placeholder="卡状态">
      <Option v-for="(item, index) in cardStateList" :key="index" :value="index+1">{{item}}</Option>
    </Select>
    <Input placeholder="卡号" v-model="cardNo" clearable style="width: 200px;margin-top:5px;" />
    <Input placeholder="车牌号" v-model="truckNo" clearable style="width: 200px;margin-top:5px;" />
    <Button v-auth="'transportCard.cardQuery.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
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
  </div>
</template>

<script>
  export default {
    data() {
      return {
        dlgVisible: false,
        dlgTitle: "发卡",
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        cardNo: "",
        truckNo: "",
        cardType: null,
        truckUseType: -1,
        cardState: "",
        startDate: "",
        endDate: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        cardTypeList: ["运输卡","出入卡"],
        cardStateList: ["初始","使用","禁用","报废"],
        rows: [], 
        columns: [
          {
            title: "卡号",
            key: "cardNo",
            fixed: "left",
            minWidth: 120
          },
          {
            title: "卡类型",
            key: "cardType",
            minWidth: 120,
            render: (h, params) => {
              return h("span", this.cardTypeList[params.row.cardType-1]);
            }
          },
          {
            title: "使用状态",
            key: "cardState",
            minWidth: 120,
            render: (h, params) => {
              return h("span", this.cardStateList[params.row.cardState-1]);
            }
          },
          {
            title: "车牌号",
            key: "truckNo",
            minWidth: 120
          },
          {
            title: "操作人",
            key: "creatorUserName",
            minWidth: 120
          },
          {
            title: "操作时间",
            key: "creationTime",
            minWidth: 160
          },
          {
            title: "备注",
            key: "memo",
            minWidth: 160
          }
        ]
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getCardList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getCardList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getCardList();
      },
      // 日期组件
      onDatePickerChange(date) {
        this.startDate = date[0];
        this.endDate = date[1];
      },
      // 卡查询
      getCardList(){
        this.loading = true;
        this.$commonService
          .post("/card/getTransportCardList", {
            dto: {
              "cardNo": this.cardNo,
              "truckUseType": this.truckUseType >=0 ? this.truckUseType : -1,
              "truckNo": this.truckNo,
              "cardState": this.cardState || -1,
              "currentPage": this.currentPage,
              "pageSize": this.pageSize,
              "endTime": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
              "startTime": this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00")
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

          })
          .catch(err => {
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      }
    },
    mounted(){
      this.getCardList();
    }
  }
</script>