<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker :value="datePickerValue" type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm  placement="bottom-start" placeholder="起止日期" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <Select v-model="bunkerId" clearable placeholder="排矸单位" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, key) in coalBunkerList" :key="key" :value="item.id">{{item.bname}}</Option>
    </Select>
    <Button v-auth="'statement.gangue.query'" type="primary" icon="ios-search" @click="onSearch" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button v-auth="'statement.gangue.export'" type="warning" icon="share" @click="exportExcel" :loading="exportLoading" style="margin-top:5px;">{{ exportText }}</Button>
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
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        bunkerId: -1,
        coalBunkerList: [],
        columns: [
          {
            title: "排矸单位",
            key: "seller_name",
            fixed: "left",
            minWidth: 120
          },
          {
            title: "车牌号",
            key: "truck_no",
            minWidth: 95
          },
          {
            title: "销售方式",
            key: "yxType",
            minWidth: 100
          },
          {
            title: "煤种",
            key: "coal_name",
            minWidth: 100
          },
          {
            title: "除皮时间",
            key: "pz_time",
            minWidth: 140
          },
          {
            title: "称重时间",
            key: "mz_time",
            minWidth: 140
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
          }
        ]
      };
    },
    mounted(){
      this.getCoalBunkersList();
      this.getDispatchList();
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getDispatchList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getDispatchList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getDispatchList();
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
      // 获取矸石列表
      getDispatchList(){
        this.loading = true;
        this.$commonService
          .post("/report/getCoalGangueList", {
            dto: {
              "bid": this.bunkerId || -1,
              "end_date": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
              "begin_date": this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00"),
              "currentPage": this.currentPage,
              "pageSize": this.pageSize,
            }
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            res.data.map(item=>{
              item.yxType = "排矸";
              return item
            })
            this.rows = res.data;
            this.totalCount = res.total;
            if (res.data.length) {
              let item = Object.assign({}, res.data[0]);
              item.seller_name  = '合计';
              item.truck_no  = '';
              item.yxType  = '';
              item.coal_name  = '';
              item.pz_time  = '';
              item.mz_time = '';
              item.pz = item.total_pz;
              item.mz = item.total_mz;
              item.jz = item.total_jz;
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
          .post("/report/getCoalGangueList", {
            dto: {
              "bid": this.bunkerId || -1,
              "end_date": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
              "begin_date": this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00"),
              "currentPage": 1,
              "pageSize": 0,
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
                  width: 80px;
                }
                .zk-table td.unit {
                  width: 240px;
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
                    陕西柴家沟煤矿矸石明细表
                  </th>
                </tr>
                <tr>
                  <td colspan="8" style="text-align: left;border-left: none;">查询时间: 
                  ${ this.startDate ? this.$utils.formateDate(this.startDate, "yyyy-MM-dd") + ' 至 ' + this.$utils.formateDate(this.endDate, "yyyy-MM-dd") : '全部'}
                  </td>
                  <td colspan="2" style="text-align: left;border-left: none;">单位：吨</td>
                </tr>
                <tr class="header">
                  <th>序号</th>
                  <th>排矸单位</th>
                  <th>车牌号</th>
                  <th>销售方式</th>
                  <th>煤种</th>
                  <th>除皮时间</th>
                  <th>称重时间</th>
                  <th>皮重</th>
                  <th>毛重</th>
                  <th class="rightborder">净重</th>
                </tr>
                ${data.map((item, index)=> `
                  <tr>
                    <td class="number">${index + 1}</td>
                    <td class="unit">${item.seller_name || ''}</td>
                    <td class="coal">${item.truck_no || ''}</td>
                    <td>排矸</td>
                    <td class="coal">${item.coal_name || ''}</td>
                    <td class="time">${item.pz_time || ''}</td>
                    <td class="time">${item.mz_time || ''}</td>
                    <td>${this.$utils.formatNum(item.pz) || ''}</td>
                    <td>${this.$utils.formatNum(item.mz) || ''}</td>
                    <td class="rightborder">${this.$utils.formatNum(item.jz) || ''}</td>
                  </tr>
                `).join('')}
                <tr>
                  <th colspan="7" style="color: red;">合计: </th>
                  <th style="color: red;">${this.$utils.formatNum(data[0].total_pz) || ''}</th>
                  <th style="color: red;">${this.$utils.formatNum(data[0].total_mz) || ''}</th>
                  <th style="color: red;" class="rightborder">${this.$utils.formatNum(data[0].total_jz) || ''}</th>
                </tr>
                <tr>
                  <td colspan="5" style="text-align: left;border: none;">制表人: ${this.$storage.getUserInfo().userName || ''}</td>
                  <td colspan="5" style="text-align: left;border: none;">制表时间：${this.$utils.formateDate(new Date(), 'yyyy-MM-dd HH:mm:ss') || ''}</td>
                </tr>
              </table>
            </div>
          </body>
        </html>`

        let uri = "data:application/vnd.ms-excel;base64,";
        let ctx = { worksheet: 'Worksheet', table: "" };
        document.getElementById("exportExcel").href = uri + this.base64(this.format(template, ctx));
        document.getElementById("exportExcel").download = '陕西柴家沟煤矿矸石明细表.xls';
        document.getElementById("exportExcel").click();
      }
    },
  }
</script>