<style lang="less">
  #vehicleModal .ivu-table-fixed-header .ivu-checkbox-wrapper {
    display: none;
  }
</style>

<template>
  <div>
    <Modal id="vehicleModal" v-model="visible" width="850" :title="title">
      <div>
        <Input placeholder="关键字（车牌号、车主）" v-model="keywords" clearable style="width: 200px" />
        <Select v-model="carType" filterable clearable style="width:200px" placeholder="请选择车型">
          <Option v-for="(item, index) in carTypeList" :key="index" :value="item.value">{{item.label}}</Option>
        </Select>
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
    type: { // 弹框用途 1、派车forDispatchTruck  2、发卡forGrantCard
      type: String,
      default: ""
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
      carType: "",
      keywords: "",
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      carTypeList: [],
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
          title: "车牌号",
          key: "truck_no",
          fixed: "left",
          minWidth: 95
        },
        {
          title: "车型",
          key: "truck_type_name",
          minWidth: 90
        },
        {
          title: "额定载重(吨)",
          key: "rated_load",
          minWidth: 105,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.rated_load));
          }
        },
        {
          title: "皮重(吨)",
          key: "tare",
          minWidth: 85,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.tare));
          }
        },
        {
          title: "车厢长度(米)",
          key: "truck_length",
          minWidth: 105,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.truck_length));
          }
        },
        {
          title: "车厢宽度(米)",
          key: "truck_width",
          minWidth: 105,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.truck_width));
          }
        },
        {
          title: "车主",
          key: "owner",
          minWidth: 80
        },
        {
          title: "司机",
          key: "driver",
          minWidth: 80
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
      
      if (this.type == "forDispatchTruck") {
        // 针对派车使用  车辆必须是启用状态且卡类型为销售卡
        this.loading = true;
        this.currentRowData = null;
        this.$commonService
          .post("/car/getCarListByCardType", {
            dto: {
              "isvalid": 1,
              "truck_type": this.carType,
              "keywords": this.keywords,
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
      }
      else if(this.type == "forGrantCard") {
        // 针对发卡使用  车辆必须是启用状态
        this.loading = true;
        this.currentRowData = null;
        this.$commonService
          .post("/car/getCarList", {
            dto: {
              "isvalid": 1,
              "truck_type": this.carType,
              "keywords": this.keywords,
              "currentPage": this.currentPage,
              "use_type": -1,
              "pageSize": this.pageSize
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
      }
      else {
        // 此处可继续开发
        this.$Message.error("请使用约定好的type值！");
      }

    },
    // 获取车型
    getCarTypeList() {
      this.$commonService
        .get("/basisType/getBasisTypeListByCode", {
          "code": "carType"
        })
        .then(res => {
          if(!res.success){
            this.$Message.error(res.msg);
            return;
          }

          this.carTypeList.map(item=>{
            item.value = String(item.value);
            return item;
          })

          this.carTypeList = res.data;
          
        })
        .catch(err => {
          err.msg && this.$Message.error(err.msg);
        });
    }
  },
  mounted() {
    this.getCarTypeList();
    this.getVehicleList();
  },
  destroyed() {
    this.currentRowData = null;
  },
}
</script>

