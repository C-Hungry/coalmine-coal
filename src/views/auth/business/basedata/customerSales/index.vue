<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <!-- <DatePicker format="yyyy/MM/dd" type="daterange" placeholder="创建时间" style="width: 200px"></DatePicker> -->
    <Input placeholder="客户名称" v-model="customerName" clearable style="width: 200px;margin-top: 5px;" />
    <Select v-model="controlMode" filterable clearable style="width:200px;margin-top: 5px;" placeholder="控制模式">
      <Option v-for="(item, index) in controlModeList" :key="index" :value="item.label">{{item.label}}</Option>
    </Select>
    <Button v-auth="'basedata.customerSales.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top: 5px;">查询</Button>
    <Button v-auth="'basedata.customerSales.add'" type="warning" icon="plus-round" @click="create()" style="margin-top: 5px;">新增</Button>
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
    <Modal v-model="dlgVisible" :title="dlgTitle" width="700">
      <Form ref="formData" :model="formData" :rules="formDataRules" :label-width="120">
        <FormItem prop="ids" label="客户名称：">
          <Select v-model="formData.ids" filterable multiple :disabled="dlgTitle=='修改'" placeholder="请选择（必填）">
            <Option v-for="(item, index) in customerList" :key="index" :value="item.id">{{item.deptName}}</Option>
          </Select>
        </FormItem>
        <Row :gutter="24">
          <Col span="12">
            <FormItem prop="coalId" label="合同煤种：">
              <Select ref="coalTypeSelect" v-model="formData.coalId" filterable :disabled="dlgTitle=='修改'" style="width:200px" placeholder="请选择（必填）">
                <Option v-for="(item, index) in coalTypeList" :key="index" :value="item.id">{{item.coalName + "（" + item.coalTypeName + "）"}}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem prop="modeTypeName" label="控制模式：">
              <Select ref="modeTypeSelect" v-model="formData.modeTypeName" @on-change="onSelectChange" filterable :disabled="dlgTitle=='修改'" style="width:200px" placeholder="请选择（必填）">
                <Option v-for="(item, index) in controlModeList" :key="index" :value="item.label">{{item.label}}</Option>
              </Select>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="24" v-if="formData.modeTypeName == '月控制'">
          <Col span="12">
            <FormItem prop="beginDate" label="控制开始日期：">
              <DatePicker v-model="formData.beginDate" format="yyyy/MM/dd" type="month" placeholder="请选择（必填）" style="width: 200px"></DatePicker>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem prop="endDate" label="控制截止日期：">
              <DatePicker v-model="formData.endDate" format="yyyy/MM/dd" @on-change="onDateMonthPickerChange" type="month" placeholder="请选择（必填）" style="width: 200px"></DatePicker>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="24" v-else>
          <Col span="12">
            <FormItem prop="beginDate" label="控制开始日期：">
              <DatePicker v-model="formData.beginDate" format="yyyy/MM/dd" type="date" placeholder="请选择（必填）" style="width: 200px"></DatePicker>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem prop="endDate" label="控制截止日期：">
              <DatePicker v-model="formData.endDate" format="yyyy/MM/dd" type="date" placeholder="请选择（必填）" style="width: 200px"></DatePicker>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="24">
          <Col span="12">
            <FormItem label="控制内容：">
              <RadioGroup v-model="controlContent">
                <Radio label="carNum">车数</Radio>
                <Radio label="weightNum">吨数</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col span="12" v-if="controlContent == 'carNum'">
            <FormItem prop="carNum" label="控制车数：">
              <Input v-model.number="formData.carNum" placeholder="请输入（必填）">
                <span slot="append">辆</span>
              </Input>
            </FormItem>
          </Col>
          <Col span="12" v-else>
            <FormItem prop="weightNum" label="控制吨数：">
              <Input v-model.number="formData.weightNum" placeholder="请输入（必填）">
                <span slot="append">吨</span>
              </Input>
            </FormItem>              
          </Col>
        </Row>
        <FormItem label="备注：">
          <Input v-model="formData.memo" placeholder="请输入" type="textarea" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="createSubmit()" :loading="modifyLoading">提交</Button>
        <Button type="default" @click="dlgVisible=false" >取消</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        controlContent: "carNum",
        customerName: "",
        controlMode: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        coalTypeList: [],
        controlModeList: [],
        customerList: [],
        dlgVisible: false,
        dlgTitle: "",
        formData:{
          "beginDate": null,
          "endDate": null,
          "carNum": null,
          "coalId": null,
          "coalName": "",
          "ids": [],
          "modeTypeName": "",
          "memo": "",
          "weightNum": null
        },
        formDataRules: {
          beginDate: [
            { required: true, type: "date", message: "请选择开始日期", trigger: "change"}
          ],
          endDate: [
            { required: true, type: "date", message: "请选择截止日期", trigger: "change"},
            {
              type: "method",
              validator: (rule, value, callback) => {
                try {
                  let t = value.getTime();
                  let beginDate = this.formData.beginDate && this.formData.beginDate.getTime();
                  if(!beginDate) {
                    callback(new Error("请先选择开始日期"));
                  }
                  else if (beginDate && t < beginDate) {
                    callback(new Error("截止日期不能早于开始日期"));
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
          carNum: [
            {
              required: true, 
              type: "method",
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error("控制车数不能为空"));
                }
                else if (!/^\+?[0-9][0-9]*$/.test(value)) {
                  callback(new Error("控制车数必须为≥0的整数"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          coalId: [
            { required: true, type: "number", message: "煤种不能为空", trigger: "change" }
          ],
          ids: [
            { required: true, type: "array", message: "客户单位不能为空", trigger: "change" }
          ],
          modeTypeName: [
            { required: true, message: "控制模式不能为空", trigger: "change" }
          ],
          weightNum: [
            {
              required: true, 
              type: "method",
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error("控制吨数不能为空"));
                }
                else if (!/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(value)) {
                  callback(new Error("控制吨数必须为≥0的数字"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ]
        },
        columns: [
          {
            title: "客户名称",
            key: "customerName",
            minWidth: 160,
            fixed: "left"
          },
          {
            title: "煤种名称",
            key: "coalName",
            minWidth: 90
          },
          {
            title: "控制模式",
            key: "modeTypeName",
            minWidth: 90
          },
          {
            title: "控制开始日期",
            key: "beginDate",
            minWidth: 110
          },
          {
            title: "控制截止日期",
            key: "endDate",
            minWidth: 110
          },
          {
            title: "控制车数",
            key: "carNum",
            minWidth: 85
          },
          {
            title: "控制吨数",
            key: "weightNum",
            minWidth: 85
          },
          {
            title: "创建时间",
            key: "creationTime",
            minWidth: 150
          },
          {
            title: "创建人",
            key: "creatorUserName",
            minWidth: 85
          },
          {
            title: "备注",
            key: "memo",
            minWidth: 120
          },
          {
            title: "操作",
            width: 108,
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
                        this.edit(params.row);
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'basedata.customerSales.modify'
                      }
                    ],
                  },
                  "修改"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small"
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
                      value: 'basedata.customerSales.delete'
                      }
                    ],
                  },
                  "删除"
                )
              ]);
            }
          },
        ],
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getCustomerSalesList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getCustomerSalesList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getCustomerSalesList();
      },
      // 截止月份变化
      onDateMonthPickerChange(value) {
        let now = new Date(value);
        let month = now.getMonth() + 1;
        let year = now.getFullYear();
        let date = new Date(year,month,0).getDate();
        let monthLastDate = year + "/" + month + "/" + date;
        this.formData.endDate = new Date(monthLastDate);
      },
      // 监控控制模式变化
      onSelectChange(value) {
        this.formData.beginDate = null;
        this.formData.endDate = null;
      },
      // 删除
      delete(data){

        this.$Modal.confirm({
          title: '提示',
          content: `<p>确定<span style="color: red;font-size: 16px;"> 删除 </span>
                  客户名称为<span style="color: red;font-size: 16px;"> ${data.customerName} </span>的客户吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/customerSales/deleteCustomerSalesById", {
                id: data.scid
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("删除成功！");
                this.getCustomerSalesList();
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

        this.formData = {
          "beginDate": new Date(data.beginDate),
          "endDate": new Date(data.endDate),
          "carNum": data.carNum,
          "coalId": data.coalId,
          "coalName": data.coalName,
          "ids": [data.customerId],
          "id": data.scid,
          "modeTypeName": data.modeTypeName,
          "memo": data.memo,
          "weightNum": data.weightNum
        }

        this.controlContent = data.carNum ? "carNum" : "weightNum";

        this.dlgVisible = true;
        this.dlgTitle = "修改";
        
      },
      // 新增
      create(){
        
        this.$refs["formData"].resetFields();
        this.$refs["coalTypeSelect"].setQuery(null);
        this.$refs["modeTypeSelect"].setQuery(null);

        this.controlContent = "carNum";

        this.formData = {
          "beginDate": null,
          "endDate": null,
          "carNum": null,
          "coalId": null,
          "coalName": "",
          "ids": [],
          "modeTypeName": "",
          "memo": "",
          "weightNum": null
        }

        this.dlgVisible = true;
        this.dlgTitle = "新增";

      },
      // 新增或者修改
      createSubmit(){

        this.$refs["formData"].validate(valid => {
          if (valid) {
            
            for (let i = 0;i<this.coalTypeList.length;i++) {
              if (this.formData.coalId == this.coalTypeList[i].id) {
                this.formData.coalName = this.coalTypeList[i].coalName;
                break;
              }
            }

            this.modifyLoading = true;

            if(this.dlgTitle=='修改'){
              this.$commonService
                .post("/customerSales/updateCustomerSales", {
                  "id": this.formData.id,
                  "beginDate": this.$utils.formateDate(this.formData.beginDate,"yyyy-MM-dd 00:00:00"),
                  "endDate": this.$utils.formateDate(this.formData.endDate,"yyyy-MM-dd 23:59:59"),
                  "carNum": this.formData.carNum,
                  "weightNum": this.formData.weightNum,
                  "memo": this.formData.memo
                })
                .then(res => {
                  this.modifyLoading = false;
                  
                  if(!res.success){
                    this.$Message.error(res.msg);
                    return;
                  }
                  
                  this.$Message.success("修改成功！");
                  this.getCustomerSalesList();
                  this.dlgVisible = false;
                })
                .catch(err => {
                  this.modifyLoading = false;
                  err.msg && this.$Message.error(err.msg);
                });
            } else {
              let params = Object.assign({},this.formData);
              params.beginDate = new Date(this.$utils.formateDate(params.beginDate, "yyyy-MM-dd 00:00:00"));
              params.endDate = new Date(this.$utils.formateDate(params.endDate, "yyyy-MM-dd 23:59:59"));
              this.$commonService
                .post("/customerSales/addCustomerSales", {
                  dto: params
                })
                .then(res => {
                  this.modifyLoading = false;

                  if(!res.success){
                    this.$Message.error(res.msg);
                    return;
                  }
                  
                  this.$Message.success("新增成功！");
                  this.getCustomerSalesList();
                  this.dlgVisible = false;
                })
                .catch(err => {
                  this.modifyLoading = false;
                  err.msg && this.$Message.error(err.msg);
                });
            }
          }
        });

      },
      // 获取客户销售控制列表
      getCustomerSalesList(){
        this.loading = true;
        this.$commonService
          .get("/customerSales/getCustomerSalesList", {
            "userName": this.customerName,
            "modeTypeName": this.controlMode || "",
            "currentPage": this.currentPage,
            "pageSize": this.pageSize
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
      // 合同煤种
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
      // 销售控制模式
      getControlModeList() {
        this.$commonService
          .get("/basisType/getBasisTypeListByCode", {
            "code": "controlMode"
          })
          .then(res => {

            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.controlModeList = res.data;

          })
          .catch(err => {
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

      }
    },
    watch: {
      controlContent(newVal) {
        if (newVal == "carNum") {
          this.formData.weightNum = null;
        } else {
          this.formData.carNum = null;
        }
      }
    },
    mounted(){
      this.getControlModeList();
      this.getCoalTypeList();
      this.getCustomerList();
      this.getCustomerSalesList();
    }
  }
</script>