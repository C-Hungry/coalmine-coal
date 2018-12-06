<style>
  
</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm  placement="bottom-start" placeholder="称重起止日期" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <Select v-model="printState" filterable clearable placeholder="磅单状态" style="width: 200px;margin-top:5px;" >
      <Option :value="0">未打</Option>
      <Option :value="1">打印</Option>
      <Option :value="2">补打</Option>
    </Select>
    <Select v-model="yxType" filterable clearable placeholder="运销类型" style="width: 200px;margin-top:5px;" >
      <Option :value="1">销售</Option>
      <Option :value="2">调运</Option>
    </Select>
    <Input v-model="customerName" placeholder="收货单位" clearable style="width: 200px;margin-top:5px;" />
    <Input v-model="truckNo" placeholder="车牌号" clearable style="width: 200px;margin-top:5px;" />
    <Button v-auth="'print.weightBill.query'" type="primary" icon="ios-search" @click="onSearch" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button v-auth="'print.weightBill.print'" type="warning" icon="ios-printer-outline" @click="print" style="margin-top:5px;">{{printText}}</Button>
    <br><br> 
    <Table 
      border
      :columns="columns" 
      :data="rows" 
      :loading="loading"
      @on-selection-change="onTableSelectChange"
      ></Table>
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
    <vue-easy-print :tableShow="false" ref="easyPrint">
      <template slot-scope="func">
        <div v-for="(item,index) in currentRowData" :key="index" style="width: 8.4in;height: 4.7in;box-sizing:border-box;padding: 0.4in 0.4in;">
          <div style="font-size: 20px;font-weight: 600;letter-spacing: 2px;text-align: center;width: 4.3in;margin: 0 auto;border-bottom: 4px double #333;">陕西集化柴家沟矿业有限公司司磅单</div>
          <div style="width: 6.3in;margin: 0.1in auto;font-size: 14px;">
            <div style="width: 50%;display: inline-block;">司磅时间：{{$utils.formateDate(item.mzTime, 'yyyy-MM-dd HH:mm:ss')}}</div>
            <div style="width: 49%;display: inline-block;text-align: right;">流水号：{{item.billNum}}</div>
          </div>
          <table style="width: 6.3in;line-height: 0.4in;font-size: 15px;margin: 0 auto;text-align: center;border-top: 1px solid #333;border-left: 1px solid #333;" cellpadding="10" cellspacing="0">
            <tr>
              <td style="font-weight: 600;border-bottom: 1px solid #333;border-right: 1px solid #333;">购煤单位</td>
              <td style="border-bottom: 1px solid #333;border-right: 1px solid #333;" colspan="3">{{item.customerName}}</td>
              <td style="font-weight: 600;border-bottom: 1px solid #333;border-right: 1px solid #333;">发煤单位</td>
              <td style="border-bottom: 1px solid #333;border-right: 1px solid #333;">{{item.sellerName}}</td>
            </tr>
            <tr>
              <td style="font-weight: 600;border-bottom: 1px solid #333;border-right: 1px solid #333;">车牌号</td>
              <td style="border-bottom: 1px solid #333;border-right: 1px solid #333;">{{item.truckNo}}</td>
              <td style="font-weight: 600;border-bottom: 1px solid #333;border-right: 1px solid #333;">&#x3000;颜色&#x3000;</td>
              <td style="border-bottom: 1px solid #333;border-right: 1px solid #333;">{{item.trucColour}}</td>
              <td style="font-weight: 600;border-bottom: 1px solid #333;border-right: 1px solid #333;">车型</td>
              <td style="border-bottom: 1px solid #333;border-right: 1px solid #333;">{{item.trucType}}</td>
            </tr>
            <tr>
              <td style="font-weight: 600;border-bottom: 1px solid #333;border-right: 1px solid #333;">煤种</td>
              <td style="border-bottom: 1px solid #333;border-right: 1px solid #333;">{{item.coalName}}</td>
              <td style="font-weight: 600;border-bottom: 1px solid #333;border-right: 1px solid #333;">&#x3000;类型&#x3000;</td>
              <td style="border-bottom: 1px solid #333;border-right: 1px solid #333;">{{item.useType == 1 ? '盘煤车辆' : '社会车辆'}}</td>
              <td style="font-weight: 600;border-bottom: 1px solid #333;border-right: 1px solid #333;">卡类型</td>
              <td style="border-bottom: 1px solid #333;border-right: 1px solid #333;">{{item.cardType}}</td>
            </tr>
            <tr>
              <td style="font-weight: 600;border-bottom: 1px solid #333;border-right: 1px solid #333;">皮重</td>
              <td style="border-bottom: 1px solid #333;border-right: 1px solid #333;">{{item.pz >= 0 ? $utils.formatNum(item.pz) + '吨' : ''}}</td>
              <td style="font-weight: 600;border-bottom: 1px solid #333;border-right: 1px solid #333;">&#x3000;毛重&#x3000;</td>
              <td style="border-bottom: 1px solid #333;border-right: 1px solid #333;">{{item.mz >= 0 ? $utils.formatNum(item.mz) + '吨' : ''}}</td>
              <td style="font-weight: 600;border-bottom: 1px solid #333;border-right: 1px solid #333;">净重</td>
              <td style="border-bottom: 1px solid #333;border-right: 1px solid #333;">{{item.jz >= 0 ? $utils.formatNum(item.jz) + '吨' : ''}}</td>
            </tr>
          </table>
          <div style="width: 6.3in;margin: 0.1in auto;font-size: 14px;">
            <div style="width: 33%;display: inline-block;">空车司磅员：{{item.pzOperator}}</div>
            <div style="width: 32%;display: inline-block;">重车司磅员：{{item.mzOperator}}</div>
            <div style="width: 31%;display: inline-block;">提货人：</div>
          </div>
          <DIV STYLE="page-break-after:always"></DIV>
        </div>
      </template>
    </vue-easy-print>
  </div>
</template>

<script>
  import vueEasyPrint from "vue-easy-print/dist/vue-easy-print.js";
  export default {
    components: {
      vueEasyPrint
    },
    data() {
      return {
        loading: false, // 列表
        printText: '打印',
        startDate: "",
        endDate: "",
        printState: 0,
        yxType: -1,
        customerName: "",
        truckNo: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        currentRowData: [],
        columns: [
          {
            type: "selection",
            key: "tid",
            fixed: "left",
            width: 53,
          },
          {
            title: "磅单号",
            key: "billNum",
            fixed: "left",
            minWidth: 140
          },
          {
            title: "煤种",
            key: "coalName",
            minWidth: 100
          },
          {
            title: "收货单位",
            key: "customerName",
            minWidth: 160
          },
          {
            title: "发煤单位",
            key: "sellerName",
            minWidth: 160
          },
          {
            title: "运销类型",
            key: "yxType",
            minWidth: 95
          },
          {
            title: "车牌号",
            key: "truckNo",
            minWidth: 95
          },
          {
            title: "车型",
            key: "trucType",
            minWidth: 95
          },
          {
            title: "颜色",
            key: "trucColour",
            minWidth: 90
          },
          {
            title: "卡类型",
            key: "cardType",
            minWidth: 95
          },
          {
            title: "皮重（吨）",
            key: "mz",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.mz));
            }
          },
          {
            title: "毛重（吨）",
            key: "pz",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.pz));
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
            title: "司磅时间",
            key: "mzTime",
            minWidth: 150
          },
          {
            title: "空车司磅员",
            key: "pzOperator",
            minWidth: 100
          },
          {
            title: "重车司磅员",
            key: "mzOperator",
            minWidth: 100
          }
        ]
      };
    },
    mounted(){
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
      // 多选变化
      onTableSelectChange(selection) {
        this.currentRowData = selection;
      },
      // 获取过磅明细列表
      getList(){
        this.loading = true;
        this.$commonService
          .post("/print/printBillList", {
            dto: {
              "currentPage": this.currentPage,
              "pageSize": this.pageSize,
              "endTime": this.$utils.formateDate(this.endDate, "yyyy/MM/dd 23:59:59"),
              "startTime": this.$utils.formateDate(this.startDate, "yyyy/MM/dd 00:00:00"),
              "billStatus": this.printState >= 0 ? this.printState : -1,
              "yxType": this.yxType || -1,
              "truckNo": this.truckNo,
              "customerName": this.customerName
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
      // 导出报表
      print() {
        if (this.currentRowData.length == 0) {
          this.$Message.warning("请选择需要打印的磅单！");
          return;
        }
        this.$Modal.confirm({
          title: '提示',
          content:  `<p style="font-size: 14px;">确定<span style="color: red;font-size: 16px;"> 打印 </span>选中的磅单吗？点击确定后，所选磅单的打印状态将发生改变。</p>`,
          loading: true,
          onOk: () => {
            this.$Modal.remove();
            this.$refs.easyPrint.print();

            let wbids = [];
            this.currentRowData.forEach(item => {
              wbids.push(item.wbid)
            });

            this.$commonService
            .post("/print/printBill", {
              dto: {
                "wbids": wbids
              }
            })
            .then(res => {
              if(!res.success){
                this.$Message.error(res.msg);
                return;
              }
              this.getList();
            })
            .catch(err => {
              err.msg && this.$Message.error(err.msg);
            });
          }
        });
        
      }
    }
  }
</script>