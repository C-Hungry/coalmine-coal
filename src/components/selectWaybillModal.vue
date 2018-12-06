<style lang="less">
  #waybillModal .ivu-table-fixed-header .ivu-checkbox-wrapper {
    display: none;
  }
</style>

<template>
  <div>
    <Modal id="waybillModal" v-model="visible" width="850" :title="title">
      <div>
        <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm  placement="bottom-start" placeholder="创建时间" style="width: 200px"></DatePicker>
        <Input v-if="!iscarrier" placeholder="承运商名称" v-model="carrierName" clearable style="width: 200px" />
        <Button type="primary" icon="ios-search" @click="onSearch()" :loading="loading">查询</Button>
          <br><br>
          <Table ref="table" border @on-select="onTableSelect" @on-selection-change="onTableSelectChange" :columns="columns" :data="rows" :loading="loading"></Table>
        <br>
        <Page size="small" :total="totalCount" show-elevator show-total :page-size="pageSize" :current="currentPage" @on-change="onPageChanged"></Page>
      </div>
      <div slot="footer">
        <Button type="primary" @click="submit">确定</Button>
        <Button type="default" @click="visible=false" >取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "选择托运单"
    },
    value: { // 默认值
      type: Number,
      default: null
    }
  },
  computed: {
    visible: {
      get() { 
        return true;
      },
      set(newVal) { 
        this.$emit("on-close", newVal);
      }
    }
  },
  data() {
    return {
      loading: false,
      iscarrier: false,
      startDate: "",
      endDate: "",
      carrierName: "",
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      waybillStateList: ["生效", "终止", "过期"],
      rows: [],
      currentRowData: null,
      columns: [
        {
          type: "selection",
          key: "tid",
          fixed: "left",
          width: 53,
        },
        {
          title: "托运单编号",
          key: "sendtruck_code",
          fixed: "left",
          minWidth: 180
        },
        {
          title: "煤种",
          key: "coal_name",
          minWidth: 80
        },
        {
          title: "承运商",
          key: "carrierName",
          minWidth: 120
        },
        {
          title: "托运单总量(吨)",
          key: "total",
          minWidth: 120,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.total));
          }
        },
        {
          title: "托运开始日期",
          key: "start_date",
          minWidth: 120
        },
        {
          title: "托运终止日期",
          key: "end_date",
          minWidth: 120
        },
        // {
        //   title: "托运单状态",
        //   key: "isvalid",
        //   minWidth: 120,
        //   render: (h, params) => {
        //     return h("span", this.waybillStateList[params.row.isvalid - 1]);
        //   }
        // },
        // {
        //   title: "创建人",
        //   key: "userName",
        //   minWidth: 100
        // }
      ]
    }
  },
  methods: {
    // 搜索
    onSearch() {
      this.currentPage = 1;
      this.getWaybillList();
    },
    // 日期组件
    onDatePickerChange(date) {
      this.startDate = date[0];
      this.endDate = date[1];
    },
    // 分页
    onPageChanged(page){
      this.currentPage = page;
      this.getWaybillList();
    },
    onTableSelect(selection,row) {
      this.rows.map(item=>{
        item._checked = row.wbid == item.wbid;
        return item;
      })
      this.currentRowData = row;
    },
    // 表格选中变化
    onTableSelectChange(selection) {
      if (selection.length == 0) {
        this.currentRowData = null;
      }
    },
    // 提交
    submit() {
      if (this.currentRowData) {
        this.$emit("on-change", this.currentRowData);
        this.visible = false;
      } else {
        this.$Message.warning("请选择托运单");
      }
    },
    // 获取托运单列表
    getWaybillList() {
      this.loading = true;
      this.currentRowData = null;
      this.$commonService
        .post("/WayBill/getAllWayBill", {
          dto: {
            "currentPage": this.currentPage,
            "end_date": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
            "isvalid": 1,
            "pageSize": this.pageSize,
            "carrierName": this.carrierName,
            "start_date": this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00"),
          }
        })
        .then(res => {
          this.loading = false;
          if(!res.success){
            this.$Message.error(res.msg);
            return;
          }

          res.data.map(item => {
            item.start_date = this.$utils.formateDate(item.start_date, "yyyy/MM/dd");
            item.end_date = this.$utils.formateDate(item.end_date, "yyyy/MM/dd");
            if (this.value == item.wbid) {
              item._checked = true;
              this.currentRowData = item;
            }
            else {
              item._checked = false;
            }
            return item;
          })

          this.rows = res.data;
          this.totalCount = res.total;

        })
        .catch(err => {
          this.loading = false;
          err.msg && this.$Message.error(err.msg);
        });
    },
  },
  mounted() {
    let userInfo = this.$storage.getUserInfo();
    if (userInfo && userInfo.deptType == 4) {
      this.iscarrier = true;
      this.carrierName = userInfo.companyName;
    }
    this.getWaybillList();
  },
  destroyed() {
    this.currentRowData = null;
  },
}
</script>