<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm placement="bottom-start" placeholder="申请时间" style="width: 200px;margin-top:5px;vertical-align: middle;"></DatePicker>
    <Input placeholder="车牌号" v-model="customerName" clearable style="width: 200px;margin-top:5px;" />
    <Select v-model="spState" placeholder="审批状态" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, index) in spStateList" :key="index+1" :value="index+1">{{item}}</Option>
    </Select>
    <Button v-auth="'coalTransfer.orderApproval.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
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
            <FormItem label="调拨总量：">{{dlgDetail.total || "--"}} 吨</FormItem> 
          </Col>
          <Col span="12">
            <FormItem label="实际调拨量：">{{dlgDetail.isretreat_coal}} 吨</FormItem>
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
            <FormItem label="审批意见：">{{dlgDetail.sp_msg || "--"}}</FormItem>
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
        validList: ["草稿","已生效","已终止","已过期"],
        spStateList: ["待审核","审核通过","审核打回"],
        dlgApprovalVisible: false,
        dlgApproval: {},
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        isvalid: null,
        spState: 1,
        customerName: "",
        startDate: "",
        endDate: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        formData:{
          "oid": null,
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
            title: "车牌号",
            key: "ocode",
            fixed: "left",
            minWidth: 100
          },
          {
            title: "卡号",
            key: "ocode",
            minWidth: 100
          },
          {
            title: "煤种",
            key: "coal_name",
            minWidth: 100
          },
          {
            title: "原皮重",
            key: "deptName",
            minWidth: 100
          },
          {
            title: "新皮重",
            key: "deptName",
            minWidth: 100
          },
          {
            title: "原毛重",
            key: "deptName",
            minWidth: 100
          },
          {
            title: "新毛重",
            key: "deptName",
            minWidth: 100
          },
          {
            title: "原净重",
            key: "deptName",
            minWidth: 120
          },
          {
            title: "新净重",
            key: "deptName",
            minWidth: 100
          },
          {
            title: "修改时运销状态",
            key: "total",
            minWidth: 140
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
            title: "申请人",
            key: "userName",
            minWidth: 100
          },
          {
            title: "申请时间",
            key: "creation_time",
            minWidth: 140
          },
          {
            title: "操作",
            width: 125,
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
                      value: 'coalTransfer.orderApproval.query'
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
                      disabled: params.row.sp_state != 1 || params.row.isvalid == 3
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.dlgApprovalVisible = true;
                        this.formData = {
                          "oid": params.row.oid,
                          "sp_node": 2,
                          "sp_msg": ""
                        }
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'coalTransfer.orderApproval.approve'
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
            this.dlgDetail.sp_state = this.spStateList[this.dlgDetail.sp_state-1];
            this.dlgDetail.start_date = this.$utils.formateDate(this.dlgDetail.start_date,"yyyy/MM/dd");
            this.dlgDetail.end_date = this.$utils.formateDate(this.dlgDetail.end_date,"yyyy/MM/dd");

            this.dlgDetailVisible = true;

          })
          .catch(err => {
            this.$Modal.remove();
            err.msg && this.$Message.error(err.msg);
          });
          
      },
      // 审批
      approval(data){

        this.$refs["formData"].validate(valid => {
          if (valid) {

            this.$commonService
              .post("/DBOrder/approveDbOrder", {
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

                this.getOrderList();

              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });

          }
        })

      },
      // 获取调拨单
      getOrderList(){
        this.loading = true;
        this.$commonService
          .post("/DBOrder/getDbOrderList", {
            dto: {
              "isvalid": this.isvalid == null ? -1 : this.isvalid,
              "sp_state": this.spState == null ? -1 : this.spState,
              "start_date":  this.$utils.formateDate(this.startDate, "yyyy-MM-dd 00:00:00"),
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
      }
    },
    mounted(){
      this.getOrderList();
    }
  }
</script>