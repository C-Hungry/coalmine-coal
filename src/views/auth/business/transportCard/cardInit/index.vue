<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <Input v-model="cardNo" placeholder="卡号" clearable style="width: 200px;margin-top:5px;" />
    <Select v-model="cardType" clearable style="width: 200px;margin-top:5px;" placeholder="卡类型">
      <Option v-for="(item, index) in cardTypeList" :key="index" :value="index+1">{{item}}</Option>
    </Select>
    <Button v-auth="'transportCard.cardInit.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button v-auth="'transportCard.cardInit.add'" type="warning" icon="plus-round" @click="create()" style="margin-top:5px;">初始化</Button>
    <Button v-auth="'transportCard.cardInit.excel'" type="warning" icon="archive" @click="importExcel()" style="margin-top: 5px;">导入excel</Button>
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
      <Form ref="formData" :model="formData" :rules="formDataRules" :label-width="100">
        <FormItem label="卡号：" prop="cardNo">
          <Input v-model="formData.cardNo" placeholder="请输入（必填）" />
        </FormItem>
        <FormItem label="卡类型：" prop="cardType">
          <Select v-model="formData.cardType" clearable placeholder="请选择（必填）">
            <Option v-for="(item, index) in cardTypeList" :key="index" :value="index+1">{{item}}</Option>
          </Select>
        </FormItem>   
      </Form>
      <div slot="footer">
        <Button type="primary" @click="createSubmit()" :loading="modifyLoading">确定</Button>
        <Button type="default" @click="dlgVisible=false" >取消</Button>
      </div>
    </Modal>

    <!-- 导入excel -->
    <Modal v-model="excelDlgVisible" title="导入excel" width="400px;">
      <Upload
        ref="uploadExcel"
        type="drag"
        name="excelFile"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        :before-upload="onBeforeUpload"
        :action="uploadAction">
        <div v-if="excelLoading" style="padding: 20px 0">
          <Icon type="information-circled" size="48" style="color: #ff9900"></Icon>
          <p>文件导入中，请勿进行其他操作！</p>
        </div>
        <div v-else style="padding: 20px 0">
          <Icon type="ios-cloud-upload" size="48" style="color: #3399ff"></Icon>
          <p>点击或拖拽excel文件进行上传</p>
        </div>
      </Upload>
      <div style="padding: 10px;" v-if="uploadFile !== null">
        <Icon type="document"></Icon>&nbsp;&nbsp;
        {{ uploadFile.name }}
        <Icon @click="clearFile" type="close-round" style="float:right;margin-top:3px;cursor:pointer;color: #ed3f14;"></Icon>  
      </div>
      <div slot="footer">
        <Button type="primary" :disabled="excelLoading" @click="confirmUpload">确认上传</Button>
        <Button type="default" @click="excelDlgVisible=false">关闭</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        excelDlgVisible: false,
        excelLoading: false,
        dlgVisible: false,
        dlgTitle: "初始化",
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        uploadAction: this.$config.get('commonBaseUrl') + "/excel/importCardInfo",
        uploadFile: null,
        cardType: "",
        cardNo: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        cardTypeList: ["运输卡","出入卡"],
        cardStateList: ["初始","使用","禁用","报废"],
        rows: [],
        formData:{
          "cardNo": "",
          "cardType": 1
        },
        formDataRules: {
          cardNo: [
            { required: true, message: "卡号不能为空", trigger: "blur" },
          ],
          cardType: [
            { required: true, type: "number", message: "卡类型不能为空", trigger: "change" }
          ]
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
            minWidth: 120
          },
          // {
          //   title: "备注",
          //   key: "memo",
          //   minWidth: 160
          // },
        ]
      };
    },
    methods:{
      importExcel() {
        this.excelDlgVisible = true;
        this.uploadFile = null;
        this.$refs['uploadExcel'] && this.$refs['uploadExcel'].clearFiles();
      },
      confirmUpload() {
        if (!this.uploadFile) {
          this.$Message.warning("请选择要上传的excel文件!");
          return
        }
        this.excelLoading = true;
        let formData = new FormData();
        formData.append("excelFile", this.uploadFile)
        this.$uploadService
          .post("/excel/importCardInfo", formData)
          .then(res => {
            this.excelLoading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.$Message.success(res.msg);
            this.getCardList();
            this.excelDlgVisible = false;
          })
          .catch(err => {
            this.excelLoading = false;
            err.msg && this.$Message.error(err.msg);
          });
      },
      onBeforeUpload(file) {
        this.uploadFile = file;
        return false;
      },
      clearFile() {
        this.uploadFile = null;
        this.$refs['uploadExcel'] && this.$refs['uploadExcel'].clearFiles();
      },
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
      // 初始化
      create(){
        this.$refs["formData"].resetFields();
        this.formData = {
          "cardNo": "",
          "cardType": 1
        }
        this.dlgVisible = true;
      },
      // 新增或者修改
      createSubmit(){
        this.$refs["formData"].validate(valid => {
          if (valid) {
            this.modifyLoading = true;
            this.$commonService
              .post("/card/initializeCard", this.formData)
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
          }
        });
      },
       // 获取卡列表
      getCardList(){
        this.loading = true;
        this.$commonService
          .post("/card/getCardList", {
            dto: {
              "cardType": this.cardType || -1,
              "cardState": 1,
              "cardNo": this.cardNo,
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