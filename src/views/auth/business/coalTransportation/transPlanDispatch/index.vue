<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm  placement="bottom-start" placeholder="派车日期" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <Input placeholder="车牌号" v-model="vehicleNum" clearable style="width: 200px;margin-top:5px;" />
    <Select v-model="dispatchState" clearable placeholder="派车状态" style="width: 200px;margin-top:5px;" >
      <Option v-for="(value, key) in dispatchStateList" :key="key" :value="key">{{value}}</Option>
    </Select>
    <Button type="primary" v-auth="'coalTransportation.transPlanDispatch.query'" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button type="warning" v-auth="'coalTransportation.transPlanDispatch.add'" icon="plus-round" @click="create()" style="margin-top:5px;">派车</Button>
    <Button type="error" v-auth="'coalTransportation.transPlanDispatch.cancel'" icon="close-round" @click="cancel()" style="margin-top:5px;">取消派车</Button>
    <br><br>
    <Table 
      border 
      :columns="columns" 
      :data="rows" 
      :loading="loading"
      @on-selection-change="onTableSelectChange"
      ></Table>
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
    <!-- 修改或新增 -->
    <Modal v-model="dlgVisible" :title="dlgTitle" width="660">
      <Form ref="formData" :model="formData" :rules="formDataRules" :label-width="120">
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="调运计划名称：" prop="tpName">
              <Input @on-focus="onTransPlanInputFocus" v-model="formData.tpName" placeholder="请选择（必填）" />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="车牌号：" prop="truckNos">
              <Input @on-focus="onVehicleInputFocus" v-model="formData.truckNos" placeholder="请选择（必填）" />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="计划运输日期：" prop="transport_date">
              <DatePicker type="date" format="yyyy/MM/dd" v-model="formData.transport_date" placeholder="计划运输日期（必选）"></DatePicker>
            </FormItem>              
          </Col>
          <Col span="12">
            <FormItem label="计划运输次数：" prop="st_sum">
              <Input v-model.number="formData.st_sum" placeholder="请输入（必填）" />
            </FormItem>      
          </Col>
        </Row>
        <Row :gutter="12">
          <!-- <Col span="12">
            <FormItem label="是否自动结束：" prop="isauto_end">
              <RadioGroup v-model.number="formData.isauto_end">
                <Radio :label="1">是</Radio>
                <Radio :label="0">否</Radio>
              </RadioGroup> 
            </FormItem>      
          </Col> -->
          <Col span="12">
            <FormItem label="承运商：">
              <Select ref="carrierSelect" v-model="formData.cid" filterable clearable placeholder="请选择">
                <Option v-for="(item, index) in carriersList" :key="index" :value="item.id">{{item.deptName}}</Option>
              </Select>
            </FormItem>               
          </Col>
          <Col span="12">
            <FormItem label="备注：">
              <Input v-model="formData.memo" placeholder="请输入" type="textarea" />
            </FormItem>               
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="createSubmit()" :loading="modifyLoading">确定</Button>
        <Button type="default" @click="dlgVisible=false" >取消</Button>
      </div>
    </Modal>

    <!-- 选择调运计划 -->
    <selectTransPlanModal 
      v-if="isShowTransPlanModal"
      :value="formData.tpid"
      @on-close="onTransPlanModalClose"
      @on-change="onTransPlanModalChange"
      ></selectTransPlanModal>

    <!-- 选择内部车辆 -->
    <multipleInnerVehicleModal 
      v-if="isShowInnerVehicleModal"
      :value="formData.tids"
      @on-close="onVehicleModalClose"
      @on-change="onVehicleModalChange">
    </multipleInnerVehicleModal>
    
    <!-- 选择全部车辆 -->
    <multipleVehicleModal 
      v-if="isShowVehicleModal"
      :value="formData.tids"
      @on-close="onVehicleModalClose"
      @on-change="onVehicleModalChange">
    </multipleVehicleModal>
  </div>
</template>

<script>
  import multipleInnerVehicleModal from "../../../../../components/multipleInnerVehicleModal";
  import multipleVehicleModal from "../../../../../components/multipleVehicleModal";
  import selectTransPlanModal from "../../../../../components/selectTransPlanModal";
  export default {
    components: {
      multipleVehicleModal,
      multipleInnerVehicleModal,
      selectTransPlanModal
    },
    data() {
      return {
        dlgVisible: false,
        dlgTitle: "新增",
        dlgCancelVisible: false,
        dlgCancelForm: {
          assignTruckId: null,
          cancelMemo: ""
        },
        isShowTransPlanModal: false,
        isShowVehicleModal: false,
        isShowInnerVehicleModal: false,
        tpType: "", //当前选中的调运计划类型
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        vehicleNum: "",
        dispatchUser: "",
        dispatchState: null,
        startDate: "",
        endDate: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        currentRowData: [],
        carriersList: [],
        cardTypeList: {1:"运输卡",2:"出入卡"},
        dispatchStateList: {1:"已派车",2:"运输中",3:"已完成",4:"取消派车"},
        formData:{
          "tpName": "",
          "tpid": null,
          "tids": [],
          "truckNos": "",
          "transport_date": null,
          "st_sum": null,
          "cid": "",
          "isauto_end": 1,
          "memo": ""
        },
        formDataRules: {
          tpName: [
            { required: true, message: "调运计划不能为空", trigger: "change" }
          ],
          truckNos: [
            { required: true, message: "车牌号不能为空", trigger: "change" }
          ],
          transport_date: [
            { required: true, type: "date", message: "请选择计划运输日期", trigger: "change"}
          ],
          st_sum: [
            {
              required: true, 
              type: "method",
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error("计划运输次数不能为空"));
                }
                else if (!/^\+?[1-9][0-9]*$/.test(value)) {
                  callback(new Error("计划运输次数必须为>0的整数"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          isauto_end: [
            { required: true, type: "number", message: "到站不能为空", trigger: "change" }
          ]
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
            width: 95
          },
          {
            title: "车型",
            key: "truck_type_name",
            minWidth: 100
          },
          {
            title: "卡号",
            key: "card_no",
            minWidth: 100
          },
          {
            title: "调运计划名称",
            key: "plan_name",
            minWidth: 120
          },
          {
            title: "计划运输日期",
            key: "transport_date",
            minWidth: 120,
            render: (h, params) => {
              return h("span", this.$utils.formateDate( params.row.transport_date,'yyyy/MM/dd'));
            }
          },
          {
            title: "计划运输顺序号",
            key: "transport_sequence",
            minWidth: 130
          },
          {
            title: "调运始发站",
            key: "startBunkerName",
            minWidth: 120
          },
          {
            title: "调运终止站",
            key: "endBunkerName",
            minWidth: 120
          },
          {
            title: "承运商名称",
            key: "carrierName",
            minWidth: 110
          },
          {
            title: "派车人",
            key: "st_user",
            minWidth: 90
          },
          {
            title: "派车时间",
            key: "st_time",
            minWidth: 150
          },
          {
            title: "派车状态",
            key: "st_state",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.dispatchStateList[params.row.st_state]);
            }
          },
          {
            title: "备注",
            key: "memo",
            minWidth: 160
          }
        ]
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getDispatchList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getDispatchList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getDispatchList();
      },
      // 多选变化
      onTableSelectChange(selection) {
        this.currentRowData = selection;
      },
      // 日期组件
      onDatePickerChange(date) {
        this.startDate = date[0];
        this.endDate = date[1];
      },
      // 选择调运计划focus
      onTransPlanInputFocus() {
        this.isShowTransPlanModal = true;
      },
      // 关闭调运计划modal
      onTransPlanModalClose(value) {
        this.isShowTransPlanModal = value;
      },
      // 监听调运计划modal值变化
      onTransPlanModalChange(data) {
        this.formData.tpName = data.plan_name;
        this.formData.tpid = data.tpid;
        this.tpType = data.transport_type_code;
      },
      // 选择托运单focus
      onVehicleInputFocus() {
        if (this.formData.tpName) {
          // 自用：显示所有的车辆，不需要区分内外部车辆
          // 调运：显示内部的车辆
          if (this.tpType == 'transportType03' || this.tpType == 'transportType04') {
            this.isShowVehicleModal = true;
            this.isShowInnerVehicleModal = false;
          }
          else{
            this.isShowInnerVehicleModal = true;
            this.isShowVehicleModal = false;
          }
        }
        else {
          this.$Message.warning('请选选择调运计划');
        }
      },
      // 关闭车辆modal
      onVehicleModalClose(value) {
        this.isShowVehicleModal = value;
        this.isShowInnerVehicleModal = value;
      },
      // 监听车辆modal值变化
      onVehicleModalChange(data) {
        this.formData.tids = [];
        let truckNos = [];
        this.formData.truckNos = "";
        if (data.length) {
          data.forEach( item => {
            this.formData.tids.push(item.tid);
            truckNos.push(item.truck_no);
          })
          this.formData.truckNos = truckNos.join(",");
        }
      },
      // 取消
      cancel(data) {
        if (this.currentRowData.length == 0) {
          this.$Message.warning("请选择需要取消派车的车辆！");
          return;
        }
        let stids = [];
        for (let i=0;i<this.currentRowData.length;i++) {
          if (this.currentRowData[i].st_state != 1) {
            stids = [];
            this.$Message.warning({
              content: `只有【已派车】状态的车辆可以取消派车，请确认。`,
              duration: 8,
              closable: true
            });
            return;
          } else {
            stids.push(this.currentRowData[i].stid);
          }
        }
        this.$Modal.confirm({
          title: '提示',
          content:  `<p>确定<span style="color: red;font-size: 16px;"> 取消 </span>已选中的派车吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/transportPlan/cancelSendTruck", {
                dto: {
                  "stids": stids
                }
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success("取消派车成功！");
                this.getDispatchList();
              })
              .catch(err => {
                console.log(err)
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }
        });
      },
      // 新增
      create(){
        this.$refs["formData"].resetFields();
        this.$refs["carrierSelect"].setQuery(null);
        this.formData = {
          "tpName": "",
          "tpid": null,
          "tids": [],
          "truckNos": "",
          "transport_date": null,
          "st_sum": null,
          "cid": "",
          "isauto_end": 1,
          "memo": ""
        }
        this.tpType = "";
        this.dlgVisible = true;
        this.dlgTitle = "新增";
      },
      // 新增或者修改
      createSubmit(){

        this.$refs["formData"].validate(valid => {
          if (valid) {
            let params = Object.assign({},this.formData);
            params.transport_date = this.$utils.formateDate(params.transport_date, "yyyy/MM/dd");

            this.modifyLoading = true;
            this.$commonService
              .post("/transportPlan/addSendTruck", {
                dto: params
              })
              .then(res => {
                this.modifyLoading = false;
                
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success(`新增派车单成功！`);
                this.getDispatchList();
                this.dlgVisible = false;
              })
              .catch(err => {
                console.log(err)
                this.modifyLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });

      },
      // 获取派车单列表
      getDispatchList(){
        this.loading = true;
        this.$commonService
          .post("/transportPlan/getSendTruckList", {
            dto: {
              "currentPage": this.currentPage,
              "pageSize": this.pageSize,
              "st_timeEnd": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
              "st_timeStart": this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00"),
              "st_state": this.dispatchState || 0,
              "truck_no": this.vehicleNum
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
            this.currentRowData = [];

          })
          .catch(err => {
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 获取承运商列表
      getCarriersList() {
        this.$commonService
          .post("/dept/getCommonDept", {
            dto: {
              "currentPage": 1,
              "deptType": 4,
              "pageSize": 999
            }
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.carriersList = res.data;
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
    },
    watch: {
      tpType(newVal, oldVal) {
        this.formData.tids = [];
        this.formData.truckNos = "";
      }
    },
    mounted(){
      this.getCarriersList();
      this.getDispatchList();
    }
  }
</script>