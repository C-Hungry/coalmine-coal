<style lang="less">
  #modal .ivu-table-fixed-header .ivu-checkbox-wrapper {
    display: none;
  }
</style>

<template>
  <div>
    <Modal id="modal" v-model="visible" width="850" :title="title">
      <div>
        <Input placeholder="车牌号" v-model="truckNo" clearable style="width: 200px" />
        <Button type="primary" icon="ios-search" @click="onSearch()" :loading="loading">查询</Button>
        <Button type="warning" icon="edit" v-auth="'coalTransfer.xmMeasureModify.xmmz'" :disabled="!currentRowData" @click="modify(70)">毛重修改</Button>
        <Button type="warning" icon="edit" v-auth="'coalTransfer.xmMeasureModify.xmpz'" :disabled="!currentRowData" @click="modify(50)">皮重修改</Button>
        <Button type="warning" icon="edit" v-auth="'coalTransfer.xmMeasureModify.xmscbd'" :disabled="!currentRowData" @click="modify(80)">毛重及皮重修改</Button>
        <br><br>
        <Table ref="table" border @on-select="onTableSelect" @on-selection-change="onTableSelectChange" :columns="columns" :data="rows" :loading="loading"></Table>
        <br>
        <Page size="small" :total="totalCount" show-elevator show-total :page-size="pageSize" :current="currentPage" @on-change="onPageChanged"></Page>
      </div>
      
      <div slot="footer">
        <Button type="primary" @click="visible=false">关闭</Button>
      </div>
    </Modal>
    <!-- 修改 -->
    <Modal v-model="editDlgVisible" :title="editDlgTitle" width="450px;">
      <Form ref="formData" :model="formData" :rules="formDataRules" :label-width="120">
        <FormItem v-if="editType == 70 || editType == 80" label="新毛重：" prop="mz">
          <Input style="width: 240px" v-model.number="formData.mz" placeholder="请输入（必填）" >
            <span slot="append">吨</span>
          </Input>
        </FormItem>
        <FormItem v-if="editType == 50 || editType == 80" label="新皮重：" prop="pz">
          <Input style="width: 240px" v-model.number="formData.pz" placeholder="请输入（必填）" >
            <span slot="append">吨</span>
          </Input>
        </FormItem>
        <FormItem label="备注：" prop="memo">
          <Input style="width: 240px" v-model="formData.memo" type="textarea" placeholder="请输入（必填）" ></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="submit()" :loading="modifyLoading">确定</Button>
        <Button type="default" @click="editDlgVisible=false" >取消</Button>
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
      editDlgVisible: false,
      editDlgTitle: '数据修改',
      editType: 0,
      loading: false,
      truckNo: "",
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      rows: [],
      selectTruckState: 0,
      currentRowData: null,
      columns: [
        {
          type: "selection",
          key: "tid",
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
          key: "truck_no",
          fixed: "left",
          minWidth: 95
        },
        {
          title: "车型",
          key: "truck_type",
          minWidth: 90
        },
        {
          title: "卡号",
          key: "card_no",
          minWidth: 95
        },
        {
          title: "煤种",
          key: "coal_name",
          minWidth: 95
        },
        // {
        //   title: "运销类型",
        //   key: "yx_type",
        //   minWidth: 85,
        //   render: (h, params) => {
        //     return h("span", this.yxTypeList[params.row.yx_type]);
        //   }
        // },
        // {
        //   title: "运销状态",
        //   key: "yx_state",
        //   minWidth: 85,
        //   render: (h, params) => {
        //     return h("span", this.yxStateList[params.row.yx_state]);
        //   }
        // },
        {
          title: "毛重(吨)",
          key: "mz",
          minWidth: 90,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.mz));
          }
        },
        {
          title: "皮重(吨)",
          key: "pz",
          minWidth: 90,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.pz));
          }
        },
        {
          title: "净重(吨)",
          key: "jz",
          minWidth: 90,
          render: (h, params) => {
            return h("span", this.$utils.formatNum(params.row.jz));
          }
        }
      ],
      formData: {
        wid: null,
        pz: null,
        mz: null
      },
      formDataRules: {
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
      this.getWeightBillList();
    },
    // 分页
    onPageChanged(page){
      this.currentPage = page;
      this.getWeightBillList();
    },
    // 监听表格选中
    onTableSelect(selection,row) {
      this.rows.map(item=>{
        item._checked = row.yxid == item.yxid;
        return item;
      })
      this.selectTruckState = row.yx_state;
      this.currentRowData = row;
    },
    // 表格选中变化
    onTableSelectChange(selection) {
      if (selection.length == 0) {
        this.currentRowData = null;
        this.selectTruckState = 0;
      }
    },
    // 提交
    submit() {
      this.$refs["formData"].validate(valid => {
        if (valid) {
          let params = Object.assign({},this.formData);
          this.modifyLoading = true;
          this.$commonService
            .post('/autoTransport/updateWeightLog', { dto: params})
            .then(res => {
              this.modifyLoading = false;
              if(!res.success){
                this.$Message.error(res.msg);
                return;
              }
              this.$Message.success(res.msg);
              this.getWeightBillList();
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
      this.editDlgVisible = true;
      this.editType = state;
      this.editDlgTitle = state == 50 ? "皮重修改" : state == 70 ? "毛重修改" : "毛重及皮重修改";
      this.formData = {
        wid: this.currentRowData.wid,
        pz: this.currentRowData.pz,
        mz: this.currentRowData.mz,
      }
    },
    // 获取榜单列表
    getWeightBillList(){
      this.loading = true;
      this.$commonService
        .post("/autoTransport/getModifiedWeightBillList", {
          dto: {
            "billstate": -1,
            "begin_date": "",
            "end_date": "",
            "pageSize": this.pageSize,
            "currentPage": this.currentPage,
            "truck_no": this.truckNo
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
  },
  mounted() {
    this.getWeightBillList();
  },
  destroyed() {

  },
}
</script>