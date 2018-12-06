<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm placement="bottom-start" placeholder="创建时间" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <Input placeholder="客户名称" v-model="customerName" clearable style="width: 200px;margin-top:5px;" />
    <Select v-model="isvalid" clearable placeholder="调拨单状态" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, index) in validList" :key="index" :value="index">{{item}}</Option>
    </Select>
    <Select v-model="spState" clearable placeholder="审批状态" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, index) in spStateList" :key="index" :value="index">{{item}}</Option>
    </Select>
    <Button v-auth="'coalTransfer.orderManage.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;" >查询</Button>
    <Button v-auth="'coalTransfer.orderManage.add'" type="warning" icon="plus-round" @click="create()" style="margin-top:5px;" >新增</Button>
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
            <FormItem label="销售方：" prop="sellerName">
              <Input placeholder="请输入（必填）" v-model="formData.sellerName" disabled/>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="客户方：" prop="customer_id">
              <Select ref="customerSelect" v-model="formData.customer_id" filterable placeholder="请选择（必填）">
                <Option v-for="(item, index) in customerList" :key="index" :value="item.id">{{item.deptName}}</Option>
              </Select>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="煤种：" prop="coal_id">
              <Select ref="coalTypeSelect" v-model="formData.coal_id" filterable placeholder="请选择（必填）">
                <Option v-for="(item, index) in coalTypeList" :key="index" :value="item.id">{{item.coalName + '（' + item.coalTypeName +'）'}}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="调拨总量：" prop="total">
              <Input v-model.number="formData.total" placeholder="请输入（必填）">
                <span slot="append">吨</span>
              </Input>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="调拨开始日期：" prop="start_date">
              <DatePicker type="date" format="yyyy/MM/dd" v-model="formData.start_date" placeholder="开始日期（必填）"></DatePicker>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="调拨终止日期：" prop="end_date">
              <DatePicker type="date" format="yyyy/MM/dd" v-model="formData.end_date" placeholder="终止日期（必填）"></DatePicker>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="发站：" prop="startpoint">
              <Input v-model="formData.startpoint" placeholder="请输入（必填）" ></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="到站：" prop="endpoint">
              <Input v-model="formData.endpoint" placeholder="请输入（必填）" ></Input>
            </FormItem>              
          </Col>
        </Row>
        <FormItem label="备注：">
          <Input v-model="formData.memo" placeholder="请输入" type="textarea" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="createSubmit()" :loading="modifyLoading">确定</Button>
        <Button type="default" @click="dlgVisible=false" >取消</Button>
      </div>
    </Modal>

    <!-- 详情 -->
    <Modal v-model="dlgDetailVisible" title="详情"  width="660">
      <Form :label-width="120" >
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="调拨单编号：">{{dlgDetail.ocode || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="煤种：">{{dlgDetail.coal_name || "--"}}</FormItem>           
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="调拨单状态：">{{dlgDetail.isvalid || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="审批状态：">{{dlgDetail.sp_state || "--"}}</FormItem>            
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="销售方：">{{ dlgDetail.sellerName || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="客户方：">{{ dlgDetail.customerName || "--"}}</FormItem>            
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="调拨总量：">{{$utils.formatNum(dlgDetail.total) || "--"}} 吨</FormItem> 
          </Col>
          <Col span="12">
            <FormItem label="实际调拨量：">{{$utils.formatNum(dlgDetail.total - dlgDetail.actualTotal)}} 吨</FormItem>
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="调拨开始日期：">{{dlgDetail.start_date || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="调拨终止日期：">{{dlgDetail.end_date || "--"}}</FormItem>         
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
            <FormItem label="创建人：">{{ dlgDetail.userName || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="创建时间：">{{dlgDetail.creation_time || "--"}}</FormItem>      
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="审批人：">{{ dlgDetail.sp_user || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="审批意见：">{{dlgDetail.sp_msg || "--"}}</FormItem>
          </Col>
        </Row>
        <FormItem label="备注：">{{dlgDetail.memo || "--"}}</FormItem>  
      </Form>
      <div slot="footer">
        <Button type="primary" @click="dlgDetailVisible=false">确定</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        dlgVisible: false,
        dlgTitle: "新增",
        dlgDetailVisible: false,
        dlgDetail:  {},
        validList: ["草稿","已生效","已终止","已过期"],
        spStateList: ["草稿","待审核","审核通过","审核打回"],
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        isvalid: null,
        spState: null,
        customerName: "",
        startDate: "",
        endDate: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        coalTypeList: [],
        customerList: [],
        formData:{
          "oid": null,
          "seller_id": null,
          "sellerName": "",
          "customer_id": null,
          "coal_id": null,
          "total": null,
          "start_date": null,
          "end_date": null,
          "startpoint": "",
          "endpoint": "",
          "memo": ""
        },
        formDataRules: {
          sellerName: [
            { required: true, message: "销售方不能为空", trigger: "blur" }
          ],
          customer_id: [
            { required: true, type: "number", message: "客户方不能为空", trigger: "blur" }
          ],
          coal_id: [
            { required: true, type: "number", message: "煤种不能为空", trigger: "change" }
          ],
          total: [
            {
              required: true, 
              type: "method",
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error("调拨总量不能为空"));
                }         
                else if (!/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(value) || value <= 0) {
                  callback(new Error("调拨总量必须为大于0的数字"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          start_date: [
            { required: true, type: "date", message: "请选择开始日期", trigger: "change"}
          ],
          end_date: [
            { required: true, type: "date", message: "请选择终止日期", trigger: "change"},
            {
              type: "method",
              validator: (rule, value, callback) => {
                try {
                  let t = value.getTime();
                  let beginDate = this.formData.start_date && this.formData.start_date.getTime();
                  if(!beginDate) {
                    callback(new Error("请先选择开始日期"));
                  }
                  else if (beginDate && t < beginDate) {
                    callback(new Error("终止日期不能早于开始日期"));
                  } 
                  else{
                    callback();
                  }
                } catch (error) {
                  callback();
                }
              },
              trigger: "change"
            }
          ],
          startpoint: [
            {
              type: "method",
              required: true,
              validator: (rule, value, callback) => {
                try {
                  if(!value) {
                    callback(new Error("发站不能为空"));
                  }
                  else if (value && value == this.formData.endpoint) {
                    callback(new Error("发站和到站地址不能一样"));
                  } 
                  else{
                    callback();
                  }
                } catch (error) {
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          endpoint: [
            {
              type: "method",
              required: true,
              validator: (rule, value, callback) => {
                try {
                  if(!value) {
                    callback(new Error("到站不能为空"));
                  }
                  else if (value && value == this.formData.startpoint) {
                    callback(new Error("发站和到站地址不能一样"));
                  } 
                  else{
                    callback();
                  }
                } catch (error) {
                  callback();
                }
              },
              trigger: "blur"
            }
          ]
        },
        columns: [
          {
            title: "调拨单编号",
            key: "ocode",
            fixed: "left",
            minWidth: 175
          },
          {
            title: "煤种",
            key: "coal_name",
            minWidth: 90
          },
          {
            title: "客户名称",
            key: "deptName",
            minWidth: 180
          },
          {
            title: "调拨总量(吨)",
            key: "total",
            minWidth: 120,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.total));
            }
          },
          {
            title: "调拨开始日期",
            key: "start_date",
            minWidth: 110
          },
          {
            title: "调拨终止日期",
            key: "end_date",
            minWidth: 110
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
            title: "调拨单状态",
            key: "isvalid",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.validList[params.row.isvalid]);
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
            width: 115,
            fixed: "right",
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
                      value: 'coalTransfer.orderManage.query'
                      }
                    ],
                  },
                  "详情"
                ),
                h(
                  "Dropdown", {
                    props: {
                      trigger: "click",
                      transfer: true
                    },
                    on: {
                      "on-click": (type) => {
                        switch(type){
                          case "edit":
                            (params.row.sp_state == 0 || params.row.sp_state == 3) ? 
                            this.edit(params.row) : this.$Message.warning("只有草稿及打回状态才可以修改！");
                            break;
                          case "approval":
                            (params.row.sp_state == 0 || params.row.sp_state == 3) ?
                            this.approval(params.row) : this.$Message.warning("只有草稿及打回状态才可以提交审核！");
                            break;
                          case "forbid": 
                            params.row.isvalid == 1 ?
                            this.forbid(params.row) : this.$Message.warning("只有生效状态的调拨单才可以终止！");
                            break;
                          case "delete":
                            (params.row.sp_state == 0 || params.row.sp_state == 3) ? 
                            this.delete(params.row) : this.$Message.warning("只有草稿及打回状态才可以删除！");
                            break;
                        }
                      }
                    },
                    scopedSlots: {
                      list: (props) => {
                        return h("DropdownMenu", [
                             h(
                              "DropdownItem", {
                                props: {
                                  name: "edit",
                                  disabled: params.row.sp_state == 1 || params.row.sp_state == 2
                                },
                                style: {
                                  textAlign: 'center'
                                },
                                directives: [
                                  {
                                  name: 'auth',
                                  value: 'coalTransfer.orderManage.modify'
                                  }
                                ],
                              },
                              "修改"
                            ),
                            h(
                              "DropdownItem", {
                                props: {
                                  name: "approval",
                                  disabled: params.row.sp_state == 1 || params.row.sp_state == 2
                                },
                                style: {
                                  textAlign: 'center'
                                },
                                directives: [
                                  {
                                  name: 'auth',
                                  value: 'coalTransfer.orderManage.add'
                                  }
                                ],
                              },
                              "提交审批"
                            ),
                            h(
                              "DropdownItem", {
                                props: {
                                  name: "forbid",
                                  disabled: params.row.isvalid != 1
                                },
                                style: {
                                  textAlign: 'center'
                                },
                                directives: [
                                  {
                                  name: 'auth',
                                  value: 'coalTransfer.orderManage.stop'
                                  }
                                ],
                              },
                              "终止"
                            ),
                            h(
                              "DropdownItem", {
                                props: {
                                  name: "delete",
                                  disabled: params.row.sp_state == 1 || params.row.sp_state == 2
                                },
                                style: {
                                  textAlign: 'center',
                                },
                                directives: [
                                  {
                                  name: 'auth',
                                  value: 'coalTransfer.orderManage.delete'
                                  }
                                ],
                              },
                              "删除"
                            ),
                          ]);
                      }
                    }
                  }, 
                  [
                    h(
                      "Button", {
                        props: {
                          type: 'ghost',
                          size: 'small'
                        }
                      }, [
                        "更多",
                        h("Icon", {
                          style: {
                            marginLeft: "5px"
                          },
                          props: {
                            type: "arrow-down-b"
                          }
                        })
                      ]
                    )
                  ]
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
        this.getOrderList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getOrderList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getOrderList();
      },
      // 日期组件
      onDatePickerChange(date) {
        this.startDate = date[0];
        this.endDate = date[1];
      },
      // 详情
      detail(data) {
        
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

            this.dlgDetail = res.data;
            this.dlgDetail.isvalid = this.validList[this.dlgDetail.isvalid];
            this.dlgDetail.sp_state = this.spStateList[this.dlgDetail.sp_state];
            this.dlgDetail.start_date = this.$utils.formateDate(this.dlgDetail.start_date,"yyyy/MM/dd");
            this.dlgDetail.end_date = this.$utils.formateDate(this.dlgDetail.end_date,"yyyy/MM/dd");

            this.dlgDetailVisible = true;

          })
          .catch(err => {
            this.$Modal.remove();
            err.msg && this.$Message.error(err.msg);
          });

      },
      // 终止
      forbid(data) {

        this.$Modal.confirm({
          title: '提示',
          content:  `<p>
            <span style="font-size: 14px;">调拨单终止后将同时终止调拨单下所有托运单。</span></p>
            确定<span style="color: red;font-size: 16px;"> 终止 </span>
            调拨单编号为<span style="color: red;font-size: 16px;"> ${data.ocode} </span>的调拨单吗？`,
          loading: true,
          onOk: () => {
            this.$commonService
              .get("/DBOrder/terminateDbOrder", {
                oId: data.oid
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("终止调拨单成功！");
                this.getOrderList();
              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }

        });
      },
      // 提交审核
      approval(data){

        this.$Modal.confirm({
          title: '提示',
          content:  `<p>确定<span style="color: red;font-size: 16px;"> 提交审批 </span>
                    调拨单编号为<span style="color: red;font-size: 16px;"> ${data.ocode} </span>的调拨单吗？</p>`,
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
                this.getOrderList();
              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }
        });
      },
      // 删除
      delete(data){

        this.$Modal.confirm({
          title: '提示',
          content:  `<p>确定<span style="color: red;font-size: 16px;"> 删除 </span>
                    调拨单编号为<span style="color: red;font-size: 16px;"> ${data.ocode} </span>的调拨单吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/DBOrder/deleteDbOrder", {
                oId: data.oid
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("删除成功！");
                this.getOrderList();
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
        this.$refs["coalTypeSelect"].setQuery(null);
        this.$refs["customerSelect"].setQuery(null);
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
        
        this.$refs["formData"].resetFields();
        this.$refs["coalTypeSelect"].setQuery(null);
        this.$refs["customerSelect"].setQuery(null);

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
                this.getOrderList();
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
      getOrderList(){
        
        this.loading = true;
        
        this.$commonService
          .post("/DBOrder/getDbOrderList", {
            dto: {
              "isvalid": this.isvalid == null ? -1 : this.isvalid,
              "sp_state": this.spState == null ? -1 : this.spState,
              "start_date": this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00"),
              "end_date": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
              "deptName": this.customerName,
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
    },
    mounted(){
      this.getCoalTypeList();
      this.getCustomerList();
      this.getOrderList();
    }
  }
</script>