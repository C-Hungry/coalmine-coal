<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm placement="bottom-start" placeholder="操作时间" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <Input placeholder="车牌号" v-model="truckNo" clearable style="width: 200px;margin-top:5px;" />
    <!-- <Select v-model="coalType" clearable placeholder="煤种" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, index) in coalTypeList" :key="index" :value="item.id">{{item.coalName}}</Option>
    </Select> -->
    <Button v-auth="'transportProcess.measureModify.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;" >查询</Button>
    <Button v-auth="'transportProcess.measureModify.add'" type="warning" icon="plus-round" @click="modify()" style="margin-top:5px;" >计量数据修改</Button>
    <br><br>
    <Table border :columns="columns" :data="rows" :loading="loading"></Table>
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

    <modify-modal 
      v-if="dlgVisible"
      @on-close="onModalClose">
    </modify-modal>

  </div>
</template>

<script>
  import modifyModal from "./modal";
  export default {
    components: {
      modifyModal
    },
    data() {
      return {
        dlgVisible: false,
        loading: false, // 列表
        truckNo: "",
        coalType: -1,
        startDate: "",
        endDate: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        coalTypeList: [],
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
        formDataRules: {
          truck_no: [
            { required: true, message: "车牌号不能为空", trigger: "blur" }
          ],
          new_pz: [
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
          new_mz: [
            {
              required: true, 
              type: "method",
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error("净重不能为空"));
                }         
                else if (!/^([1-9]\d?(\.\d{1,2})?|0\.\d{1,2}|100)$/.test(value)) {
                  callback(new Error("净重必须为≥0的数字，可保留两位小数"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ]
        },
        columns: [
          {
            title: "煤种",
            key: "coal_type_name",
            minWidth: 90
          },
          {
            title: "车牌号",
            key: "truck_no",
            fixed: "left",
            minWidth: 100
          },
          {
            title: "卡号",
            key: "card_no",
            fixed: "left",
            minWidth: 95
          },
          {
            title: "原皮重(吨)",
            key: "old_pz",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.old_pz));
            }
          },
          {
            title: "新皮重(吨)",
            key: "new_pz",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.new_pz));
            }
          },
          {
            title: "原毛重(吨)",
            key: "old_mz",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.old_mz));
            }
          },
          {
            title: "新毛重(吨)",
            key: "new_mz",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.new_mz));
            }
          },
          {
            title: "原净重(吨)",
            key: "old_jz",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.old_jz));
            }
          },
          {
            title: "新净重(吨)",
            key: "new_jz",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.new_jz));
            }
          },
          {
            title: "修改类型",
            key: "weight_type",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.yxStateList[params.row.weight_type]);
            }
          },
          {
            title: "操作人",
            key: "userName",
            minWidth: 100
          },
          {
            title: "操作时间",
            key: "creation_time",
            minWidth: 160
          },
          {
            title: "备注",
            key: "memo",
            minWidth: 140
          },
          {
            title: "当前运销状态",
            key: "yx_state",
            minWidth: 120,
            render: (h, params) => {
              return h("span", this.yxStateList[params.row.yx_state]);
            }
          }
        ]
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getWeightUpdateist();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getWeightUpdateist();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getWeightUpdateist();
      },
      // 日期组件
      onDatePickerChange(date) {
        this.startDate = date[0];
        this.endDate = date[1];
      },
      // modal关闭
      onModalClose(val) {
        this.dlgVisible = false;
        this.getWeightUpdateist();
      },
      // 计量数据修改
      modify() {
        this.dlgVisible = true;
      },
      // 获取计量数据修改列表
      getWeightUpdateist(){
        this.loading = true;
        this.$commonService
          .post("/autoTransport/getWeight", {
            dto: {
              "begin_date": this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00"),
              "coal_type": -1,
              "currentPage": this.currentPage,
              "end_date": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
              "pageSize": this.pageSize,
              "truck_no": this.truckNo
            }
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.rows = res.data;
            this.totalCount = res.total;
          })
          .catch(err => {
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 获取煤种信息
      getCoalTypeList(){
        this.$commonService
          .get("/coalType/getCoalTypeList",{
            isvalid: 1,
            currentPage: 1,
            pageSize: 99999
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.coalTypeList = res.data;
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
    },
    mounted(){
      // this.getCoalTypeList();
      this.getWeightUpdateist();
    }
  }
</script>