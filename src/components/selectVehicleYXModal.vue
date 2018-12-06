<style lang="less">
  #vehicleModal .ivu-table-fixed-header .ivu-checkbox-wrapper {
    display: none;
  }
</style>

<template>
  <div>
    <Modal id="vehicleModal" v-model="visible" width="850" :title="title">
      <div>
        <Input placeholder="车牌号" v-model="keywords" clearable style="width: 200px" />
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
    title: { // 弹框title
      type: String,
      default: "选择车辆"
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
      keywords: "",
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      rows: [],
      currentRowData: null,
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
          type: "selection",
          key: "tid",
          fixed: "left",
          width: 53,
        },
        {
          title: "车牌号",
          key: "truck_no",
          fixed: "left",
          minWidth: 95
        },
        {
          title: "车型",
          key: "truck_type_name",
          minWidth: 100
        },
        {
          title: "卡号",
          key: "rated_load",
          minWidth: 105
        },
        {
          title: "煤种",
          key: "coal_name",
          minWidth: 85
        },
        {
          title: "运销状态",
          key: "yx_state",
          minWidth: 100,
          render: (h, params) => {
            return h("span", this.yxStateList[params.row.yx_state]);
          }
        },
        {
          title: "客户名称",
          key: "customer_name",
          minWidth: 105
        }
      ]
    }
  },
  methods: {
    // 搜索
    onSearch() {
      this.currentPage = 1;
      this.getVehicleList();
    },
    // 分页
    onPageChanged(page){
      this.currentPage = page;
      this.getVehicleList();
    },
    onTableSelect(selection,row) {
      this.rows.map(item=>{
        item._checked = row.tid == item.tid;
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
        this.$Message.warning("请选择车辆");
      }
    },
    // 获取车辆列表
    getVehicleList(){
      this.loading = true;
      this.currentRowData = null;
      this.$commonService
        .post("/autoTransport/selectTruckState", {
          dto: {
            yx_state: 80,
            truck_no: this.keywords,
            startst_time: "",
            endst_time: "",
            coal_id: null,
            currentPage: this.currentPage,
            pageSize: this.pageSize,
          }
        })
        .then(res => {
          this.loading = false;
          if(!res.success){
            this.$Message.error(res.msg);
            return;
          }
          res.data.map(item=>{
            if (this.value == item.tid) {
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
    this.getVehicleList();
  },
  destroyed() {
    this.currentRowData = null;
  },
}
</script>