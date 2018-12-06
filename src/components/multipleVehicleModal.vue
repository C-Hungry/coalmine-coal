<style lang="less">

</style>

<template>
  <div>
    <Modal id="multipleVehicleModal" v-model="visible" width="850" :title="title">
      <div>
        <Input placeholder="关键字（车牌号、车主）" v-model="keywords" clearable style="width: 200px" />
        <Select v-model="carType" filterable clearable style="width:200px" placeholder="请选择车型">
          <Option v-for="(item, index) in carTypeList" :key="index" :value="item.value">{{item.label}}</Option>
        </Select>
        <Button type="primary" icon="ios-search" @click="onSearch()" :loading="loading">查询</Button>
          <br><br>
          <Table 
            ref="table" 
            border 
            @on-selection-change="onTableSelectChange" 
            :columns="columns" 
            :data="rows" 
            :loading="loading"
            ></Table>
        <br>
        <Page 
          size="small" 
          :total="totalCount" 
          show-elevator 
          show-sizer 
          show-total 
          :page-size="pageSize"
          :page-size-opts="[10, 20, 50, 100]"
          :current="currentPage" 
          @on-change="onPageChanged"
          @on-page-size-change="onPageSizeChanged"
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
    title: { // 弹框title
      type: String,
      default: "选择车辆"
    },
    type: { // 弹框用途 
      type: String,
      default: ""
    },
    value: { // 默认值
      type: Array,
      default: []
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
      currentRowData: [],
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
    onPageSizeChanged(size) {
      this.currentPage = 1;
      this.pageSize = size;
      this.getVehicleList();
    },
    // 分页
    onPageChanged(page){
      this.currentPage = page;
      this.getVehicleList();
    },
    // 多选变化触发
    onTableSelectChange(selection,row) {
      this.currentRowData = selection;
    },
    // 提交
    submit() {
      if (this.currentRowData.length > 0) {
        this.$emit("on-change", this.currentRowData);
        this.visible = false;
      } else {
        this.$Message.warning("请选择车辆");
      }
    },
    // 获取车辆列表
    getVehicleList(){
      // 车辆必须是启用状态且卡类型为销售卡
      this.currentRowData = [];
      this.loading = true;
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
            let flag = this.value.some( value => {
              return value == item.tid;
            })
            if (flag) {
              item._checked = true;
              this.currentRowData.push(item);
            }else {
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
    this.currentRowData = [];
  },
}
</script>