<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm placement="bottom-start" placeholder="计划开始时间" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <Input placeholder="调运计划编号" v-model="planNum" clearable style="width: 200px;margin-top:5px;" />
    <Input placeholder="调运计划名称" v-model="planName" clearable style="width: 200px;margin-top:5px;" />
    <Select v-model="planType" clearable placeholder="计划类型" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, index) in planTypeList" :key="index" :value="item.value">{{item.label}}</Option>
    </Select>
    <Button v-auth="'coalTransportation.transPlanManage.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;" >查询</Button>
    <Button v-auth="'coalTransportation.transPlanManage.add'" type="warning" icon="plus-round" @click="create()" style="margin-top:5px;" >新增</Button>
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
            <FormItem label="计划名称：" prop="plan_name">
              <Input placeholder="请输入（必填）" v-model="formData.plan_name" />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="调运类型：" prop="transport_type">
              <Select @on-change="onSelectChange" v-model="formData.transport_type" placeholder="请选择（必填）">
                <Option v-for="(item, index) in planTypeList" :key="index" :value="item.value">{{item.label}}</Option>
              </Select>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="调运煤种：" prop="coal_id">
              <Select ref="coalTypeSelect" v-model="formData.coal_id" filterable placeholder="请选择（必选）">
                <Option v-for="(item, index) in coalTypeList" :key="index" :value="item.id">{{item.coalName + '（' + item.coalTypeName +'）'}}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="调运计划量：" prop="plan_num">
              <Input v-model.number="formData.plan_num" placeholder="请输入（必填）">
                <span slot="append">吨</span>
              </Input>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="调运始发站：" prop="departure_station_tid">
              <Select ref="startpointSelect" v-model="formData.departure_station_tid" clearable filterable placeholder="请选择（必选）">
                <Option v-for="(item, index) in coalBunkerList" :key="index" :value="item.id">{{item.bname}}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="调运终点站：" prop="terminal_station_tid">
              <Select ref="endpointSelect" v-model.number="formData.terminal_station_tid" clearable filterable placeholder="请选择（外部调运必选）">
                <Option v-for="(item, index) in coalBunkerList" :key="index" :value="item.id">{{item.bname}}</Option>
              </Select>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="计划开始日期：" prop="begin_date">
              <DatePicker type="date" format="yyyy/MM/dd" v-model="formData.begin_date" placeholder="开始日期（必填）"></DatePicker>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="计划终止日期：" prop="end_date">
              <DatePicker type="date" format="yyyy/MM/dd" v-model="formData.end_date" placeholder="终止日期（必填）"></DatePicker>
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
            <FormItem label="计划名称：">{{dlgDetail.plan_name || "--"}}</FormItem>           
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="计划编号：">{{dlgDetail.plan_code || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="审核状态：">{{dlgDetail.sp_state_str || "--"}}</FormItem>           
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="计划执行状态：">{{dlgDetail.plan_state_str || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="调运类型：">{{dlgDetail.transport_type_name || "--"}}</FormItem>            
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="煤种：">{{dlgDetail.coal_name || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="调运计划量：">{{ $utils.formatNum(dlgDetail.plan_num) || "--"}} 吨</FormItem>
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="计划开始日期：">{{dlgDetail.begin_date || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="计划终止日期：">{{dlgDetail.end_date || "--"}}</FormItem>         
          </Col>
        </Row>
        <Row :gutter="12">
          <Col span="12">
            <FormItem label="调运始发站：">{{dlgDetail.startBunkerName || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="调运终止站：">{{dlgDetail.endBunkerName || "--"}}</FormItem>   
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
            <FormItem label="审批人：">{{dlgDetail.sp_user || "--"}}</FormItem>
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
        planTypeList: [],
        planCode: "",
        planStateList: ["待生效","已生效","已终止","已过期"],
        spStateList: ["草稿","待审核","审核通过","审核打回"],
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        planNum: "",
        planName: "",
        planType: null,
        startDate: "",
        endDate: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        coalTypeList: [],
        coalBunkerList: [],
        formData:{
          "tpid": null,
          "plan_name": "",
          "coal_id": null,
          "transport_type": null,
          "plan_num": null,
          "departure_station_tid": null,
          "terminal_station_tid": null,
          "begin_date": null,
          "end_date": null,
          "memo": ""
        },
        formDataRules: {
          plan_name: [
            { required: true, message: "计划名称不能为空", trigger: "blur" }
          ],
          coal_id: [
            { required: true, type: "number", message: "调运煤种不能为空", trigger: "change" }
          ],
          transport_type: [
            { required: true, type: "number", message: "调运类型不能为空", trigger: "change" }
          ],
          departure_station_tid: [
            { required: true, type: "number", message: "调运起始地不能为空", trigger: "change" }
          ],
          terminal_station_tid: [
            {
              type: "method",
              validator: (rule, value, callback) => {
                if (!value && this.planCode == "transportType01") {
                  callback(new Error("外部调运终止地不能为空"));
                }    
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          plan_num: [
            {
              required: true, 
              type: "method",
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error("调运计划量不能为空"));
                }         
                else if (!/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(value) || value <= 0) {
                  callback(new Error("调运计划量必须为大于0的数字"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          begin_date: [
            { required: true, type: "date", message: "请选择开始日期", trigger: "change"}
          ],
          end_date: [
            { required: true, type: "date", message: "请选择终止日期", trigger: "change"},
            {
              type: "method",
              validator: (rule, value, callback) => {
                try {
                  let t = value.getTime();
                  let beginDate = this.formData.begin_date && this.formData.begin_date.getTime();
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
          ]
        },
        columns: [
          {
            title: "计划编号",
            key: "plan_code",
            fixed: "left",
            minWidth: 180
          },
          {
            title: "计划名称",
            key: "plan_name",
            minWidth: 150
          },
          {
            title: "煤种",
            key: "coal_name",
            minWidth: 95
          },
          {
            title: "调运类型",
            key: "transport_type_name",
            minWidth: 90
          },
          {
            title: "计划量(吨)",
            key: "plan_num",
            minWidth: 120,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.plan_num));
            }
          },
          {
            title: "起始站",
            key: "startBunkerName",
            minWidth: 120
          },
          {
            title: "终止站",
            key: "endBunkerName",
            minWidth: 120
          },
          {
            title: "计划开始日期",
            key: "begin_date",
            minWidth: 110
          },
          {
            title: "计划终止日期",
            key: "end_date",
            minWidth: 110
          },
          {
            title: "审核状态",
            key: "sp_state",
            minWidth: 100,
            render: (h, params) => {
              return h("span", this.spStateList[params.row.sp_state]);
            }
          },
          {
            title: "计划执行状态",
            key: "plan_state",
            minWidth: 110,
            render: (h, params) => {
              return h("span", this.planStateList[params.row.plan_state]);
            }
          },
          {
            title: "创建人",
            key: "userName",
            minWidth: 80
          },
          {
            title: "创建时间",
            key: "creation_time",
            minWidth: 150
          },
          {
            title: "操作",
            width: 114,
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
                      value: 'coalTransportation.transPlanManage.query'
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
                                  value: 'coalTransportation.transPlanManage.modify'
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
                                  value: 'coalTransportation.transPlanManage.add'
                                  }
                                ],
                              },
                              "提交审批"
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
                                  value: 'coalTransportation.transPlanManage.delete'
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
        this.getTransportPlanList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getTransportPlanList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getTransportPlanList();
      },
      // 日期组件
      onDatePickerChange(date) {
        this.startDate = date[0];
        this.endDate = date[1];
      },
      // 监听调运类型值变化
      onSelectChange(value) {
        for (let i=0;i<this.planTypeList.length;i++) {
          if (value == this.planTypeList[i].value) {
            this.planCode = this.planTypeList[i].code;
            break;
          }
        }
      },
      // 详情
      detail(data) {
        this.$commonService
          .get("/transportPlan/gettransportPlanInfo", {
            tpid: data.tpid
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.dlgDetail = res.data;
            this.dlgDetail.plan_state_str = this.planStateList[this.dlgDetail.plan_state];
            this.dlgDetail.transport_type_str = this.planTypeList[this.dlgDetail.transport_type-1];
            this.dlgDetail.sp_state_str = this.spStateList[this.dlgDetail.sp_state];
            this.dlgDetail.begin_date = this.$utils.formateDate(this.dlgDetail.begin_date,"yyyy/MM/dd");
            this.dlgDetail.end_date = this.$utils.formateDate(this.dlgDetail.end_date,"yyyy/MM/dd");
            this.dlgDetailVisible = true;
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 终止
      forbid(data) {
        this.$Modal.confirm({
          title: '提示',
          content:  `<p>确定<span style="color: red;font-size: 16px;"> 终止 </span>
            调运计划编号为<span style="color: red;font-size: 16px;"> ${data.plan_code} </span>的调运计划吗？</p>`,
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
                this.getTransportPlanList();
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
                    调运计划编号为<span style="color: red;font-size: 16px;"> ${data.plan_code} </span>的调运计划吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .get("/transportPlan/submitTransportPlan", {
                  tpid: data.tpid
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("提交审核成功！");
                this.getTransportPlanList();
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
                    调运计划编号为<span style="color: red;font-size: 16px;"> ${data.plan_code} </span>的调运计划吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .get("/transportPlan/deleteTrabsportPlan", {
                tpid: data.tpid
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success("删除调煤计划成功！");
                this.getTransportPlanList();
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
        this.$refs["startpointSelect"].setQuery(null);
        this.$refs["endpointSelect"].setQuery(null);
        this.$commonService
          .get("/transportPlan/gettransportPlanInfo", {
            tpid: data.tpid
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.formData = {
              "tpid": res.data.tpid,
              "plan_name": res.data.plan_name,
              "coal_id": res.data.coal_id,
              "transport_type": res.data.transport_type,
              "plan_num": res.data.plan_num,
              "departure_station_tid": res.data.departure_station_tid,
              "terminal_station_tid": res.data.terminal_station_tid,
              "begin_date": this.$utils.formateDate(res.data.begin_date,"yyyy/MM/dd"),
              "end_date": this.$utils.formateDate(res.data.end_date,"yyyy/MM/dd"),
              "memo": res.data.memo,
            }
            this.dlgVisible = true;
            this.dlgTitle = "修改";
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 新增
      create(){
        this.$refs["formData"].resetFields();
        this.$refs["coalTypeSelect"].setQuery(null);
        this.$refs["startpointSelect"].setQuery(null);
        this.$refs["endpointSelect"].setQuery(null);
        this.formData = {
          "tpid": null,
          "plan_name": "",
          "coal_id": null,
          "transport_type": null,
          "plan_num": null,
          "departure_station_tid": null,
          "terminal_station_tid": null,
          "begin_date": null,
          "end_date": null,
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
            params.begin_date = this.$utils.formateDate(params.begin_date, "yyyy/MM/dd 00:00:00");
            params.end_date = this.$utils.formateDate(params.end_date, "yyyy/MM/dd 23:59:59");
            params.terminal_station_tid = params.terminal_station_tid || null;
            this.modifyLoading = true;
            // 车辆状态:0表示草稿状态，1表示启用，2表示禁用
            let url = this.dlgTitle == '修改' ? "/transportPlan/updateTransportPlan" : "/transportPlan/addTransportPlan";
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
                this.getTransportPlanList();
                this.dlgVisible = false;
              })
              .catch(err => {
                err.msg && this.$Message.error(err.msg);
              });
          }
        });

      },
      // 获取调运单列表
      getTransportPlanList(){
        this.loading = true;
        this.$commonService
          .post("/transportPlan/gettransportPlanList", {
            dto: {
              "begin_date": this.$utils.formateDate(this.startDate, "yyyy/MM/dd 00:00:00"),
              "end_date": this.$utils.formateDate(this.endDate, "yyyy/MM/dd 23:59:59"),
              "currentPage": this.currentPage,
              "pageSize": this.pageSize,
              "plan_name": this.planName,
              "plan_code": this.planNum,
              "plan_state": -1,
              "sp_state": -1,
              "transport_type": this.planType
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
              item.begin_date = this.$utils.formateDate(item.begin_date, "yyyy/MM/dd");
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
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 字典表获取调运计划类型
      getPlanTypeList() {
        this.$commonService
          .get("/basisType/getBasisTypeListByCode", {
            "code": "transportType"
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.planTypeList = res.data;
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      }
    },
    mounted(){
      this.getCoalBunkersList();
      this.getCoalTypeList();
      this.getPlanTypeList();
      this.getTransportPlanList();
    }
  }
</script>