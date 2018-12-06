<style lang="less">
  #modal .ivu-table-fixed-header .ivu-checkbox-wrapper {
    display: none;
  }
</style>

<template>
  <div>
    <Modal id="modal" v-model="visible" width="750" :title="title">
      <div>
        <Input placeholder="车牌号" v-model="truckNo" clearable style="width: 200px;" />
        <Select v-model="yxState" placeholder="运销状态" style="width: 200px;" >
          <Option :value="40">入场</Option>
          <Option :value="50">除皮</Option>
          <!-- <Option :value="70">称重</Option> -->
        </Select>
        <Button type="primary" icon="ios-search" @click="onSearch()" :loading="loading">查询</Button>
        <Button type="warning" icon="edit" v-if="yxState==40" :disabled="!currentRowData" v-auth="'transportProcess.measureSupplement.pz'" @click="modify(50)">除皮车辆 - 皮重补录</Button>
        <Button type="warning" icon="edit" v-if="yxState==50" :disabled="!currentRowData" v-auth="'transportProcess.measureSupplement.mz'" @click="modify(70)">称重车辆 - 毛重补录</Button>
        <!-- <Button type="warning" icon="edit" v-if="yxState==40" :disabled="!currentRowData" v-auth="'transportProcess.measureSupplement.scbd'" @click="modify(40)">生成榜单车辆 - 计量数据补录</Button> -->
        <br><br>
        <Table ref="table" border @on-select="onTableSelect" @on-selection-change="onTableSelectChange" :columns="columns" :data="rows" :loading="loading"></Table>
        <br>
        <Page size="small" :total="totalCount" show-elevator show-total :page-size="pageSize" :current="currentPage" @on-change="onPageChanged"></Page>
      </div>
      <div slot="footer">
        <Button type="primary" @click="visible=false">关闭</Button>
      </div>
    </Modal>
    <!-- 补录 -->
    <Modal v-model="dlgVisible" :title="dlgTitle" width="450">
      <Form ref="formData" :model="formData" :rules="formDataRules" :label-width="120">
        <FormItem label="车牌号：" prop="truckNo">
          <Input style="width: 240px" v-model="formData.truckNo" disabled placeholder="请输入（必填）"></Input>
        </FormItem>
        <FormItem label="卡号：" prop="cardNo">
          <Input style="width: 240px" v-model="formData.cardNo" disabled placeholder="请输入（必填）"></Input>
        </FormItem>
        <FormItem label="装车仓场：" prop="bunkerId">
          <Select style="width: 240px" ref="bunkerSelect" v-model="formData.bunkerId" clearable filterable placeholder="请选择（必选）">
            <Option v-for="(item, index) in coalBunkerList" :key="index" :value="item.id">{{item.bname}}</Option>
          </Select>
        </FormItem>
        <!-- 皮重补录开始 -->
        <FormItem v-if="yxState==40" label="皮重：" prop="pz">
          <Input style="width: 240px" v-model.number="formData.pz" placeholder="请输入（必填）">
            <span slot="append">吨</span>
          </Input>
        </FormItem>     
        <FormItem v-if="yxState==40" label="除皮时间：" prop="pzTime">
          <DatePicker style="width: 240px" type="datetime" format="yyyy/MM/dd HH:mm:ss" v-model="formData.pzTime" placeholder="请选择（必填）"></DatePicker>
        </FormItem>
        <FormItem v-if="yxState==40" label="除皮操作人：" prop="pzOperator">
          <Input style="width: 240px" v-model="formData.pzOperator" placeholder="请输入（必填）"></Input>
        </FormItem>     
        <!-- 皮重补录结束 -->
        <!-- 毛重补录开始 -->
        <FormItem v-if="yxState==50" label="毛重：" prop="mz">
          <Input style="width: 240px" v-model.number="formData.mz" placeholder="请输入（必填）">
            <span slot="append">吨</span>
          </Input>
        </FormItem>   
        <FormItem v-if="yxState==50" label="称重时间：" prop="mzTime">
          <DatePicker style="width: 240px" type="datetime" format="yyyy/MM/dd HH:mm:ss" v-model="formData.pzTime" placeholder="请选择（必填）"></DatePicker>
        </FormItem>
        <FormItem v-if="yxState==50" label="称重操作人：" prop="mzOperator">
          <Input style="width: 240px" v-model="formData.mzOperator" placeholder="请输入（必填）"></Input>
        </FormItem>
        <!-- 毛重补录结束 -->
        <FormItem label="备注：">
          <Input style="width: 240px" v-model="formData.memo" type="textarea" placeholder="请输入（必填）"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="submit()" :loading="modifyLoading">确定</Button>
        <Button type="default" @click="dlgVisible=false" >取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  props: {
    title: { // 弹框title
      type: String,
      default: "计量数据修改"
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
      modifyLoading: false,
      dlgVisible: false,
      dlgTitle: '数据补录',
      loading: false,
      yxState: 40,
      truckNo: "",
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      rows: [],
      currentRowData: null,
      coalBunkerList: [],
      yxTypeList: {
        1:"销售",
        2:"调运",
      },
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
          key: "yxid",
          fixed: "left",
          width: 53,
        },
        // {
        //   title: "客户名称",
        //   key: "customer_name",
        //   fixed: "left",
        //   minWidth: 140
        // },
        {
          title: "车牌号",
          key: "truckNo",
          fixed: "left",
          width: 95
        },
        {
          title: "车型",
          key: "truckTypeName",
          width: 140
        },
        {
          title: "卡号",
          key: "cardNo",
          width: 140
        },
        {
          title: "煤种",
          key: "coalName",
          width: 140
        },
        {
          title: "运销类型",
          key: "yxType",
          minWidth: 140
        },
        // {
        //   title: "运销状态",
        //   key: "yxType",
        //   minWidth: 85,
        //   render: (h, params) => {
        //     return h("span", this.yxStateList[params.row.yx_state]);
        //   }
        // },
        // {
        //   title: "皮重(吨)",
        //   key: "pz",
        //   minWidth: 80,
        //   render: (h, params) => {
        //     return h("span", this.$utils.formatNum(params.row.pz));
        //   }
        // },
        // {
        //   title: "毛重(吨)",
        //   key: "mz",
        //   minWidth: 80,
        //   render: (h, params) => {
        //     return h("span", this.$utils.formatNum(params.row.mz));
        //   }
        // },
        // {
        //   title: "净重(吨)",
        //   key: "jz",
        //   minWidth: 80,
        //   render: (h, params) => {
        //     return h("span", this.$utils.formatNum(params.row.jz));
        //   }
        // }
      ],
      formData: {
        truckNo: "",
        cardNo: "",
        bunkerId: null,
        yxStatus: null,
        pz: null,
        pzTime: null,
        pzOperator: "",
        mz: null,
        mzTime: null,
        mzOperator: "",
        memo: ""
      },
      formDataRules: {
        truckNo: [
          { required: true, message: "车牌号不能为空", trigger: "blur" }
        ],
        cardNo: [
          { required: true, message: "卡号不能为空", trigger: "blur" }
        ],
        bunkerId: [
          { required: true, type: "number", message: "装车仓场不能为空", trigger: "change" }
        ],
        blType: [
          { required: true, type: "number", message: "补录类型不能为空", trigger: "change" }
        ],
        pzTime: [
          { required: true, type: "date", message: "除皮时间不能为空", trigger: "change"}
        ],
        mzTime: [
          { required: true, type: "date", message: "毛重时间不能为空", trigger: "change"}
        ],
        pzOperator: [
          { required: true, message: "除皮操作员不能为空", trigger: "blur" }
        ],
        mzOperator: [
          { required: true, message: "称重操作员不能为空", trigger: "blur" }
        ],
        pz: [
          {
            required: true, 
            type: "method",
            validator: (rule, value, callback) => {
              if (value == null) {
                callback(new Error("皮重不能为空"));
              }         
              else if (!/^([1-9]\d?(\.\d{1,2})?|0\.\d{1,2}|100)$/.test(value)) {
                callback(new Error("皮重必须为≥0的数字，可保留两位小数"));
              }
              else{
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        mz: [
          {
            required: true, 
            type: "method",
            validator: (rule, value, callback) => {
              if (value == null) {
                callback(new Error("毛重不能为空"));
              }         
              else if (!/^([1-9]\d?(\.\d{1,2})?|0\.\d{1,2}|100)$/.test(value)) {
                callback(new Error("毛重必须为≥0的数字，可保留两位小数"));
              }
              else{
                callback();
              }
            },
            trigger: "blur"
          }
        ]
      },
    }
  },
  methods: {
    // 搜索
    onSearch() {
      this.currentPage = 1;
      this.getTruckList();
    },
    // 分页
    onPageChanged(page){
      this.currentPage = page;
      this.getTruckList();
    },
    // 监听表格选中
    onTableSelect(selection,row) {
      this.rows.map(item=>{
        item._checked = row.yxid == item.yxid;
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
      this.$refs["formData"].validate(valid => {
        if (valid) {
          let params = Object.assign({},this.formData);
          params.pzTime = this.$utils.formateDate(params.pzTime, "yyyy/MM/dd HH:mm:ss");
          this.modifyLoading = true;
          this.$commonService
            .post('/addWeigh/addWeigh', { dto: params})
            .then(res => {
              this.modifyLoading = false;
              if(!res.success){
                this.$Message.error(res.msg);
                return;
              }
              this.$Message.success(res.msg);
              this.getTruckList();
              this.editDlgVisible = false;
              this.$emit('on-change');
            })
            .catch(err => {
              this.modifyLoading = false;
              err.msg && this.$Message.error(err.msg);
            });
        }
      });
    },
    // 修改
    modify(state) {
      this.$refs["formData"].resetFields();
      this.dlgVisible = true;
      // this.dgTitle = state == 40 ? "除皮车辆 - 皮重补录" : state == 50 ? "称重车辆 - 毛重补录" : "入场车辆 - 皮重及毛重补录";
      this.dgTitle = state == 50 ? "除皮车辆 - 皮重补录" : state == 70 ? "称重车辆 - 毛重补录" : "入场车辆 - 皮重及毛重补录";
      this.formData = {
        truckNo: this.currentRowData.truckNo,
        cardNo: this.currentRowData.cardNo,
        bunkerId: null,
        yxStatus: state,
        pz: null,
        pzTime: null,
        pzOperator: "",
        mz: null,
        mzTime: null,
        mzOperator: "",
        memo: ""
      }
    },
    // 获取可以补录的车辆列表
    getTruckList(){
      this.loading = true;
      this.$commonService
        .post("/addWeigh/weighTruckInfoList", {
          dto: {
            "pageSize": this.pageSize,
            "currentPage": this.currentPage,
            "truck_no": this.truckNo,
            "yxStatus": this.yxState
          }
        })
        .then(res => {
          this.loading = false;
          if(!res.success){
            this.$Message.error(res.msg);
            return;
          }
          res.data.map(item=>{
            item._checked = false;
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
          err.msg && this.$Message.error(err.msg);
        });
    },
  },
  mounted() {
    this.getTruckList();
    this.getCoalBunkersList();
  },
  destroyed() {

  },
}
</script>