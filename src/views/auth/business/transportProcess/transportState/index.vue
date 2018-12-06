<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm placement="bottom-start" placeholder="派车时间" style="width: 200px;vertical-align: middle;margin-top: 5px;"></DatePicker>
    <Input placeholder="车牌号" v-model="truckNo" clearable style="width: 200px;margin-top:5px;" />
    <Select v-model="coalType" filterable clearable placeholder="煤种" style="width: 200px;margin-top:5px;">
      <Option v-for="(item, key) in coalTypeList" :key="key" :value="item.id">{{item.coalName}}</Option>
    </Select>
    <Select v-model="yxState" filterable clearable placeholder="运销状态" style="width: 200px;margin-top:5px;">
      <Option v-for="(value, key) in yxStateList" :key="key" :value="key">{{value}}</Option>
    </Select>
    <!-- <Select v-model="yxType" filterable clearable placeholder="运销类型" style="width: 200px;margin-top:5px;">
      <Option :value="1">销售</Option>
      <Option :value="2">调运</Option>
    </Select> -->
    <Button v-auth="'transportProcess.processQuery.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
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
        yxState: null,
        // yxType: -1,
        truckNo: "",
        startTime: "",
        endTime: "",
        coalType: null,
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        coalTypeList: [],
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
        columns: [
          {
            title: "车牌号",
            key: "truck_no",
            fixed: "left",
            minWidth: 95
          },
          {
            title: "客户",
            key: "customer_name",
            minWidth: 180
          },
          // {
          //   title: "运销类型",
          //   key: "yx_type",
          //   minWidth: 100,
          //   render: (h, params) => {
          //     return h("span", params.row.yx_type == 1 ? "销售" : params.row.yx_type == 2 ? "调运" : "" );
          //   }
          // },
          {
            title: "运销状态",
            key: "yx_state",
            minWidth: 90,
            render: (h, params) => {
              return h("span", this.yxStateList[params.row.yx_state]);
            }
          },
          {
            title: "煤种",
            key: "coal_name",
            minWidth: 90
          },
          {
            title: "皮重（吨）",
            key: "pz",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.pz));
            }
          },
          {
            title: "毛重（吨）",
            key: "mz",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.mz));
            }
          },
          {
            title: "净重（吨）",
            key: "jz",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.jz));
            }
          },
          {
            title: "入场时间",
            key: "into_time",
            minWidth: 150
          },
          {
            title: "皮重时间",
            key: "pz_time",
            minWidth: 150
          },
          {
            title: "毛重时间",
            key: "mz_time",
            minWidth: 150
          },
          {
            title: "装车时间",
            key: "loadStart_time",
            minWidth: 150
          },
          {
            title: "出场时间",
            key: "out_time",
            minWidth: 150
          }
        ]
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getTransportStateList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getTransportStateList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getTransportStateList();
      },
      // 日期组件
      onDatePickerChange(date) {
        this.startTime = date[0];
        this.endTime = date[1];
      },
      // 获取运销车辆列表
      getTransportStateList(){
        this.loading = true;
        this.$commonService
          .post("/autoTransport/selectTruckState", {
            dto: {
              yx_state: this.yxState ? Number(this.yxState) : null,
              // yx_type: this.yxType ? Number(this.yxType) : -1,
              truck_no: this.truckNo,
              startst_time: this.$utils.formateDate(this.startTime, "yyyy-MM-dd 00:00:00"),
              endst_time: this.$utils.formateDate(this.endTime, "yyyy-MM-dd 23:59:59"),
              coal_id: this.coalType,
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
      },
      // 获取煤种信息
      getCoalTypeList(){
        this.$commonService
          .get("/coalType/getCoalTypeList",{
            isvalid: 1,
            currentPage: 1,
            pageSize: 99999
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.coalTypeList = res.data;
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
    },
    mounted(){
      this.getCoalTypeList();
      this.getTransportStateList();
    }
  }
</script>