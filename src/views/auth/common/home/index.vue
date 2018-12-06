<style scoped lang="less">
  .homepage {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    text-align: center;
    &-approve {
      text-align: left;
      margin-top: 30px;
      // padding-left: 50px;
      &-item {
        box-shadow: 0 0 5px #ccc;
        background-color: #ccc;
        height: 40px;
        line-height: 40px;
        text-align: center;
        font-size: 14px;
        padding: 0 12px;
        margin: 0 12px;
        min-width: 100px;
        display: inline-block;
        cursor: pointer;
        color: #ffffff;
        span {
          color: red;
          font-size: 24px;
          font-weight: border;
        }
      }
      &-item:hover {
        box-shadow: 0 0 10px #999;
      }
    }
    &-progress {
      width: 100%;
    }
    &-chart {
      display: flex;
      &-item {
        flex: 1;
        height: 380px;
        margin: 0 16px;
        box-shadow: 0 0 5px #ccc;
        padding: 12px;
        box-sizing: border-box;
      }
    }
  }
</style>

<template>
  <div class="homepage">
    <!-- <Spin fix></Spin> -->
    <div class="homepage-approve">
      <div v-auth="'coalTransfer.orderApproval.approve'" @click="$router.push('/auth/transferOrderApproval?spState=1')" class="homepage-approve-item" style="background-color: #4bcc61">调拨单待审批 <span>{{spData.dbOrderApprovalNum || 0}}</span> 个</div>
      <div v-auth="'transportProcess.transforbidApproval.approve'" @click="$router.push('/auth/transforbidApproval?spState=1')" class="homepage-approve-item" style="background-color: #5BB9ED">运销终止待审批 <span>{{spData.yxForbidApprovalNum || 0}}</span> 个</div>
      <div v-auth="'coalTransportation.transPlanApproval.approve'" @click="$router.push('/auth/transPlanApproval?spState=1')" class="homepage-approve-item" style="background-color: #ffc24d">煤炭调运待审批 <span>{{spData.coalTransportedApprovalNum || 0}}</span> 个</div>
    </div>
    <div class="homepage-progress">
      <transportProgess></transportProgess>
    </div>
    <div class="homepage-chart">
      <div class="homepage-chart-item">
        <coalTypeSalesChart></coalTypeSalesChart>
      </div>
      <div class="homepage-chart-item">
        <completedDispatch></completedDispatch>
      </div>
      <div class="homepage-chart-item">
        <transportChart></transportChart>
      </div>
    </div>
  </div>
</template>

<script>
  import transportProgess from "./transportProgess";
  import transportChart from "./transportChart";
  import coalTypeSalesChart from "./coalTypeSalesChart";
  import completedDispatch from "./completedDispatch";
  export default {
    components: {
      transportProgess,
      transportChart,
      coalTypeSalesChart,
      completedDispatch
    },
    data() {
      return {
        spData: {}
      };
    },
    methods: {
      getApprovalStatisticsInfo() {
        this.$commonService
          .get("/statistics/getApprovalStatisticsInfo", {})
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.spData = res.data;
          })
          .catch(err => {
            console.log(err)
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      }
    },
    mounted() {
      this.getApprovalStatisticsInfo();
    }
  }
</script>
