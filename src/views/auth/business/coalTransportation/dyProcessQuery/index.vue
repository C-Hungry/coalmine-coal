<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm placement="bottom-start" placeholder="计划运输日期" style="width: 200px;vertical-align: middle;margin-top: 5px;"></DatePicker>
    <Select style="width: 200px;margin-top: 5px;" v-model="coalType" filterable clearable placeholder="煤种">
      <Option v-for="(item, index) in coalTypeList" :key="index" :value="item.id">{{item.coalName + "（" + item.coalTypeName + "）"}}</Option>
    </Select>
    <Select v-model="sendTruckStatus" filterable clearable placeholder="派车状态" style="width: 200px;margin-top:5px;">
      <Option v-for="(value, key) in sendTruckStatusList" :key="key" :value="key">{{value}}</Option>
    </Select>
    <Select v-model="yxStatus" filterable clearable placeholder="运销状态" style="width: 200px;margin-top:5px;">
      <Option v-for="(value, key) in yxStateList" :key="key" :value="key">{{value}}</Option>
    </Select>
    <Input placeholder="车牌号" v-model="truckNo" clearable style="width: 200px;margin-top:5px;" />
    <Button v-auth="'statement.coalPlatTransport.query'" type="primary" icon="ios-search" @click="onSearch" :loading="loading" style="margin-top:5px;">查询</Button>
    <a href="#" id="exportExcel" style="display:none;"></a>
    <br><br> 
    <Table 
      border 
      :columns="columns" 
      :data="rows" 
      :loading="loading">
    </Table>
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
        sendTruckStatus: -1,
        yxStatus: -1,
        startDate: "",
        endDate: "",
        truckNo: "",
        currentPage: 1,
        pageSize: 10,
        coalName: "",
        coalType: -1,
        coalTypeList: [],
        totalCount: 0,
        rows: [],
        sendTruckStatusList: {
          1:"已派车",
          2:"运输中",
          3:"已完成",
          4:"取消派车"
        },
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
            key: "truckNo",
            fixed: "left",
            minWidth: 95
          },
          {
            title: "煤种",
            key: "coalName",
            minWidth: 95
          },
          {
            title: "计划运输日期",
            key: "transportDate",
            minWidth: 110,
            render: (h, params) => {
              return h("span", this.$utils.formateDate(params.row.transportDate, 'yyyy/MM/dd'));
            }
          },
          {
            title: "序号",
            key: "transportSequence",
            minWidth: 65
          },
          {
            title: "派单状态",
            key: "sendTruckStatus",
            minWidth: 90
          },
          {
            title: "运销状态",
            key: "yxStatus",
            minWidth: 90
          },
          {
            title: "装煤",
            align: 'center',
            children: [
              {
                title: "始发站",
                key: "departureStation",
                minWidth: 140
              },
              {
                title: "皮重(吨)",
                key: "loadingPz",
                minWidth: 85,
                render: (h, params) => {
                  return h("span", this.$utils.formatNum(params.row.loadingPz));
                }
              },
              {
                title: "毛重(吨)",
                key: "loadingMz",
                minWidth: 85,
                render: (h, params) => {
                  return h("span", this.$utils.formatNum(params.row.loadingMz));
                }
              },
              {
                title: "净重(吨)",
                key: "loadingJz",
                minWidth: 85,
                render: (h, params) => {
                  return h("span", this.$utils.formatNum(params.row.loadingJz));
                }
              },
              {
                title: "除皮时间",
                key: "loadingPzTime",
                minWidth: 160
              },
              {
                title: "称重时间",
                key: "loadingMzTime",
                minWidth: 160
              },
            ]
          },
          {
            title: "卸煤",
            align: 'center',
            children: [
              {
                title: "终点站",
                key: "terminalStation",
                minWidth: 140
              },
              {
                title: "毛重(吨)",
                key: "unloadMz",
                minWidth: 85,
                render: (h, params) => {
                  return h("span", this.$utils.formatNum(params.row.unloadMz));
                }
              },
              {
                title: "皮重(吨)",
                key: "unloadPz",
                minWidth: 85,
                render: (h, params) => {
                  return h("span", this.$utils.formatNum(params.row.unloadPz));
                }
              },
              {
                title: "净重(吨)",
                key: "unloadJz",
                minWidth: 85,
                render: (h, params) => {
                  return h("span", this.$utils.formatNum(params.row.unloadJz));
                }
              },
              {
                title: "称重时间",
                key: "unloadMzTime",
                minWidth: 160
              },
              {
                title: "除皮时间",
                key: "unloadPzTime",
                minWidth: 160
              }
            ]
          }
        ]
      };
    },
    mounted(){
      this.getCoalTypeList();
      this.getList();
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getList();
      },
      // 日期组件
      onDatePickerChange(date) {
        this.startDate = date[0];
        this.endDate = date[1];
      },
      // 获取煤台调运明细表
      getList(){
        this.loading = true;
        if (this.coalType) {
          for (let i = 0; i <this.coalTypeList.length; i++) {
            if (this.coalTypeList[i].id == this.coalType) {
              this.coalName = this.coalTypeList[i].coalName;
              break;
            }
          }
        } else {
          this.coalName = "";
        }
        
        this.$commonService
          .post("/transportProcess/getTransportationList", {
            dto: {
              "coalName": this.coalName,
              "currentPage": this.currentPage,
              "pageSize": this.pageSize,
              "endTime": this.$utils.formateDate(this.endDate, "yyyy/MM/dd 23:59:59"),
              "startTime": this.$utils.formateDate(this.startDate, "yyyy/MM/dd 00:00:00"),
              "sendTruckStatus": this.sendTruckStatus || -1,
              "truckNo": this.truckNo,
              "yxStatus": this.yxStatus || -1
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
  }
</script>