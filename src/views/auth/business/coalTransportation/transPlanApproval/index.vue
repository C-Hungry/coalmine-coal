<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm placement="bottom-start" placeholder="计划开始时间" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <Input placeholder="调运计划编号" v-model="planNum" clearable style="width: 200px;margin-top:5px;" />
    <Input placeholder="调运计划名称" v-model="planName" clearable style="width: 200px;margin-top:5px;" />
    <Select v-model="spState" placeholder="审批状态" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, index) in spStateList" :key="index+1" :value="index+1">{{item}}</Option>
    </Select>
    <Button v-auth="'coalTransportation.transPlanApproval.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;" >查询</Button>
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
    <!-- 审核 -->
    <Modal v-model="dlgApprovalVisible" title="审批">
      <Form :label-width="120" ref="formData" :model="formData" :rules="formDataRules">
        <FormItem label="审批：" prop="sp_node">
          <RadioGroup v-model="formData.sp_node">
            <Radio :label="2"><span>通过</span></Radio>
            <Radio :label="3"><span>不通过</span></Radio>
          </RadioGroup>  
        </FormItem> 
        <FormItem label="审批意见：" prop="sp_msg">
          <Input v-model="formData.sp_msg" placeholder="请输入" type="textarea" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="approval">确定</Button>
        <Button type="default" @click="dlgApprovalVisible=false">取消</Button>
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
            <FormItem label="调运计划量：">{{$utils.formatNum(dlgDetail.plan_num) || "--"}} 吨</FormItem>
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
            <FormItem label="审批意见：">{{dlgDetail.sp_msg  || "--"}}</FormItem>
          </Col>
          <Col span="12">
            <FormItem label="备注：">{{dlgDetail.memo || "--"}}</FormItem>  
          </Col>
        </Row>
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
        dlgDetailVisible: false,
        dlgDetail:  {},
        dlgApprovalVisible: false,
        planStateList: ["待生效","已生效","已终止","已过期"],
        spStateList: ["待审核","审核通过","审核打回"],
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        spState: 1,
        planNum: "",
        planName: "",
        startDate: "",
        endDate: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        formData:{
          "tpid": null,
          "sp_node": 2,
          "sp_msg": ""
        },
        formDataRules: {
          sp_msg: [
            {
              type: "method",
              validator: (rule, value, callback) => {
                try {
                  if(this.formData.sp_node == 3 && !value) {
                    callback(new Error("不通过时，审批意见不能为空"));
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
          sp_node: [
            { required: true, type: "number", message: "请选择是否通过", trigger: "blur" }
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
              return h("span", this.spStateList[params.row.sp_state-1]);
            }
          },
          {
            title: "计划执行状态",
            key: "plan_state",
            minWidth: 120,
            render: (h, params) => {
              return h("span", this.planStateList[params.row.plan_state]);
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
            width: 106,
            align: "center",
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
                      value: 'coalTransportation.transPlanApproval.query'
                      }
                    ],
                  },
                  "详情"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "warning",
                      size: "small",
                      disabled: params.row.sp_state != 1
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.dlgApprovalVisible = true;
                        this.formData = {
                          "tpid": params.row.tpid,
                          "sp_node": 2,
                          "sp_msg": ""
                        }
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'coalTransportation.transPlanApproval.approve'
                      }
                    ],
                  },
                  "审批"
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
            this.dlgDetail.sp_state_str = this.spStateList[this.dlgDetail.sp_state-1];
            this.dlgDetail.begin_date = this.$utils.formateDate(this.dlgDetail.begin_date,"yyyy/MM/dd");
            this.dlgDetail.end_date = this.$utils.formateDate(this.dlgDetail.end_date,"yyyy/MM/dd");

            this.dlgDetailVisible = true;

          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });

      },
      // 提交审核
      approval(data){
        this.$refs["formData"].validate(valid => {
          if (valid) {
            this.$commonService
              .post("/transportPlan/approveTransportPlan", {
                dto: this.formData
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success("审批已完成！");
                this.dlgApprovalVisible = false;
                this.getTransportPlanList();
              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }
        })
      },
      // 获取调运单列表
      getTransportPlanList(){
        this.loading = true;
        this.$commonService
          .post("/transportPlan/gettransportPlanList", {
            dto: {
              "begin_date": this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00"),
              "end_date": this.$utils.formateDate(this.endDate, "yyyy-MM-dd 23:59:59"),
              "currentPage": this.currentPage,
              "pageSize": this.pageSize,
              "plan_name": this.planName,
              "plan_code": this.planNum,
              "sp_state": this.spState,
              "plan_state": -1,
              "transport_type": null
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
      }
    },
    mounted(){
      this.getTransportPlanList();
    }
  }
</script>