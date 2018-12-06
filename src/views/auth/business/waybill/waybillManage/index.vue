<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm  placement="bottom-start" placeholder="创建时间" style="width: 200px;margin-top: 5px;vertical-align: middle;"></DatePicker>
    <Input placeholder="承运商名称" v-model="carrierName" clearable style="width: 200px;margin-top: 5px;" />
    <Button v-auth="'waybill.waybillManage.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top: 5px;">查询</Button>
    <Button v-auth="'waybill.waybillManage.add'" type="warning" icon="plus-round" @click="create()" style="margin-top: 5px;">新增</Button>
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
      <Form ref="formData" :model="formData" :rules="formDataRules"  :label-width="120">
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="调拨单：" prop="orderNum">
              <Input @on-focus="onTransferOrderInputFocus" v-model="formData.orderNum" placeholder="请选择（必填）" />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="客户方：" prop="customer_name">
              <Input v-model.number="formData.customer_name" disabled placeholder="请选择调拨单" ></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="承运商：" prop="carrier_id">
              <Select ref="carrierSelect" v-model="formData.carrier_id" filterable clearable placeholder="请选择（必填）">
                <Option v-for="(item, index) in carriersList" :key="index" :value="item.id">{{item.deptName}}</Option>
              </Select>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="煤种：" prop="coal_name">
              <Input v-model.number="formData.coal_name" disabled placeholder="请选择调拨单" ></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="运单总量：" prop="total">
              <Input v-model.number="formData.total" placeholder="请输入（必填）" >
                <span slot="append">吨</span>
              </Input>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="运单开始日期：" prop="start_date">
              <Input v-model="formData.start_date" disabled placeholder="请选择调拨单" ></Input>
              <!-- <DatePicker disabled type="date" format="yyyy/MM/dd" v-model="formData.start_date" placeholder="请选择调拨单"></DatePicker> -->
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="运单终止日期：" prop="end_date">
              <Input v-model="formData.end_date" disabled placeholder="请选择调拨单" ></Input>
              <!-- <DatePicker disabled type="date" format="yyyy/MM/dd" v-model="formData.end_date" placeholder="请选择调拨单"></DatePicker> -->
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="发站：" prop="startpoint">
              <Input v-model="formData.startpoint" disabled placeholder="请选择调拨单" ></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="到站：" prop="endpoint">
              <Input v-model="formData.endpoint" disabled placeholder="请选择调拨单" ></Input>
            </FormItem>              
          </Col>
        </Row>
        <FormItem label="备注：">
          <Input v-model="formData.memo" placeholder="请输入" type="textarea" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="createSubmit()" :loading="modifyLoading">保存</Button>
        <Button type="default" @click="dlgVisible=false" >取消</Button>
      </div>
    </Modal>

    <!-- 详情 -->
    <Modal v-model="dlgDetailVisible" title="详情"  width="660">
      <Form :label-width="120">
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="托运单编号：">{{(dlgDetail.sendtruck_code || "--") + (waybillStateList[dlgDetail.isvalid-1] ? "（" + waybillStateList[dlgDetail.isvalid-1] + "）": "") }}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="调拨单编号：">{{dlgDetail.ocode || "--"}}</FormItem>
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="煤种：">{{dlgDetail.coal_name || "--"}}</FormItem>           
          </Col>
          <Col span="12">
            <FormItem label="承运商：">{{dlgDetail.carrierName || "--"}}</FormItem>            
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="托运单总量：">{{$utils.formatNum(dlgDetail.total) || 0}} 吨</FormItem> 
          </Col>
          <Col span="12">
            <FormItem label="实际托运量：">{{$utils.formatNum(dlgDetail.actualTotal) || 0}} 吨</FormItem>
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="托运开始日期：">{{dlgDetail.start_date || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="托运终止日期：">{{dlgDetail.end_date || "--"}}</FormItem>         
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="发站：">{{dlgDetail.startpoint || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="到站：">{{dlgDetail.endpoint || "--"}}</FormItem>   
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="创建人：">{{dlgDetail.userName || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="创建时间：">{{dlgDetail.creation_time || "--"}}</FormItem>      
          </Col>
        </Row>
        <FormItem label="备注：">
          {{dlgDetail.memo || "--"}}
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="dlgDetailVisible=false">确定</Button>
      </div>
    </Modal>
    <!-- 选择调拨单 -->
    <selectTransferOrderModal 
      v-if="isShowTransferOrderModal"
      :value="formData.oid"
      @on-close="onTransferOrderModalClose"
      @on-change="onTransferOrderModalChange"
      ></selectTransferOrderModal>

  </div>
</template>

<script>
  import selectTransferOrderModal from "../../../../../components/selectTransferOrderModal";
import { debug } from 'util';
  export default {
    components: {
      selectTransferOrderModal
    },
    data() {
      return {
        isShowTransferOrderModal: false,
        dlgVisible: false,
        dlgTitle: "新增",
        dlgDetailVisible: false,
        dlgDetail: {},
        loading: false, // 列表
        isSelectloading: false, //调拨单loading
        modifyLoading: false, // 新增修改
        orderCode: "",
        startDate: "",
        endDate: "",
        currentPage: 1,
        pageSize: 10,
        carrierName: "",
        totalCount: 0,
        rows: [],
        dbOrderList: [],
        carriersList: [],
        waybillStateList: ["生效", "终止", "过期"],
        formData:{
          "oid": null,
          "orderNum": "",
          "customer_id": null,
          "customer_name": "",
          "carrier_id": null,
          "coal_id": null,
          "coal_name": "",
          "total": null,
          "start_date": null,
          "end_date": null,
          "startpoint": "",
          "endpoint": "",
          "memo": ""
        },
        formDataRules: {
          orderNum: [
            { required: true, message: "调拨单编号不能为空", trigger: "change" }
          ],
          carrier_id: [
            { required: true, type: "number", message: "承运商不能为空", trigger: "change" }
          ],
          customer_name: [
            { required: true, message: "客户方不能为空", trigger: "blur" }
          ],
          coal_name: [
            { required: true, message: "煤种不能为空", trigger: "blur" }
          ],
          total: [
            {
              required: true, 
              type: "method",
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error("运单总量不能为空"));
                }
                else if (!/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(value) || value <= 0) {
                  callback(new Error("运单总量必须为大于0的数字"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          start_date: [
            { required: true, message: "请选择开始日期", trigger: "change"}
          ],
          end_date: [
            { required: true, message: "请选择终止日期", trigger: "change"}
          ],
          startpoint: [
            { required: true, message: "发站不能为空", trigger: "blur" }
          ],
          endpoint: [
            { required: true, message: "到站不能为空", trigger: "blur" }
          ]
        },
        columns: [
          {
            title: "托运单编号",
            key: "sendtruck_code",
            fixed: "left",
            minWidth: 180
          },
          {
            title: "煤种",
            key: "coal_name",
            minWidth: 80
          },
          {
            title: "承运商",
            key: "carrierName",
            minWidth: 120
          },
          {
            title: "托运单总量(吨)",
            key: "total",
            minWidth: 120,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.total));
            }
          },
          {
            title: "托运开始日期",
            key: "start_date",
            minWidth: 110
          },
          {
            title: "托运终止日期",
            key: "end_date",
            minWidth: 110
          },
          {
            title: "托运单状态",
            key: "isvalid",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.waybillStateList[params.row.isvalid - 1]);
            }
          },
          {
            title: "创建人",
            key: "userName",
            minWidth: 90
          },
          {
            title: "创建时间",
            key: "creation_time",
            minWidth: 150
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
                      value: 'waybill.waybillManage.query'
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
                       disabled: params.row.isvalid != 1
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.forbid(params.row);
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'waybill.waybillManage.stop'
                      }
                    ],
                  },
                  "终止"
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
        this.getWaybillList();
      },
      // 日期组件
      onDatePickerChange(date) {
        this.startDate = date[0];
        this.endDate = date[1];
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getWaybillList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getWaybillList();
      },
      // 选择托运单focus
      onTransferOrderInputFocus() {
        this.isShowTransferOrderModal = true;
      },
      // 关闭托运单modal
      onTransferOrderModalClose(value) {
        this.isShowTransferOrderModal = value;
      },
      // 监听调拨单modal值变化
      onTransferOrderModalChange(data) {
        this.formData.customer_id = null;
        this.formData.customer_name = "";
        this.formData.coal_id = null;
        this.formData.coal_name = "";
        this.formData.start_date = "";
        this.formData.end_date = "";
        this.formData.startpoint = "";
        this.formData.endpoint = "";
        this.formData.orderNum = data.ocode;
        this.formData.oid = data.oid;

        this.$commonService
        .get("/DBOrder/getDbOrderInfoByOId", {
          oId: data.oid
        })
        .then(res => {
          if(!res.success){
            this.$Message.error(res.msg);
            return;
          }
          this.formData.customer_id = res.data.customer_id;
          this.formData.customer_name = res.data.customerName;
          this.formData.coal_id = res.data.coal_id;
          this.formData.coal_name = res.data.coal_name;
          this.formData.start_date = this.$utils.formateDate(res.data.start_date, "yyyy/MM/dd");
          this.formData.end_date =  this.$utils.formateDate(res.data.end_date, "yyyy/MM/dd");
          this.formData.startpoint = res.data.startpoint;
          this.formData.endpoint = res.data.endpoint;
          this.formData.total = res.data.actualTotal;
        })
        .catch(err => {
          console.log(err);
          this.isSelectloading = false;
          err.msg && this.$Message.error(err.msg);
        });

      },
      // 获取托运单详情
      detail(data) {
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
            this.dlgDetail = res.data;
            this.dlgDetail.start_date = this.$utils.formateDate(this.dlgDetail.start_date, "yyyy/MM/dd");
            this.dlgDetail.end_date = this.$utils.formateDate(this.dlgDetail.end_date, "yyyy/MM/dd");
            this.dlgDetailVisible = true;
          })
          .catch(err => {
            this.modifyLoading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 终止
      forbid(data) {

        this.$Modal.confirm({
          title: '提示',
          content:  `<p>确定<span style="color: red;font-size: 16px;"> 终止 </span>
                    托运单编号为<span style="color: red;font-size: 16px;"> ${data.sendtruck_code} </span>的托运单吗？<br/>
                    <span style="color: red;font-size: 14px;">托运单终止后将同时终止托运单下所有派车单。</span></p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .get("/WayBill/terminateWayBill", {
                wbid: data.wbid
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("终止托运单成功！");
                this.getWaybillList();
              })
              .catch(err => {
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
          "oid": null,
          "orderNum": "",
          "customer_id": null,
          "customer_name": "",
          "carrier_id": null,
          "coal_id": null,
          "coal_name": "",
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

            this.modifyLoading = true;

            let params = Object.assign({}, this.formData);
            params.start_date = this.$utils.formateDate(params.start_date, "yyyy-MM-dd 00:00:00");
            params.end_date = this.$utils.formateDate(params.end_date, "yyyy-MM-dd 23:59:59");

            this.$commonService
              .post("/WayBill/addWayBill", {
                dto: params
              })
              .then(res => {
                this.modifyLoading = false;
                
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success(`${this.dlgTitle}成功！`);
                this.getWaybillList();
                this.dlgVisible = false;
              })
              .catch(err => {
                this.modifyLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });

      },
      // 获取已生效调拨单列表
      getDbOrderList(){

        this.$commonService
          .post("/DBOrder/getDbOrderList", {
            dto: {
              "isvalid": 1,
              "sp_state": -1,
              "ocode": "",
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

            this.dbOrderList = res.data;

          })
          .catch(err => {
            console.log(err)
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
      // 获取托运单列表
      getWaybillList() {
        this.loading = true;
        this.$commonService
          .post("/WayBill/getAllWayBill", {
            dto: {
              "currentPage": this.currentPage,
              "end_date": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
              "isvalid": -1,
              "pageSize": this.pageSize,
              "carrierName": this.carrierName,
              "start_date": this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00")
            }
          })
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.rows = res.data;
            this.rows.map(item => {
              item.start_date = this.$utils.formateDate(item.start_date, "yyyy/MM/dd");
              item.end_date = this.$utils.formateDate(item.end_date, "yyyy/MM/dd");
              return item;
            })

            this.totalCount = res.total;

          })
          .catch(err => {
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });

      }
    },
    mounted(){
      this.getDbOrderList();
      this.getCarriersList();
      this.getWaybillList();
    }
  }
</script>