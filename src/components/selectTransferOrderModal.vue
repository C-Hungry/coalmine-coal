<style lang="less">
  #transferOrderModal .ivu-table-fixed-header .ivu-checkbox-wrapper {
    display: none;
  }
</style>

<template>
  <div>
    <Modal id="transferOrderModal" v-model="visible" width="900" :title="title">
      <div>
        <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm  placement="bottom-start" placeholder="创建时间" style="width: 200px"></DatePicker>
        <Input v-if="!iscustomer" placeholder="客户名称" v-model="customerName" clearable style="width: 200px" />
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
      default: "选择调拨单"
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
      iscustomer: false,
      loading: false,
      startDate: "",
      endDate: "",
      customerName: "",
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
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
          title: "调拨单编号",
          key: "ocode",
          fixed: "left",
          minWidth: 150
        },
        {
          title: "煤种",
          key: "coal_name",
          minWidth: 75
        },
        {
          title: "客户名称",
          key: "deptName",
          minWidth: 150
        },
        {
          title: "调拨总量(吨)",
          key: "total",
          minWidth: 100,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.total));
          }
        },
        {
          title: "调拨开始日期",
          key: "start_date",
          minWidth: 100
        },
        {
          title: "调拨终止日期",
          key: "end_date",
          minWidth: 100
        }
      ]
    }
  },
  methods: {
    // 搜索
    onSearch() {
      this.currentPage = 1;
      this.getTransferOrderList();
    },
    // 日期组件
    onDatePickerChange(date) {
      this.startDate = date[0];
      this.endDate = date[1];
    },
    // 分页
    onPageChanged(page){
      this.currentPage = page;
      this.getTransferOrderList();
    },
    onTableSelect(selection,row) {
      this.rows.map(item=>{
        item._checked = row.oid == item.oid;
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
    // 获取调拨单列表
    getTransferOrderList() {
      this.loading = true;
      this.currentRowData = null;
      this.$commonService
        .post("/DBOrder/getDbOrderList", {
          dto: {
            "isvalid": 1,
            "sp_state": 2,
            "start_date": this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00"),
            "end_date": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
            "deptName": this.customerName,
            "currentPage": this.currentPage,
            "pageSize": this.pageSize
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
            if (this.value == item.oid) {
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
    if (userInfo && userInfo.deptType == 2) {
      this.iscustomer = true;
      this.customerName = userInfo.companyName;
    }
    this.getTransferOrderList();
  },
  destroyed() {
    this.currentRowData = null;
  },
}
</script>