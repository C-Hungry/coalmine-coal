<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker :value="datePickerValue" type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm  placement="bottom-start" placeholder="起止日期" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <Input v-model="customerName" placeholder="收货单位" clearable style="width: 200px;margin-top:5px;" />
    <Button v-auth="'statement.coalTypePlat.query'" type="primary" icon="ios-search" @click="onSearch" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button v-auth="'statement.coalTypePlat.export'" type="warning" icon="share" @click="exportExcel" :loading="exportLoading" style="margin-top:5px;">{{ exportText }}</Button>
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
        customerName: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        columns: [
          {
            title: "销售分类",
            key: "yx_type_name",
            fixed: "left",
            width: 95
          },
          {
            title: "煤种",
            key: "coal_name",
            minWidth: 80
          },
          {
            title: "净重（吨）",
            key: "jz",
            minWidth: 90,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.jz));
            }
          },
          {
            title: "车数（次）",
            key: "truck_num",
            minWidth: 90
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
      // 表格合计行样式
      rowClassName (row, index) {
        return index == this.rows.length -1 ? 'zk-table-summation-row' : '';
      },
      // 获取2号煤台煤种明细表
      getList(){
        this.loading = true;
        this.$commonService
          .post("/report/getNo2CoalPlatformListByCoal", {
            dto: {
              "currentPage": this.currentPage,
              "pageSize": 0,
              "bid": -1,
              "end_date": this.$utils.formateDate(this.endDate, "yyyy/MM/dd 23:59:59"),
              "begin_date": this.$utils.formateDate(this.startDate, "yyyy/MM/dd 00:00:00"),
              "customer_name": this.customerName
            }
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            res.data.map(item=>{
              item.yx_type_name = item.yx_type == 1 ? '销售' : '调运';
              return item;
            })
            this.rows = res.data;
            this.totalCount = res.total;
            if (res.data.length) {
              let item = Object.assign({}, res.data[0]);
              item.yx_type_name = '合计';
              item.jz = item.total_jz;
              item.coal_name = "";
              item.truck_num = item.total_truck_num;
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
          .post("/report/getNo2CoalPlatformListByCoal", {
            dto: {
              "currentPage": 1,
              "pageSize": 0,
              "bid": -1,
              "end_date": this.$utils.formateDate(this.endDate, "yyyy/MM/dd 23:59:59"),
              "begin_date": this.$utils.formateDate(this.startDate, "yyyy/MM/dd 00:00:00"),
              "customer_name": this.customerName
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
            res.data.map(item=>{
              item.yx_type_name = item.yx_type == 1 ? '销售' : '调运';
              return item;
            })
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
      formatExcelTemp(data, jz, truckNum) {
        try {
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
                    width: 130px;
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
                  </colgroup>
                  <tr style="height: 40px">
                    <th style="font-size: 16pt; font-family: 宋体; border: none;" colspan="5">
                      陕西柴家沟煤矿2号煤台煤种统计表
                    </th>
                  </tr>
                  <tr>
                    <td colspan="4" style="text-align: left;border-left: none;">查询时间: 
                    ${ this.startDate ? this.$utils.formateDate(this.startDate, "yyyy-MM-dd") + ' 至 ' + this.$utils.formateDate(this.endDate, "yyyy-MM-dd") : '全部'}
                    </td>
                    <td colspan="1" style="text-align: left;border-left: none;">单位：吨</td>
                  </tr>
                  <tr class="header">
                    <th>序号</th>
                    <th>销售分类</th>
                    <th>煤种</th>
                    <th>净重</th>
                    <th class="rightborder">车数</th>
                  </tr>
                  ${data.map((item, index)=> `
                    <tr>
                      <td class="number">${index + 1}</td>
                      <td>${item.yx_type_name}</td>
                      <td class="coal">${item.coal_name || ''}</td>
                      <td>${this.$utils.formatNum(item.jz) || ''}</td>
                      <td class="rightborder">${item.truck_num || ''}</td>
                    </tr>
                  `).join('')}
                  <tr>
                    <th colspan="3" style="color: red;">合计: </th>
                    <th style="color: red;">${this.$utils.formatNum(data[0].total_jz) || ''}</th>
                    <th style="color: red;" class="rightborder">${data[0].total_truck_num || ''}</th>
                  </tr>
                  <tr>
                    <td colspan="3" style="text-align: left;border: none;">制表人: ${this.$storage.getUserInfo().userName || ''}</td>
                    <td colspan="3" style="text-align: left;border: none;">制表时间：${this.$utils.formateDate(new Date(), 'yyyy-MM-dd HH:mm:ss') || ''}</td>
                  </tr>
                </table>
              </div>
            </body>
          </html>`

          let uri = "data:application/vnd.ms-excel;base64,";
          let ctx = { worksheet: 'Worksheet', table: "" };
          document.getElementById("exportExcel").href = uri + this.base64(this.format(template, ctx));
          document.getElementById("exportExcel").download = '2号煤台煤种统计表.xls';
          document.getElementById("exportExcel").click();
        } catch (error) {
          console.log(err);
          this.$Message.error('导出失败。原因：你的浏览器版本暂不支持导出功能，或者导出数据出现异常。')
        }
      }
    },
  }
</script>