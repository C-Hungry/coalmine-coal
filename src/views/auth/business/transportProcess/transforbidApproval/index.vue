<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm placement="bottom-start" placeholder="申请时间" style="width: 200px;;margin-top:5px;vertical-align:middle;"></DatePicker>
    <Input placeholder="车牌号" v-model="truckNo" clearable style="width: 200px;margin-top:5px;" />
    <Select v-model="spState" placeholder="审批状态" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, index) in spStateList" :key="index+1" :value="index+1">{{item}}</Option>
    </Select>
    <Button v-auth="'transportProcess.transforbidApproval.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
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
        <FormItem label="审批：" prop="applyStatus">
          <RadioGroup v-model="formData.applyStatus">
            <Radio :label="2"><span>通过</span></Radio>
            <Radio :label="3"><span>不通过</span></Radio>
          </RadioGroup>  
        </FormItem> 
        <FormItem label="审批意见：" prop="memo">
          <Input v-model="formData.memo" placeholder="请输入" type="textarea" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="approval">确定</Button>
        <Button type="default" @click="dlgApprovalVisible=false">取消</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        dlgApprovalVisible: false,
        loading: false, // 列表
        truckNo: "",
        startTime: "",
        endTime: "",
        spState: 1,
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        spStateList: ["待审核","审核通过","审核打回"],
        formData:{
          "stopId": null,
          "applyStatus": 2,
          "memo": ""
        },
        formDataRules: {
          applyStatus: [
            { required: true, type: "number", message: "请选择是否通过", trigger: "blur" }
          ],
          memo: [
            {
              type: "method",
              validator: (rule, value, callback) => {
                try {
                  if(this.formData.applyStatus == 3 && !value) {
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
          ]
        },
        columns: [
          {
            title: "车牌号",
            key: "truckNo",
            fixed: "left",
            minWidth: 100
          },
          {
            title: "车型",
            key: "truckTypeName",
            minWidth: 90
          },
          {
            title: "申请状态",
            key: "applyStatus",
            minWidth: 90
          },
          {
            title: "申请人",
            key: "applyUser",
            minWidth: 90
          },
          {
            title: "申请时间",
            key: "applyTime",
            minWidth: 150
          },
          {
            title: "申请原因",
            key: "applyMemo",
            minWidth: 140
          },
          {
            title: "审批人",
            key: "auditUser",
            minWidth: 90
          },
          {
            title: "审批时间",
            key: "auditTime",
            minWidth: 150
          },
          {
            title: "审批意见",
            key: "auditMemo",
            minWidth: 140
          },
          {
            title: "操作",
            width: 90,
            fixed: "right",
            align: "center",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "warning",
                      size: "small",
                      disabled: params.row.applyStatus != "待审核"
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.dlgApprovalVisible = true;
                        this.formData = {
                          "stopId": params.row.sid,
                          "applyStatus": 2,
                          "memo": ""
                        }
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'transportProcess.transforbidApproval.approve'
                      }
                    ],
                  },
                  "审批"
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
        this.getTransportStopList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getTransportStopList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getTransportStopList();
      },
      // 日期组件
      onDatePickerChange(date) {
        this.startTime = date[0];
        this.endTime = date[1];
      },
      // 审批
      approval(data) {
        this.$refs["formData"].validate(valid => {
          if (valid) {
            this.$commonService
              .post("/transportStop/check", this.formData)
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success("审批已完成！");
                this.dlgApprovalVisible = false;
                this.getTransportStopList();
              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }
        })
      },
      // 获取运销终止列表
      getTransportStopList(){
        this.loading = true;
        this.$commonService
          .post("/transportStop/listTransportStops", {
            dto: {
              "currentPage": this.currentPage,
              "endTime": this.$utils.formateDate(this.endTime, "yyyy-MM-dd 23:59:59"),
              "pageSize": this.pageSize,
              "startTime": this.$utils.formateDate(this.startTime, "yyyy-MM-dd 00:00:00"),
              "applyStatusNum": this.spState,
              "truckNo": this.truckNo
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
      this.getTransportStopList();
    }
  }
</script>