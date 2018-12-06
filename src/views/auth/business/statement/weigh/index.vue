<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker :value="datePickerValue" type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm  placement="bottom-start" placeholder="起止日期" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <!-- <Select v-model="bunkerId" clearable placeholder="请选择发煤单位" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, key) in coalBunkerList" :key="key" :value="item.id">{{item.bname}}</Option>
    </Select> -->
    <Select v-model="coalId" filterable clearable placeholder="煤种" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, index) in coalTypeList" :key="index" :value="item.id">{{item.coalName + '（' + item.coalTypeName +'）'}}</Option>
    </Select>
    <Input v-model="customerName" placeholder="收货单位" clearable style="width: 200px;margin-top:5px;" />
    <Input v-model="sellerName" placeholder="发货单位" clearable style="width: 200px;margin-top:5px;" />    
    <Input v-model="truckNo" placeholder="车牌号" clearable style="width: 200px;margin-top:5px;" />
    <Button v-auth="'statement.weigh.query'" type="primary" icon="ios-search" @click="onSearch" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button v-auth="'statement.weigh.export'" type="warning" icon="share" @click="exportExcel" :loading="exportLoading" style="margin-top:5px;">{{ exportText }}</Button>
    <a href="#" id="exportExcel" style="display:none;"></a>
    <br><br> 
    <Table 
      border 
      :row-class-name="rowClassName"
      :columns="columns" 
      :data="rows" 
      :loading="loading"
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
  </div>
</template>

<script>
  export default {
    data() {
      return {
        loading: false, // 列表
        exportLoading: false,
        exportText: "导出报表",
        datePickerValue: [this.$utils.formateDate(new Date(), "yyyy/MM/dd"), this.$utils.formateDate(new Date(), "yyyy/MM/dd")],
        startDate: this.$utils.formateDate(new Date(), "yyyy/MM/dd"),
        endDate: this.$utils.formateDate(new Date(), "yyyy/MM/dd"),
        // bunkerId: null,
        sellerName: "",
        // coalBunkerList: [],
        customerName: "",
        coalId: null,
        coalName: "",
        coalTypeList: [],
        truckNo: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        columns: [
          {
            title: "煤种",
            key: "coalName",
            fixed: "left",
            minWidth: 95
          },
          {
            title: "收货单位",
            key: "customerName",
            minWidth: 160
          },
          {
            title: "发煤单位",
            key: "sellerName",
            minWidth: 100
          },
          {
            title: "运销类型",
            key: "yxType",
            minWidth: 90
          },
          {
            title: "车牌号",
            key: "truckNo",
            minWidth: 95
          },
          {
            title: "车型",
            key: "truckType",
            minWidth: 95
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
            title: "皮重（吨）",
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
            title: "称重时间",
            key: "mzTime",
            minWidth: 150
          }
        ]
      };
    },
    mounted(){
      // this.getCoalBunkersList();
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
      // 表格合计行样式
      rowClassName (row, index) {
        return index == this.rows.length -1 ? 'zk-table-summation-row' : '';
      },
      // 获取仓场信息
      // getCoalBunkersList(){
      //   this.$commonService
      //     .get("/bunker/getBunkerList", {
      //       "isvalid": 1,
      //       "keywords": "",
      //       "currentPage": 1,
      //       "pageSize": 999
      //     })
      //     .then(res => {
      //       if(!res.success){
      //         this.$Message.error(res.msg);
      //         return;
      //       }
      //       this.coalBunkerList = res.data;
      //     })
      //     .catch(err => {
      //       this.loading = false;
      //       this.$Message.error("查询仓场列表出现未知错误！");
      //     });
      // },
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
      // 获取过磅明细列表
      getList(){
        this.loading = true;
        // this.coalName = 
        let coalArr = this.coalTypeList.filter(item => item.id == this.coalId);
        if(coalArr.length) {
          this.coalName = coalArr[0].coalName;
        }
        this.$commonService
          .post("/salesReport/weighReport", {
            dto: {
              "currentPage": this.currentPage,
              "pageSize": this.pageSize,
              "endTime": this.$utils.formateDate(this.endDate, "yyyy/MM/dd 23:59:59"),
              "startTime": this.$utils.formateDate(this.startDate, "yyyy/MM/dd 00:00:00"),
              "customerName": this.customerName,
              "sellerName": this.sellerName,
              "truckNo": this.truckNo,
              "coalName": this.coalName
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
            if (res.data.length) {
              let item = Object.assign({}, res.data[0]);
              item.coalName = '合计';
              item.yxType = "";
              item.customerName = "";
              item.sellerName = "";
              item.truckNo = "";
              item.truckType = "";
              item.mzTime = "";
              item.jz = item.jzTotal;
              item.mz = item.mzTotal;
              item.pz = item.pzTotal;
              this.rows.push(item);
            }
          })
          .catch(err => {
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 导出报表
      exportExcel() {
        this.exportText = "导出中...";
        this.exportLoading = true;
        this.$commonService
          .post("/salesReport/weighReport", {
            dto: {
              "currentPage": this.currentPage,
              "pageSize": 0,
              "endTime": this.$utils.formateDate(this.endDate, "yyyy/MM/dd 23:59:59"),
              "startTime": this.$utils.formateDate(this.startDate, "yyyy/MM/dd 00:00:00"),
              "customer_name": this.customerName,
              "sellerName": this.sellerName,
              "truckNo": this.truckNo,
              "coalName": this.coalName
            }
          })
          .then(res => {
            this.exportText = "导出报表";
            this.exportLoading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            if(!res.data.length){
              this.$Message.warning('暂无数据，无法导出报表。');
              return;
            }
            this.formatExcelTemp(res.data);
          })
          .catch(err => {
            console.log(err)
            this.exportText = "导出报表";
            this.exportLoading = false;
            err.msg && this.$Message.error(err.msg);
          });

      },
      base64(s) {
        return window.btoa(unescape(encodeURIComponent(s)))
      },
      format(s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; })
      },
      formatExcelTemp(data) {
        
        let template = `
          <html 
            xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <!--[if gte mso 9]>
              <xml>
                <x:ExcelWorkbook>
                  <x:ExcelWorksheets>
                    <x:ExcelWorksheet>
                      <x:Name></x:Name>
                      <x:WorksheetOptions>
                        <x:Selected></x:Selected>
                      </x:WorksheetOptions>
                    </x:ExcelWorksheet>
                  </x:ExcelWorksheets>
                </x:ExcelWorkbook>
              </xml>
              <![endif]-->
              <style type="text/css">
                .zk-table tr {
                  text-align: center;
                  vertical-align: middle;
                }
                .zk-table th,
                .zk-table td {
                  border-left: 0.5pt solid #000;
                  border-bottom: 0.5pt solid #000;
                  text-align: center;
                  font-size: 10pt;
                  height: 26px;
                  width: 100px;
                }
                .zk-table td.number {
                  width: 60px;
                }
                .zk-table td.unit {
                  width: 180px;
                }
                .zk-table td.coal {
                  width: 120px;
                }
                .zk-table td.time {
                  width: 160px;
                }
                .zk-table .header th {
                  font-size: 11pt;
                  background-color: #92CDDC;
                }
                .zk-table tr td.noleftborder {
                  border-left: none;
                }
                .zk-table tr th.rightborder,
                .zk-table tr td.rightborder {
                  width: 160px;
                  border-right: 0.5pt solid #000;
                }
              </style>
            </head>
          <body>
            <div>
              <table class="zk-table" cellspacing="0" cellpadding="0" border="0">
                <colgroup>
                  <col class="td" />
                  <col class="td" />
                  <col class="td" />
                  <col class="td" />
                  <col class="td" />
                  <col class="td" />
                  <col class="td" />
                  <col class="td" />
                  <col class="td" />
                  <col class="td" />
                  <col class="td" />
                </colgroup>
                <tr style="height: 40px">
                  <th style="font-size: 16pt; font-family: 宋体; border: none;" colspan="11">
                    陕西柴家沟煤矿过磅明细表
                  </th>
                </tr>
                <tr>
                  <td colspan="8" style="text-align: left;border-left: none;">查询时间: 
                  ${ this.startDate ? this.$utils.formateDate(this.startDate, "yyyy-MM-dd") + ' 至 ' + this.$utils.formateDate(this.endDate, "yyyy-MM-dd") : '全部'}
                  </td>
                  <td colspan="3" style="text-align: left;border-left: none;">单位：吨</td>
                </tr>
                <tr class="header">
                  <th>序号</th>
                  <th>煤种</th>
                  <th>收货单位</th>
                  <th>发煤单位</th>
                  <th>运销类型</th>
                  <th>车牌号</th>
                  <th>车型</th>
                  <th>毛重</th>
                  <th>皮重</th>
                  <th>净重</th>
                  <th class="rightborder">称重时间</th>
                </tr>
                ${data.map((item, index)=> `
                  <tr>
                    <td class="number">${index + 1}</td>
                    <td class="coal">${item.coalName || ''}</td>
                    <td class="unit">${item.customerName || ''}</td>
                    <td class="unit">${item.sellerName || ''}</td>
                    <td>${item.yxType || ''}</td>
                    <td>${item.truckNo || ''}</td>
                    <td>${item.truckType || ''}</td>
                    <td>${this.$utils.formatNum(item.mz) || ''}</td>
                    <td>${this.$utils.formatNum(item.pz) || ''}</td>
                    <td>${this.$utils.formatNum(item.jz) || ''}</td>
                    <td class="rightborder">${item.mzTime || ''}</td>
                  </tr>
                `).join('')}
                <tr>
                  <th colspan="7" style="color: red;">合计: </th>
                  <th style="color: red;">${this.$utils.formatNum(data[0].mzTotal) || ''}</th>
                  <th style="color: red;">${this.$utils.formatNum(data[0].pzTotal) || ''}</th>
                  <th style="color: red;">${this.$utils.formatNum(data[0].jzTotal) || ''}</th>
                  <th style="color: red;" class="rightborder"></th>
                </tr>
                <tr>
                  <td colspan="6" style="text-align: left;border: none;">制表人: ${this.$storage.getUserInfo().userName || ''}</td>
                  <td colspan="5" style="text-align: left;border: none;">制表时间：${this.$utils.formateDate(new Date(), 'yyyy-MM-dd HH:mm:ss') || ''}</td>
                </tr>
              </table>
            </div>
          </body>
        </html>`

        let uri = "data:application/vnd.ms-excel;base64,";
        let ctx = { worksheet: 'Worksheet', table: "" };
        document.getElementById("exportExcel").href = uri + this.base64(this.format(template, ctx));
        document.getElementById("exportExcel").download = '过磅明细表.xls';
        document.getElementById("exportExcel").click();
      }
    },
  }
</script>