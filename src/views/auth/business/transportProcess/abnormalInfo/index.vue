<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <Input placeholder="车牌号" v-model="truckNo" clearable style="width: 200px;margin-top:5px;" />
    <Input placeholder="卡号" v-model="cardNo" clearable style="width: 200px;margin-top:5px;" />
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm placement="bottom-start" placeholder="报警时间" style="width: 200px;vertical-align: middle;margin-top: 5px;"></DatePicker>
    <Select v-model="alarmType" filterable clearable placeholder="报警类型" style="width: 200px;margin-top:5px;">
      <Option v-for="(value, key) in alarmTypeList" :key="key" :value="key">{{value}}</Option>
    </Select>
    <Select v-model="alarmPosition" filterable clearable placeholder="报警位置" style="width: 200px;margin-top:5px;">
      <Option v-for="(value, key) in alarmPositionList" :key="key" :value="key">{{value}}</Option>
    </Select>
    <Button v-auth="'transportProcess.abnormalInfo.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
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
        loading: false, // 列表
        state: -1,
        truckNo: "",
        cardNo: "",
        startTime: "",
        endTime: "",
        cardType: -1,
        alarmType: -1,
        alarmPosition: -1,
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        cardTypeList: {
          1:"运输卡",
          2:"出入卡"
        },
        alarmTypeList: {
          1:"车号异常",
          2:"煤种异常",
          3:"皮重异常",
          4:"毛重异常",
          5:"其它"
        },
        alarmPositionList: {
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
        columns: [
          {
            title: "车牌号",
            key: "truckNo",
            fixed: "left",
            minWidth: 90
          },
          {
            title: "车型",
            key: "truckTypeName",
            minWidth: 90
          },
          {
            title: "卡号",
            key: "cardNo",
            minWidth: 100
          },
          {
            title: "报警类型",
            key: "alarmType",
            minWidth: 85
          },
          {
            title: "报警位置",
            key: "alarmPosition",
            minWidth: 90
          },
          {
            title: "报警内容",
            key: "alarmContent",
            minWidth: 120
          },
          {
            title: "报警时间",
            key: "alarmTime",
            minWidth: 150
          }
        ]
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getAlarmList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getAlarmList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getAlarmList();
      },
      // 日期组件
      onDatePickerChange(date) {
        this.startTime = date[0];
        this.endTime = date[1];
      },
      // 获取异常列表
      getAlarmList(){
        this.loading = true;
        this.$commonService
          .post("/assignTruck/queryAlarmList", {
            dto: {
              state: this.state,
              truckNo: this.truckNo,
              cardNo: this.cardNo,
              startTime: this.$utils.formateDate(this.startTime, "yyyy-MM-dd 00:00:00"),
              endTime: this.$utils.formateDate(this.endTime, "yyyy-MM-dd 23:59:59"),
              cardType: this.cardType || -1,
              alarmType: this.alarmType || -1,
              alarmPosition: this.alarmPosition || -1,
              currentPage: this.currentPage,
              pageSize: this.pageSize,
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
      this.getAlarmList();
    }
  }
</script>