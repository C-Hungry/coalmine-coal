<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <Input placeholder="卡号" v-model="cardNo" clearable style="width: 200px;margin-top:5px;" />
    <Select v-model="cardType" clearable style="width:200px;margin-top:5px;" placeholder="卡类型">
      <Option v-for="(item, index) in cardTypeList" :key="index" :value="index+1">{{item}}</Option>
    </Select>
    <Button v-auth="'transportCard.cardGrant.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
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
    <!-- 车辆发卡 -->
    <Modal v-model="dlgVisible" :title="dlgTitle">
      <Form ref="formData" :model="formData" :rules="formDataRules" :label-width="100">
        <FormItem label="卡号：" prop="cardNo">
          <Input v-model="formData.cardNo" disabled placeholder="请输入（必填）" />
        </FormItem>
        <FormItem label="卡类型：" prop="cardTypeStr">
          <Input v-model="formData.cardTypeStr" disabled placeholder="请输入（必填）" />
        </FormItem>     
        <FormItem label="卡使用状态：" prop="cardStateStr">
          <Input v-model.number="formData.cardStateStr" disabled placeholder="请输入（必填）" ></Input>
        </FormItem>
        <FormItem label="车辆：" prop="carNo">
          <Input @on-focus="onVehicleInputFocus" v-model="formData.carNo" placeholder="请选择（必填）" />          
        </FormItem>     
        <FormItem label="领卡人：" prop="getCardUser">
          <Input v-model="formData.getCardUser" placeholder="请输入" />
        </FormItem>
        <FormItem label="备注：" prop="memo">
          <Input v-model="formData.memo" placeholder="请输入" />
        </FormItem> 
      </Form>
      <div slot="footer">
        <Button type="primary" @click="checkCardState()" :loading="modifyLoading">确定</Button>
        <Button type="default" @click="dlgVisible=false" >取消</Button>
      </div>
    </Modal>
    <!-- 选择车辆 -->
    <selectVehicleModal 
      v-if="isShowVehicleModal"
      :type="'forGrantCard'"
      :value="formData.carId"
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
        dlgTitle: "发卡",
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        cardNo: "",
        cardType: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        vehicleList: [],
        cardTypeList: ["运输卡","出入卡"],
        cardStateList: ["初始","使用","禁用","报废"],
        rows: [],
        formData:{
          "cardId": null,
          "cardNo": "",
          "cardType": null,
          "cardTypeStr": null,
          "cardState": null,
          "cardStateStr": "",
          "carId": null,
          "carNo": "",
          "getCardUser": "",
          "memo": ""
        },
        formDataRules: {
          cardNo: [
            { required: true, message: "卡号不能为空", trigger: "blur" },
          ],
          cardType: [
            { required: true, type: "number", message: "卡类型不能为空", trigger: "change" },
          ],
          cardState: [
            { required: true, message: "卡状态不能为空", trigger: "blur" },
          ],
          carNo: [
            { required: true, message: "车辆不能为空", trigger: "change" },
          ],
          getCardUser: [
            { max: 20, message: "领卡人姓名不能超过20个字", trigger: "blur" },
          ],
          memo: [
            { max: 60, message: "备注不能超过60个字", trigger: "blur" },
          ],
        },
        columns: [
          {
            title: "卡号",
            key: "cardNo",
            fixed: "left",
            minWidth: 120
          },
          {
            title: "卡类型",
            key: "cardType",
            minWidth: 120,
            render: (h, params) => {
              return h("span", this.cardTypeList[params.row.cardType-1]);
            }
          },
          {
            title: "使用状态",
            key: "cardState",
            minWidth: 120,
            render: (h, params) => {
              return h("span", this.cardStateList[params.row.cardState-1]);
            }
          },
          {
            title: "创建人",
            key: "creatorUserName",
            minWidth: 120
          },
          {
            title: "创建时间",
            key: "creationTime",
            minWidth: 160
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
                      type: "primary",
                      size: "small"
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.grant(params.row);
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'transportCard.cardGrant.add'
                      }
                    ],
                  },
                  "发卡"
                )
              ]);
            }
          },
        ]
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getCardList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getCardList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getCardList();
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
        this.formData.carId = data.tid;
        this.formData.carNo = data.truck_no;
      },
      // 发卡
      grant(data){
        this.$refs["formData"].resetFields();
        this.formData = {
          "cardId": data.cardId,
          "cardNo": data.cardNo,
          "cardType": data.cardType,
          "cardTypeStr": this.cardTypeList[data.cardType-1],
          "cardStateStr": this.cardStateList[data.cardState-1],
          "carId": null,
          "carNo": "",
          "getCardUser": "",
          "memo": ""
        }
        this.dlgVisible = true;
      },
      // 车辆发卡
      grantSubmit(){
        this.modifyLoading = true;
        this.$commonService
          .post("/card/sendCard", {
            dto: {
              carId: this.formData.carId,
              cardId: this.formData.cardId,
              cardNo: this.formData.cardNo,
              cardType: this.formData.cardType,
              getCardUser: this.formData.getCardUser,
              memo: this.formData.memo
            }
          })
          .then(res => {
            this.modifyLoading = false;
            
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            
            this.$Message.success(`${this.dlgTitle}成功！`);
            this.getCardList();
            this.dlgVisible = false;
          })
          .catch(err => {
            this.modifyLoading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      // 检测车辆使用卡状态
      checkCardState(){
        
        this.$refs["formData"].validate(valid => {
          if (valid) {
            this.$commonService
            .post("/card/checkCarStarts", {
              carId: this.formData.carId
            })
            .then(res => {
              this.loading = false;
              if(!res.success){
                this.$Message.error(res.msg);
                return;
              }

              // if (res.data.yxState == null || res.data.yxState == 100) {
                if(res.data.cardNo) {
                  this.$Modal.confirm({
                    title: '提示',
                    content:  `<p></p>
                      <span style="color:red;font-size:16px;">您选的车辆已经发卡【${res.data.cardNo}】，重复发卡【${res.data.cardNo}】卡将作废，请确认车牌号。`,
                    loading: true,
                    onOk: () => {
                      this.$Modal.remove();
                      this.grantSubmit();
                    }
                  });
                }
                else {
                  this.grantSubmit();
                }
              // }
              // else {
              //   this.$Message.error("该车辆运销过程未结束，暂无法进行发卡操作！");
              // }
            })
            .catch(err => {
              console.log(err)
              this.loading = false;
              err.msg && this.$Message.error(err.msg);
            });
          }
        })
        
      },
      // 获取卡列表
      getCardList(){
        this.loading = true;
        this.$commonService
          .post("/card/getCardList", {
            dto: {
              "cardType": this.cardType || -1,
              "cardNo": this.cardNo,
              "cardState": 1,
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
            this.totalCount = res.total;

          })
          .catch(err => {
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      }
    },
    mounted(){
      this.getCardList();
    }
  }
</script>