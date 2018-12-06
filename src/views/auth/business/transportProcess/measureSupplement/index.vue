<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm placement="bottom-start" placeholder="创建时间" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <Input placeholder="客户名称" v-model="customerName" clearable style="width: 200px;margin-top:5px;" />
    <Input placeholder="车牌号" v-model="truckNo" clearable style="width: 200px;margin-top:5px;" />
    <Select v-model="yxType" filterable clearable placeholder="运销类型" style="width: 200px;margin-top:5px;">
      <Option :value="1">销售</Option>
      <Option :value="2">调运</Option>
    </Select>
    <Select v-model="coalType" filterable clearable placeholder="煤种" style="width: 200px;margin-top:5px;">
      <Option v-for="(item, key) in coalTypeList" :key="key" :value="item.id">{{item.coalName}}</Option>
    </Select>
    <Select v-model="spState" clearable placeholder="审批状态" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, index) in spStateList" :key="index" :value="index">{{item}}</Option>
    </Select>
    <Button v-auth="'transportProcess.measureSupplement.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;" >查询</Button>
    <Button v-auth="'transportProcess.measureSupplement.add'" type="warning" icon="plus-round" @click="create()" style="margin-top:5px;" >新增</Button>
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
    <!-- 补录修改 -->
    <Modal v-model="editDlgVisible" title="修改" width="450">
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
        <FormItem v-if="yxState==50 || yxState==40" label="皮重：" prop="pz">
          <Input style="width: 240px" v-model.number="formData.pz" placeholder="请输入（必填）">
            <span slot="append">吨</span>
          </Input>
        </FormItem>     
        <FormItem v-if="yxState==50 || yxState==40" label="除皮时间：" prop="pzTime">
          <DatePicker style="width: 240px" type="date" format="yyyy/MM/dd" v-model="formData.pzTime" placeholder="请选择（必填）"></DatePicker>
        </FormItem>
        <FormItem v-if="yxState==50 || yxState==40" label="除皮操作人：" prop="pzOperator">
          <Input style="width: 240px" v-model="formData.pzOperator" placeholder="请输入（必填）"></Input>
        </FormItem>     
        <!-- 皮重补录结束 -->
        <!-- 毛重补录开始 -->
        <FormItem v-if="yxState==70 || yxState==40" label="毛重：" prop="mz">
          <Input style="width: 240px" v-model.number="formData.mz" placeholder="请输入（必填）">
            <span slot="append">吨</span>
          </Input>
        </FormItem>   
        <FormItem v-if="yxState==70 || yxState==40" label="称重时间：" prop="mzTime">
          <DatePicker style="width: 240px" type="date" format="yyyy/MM/dd" v-model="formData.pzTime" placeholder="请选择（必填）"></DatePicker>
        </FormItem>
        <FormItem v-if="yxState==70 || yxState==40" label="称重操作人：" prop="mzOperator">
          <Input style="width: 240px" v-model="formData.mzOperator" placeholder="请输入（必填）"></Input>
        </FormItem>
        <!-- 毛重补录结束 -->
        <FormItem label="备注：">
          <Input style="width: 240px" v-model="formData.memo" type="textarea" placeholder="请输入（必填）"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="submit()" :loading="modifyLoading">确定</Button>
        <Button type="default" @click="editDlgVisible=false" >取消</Button>
      </div>
    </Modal>

    <supplement-modal
      v-if="dlgVisible"
      @on-close="onModalClose">
    </supplement-modal>
  </div>
</template>

<script>
  import supplementModal from "./modal";
  export default {
    components: {
      supplementModal
    },
    data() {
      return {
        dlgVisible: false,
        editDlgVisible: false,
        validList: ["草稿","已生效","已终止","已过期"],
        spStateList: ["草稿","待审核","审核通过","审核打回"],
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        yxState: null,
        yxType: null,
        isvalid: null,
        spState: null,
        truckNo: "",
        customerName: "",
        startDate: "",
        endDate: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        coalType: null,
        coalTypeList: [],
        coalBunkerList: [],
        customerList: [],
        formData: {
          tid: null,
          truckNo: "",
          cardNo: "",
          bunkerId: null,
          bunkerName: "",
          blType: null,
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
        columns: [
          {
            title: "车牌号",
            key: "ocode",
            fixed: "left",
            minWidth: 95
          },
          {
            title: "客户名称",
            key: "deptName",
            minWidth: 130
          },
          {
            title: "煤种",
            key: "coal_name",
            minWidth: 90
          },
          {
            title: "承运单位",
            key: "deptName",
            minWidth: 130
          },
          {
            title: "补录类型",
            key: "yx_state",
            minWidth: 85
          },
          {
            title: "皮重(吨)",
            key: "total",
            minWidth: 85,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.total));
            }
          },
          {
            title: "毛重(吨)",
            key: "total",
            minWidth: 85,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.total));
            }
          },
          {
            title: "净重(吨)",
            key: "total",
            minWidth: 85,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.total));
            }
          },
          {
            title: "皮重时间",
            key: "start_date",
            minWidth: 110
          },
          {
            title: "皮重计量员",
            key: "end_date",
            minWidth: 110
          },
          {
            title: "毛重时间",
            key: "start_date",
            minWidth: 110
          },
          {
            title: "毛重计量员",
            key: "end_date",
            minWidth: 110
          },
          {
            title: "装车地点",
            key: "isvalid",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.validList[params.row.isvalid]);
            }
          },
          {
            title: "审核状态",
            key: "sp_state",
            minWidth: 85,
            render: (h, params) => {
              return h("span", this.spStateList[params.row.sp_state]);
            }
          },
          {
            title: "创建人",
            key: "userName",
            minWidth: 85
          },
          {
            title: "创建时间",
            key: "creation_time",
            minWidth: 150
          },
          {
            title: "操作",
            width: 190,
            fixed: "right",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small",
                      disabled: params.row.spState == 0 || params.row.spState == 3
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.edit(params.row);
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'transportProcess.measureSupplement.modify'
                      }
                    ],
                  },
                  "修改"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "warning",
                      size: "small",
                      disabled: params.row.spState == 1
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.approve(params.row);
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'transportProcess.measureSupplement.approve'
                      }
                    ],
                  },
                  "提交审核"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small",
                      disabled: params.row.sp_state == 0 || params.row.sp_state == 3
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.delete(params.row);
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'transportProcess.measureSupplement.delete'
                      }
                    ],
                  },
                  "删除"
                )
              ]);
            }
          }
        ]
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getMeasureSupplementList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getMeasureSupplementList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getMeasureSupplementList();
      },
      // 日期组件
      onDatePickerChange(date) {
        this.startDate = date[0];
        this.endDate = date[1];
      },
      // modal关闭
      onModalClose(val) {
        this.dlgVisible = false;
        this.getMeasureSupplementList();
      },
      // 删除
      delete(data) {
        this.$Modal.confirm({
          title: '提示',
          content:  `<p>确定<span style="color: red;font-size: 16px;"> 删除 </span>
                    车牌号为<span style="color: red;font-size: 16px;"> ${data.truckNo} </span>的计量数据补录流程吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .get("/transportStop/deleteById", {
                stopId: data.sid,
                applyStatus: data.applyStatusNum
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success("删除成功！");
                this.getTransportStopList();
              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }
        });
      },
      // 提交审核
      approve(data){

        this.$Modal.confirm({
          title: '提示',
          content:  `<p>确定<span style="color: red;font-size: 16px;"> 提交审批 </span>
                    车牌号为<span style="color: red;font-size: 16px;"> ${data.ocode} </span>的计量数据补录流程吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/DBOrder/submitDbOrder", {
                  oId: data.oid
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("提交审核成功！");
                this.getMeasureSupplementList();
              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }
        });
      },
      // 修改
      edit(data){
        this.$refs["formData"].resetFields();
        this.editDlgVisible = true;
        return
        this.$commonService
          .get("/DBOrder/getDbOrderInfoByOId", {
            oId: data.oid
          })
          .then(res => {
            this.$Modal.remove();
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.formData = {
              "oid": res.data.oid,
              "seller_id": res.data.seller_id,
              "sellerName": res.data.sellerName,
              "customer_id": res.data.customer_id,
              "coal_id": res.data.coal_id,
              "total": res.data.total,
              "start_date": res.data.start_date,
              "end_date": res.data.end_date,
              "startpoint": res.data.startpoint,
              "endpoint": res.data.endpoint,
              "memo": res.data.memo
            };
            this.dlgVisible = true;
            this.dlgTitle = "修改";
          })
          .catch(err => {
            this.$Modal.remove();
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 新增
      create(){
        // this.$refs["formData"].resetFields();
        // this.$refs["coalTypeSelect"].setQuery(null);
        // this.$refs["customerSelect"].setQuery(null);
        this.formData = {
          "oid": "",
          "seller_id": this.$storage.getUserInfo().companyId,
          "sellerName": this.$storage.getUserInfo().companyName,
          "customer_id": null,
          "coal_id": null,
          "total": null,
          "start_date": null,
          "end_date": null,
          "startpoint": "",
          "endpoint": "",
          "memo": ""
        }
        this.dlgVisible = true;
        this.dlgTitle = "新增";
      },
      // 新增或者修改
      createSubmit(){
        this.$refs["formData"].validate(valid => {
          if (valid) {
            let params = Object.assign({},this.formData);
            params.start_date = this.$utils.formateDate(params.start_date, "yyyy/MM/dd 00:00:00");
            params.end_date = this.$utils.formateDate(params.end_date, "yyyy/MM/dd 23:59:59");
            this.modifyLoading = true;
            // 车辆状态:0表示草稿状态，1表示启用，2表示禁用
            let url = this.dlgTitle == '修改' ? "/DBOrder/updateDbOrder" : "/DBOrder/addDbOrder";
            this.$commonService
              .post(url, {
                dto: params
              })
              .then(res => {
                this.modifyLoading = false;
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success(`${this.dlgTitle}成功！`);
                this.getMeasureSupplementList();
                this.dlgVisible = false;
              })
              .catch(err => {
                this.modifyLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });

      },
      // 获取调拨单列表
      getMeasureSupplementList(){
        this.loading = true;
        this.$commonService
          .post("/addWeigh/getWeighDataList", {
            dto: {
              "coalId": this.coalType || -1,
              "currentPage": this.currentPage,
              "pageSize": this.pageSize,
              "customerName": this.customerName,
              "startTime": this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00"),
              "endTime": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
              "spStatus": this.spState || -1,
              "truckNo": this.truckNo,
              "yxStatus": -1,
              "yxType": this.yxType || -1
            }
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.rows = res.data;
            this.rows.map(item=>{
              item.start_date = this.$utils.formateDate(item.start_date, "yyyy/MM/dd");
              item.end_date = this.$utils.formateDate(item.end_date, "yyyy/MM/dd");
              return item;
            })
            this.totalCount = res.total;
          })
          .catch(err => {
            console.log(err)
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 获取客户列表
      getCustomerList() {
        this.$commonService
          .post("/dept/getCommonDept", {
            dto: {
              "currentPage": 1,
              "deptType": 2,
              "pageSize": 999
            }
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.customerList = res.data;
          })
          .catch(err => {
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
    mounted(){
      this.getCoalBunkersList();
      this.getCoalTypeList();
      this.getCustomerList();
      this.getMeasureSupplementList();
    }
  }
</script>