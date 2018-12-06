<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <Input placeholder="卡号" v-model="cardNo" clearable style="width: 200px;margin-top:5px;" />
    <Input placeholder="车牌号" v-model="carNo" clearable style="width: 200px;margin-top:5px;" />
    <Button v-auth="'transportCard.cardRefund.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
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
    <!-- 车辆收卡 -->
    <Modal v-model="dlgVisible" :title="dlgTitle">
      <Form :label-width="100">
        <FormItem label="卡号：">
          <Input v-model="formData.cardNo" disabled/>
        </FormItem>
        <FormItem label="卡类型：">
          <Input v-model="formData.cardTypeStr" disabled/>
        </FormItem>     
        <FormItem label="卡使用状态：">
          <Input v-model.number="formData.cardStateStr" disabled>
          </Input>
        </FormItem>
        <FormItem label="车牌号：">
          <Input v-model="formData.truckNo" disabled/>
        </FormItem>     
        <FormItem label="领卡人：">
          <Input v-model="formData.getCardUser" disabled/>
        </FormItem>
        <FormItem label="备注：">
          <Input v-model="formData.memo" disabled/>
        </FormItem> 
      </Form>
      <div slot="footer">
        <Button type="error" @click="refundSubmit()" :loading="modifyLoading">确定退卡</Button>
        <Button type="default" @click="dlgVisible=false" >取消</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        dlgVisible: false,
        dlgTitle: "退卡",
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        cardNo: "",
        carNo: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        cardTypeList: ["运输卡","出入卡"],
        cardStateList: ["初始","使用","禁用","报废"],
        rows: [],
        formData:{
          "cardId": null,
          "cardNo": "",
          "cardType": null,
          "cardTypeStr": "",
          "cardState": "",
          "cardStateStr": "",
          "truckNo": "",
          "tid": "",
          "getCardUser": "",
          "memo": ""
        },
        columns: [
          {
            title: "车牌号",
            key: "truckNo",
            fixed: "left",
            minWidth: 100
          },
          {
            title: "车辆类型",
            key: "truckTypeName",
            minWidth: 90
          },
          {
            title: "卡号",
            key: "cardNo",
            minWidth: 95
          },
          {
            title: "卡类型",
            key: "cardTypeStr",
            minWidth: 80
          },
          {
            title: "卡使用状态",
            key: "cardStateStr",
            minWidth: 100
          },
          {
            title: "发卡人",
            key: "sendCardUser",
            minWidth: 80
          },
          {
            title: "发卡时间",
            key: "sendCardTime",
            minWidth: 150
          },
          {
            title: "领卡人",
            key: "getCardUser",
            minWidth: 80
          },
          {
            title: "备注",
            key: "memo",
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
                      type: "primary",
                      size: "small"
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.refund(params.row);
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'transportCard.cardRefund.refund'
                      }
                    ],
                  },
                  "退卡"
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
      // 退卡
      refund(data){

        this.formData = {
          "carId": data.truckId,
          "cardNo": data.cardNo,
          "cardType": data.cardType,
          "cardTypeStr": data.cardTypeStr,
          "cardState": data.cardType,
          "cardStateStr": data.cardStateStr,
          "truckNo": data.truckNo,
          "getCardUser": data.getCardUser,
          "memo": data.memo,
        }

        this.dlgVisible = true;

      },
      // 车辆退卡
      refundSubmit(){

        this.modifyLoading = true;

        this.$commonService
          .post("/card/returnCard", {
            cardNo: this.formData.cardNo
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
      getCardList(){
        this.loading = true;
        this.$commonService
          .post("/card/getReturnCardList", {
            dto: {
              "cardNo": this.cardNo,
              "cardType": this.cardType || -1,
              "cardState": 2,
              "truckNo": this.carNo,
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
              item.cardTypeStr = this.cardTypeList[item.cardType-1];
              item.cardStateStr = this.cardStateList[item.cardState-1];
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
      this.getCardList();
    }
  }
</script>