<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <DatePicker type="daterange" format="yyyy/MM/dd" @on-change="onDatePickerChange" confirm placement="bottom-start" placeholder="申请时间" style="width: 200px;;margin-top:5px;vertical-align:middle;"></DatePicker>
    <Input placeholder="车牌号" v-model="truckNo" clearable style="width: 200px;margin-top:5px;" />
    <Button v-auth="'transportProcess.processForbid.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button v-auth="'transportProcess.processForbid.add'" type="warning" icon="plus-round" @click="create()" style="margin-top:5px;">新增终止</Button>
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
    <Modal v-model="dlgVisible" :title="dlgTitle">
      <Form ref="formData" :model="formData" :rules="formDataRules"  :label-width="120">
        <FormItem label="车牌号：" prop="truckNo">
          <Input @on-focus="onVehicleInputFocus" v-model.number="formData.truckNo" placeholder="请输入（必填）" ></Input>
        </FormItem>
        <FormItem label="申请原因：" prop="memo">
          <Input v-model="formData.memo" placeholder="请输入" type="textarea" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="createSubmit()" :loading="modifyLoading">确定</Button>
        <Button type="default" @click="dlgVisible=false" >取消</Button>
      </div>
    </Modal>

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
  export default {
    components: {
      selectVehicleModal
    },
    data() {
      return {
        isShowVehicleModal: false,
        dlgVisible: false,
        dlgTitle: "新增终止",
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        truckNo: "",
        startTime: "",
        endTime: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        formData:{
          "stopId": null,
          "truckId": null,
          "truckNo": "",
          "memo": ""
        },
        formDataRules: {
          truckNo: [
            { required: true, message: "车牌号不能为空", trigger: "change" }
          ],
          memo: [
            { required: true, message: "申请终止原因不能为空", trigger: "blur" }
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
            minWidth: 100
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
            width: 143,
            fixed: "right",
            align: "center",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "success",
                      size: "small",
                      disabled: params.row.applyStatus == "待审核" || params.row.applyStatus == "审核通过"
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
                      value: 'transportProcess.processForbid.modify'
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
                      disabled: params.row.applyStatus == "待审核" || params.row.applyStatus == "审核通过"
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.approval(params.row);
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'transportProcess.processForbid.add'
                      }
                    ],
                  },
                  "提交"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small",
                      disabled: params.row.applyStatus == "待审核" || params.row.applyStatus == "审核通过"
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
                      value: 'transportProcess.processForbid.delete'
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
      },
      // 删除
      delete(data) {
        this.$Modal.confirm({
          title: '提示',
          content:  `<p>确定<span style="color: red;font-size: 16px;"> 删除 </span>
                    车牌号为<span style="color: red;font-size: 16px;"> ${data.truckNo} </span>的终止流程吗？</p>`,
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
      // 提交
      approval(data) {
        this.$Modal.confirm({
          title: '提示',
          content:  `<p>确定<span style="color: red;font-size: 16px;"> 提交审核 </span>
                    车牌号为<span style="color: red;font-size: 16px;"> ${data.truckNo} </span>的终止流程吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/transportStop/submitById", {
                stopId: data.sid
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success("提交审核成功！");
                this.getTransportStopList();
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
        this.formData = {
          "stopId": null,
          "truckId": null,
          "truckNo": "",
          "memo": ""
        }
        this.dlgVisible = true;
        this.dlgTitle = "新增";
      },
      // 修改
      edit(data){
        this.$refs["formData"].resetFields();
        this.formData = {
          "stopId": data.sid,
          "truckId": data.truckId,
          "truckNo": data.truckNo,
          "memo": data.applyMemo
        }
        this.dlgVisible = true;
        this.dlgTitle = "修改";
      },
      // 新增或者修改
      createSubmit(){
        this.$refs["formData"].validate(valid => {
          if (valid) {
            let params = Object.assign({},this.formData);
            this.modifyLoading = true;

            // 车辆状态:0表示草稿状态，1表示启用，2表示禁用
            let url = this.dlgTitle == '修改' ? "/transportStop/updateTransportStop" : "/transportStop/saveTransportStop";
            this.$commonService
              .post(url, { dto: params})
              .then(res => {
                this.modifyLoading = false;
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success(`${this.dlgTitle}成功！`);
                this.getTransportStopList();
                this.dlgVisible = false;
              })
              .catch(err => {
                this.modifyLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });
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
              "applyStatusNum": -1,
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