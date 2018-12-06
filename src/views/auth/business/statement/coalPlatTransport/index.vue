<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker :value="datePickerValue" type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm  placement="bottom-start" placeholder="起止日期" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <Select v-model="bunkerId" clearable placeholder="发煤单位" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, key) in coalBunkerList" :key="key" :value="item.id">{{item.bname}}</Option>
    </Select>
    <Button v-auth="'statement.coalPlatTransport.query'" type="primary" icon="ios-search" @click="onSearch" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button v-auth="'statement.coalPlatTransport.export'" type="warning" icon="share" @click="exportExcel" :loading="exportLoading" style="margin-top:5px;">{{ exportText }}</Button>
    <a href="#" id="exportExcel" style="display:none;"></a>
    <br><br> 
    <Table 
      border 
      :row-class-name="rowClassName"
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
        exportLoading: false,
        exportText: "导出报表",
        datePickerValue: [this.$utils.formateDate(new Date(), "yyyy/MM/dd"), this.$utils.formateDate(new Date(), "yyyy/MM/dd")],
        startDate: this.$utils.formateDate(new Date(), "yyyy/MM/dd"),
        endDate: this.$utils.formateDate(new Date(), "yyyy/MM/dd"),
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        bunkerId: null,
        coalBunkerList: [],
        columns: [
          {
            title: "车牌号",
            key: "truck_no",
            fixed: "left",
            minWidth: 95
          },
          {
            title: "煤种",
            key: "coal_name",
            minWidth: 95
          },
          {
            title: "装煤",
            align: 'center',
            children: [
              {
                title: "发煤单位",
                key: "seller_name",
                minWidth: 140
              },
              {
                title: "称重时间",
                key: "mz_time",
                minWidth: 160
              },
              {
                title: "净重（吨）",
                key: "zmjz",
                minWidth: 100,
                render: (h, params) => {
                  return h("span", this.$utils.formatNum(params.row.zmjz));
                }
              }
            ]
          },
          {
            title: "卸煤",
            align: 'center',
            children: [
              {
                title: "收煤单位",
                key: "customer_name",
                minWidth: 140
              },
              {
                title: "称重时间",
                key: "unloading_time",
                minWidth: 160
              },
              {
                title: "净重（吨）",
                key: "xmjz",
                minWidth: 100,
                render: (h, params) => {
                  return h("span", this.$utils.formatNum(params.row.xmjz));
                }
              }
            ]
          },
          {
            title: "短吨（公斤）",
            key: "short_ton",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.short_ton));
            }
          }
        ]
      };
    },
    mounted(){
      this.getCoalBunkersList();
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
      getCoalBunkersList(){
        this.$commonService
          .get("/bunker/getBunkerList", {
            "isvalid": 1,
            "keywords": "",
            "currentPage": 1,
            "pageSize": 999
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.coalBunkerList = res.data;
          })
          .catch(err => {
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 获取煤台调运明细表
      getList(){
        this.loading = true;
        this.$commonService
          .post("/report/getCoalPlatformTransportList", {
            dto: {
              "currentPage": this.currentPage,
              "pageSize": this.pageSize,
              "end_date": this.$utils.formateDate(this.endDate, "yyyy/MM/dd 23:59:59"),
              "begin_date": this.$utils.formateDate(this.startDate, "yyyy/MM/dd 00:00:00"),
              "customer_name": this.customerName,
              "bid": this.bunkerId || -1
            }
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            res.data.map(item=>{
              item.short_ton = item.short_ton * 1000;
              return item
            })
            this.rows = res.data;
            this.totalCount = res.total;
            if (res.data.length) {
              let item = Object.assign({}, res.data[0]);
              item.coal_name  = '';
              item.customer_name  = '';
              item.mz_time  = '';
              item.seller_name  = '';
              item.unloading_time  = '';
              item.truck_no  = '合计';
              item.zmjz = item.total_zmjz;
              item.xmjz = item.total_xmjz;
              item.short_ton = item.total_short_ton * 1000;
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
          .post("/report/getCoalPlatformTransportList", {
            dto: {
              "currentPage": this.currentPage,
              "pageSize": 0,
              "end_date": this.$utils.formateDate(this.endDate, "yyyy/MM/dd 23:59:59"),
              "begin_date": this.$utils.formateDate(this.startDate, "yyyy/MM/dd 00:00:00"),
              "customer_name": this.customerName,
              "bid": this.bunkerId || -1
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
                  width: 80px;
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
                </colgroup>
                <tr style="height: 40px">
                  <th style="font-size: 16pt; font-family: 宋体; border: none;" colspan="10">
                    陕西柴家沟煤矿煤台调运明细表
                  </th>
                </tr>
                <tr>
                  <td colspan="7" style="text-align: left;border-left: none;">查询时间: 
                  ${ this.startDate ? this.$utils.formateDate(this.startDate, "yyyy-MM-dd") + ' 至 ' + this.$utils.formateDate(this.endDate, "yyyy-MM-dd") : '全部'}
                  </td>
                  <td colspan="3" style="text-align: left;border-left: none;">单位：吨</td>
                </tr>
                <tr class="header">
                  <th rowspan="2">序号</th>
                  <th rowspan="2">车牌号</th>
                  <th rowspan="2">煤种</th>
                  <th colspan="3">装煤</th>
                  <th colspan="3">卸煤</th>
                  <th rowspan="2" class="rightborder">短吨(公斤)</th>
                </tr>
                <tr class="header">
                  <th>发煤单位</th>
                  <th>称重时间</th>
                  <th>净重（吨）</th>
                  <th>收煤单位</th>
                  <th>称重时间</th>
                  <th>净重（吨）</th>
                </tr>
                ${data.map((item, index)=> `
                  <tr>
                    <td class="number">${index + 1}</td>
                    <td class="coal">${item.truck_no || ''}</td>
                    <td class="coal">${item.coal_name || ''}</td>
                    <td class="unit">${item.seller_name || ''}</td>
                    <td class="time">${item.mz_time || ''}</td>
                    <td>${this.$utils.formatNum(item.zmjz) || ''}</td>
                    <td class="unit">${item.customer_name || ''}</td>
                    <td class="time">${item.unloading_time || ''}</td>
                    <td>${this.$utils.formatNum(item.xmjz) || ''}</td>
                    <td class="rightborder">${this.$utils.formatNum(item.short_ton * 1000) || ''}</td>
                  </tr>
                `).join('')}
                <tr>
                  <th colspan="3" style="color: red;">合计: </th>
                  <th></th>
                  <th></th>
                  <th style="color: red;">${this.$utils.formatNum(data[0].total_zmjz) || ''}</th>
                  <th></th>
                  <th></th>
                  <th style="color: red;">${this.$utils.formatNum(data[0].total_xmjz) || ''}</th>
                  <th style="color: red;" class="rightborder">${this.$utils.formatNum(data[0].total_short_ton * 1000) || ''}</th>
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
        document.getElementById("exportExcel").download = '煤台调运明细表.xls';
        document.getElementById("exportExcel").click();
      }
    },
  }
</script>