<style lang="less" scoped>
  .progress {
    margin: 60px auto 75px auto;
    &-item {
      font-size: 15px;
      display: inline-block;
      min-width: 90px;
      cursor: pointer;
      &-top {
        font-size: 40px;
        margin-bottom: -16px;
        &-sub {
          font-size: 14px;
        }
      }
      &-bottom {
        color: #ffffff;
        background-size: 100% 100%;
        background-image: url(../../../../assets/truck.png);
        background-repeat: no-repeat;
        text-align: left;
        height: 100px;
        line-height: 80px;
        padding-left: 20px; 
      }
    }
    &-line {
      display: inline-block;
      width: 36px;
      height: 0;
      border: 1px dashed red;
      vertical-align: middle;
    }
    &-arrow {
      width: 18px;
      vertical-align: middle;
      margin-left: -6px;
    }
  }
</style>

<template>
  <div class="progress">
    <div class="progress-item" @click="openDetail(10, '已派车')">
      <div class="progress-item-top">
        <span style="color: #FF0000;">{{data.dispatchingTruckNum >= 0 ? data.dispatchingTruckNum : ''}}</span>
        <span class="progress-item-top-sub">辆</span>
      </div>
      <div class="progress-item-bottom">派车</div>
    </div>
    <div class="progress-line"></div>
    <img class="progress-arrow" src="../../../../assets/arrow-right.png" alt="">
    <div class="progress-item" @click="openDetail(40, '已入场')">
      <div class="progress-item-top">
        <span style="color: #2D8CF0;">{{data.enteredTruckNum >= 0 ? data.enteredTruckNum : ''}}</span>
        <span class="progress-item-top-sub">辆</span>
      </div>
      <div class="progress-item-bottom">入场</div>
    </div>
    <div class="progress-line"></div>
    <img class="progress-arrow" src="../../../../assets/arrow-right.png" alt="">
    <div class="progress-item" @click="openDetail(50, '已除皮')">
      <div class="progress-item-top">
        <span style="color: #1AFA29;">{{data.tareTruckNum >= 0 ? data.tareTruckNum : ''}}</span>
        <span class="progress-item-top-sub">辆</span>
      </div>
      <div class="progress-item-bottom">除皮</div>
    </div>
    <div class="progress-line"></div>
    <img class="progress-arrow" src="../../../../assets/arrow-right.png" alt="">
    <div class="progress-item" @click="openDetail(60, '装车')">
      <div class="progress-item-top">
        <span style="color: #FF4574;">{{data.loadingTruckNum >= 0 ? data.loadingTruckNum : ''}}</span>
        <span class="progress-item-top-sub">辆</span>
      </div>
      <div class="progress-item-bottom">装车</div>
    </div>
    <div class="progress-line"></div>
    <img class="progress-arrow" src="../../../../assets/arrow-right.png" alt="">
    <div class="progress-item" @click="openDetail(70, '已称重')">
      <div class="progress-item-top">
        <span style="color: #D81E06;">{{data.weightTruckNum >= 0 ? data.weightTruckNum : ''}}</span>
        <span class="progress-item-top-sub">辆</span>
      </div>
      <div class="progress-item-bottom">称重</div>
    </div>
    <div class="progress-line"></div>
    <img class="progress-arrow" src="../../../../assets/arrow-right.png" alt="">
    <div class="progress-item" @click="openDetail(90, '已出场')">
      <div class="progress-item-top">
        <span style="color: #8A8895;">{{data.outTruckNum >= 0 ? data.outTruckNum : ''}}</span>
        <span class="progress-item-top-sub">辆</span>
      </div>
      <div class="progress-item-bottom">出矿</div>
    </div>
    <!-- 车辆列表弹框 -->
    <Modal id="vehicleYXModal" v-model="visible" width="900" :title="title">
      <Input placeholder="车牌号" v-model="truckNo" clearable style="width: 200px;margin-top:5px;" />
      <Select v-model="coalType" filterable clearable placeholder="煤种" style="width: 200px;margin-top:5px;">
        <Option v-for="(item, key) in coalTypeList" :key="key" :value="item.id">{{item.coalName}}</Option>
      </Select>
      <Button v-auth="'transportProcess.processQuery.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
      <br><br>
      <Table border :columns="columns" :data="rows" :loading="loading"></Table>
      <br>
      <div style="position: relative;">
        <Page 
        size="small" 
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
      <div slot="footer">
        <Button type="primary" @click="visible=false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: {},
      visible: false,
      title: "",
      loading: false, // 列表
      yxState: null,
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
      columns: [],
      pcColumns: [
        {
          title: "车牌号",
          key: "truck_no",
          width: 95
        },
        {
          title: "车型",
          key: "truck_type",
          width: 95
        },
        {
          title: "卡号",
          key: "card_no",
          width: 95
        },
        {
          title: "煤种",
          key: "coal_name",
          width: 90
        },
        {
          title: "派车时间",
          key: "st_time",
          width: 150
        },
        {
          title: "客户",
          key: "customer_name",
          minWidth: 150
        },
        {
          title: "运销状态",
          key: "yx_state",
          width: 95,
          render: (h, params) => {
            return h("span", this.yxStateList[params.row.yx_state]);
          }
        },
      ],
      rcColumns: [
        {
          title: "车牌号",
          key: "truck_no",
          width: 95
        },
        {
          title: "车型",
          key: "truck_type",
          width: 95
        },
        {
          title: "卡号",
          key: "card_no",
          width: 90
        },
        {
          title: "煤种",
          key: "coal_name",
          width: 90
        },
        {
          title: "派车时间",
          key: "st_time",
          width: 150
        },
        {
          title: "入场时间",
          key: "into_time",
          width: 150
        },
        {
          title: "客户",
          key: "customer_name",
          minWidth: 150
        },
        {
          title: "运销状态",
          key: "yx_state",
          width: 95,
          render: (h, params) => {
            return h("span", this.yxStateList[params.row.yx_state]);
          }
        },
      ],
      cpColumns: [
        {
          title: "车牌号",
          fixed: 'left',
          key: "truck_no",
          width: 95
        },
        {
          title: "车型",
          key: "truck_type",
          width: 95
        },
        {
          title: "卡号",
          key: "card_no",
          width: 90
        },
        {
          title: "煤种",
          key: "coal_name",
          width: 90
        },
        {
          title: "皮重(吨)",
          key: "pz",
          width: 90,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.pz));
          }
        },
        {
          title: "派车时间",
          key: "st_time",
          width: 150
        },
        {
          title: "入场时间",
          key: "into_time",
          width: 150
        },
        {
          title: "皮重时间",
          key: "into_time",
          width: 150
        },
        {
          title: "客户",
          key: "customer_name",
          minWidth: 150
        },
        {
          title: "运销状态",
          key: "yx_state",
          width: 95,
          render: (h, params) => {
            return h("span", this.yxStateList[params.row.yx_state]);
          }
        },
      ],
      zcColumns: [
        {
          title: "车牌号",
          fixed: 'left',
          key: "truck_no",
          width: 95
        },
        {
          title: "车型",
          key: "truck_type",
          width: 95
        },
        {
          title: "卡号",
          key: "card_no",
          width: 90
        },
        {
          title: "煤种",
          key: "coal_name",
          width: 90
        },
        {
          title: "皮重(吨)",
          key: "pz",
          width: 90,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.pz));
          }
        },
        {
          title: "派车时间",
          key: "st_time",
          width: 150
        },
        {
          title: "入场时间",
          key: "into_time",
          width: 150
        },
        {
          title: "皮重时间",
          key: "into_time",
          width: 150
        },
        {
          title: "装车开始时间",
          key: "loadStart_time",
          width: 150
        },
        {
          title: "装车结束时间",
          key: "loadEnd_time",
          width: 150
        },
        {
          title: "客户",
          key: "customer_name",
          minWidth: 150
        },
        {
          title: "运销状态",
          key: "yx_state",
          width: 95,
          render: (h, params) => {
            return h("span", this.yxStateList[params.row.yx_state]);
          }
        },
      ],
      czColumns: [
        {
          title: "车牌号",
          fixed: 'left',
          key: "truck_no",
          width: 95
        },
        {
          title: "车型",
          key: "truck_type",
          width: 95
        },
        {
          title: "卡号",
          key: "card_no",
          width: 90
        },
        {
          title: "煤种",
          key: "coal_name",
          width: 90
        },
        {
          title: "皮重(吨)",
          key: "pz",
          width: 90,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.pz));
          }
        },
        {
          title: "毛重(吨)",
          key: "mz",
          width: 90,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.mz));
          }
        },
        {
          title: "净重(吨)",
          key: "jz",
          width: 90,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.jz));
          }
        },
        {
          title: "派车时间",
          key: "st_time",
          width: 150
        },
        {
          title: "入场时间",
          key: "into_time",
          width: 150
        },
        {
          title: "皮重时间",
          key: "pz_time",
          width: 150
        },
        {
          title: "装车开始时间",
          key: "loadStart_time",
          width: 150
        },
        {
          title: "装车结束时间",
          key: "loadEnd_time",
          width: 150
        },
        {
          title: "毛重时间",
          key: "mz_time",
          width: 150
        },
        {
          title: "客户",
          key: "customer_name",
          minWidth: 150
        },
        {
          title: "运销状态",
          key: "yx_state",
          width: 95,
          render: (h, params) => {
            return h("span", this.yxStateList[params.row.yx_state]);
          }
        },
      ],
      ccColumns: [
        {
          title: "车牌号",
          fixed: 'left',
          key: "truck_no",
          width: 95
        },
        {
          title: "车型",
          key: "truck_type",
          width: 95
        },
        {
          title: "卡号",
          key: "card_no",
          width: 90
        },
        {
          title: "煤种",
          key: "coal_name",
          width: 90
        },
        {
          title: "皮重(吨)",
          key: "pz",
          width: 90,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.pz));
          }
        },
        {
          title: "毛重(吨)",
          key: "mz",
          width: 90,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.mz));
          }
        },
        {
          title: "净重(吨)",
          key: "jz",
          width: 90,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.jz));
          }
        },
        {
          title: "派车时间",
          key: "st_time",
          width: 150
        },
        {
          title: "入场时间",
          key: "into_time",
          width: 150
        },
        {
          title: "皮重时间",
          key: "pz_time",
          width: 150
        },
        {
          title: "装车开始时间",
          key: "loadStart_time",
          width: 150
        },
        {
          title: "装车结束时间",
          key: "loadEnd_time",
          width: 150
        },
        {
          title: "毛重时间",
          key: "mz_time",
          width: 150
        },
        {
          title: "出场",
          key: "out_time",
          width: 150
        },
        {
          title: "客户",
          key: "customer_name",
          minWidth: 150
        },
        {
          title: "运销状态",
          key: "yx_state",
          width: 95,
          render: (h, params) => {
            return h("span", this.yxStateList[params.row.yx_state]);
          }
        },
      ],
    }
  },
  methods: {
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
    // 查看详情
    openDetail(state, title) {
      this.title = `${title}车辆列表`;
      this.yxState = state;
      this.visible = true;
      this.rows = [];
      switch (state) {
        case 10: 
          this.columns = [...this.pcColumns];
          break;
        case 40: 
          this.columns = [...this.rcColumns];
          break;
        case 50: 
          this.columns = [...this.cpColumns];
          break;
        case 60: 
          this.columns = [...this.zcColumns];
          break;
        case 70: 
          this.columns = [...this.czColumns];
          break;
        case 90: 
          this.columns = [...this.ccColumns];
          break;
      }
      this.getCoalTypeList();
      this.getTransportStateList();
    },
    // 获取运销车辆列表
    getTransportStateList(){
      this.loading = true;
      this.$commonService
        .post("/autoTransport/selectTruckState", {
          dto: {
            yx_state: this.yxState,
            truck_no: this.truckNo,
            startst_time: this.$utils.formateDate(new Date(), "yyyy-MM-dd 00:00:00"),
            endst_time: this.$utils.formateDate(new Date(), "yyyy-MM-dd 23:59:59"),
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
    // 获取各个运销状态的车辆统计
    getYXStateStatisticsInfo() {
      this.$commonService
        .get("/statistics/getYXStateStatisticsInfo", {})
        .then(res => {
          this.loading = false;
          if(!res.success){
            this.$Message.error(res.msg);
            return;
          }
          this.data = res.data;
        })
        .catch(err => {
          console.log(err)
          this.loading = false;
          err.msg && this.$Message.error(err.msg);
        });
    },
  },
  mounted() {
    this.getYXStateStatisticsInfo();
  }
}
</script>

