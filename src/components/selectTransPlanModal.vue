<style lang="less">
  #transPlanModal .ivu-table-fixed-header .ivu-checkbox-wrapper {
    display: none;
  }
</style>

<template>
  <div>
    <Modal id="transPlanModal" v-model="visible" width="850" :title="title">
      <div>
        <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm  placement="bottom-start" placeholder="计划开始时间" style="width: 200px"></DatePicker>
        <Input placeholder="调运计划名称" v-model="planName" clearable style="width: 200px" />
        <Button type="primary" icon="ios-search" @click="onSearch()" :loading="loading">查询</Button>
        <br><br>
        <Table 
          ref="table" 
          border 
          @on-select="onTableSelect" 
          @on-selection-change="onTableSelectChange"
          :columns="columns" 
          :data="rows" 
          :loading="loading"
          ></Table>
        <br>
        <Page size="small" 
          :total="totalCount" 
          show-elevator 
          show-total 
          :page-size="pageSize"
          :current="currentPage" 
          @on-change="onPageChanged"
          ></Page>
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
      default: "选择调运计划"
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
      startDate: "",
      endDate: "",
      planName: "",
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      rows: [],
      planTypeList: ["外部调运","内部调运","外部自用","内部自用"],
      currentRowData: null,
      columns: [
        {
          type: "selection",
          key: "tid",
          fixed: "left",
          width: 53,
        },
        {
          title: "计划编号",
          key: "plan_code",
          fixed: "left",
          minWidth: 180
        },
        {
          title: "计划名称",
          key: "plan_name",
          minWidth: 120
        },
        {
          title: "煤种",
          key: "coal_name",
          minWidth: 80
        },
        {
          title: "调运类型",
          key: "transport_type_name",
          minWidth: 90
        },
        {
          title: "计划量(吨)",
          key: "plan_num",
          minWidth: 100,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.plan_num));
          }
        },
        {
          title: "起始站",
          key: "startBunkerName",
          minWidth: 120
        },
        {
          title: "终止站",
          key: "endBunkerName",
          minWidth: 120
        },
        {
          title: "计划开始日期",
          key: "begin_date",
          minWidth: 120
        },
        {
          title: "计划终止日期",
          key: "end_date",
          minWidth: 120
        }
      ]
    }
  },
  methods: {
    // 搜索
    onSearch() {
      this.currentPage = 1;
      this.getTransportPlanList();
    },
    // 日期组件
    onDatePickerChange(date) {
      this.startDate = date[0];
      this.endDate = date[1];
    },
    // 分页
    onPageChanged(page){
      this.currentPage = page;
      this.getTransportPlanList();
    },
    // 选中触发
    onTableSelect(selection,row) {
      this.rows.map(item=>{
        item._checked = row.tpid == item.tpid;
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
    // 获取调运单列表
    getTransportPlanList(){
      this.loading = true;
      this.currentRowData = null;
      this.$commonService
        .post("/transportPlan/gettransportPlanList", {
          dto: {
            "begin_date": this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00"),
            "end_date": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
            "currentPage": this.currentPage,
            "pageSize": this.pageSize,
            "plan_name": this.planName,
            "plan_code": "",
            "plan_state": 1,
            "sp_state": 2,
            "transport_type": null
          }
        })
        .then(res => {
          this.loading = false;
          if(!res.success){
            this.$Message.error(res.msg);
            return;
          }

          res.data.map(item=>{
            item.begin_date = this.$utils.formateDate(item.begin_date, "yyyy/MM/dd");
            item.end_date = this.$utils.formateDate(item.end_date, "yyyy/MM/dd");
            if (this.value == item.tpid) {
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
    this.getTransportPlanList();
  },
  destroyed() {
    this.currentRowData = null;
  },
}
</script>