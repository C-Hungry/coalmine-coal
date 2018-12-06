<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm  placement="bottom-start" placeholder="派车时间" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <Select v-model="dispatchState" filterable clearable placeholder="派车状态"  style="width: 200px;margin-top:5px;">
      <Option v-for="(value, key) in dispatchStateList" :key="key" :value="key">{{value}}</Option>
    </Select>
    <Input placeholder="车牌号" v-model="vehicleNum" clearable style="width: 200px;margin-top:5px;" />
    <Button v-auth="'transportProcess.vehicleDispatch.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button v-auth="'transportProcess.vehicleDispatch.add'" type="warning" icon="plus-round" @click="create()" style="margin-top:5px;">派车</Button>
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
    <!-- 修改或新增 -->
    <Modal v-model="dlgVisible" :title="dlgTitle" width="660">
      <Form ref="formData" :model="formData" :rules="formDataRules" :label-width="120">
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="托运订单：" prop="waybillNo">
              <Input @on-focus="onWaybillInputFocus" v-model="formData.waybillNo" placeholder="请选择（必填）" />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="车牌号：" prop="truckNo">
              <Input @on-focus="onVehicleInputFocus" v-model="formData.truckNo" placeholder="请选择（必填）" />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="煤种：" prop="coalName">
              <Input v-model="formData.coalName" disabled placeholder="请选择托运订单" />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="车辆类型：" prop="vehicleTypeName">
              <Input v-model.number="formData.vehicleTypeName" disabled placeholder="请选择车牌号" ></Input>
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="卡号：" prop="cardNo">
              <Input v-model="formData.cardNo" disabled placeholder="请选择车牌号" />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="卡类型：" prop="cardTypeName">
              <Input v-model="formData.cardTypeName" disabled placeholder="请选择车牌号" />
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="发站：" prop="startpoint">
              <Input v-model.number="formData.startpoint" disabled placeholder="请选择托运订单" ></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="到站：" prop="endpoint">
              <Input v-model.number="formData.endpoint" disabled placeholder="请选择托运订单" ></Input>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="12">
          <!-- <Col span="12">
            <FormItem label="预计运输时间：">
              <DatePicker type="datetime" v-model="formData.planTime" placeholder="预计运输时间"></DatePicker>
            </FormItem>              
          </Col> -->
          <!-- <Col span="12"> -->
            <FormItem label="备注：">
              <Input v-model="formData.memo" placeholder="请输入" type="textarea" />
            </FormItem>        
          <!-- </Col> -->
        </Row>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="createSubmit()" :loading="modifyLoading">确定</Button>
        <Button type="default" @click="dlgVisible=false" >取消</Button>
      </div>
    </Modal>

    <!-- 取消派车 -->
    <Modal v-model="dlgCancelVisible" title="取消派车">
      <br/>
      <Form :label-width="100" ref="dlgCancelForm" :model="dlgCancelForm" :rules="dlgCancelFormRules">
        <FormItem label="取消原因：" prop="cancelMemo">
          <Input v-model="dlgCancelForm.cancelMemo" placeholder="请输入取消派车原因（必填）" type="textarea" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="onCancelOk">确定</Button>
        <Button type="default" @click="dlgCancelVisible=false">取消</Button>
      </div>
    </Modal>

    <!-- 详情 -->
    <Modal v-model="dlgDetailVisible" title="详情"  width="660">
      <Form :label-width="100" >
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="派车单编号：">{{dlgDetail.assignTruckNum}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="状态：">{{dispatchStateList[dlgDetail.truckState]}}</FormItem>            
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="客户名称：">{{dlgDetail.customerName}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="承运商名称：">{{dlgDetail.transportName}}</FormItem>            
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="煤种：">{{dlgDetail.coalName}}</FormItem>           
          </Col>
          <Col span="12">
            <FormItem label="派车装车量：">{{$utils.formatNum(dlgDetail.loadTruckWeight)}} 吨</FormItem> 
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="车牌号：">{{dlgDetail.truckNo}}</FormItem>           
          </Col>
          <Col span="12">
            <FormItem label="车辆类型：">{{dlgDetail.truckTypeName}}</FormItem> 
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="卡号：">{{dlgDetail.cardNo}}</FormItem>           
          </Col>
          <Col span="12">
            <FormItem label="卡类型：">{{cardTypeList[dlgDetail.cardType-1]}}</FormItem> 
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="发站：">{{dlgDetail.startpoint}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="到站：">{{dlgDetail.endpoint}}</FormItem>   
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="创建人：">{{dlgDetail.creatorUserName}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="创建时间：">{{dlgDetail.creationTime}}</FormItem>      
          </Col>
        </Row>
        <Row :gutter="12">
          <!-- <Col span="12">
            <FormItem label="预计运输时间：">{{dlgDetail.planTime}}</FormItem>
          </Col> -->
          <Col span="12">
            <FormItem label="备注：">{{dlgDetail.memo}}</FormItem>      
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="dlgDetailVisible=false">确定</Button>
      </div>
    </Modal>

    <!-- 选择托运单 -->
    <selectWaybillModal 
      v-if="isShowWaybillModal"
      :value="formData.waybillId"
      @on-close="onWaybillModalClose"
      @on-change="onWaybillModalChange"
      ></selectWaybillModal>

    <!-- 选择车辆 -->
    <selectVehicleModal 
      v-if="isShowVehicleModal"
      type="forDispatchTruck"
      :value="formData.truckId"
      @on-close="onVehicleModalClose"
      @on-change="onVehicleModalChange"
      ></selectVehicleModal>
  </div>
</template>

<script>
  import selectVehicleModal from "../../../../../components/selectVehicleModal";
  import selectWaybillModal from "../../../../../components/selectWaybillModal";
  export default {
    components: {
      selectVehicleModal,
      selectWaybillModal
    },
    data() {
      return {
        dlgVisible: false,
        dlgTitle: "新增",
        dlgDetailVisible:  false,
        dlgDetail: {},
        dlgCancelVisible: false,
        dlgCancelForm: {
          assignTruckId: null,
          cancelMemo: ""
        },
        isShowWaybillModal: false,
        isShowVehicleModal: false,
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
        waybillList:[], //托运单
        vehicleList: [], //车辆列表
        cardTypeList: ["运输卡","出入卡"],
        dispatchStateList: {1:"已派车",2:"已取消",3:"已终止"},
        formData:{
          "waybillId": null,
          "waybillNo": "",
          "truckId": null,
          "truckNo": "",
          "coalId": null,
          "coalName": "",
          "cardNo": "",
          "cardType": "",
          "cardTypeName": "",
          "vehicleTypeName": "",
          "planTime": null,
          "customerId": null,
          "carrierId": null,
          "startpoint": "",
          "endpoint": "",
          "memo": ""
        },
        formDataRules: {
          waybillNo: [
            { required: true, message: "托运单编号不能为空", trigger: "change" }
          ],
          truckNo: [
            { required: true, message: "车牌号不能为空", trigger: "change" }
          ],
          coalName: [
            { required: true, message: "煤种不能为空", trigger: "blur" }
          ],
          cardNo: [
            { required: true, message: "卡号不能为空", trigger: "blur" }
          ],
          cardTypeName: [
            { required: true, message: "卡类型不能为空", trigger: "blur" }
          ],
          vehicleTypeName: [
            { required: true, message: "车辆类型不能为空", trigger: "blur" }
          ],
          planTime: [
            { required: true, type: "date", message: "请选择预计运输时间", trigger: "change"}
          ],
          startpoint: [
            { required: true, message: "发站不能为空", trigger: "blur" }
          ],
          endpoint: [
            { required: true, message: "到站不能为空", trigger: "blur" }
          ]
        },
        dlgCancelFormRules: {
          cancelMemo: [
            { required: true, message: "取消原因不能为空", trigger: "blur" }
          ],
        },
        columns: [
          {
            title: "派车单编号",
            key: "assignTruckNum",
            fixed: "left",
            minWidth: 180
          },
          {
            title: "车牌号",
            key: "truckNo",
            minWidth: 95
          },
          {
            title: "卡号",
            key: "cardNo",
            minWidth: 95
          },
          {
            title: "煤种",
            key: "coalName",
            minWidth: 90
          },
          {
            title: "派车装车量",
            key: "loadTruckWeight",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.loadTruckWeight));
            }
          },
          {
            title: "派车状态",
            key: "truckState",
            minWidth: 90,
            render: (h, params) => {
              return h("span", this.dispatchStateList[params.row.truckState]);
            }
          },
          {
            title: "派车人",
            key: "assignTruckUser",
            minWidth: 90
          },
          {
            title: "派车时间",
            key: "assignTruckTime",
            minWidth: 150
          },
          {
            title: "备注",
            key: "memo",
            minWidth: 160
          },
          {
            title: "操作",
            width: 105,
            fixed: "right",
            align: "center",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small"
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.detail(params.row);
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'transportProcess.vehicleDispatch.query'
                      }
                    ],
                  },
                  "详情"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small",
                      disabled: params.row.truckState != 1
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.cancel(params.row);
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'transportProcess.vehicleDispatch.cancel'
                      }
                    ],
                  },
                  "取消"
                ),
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
      // 日期组件
      onDatePickerChange(date) {
        this.startDate = date[0];
        this.endDate = date[1];
      },
      // 选择托运单focus
      onWaybillInputFocus() {
        this.isShowWaybillModal = true;
      },
      // 关闭托运单modal
      onWaybillModalClose(value) {
        this.isShowWaybillModal = value;
      },
      // 监听托运单modal值变化
      onWaybillModalChange(data) {

        this.$commonService
          .get("/WayBill/getWayBillInfo", {
            wbid: data.wbid
          })
          .then(res => {
            this.modifyLoading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.formData.waybillId = res.data.wbid;
            this.formData.waybillNo = res.data.sendtruck_code;
            this.formData.coalName = res.data.coal_name;
            this.formData.coalId = res.data.coal_id;
            this.formData.startpoint = res.data.startpoint;
            this.formData.endpoint = res.data.endpoint;
            this.formData.carrierId = res.data.carrier_id;
            this.formData.customerId = res.data.customer_id;
          })
          .catch(err => {
            this.modifyLoading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 选择托运单focus
      onVehicleInputFocus() {
        this.isShowVehicleModal = true;
      },
      // 关闭车辆modal
      onVehicleModalClose(value) {
        this.isShowVehicleModal = value;
      },
      // 监听车辆modal值变化
      onVehicleModalChange(data) {
        this.formData.truckId = data.tid;
        this.formData.truckNo = data.truck_no;
        this.formData.vehicleTypeName = data.truck_type_name;
        this.$commonService
          .post("/card/getTransportCardList", {
            dto: {
              "cardNo": "",
              "cardType": -1,
              "truckNo": data.truck_no,
              "cardState": -1,
              "currentPage": 1,
              "pageSize": 10,
              "endTime": "",
              "startTime": ""
            }
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            let cardTypeList = ["运输卡","出入卡"];

            this.formData.cardNo = res.data[0].cardNo;
            this.formData.cardType = res.data[0].cardType;
            this.formData.cardTypeName = cardTypeList[res.data[0].cardType-1];

          })
          .catch(err => {
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 详情
      detail(data) {
        this.$commonService
          .post("/assignTruck/getAssignTruckDetail", {
            assignTruckId: data.stid
          })
          .then(res => {

            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.dlgDetail = res.data;
            this.dlgDetailVisible = true;

          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 取消
      cancel(data) {
        this.$refs["dlgCancelForm"].resetFields();

        this.dlgCancelVisible = true;
        this.dlgCancelForm.assignTruckId = data.stid;
        this.dlgCancelForm.cancelMemo = "";
      },
      // 取消OK
      onCancelOk() {

        this.$refs["dlgCancelForm"].validate(valid => {
          if (valid) {
            this.$commonService
              .post("/assignTruck/cancelAssignTruck", this.dlgCancelForm)
              .then(res => {

                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.dlgCancelVisible = false;
                this.getDispatchList();
              })
              .catch(err => {
                err.msg && this.$Message.error(err.msg);
              });
          }
        })
        
      },
      // 新增
      create(){
        this.$refs["formData"].resetFields();
        this.formData = {
          "waybillId": null,
          "truckId": null,
          "truckNo": "",
          "coalId": null,
          "coalName": "",
          "cardNo": "",
          "cardType": "",
          "cardTypeName": "",
          "vehicleTypeName": "",
          "planTime": null,
          "customerId": null,
          "carrierId": null,
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
            // params.planTime = this.$utils.formateDate(params.planTime,"yyyy/MM/dd HH:mm:ss");

            this.modifyLoading = true;
            this.$commonService
              .post("/assignTruck/addAssignTruck", {
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
          .post("/assignTruck/queryAssignTruckList", {
            dto: {
              "assignTruckState": this.dispatchState || -1,
              "assignTruckUser": "",
              "currentPage": this.currentPage,
              "startTime":  this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00"),
              "endTime": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
              "pageSize":this.pageSize,
              "truckNo": this.vehicleNum
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
    },
    mounted(){
      this.getDispatchList();
    }
  }
</script>