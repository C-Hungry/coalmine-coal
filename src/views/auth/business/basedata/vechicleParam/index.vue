<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <Select style="width: 200px;margin-top: 5px;" v-model="vechicleType" filterable clearable placeholder="车型">
      <Option v-for="(item, index) in vechicleTypeList" :key="index" :value="item.value">{{item.label}}</Option>
    </Select>
    <Button v-auth="'basedata.vechicleParamSetting.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top: 5px;">查询</Button>
    <Button v-auth="'basedata.vechicleParamSetting.add'" type="warning" icon="plus-round" @click="create()" style="margin-top: 5px;">新增</Button>
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
    <Modal v-model="dlgVisible" :title="dlgTitle" width="480">
      <Form :label-width="100" ref="formData" :model="formData" :rules="formDataRules">
        <FormItem label="车型：" prop="truck_type">
          <Select ref="vechicleTypeSelect" :disabled="dlgTitle == '修改'" style="width: 300px;" v-model="formData.truck_type" filterable placeholder="请选择（必选）">
            <Option v-for="(item, index) in vechicleTypeList" :key="index" :value="item.value">{{item.label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="参数类型：" prop="param_code">
          <Select ref="parmaCodeSelect" :disabled="dlgTitle == '修改'" style="width: 300px;" v-model="formData.param_code" filterable placeholder="请选择（必选）">
            <Option :value="'3'">皮重浮动值</Option>
            <Option :value="'2'">毛重浮动值</Option>
          </Select>
        </FormItem>
        <FormItem label="浮动值：" prop="floatValue">
          <Input v-model.number="formData.floatValue" style="width: 300px;" placeholder="请输入（必填）">
            <span slot="append">吨</span>
          </Input>
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
        vechicleType: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        vechicleTypeList:[],
        rows: [],
        dlgVisible: false,
        dlgTitle: "新增",
        formData:{
          "pid": null,
          "floatValue": null,
          "truck_type": null,
          "param_code": ""
        },
        formDataRules: {
          truck_type: [
            { required: true, type: "number", message: "请选择车型", trigger: "change" }
          ],
          param_code: [
            { required: true, message: "请选择参数类型", trigger: "change" }
          ],
          floatValue: [
            {
              type: "method",
              required: true,
              validator: (rule, value, callback) => {
                if (!value && value != 0) {
                  callback(new Error("请输入浮动值"));
                }
                else if (!/^[-]?([0-9]\d?(\.\d{1,2})?|100)$/.test(value)) {
                  callback(new Error("必须≥-100且≤100，可保留两位小数"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            },
          ]
        },
        columns: [
          {
            title: "车型",
            key: "truckTypeName",
            minWidth: 120
          },
          {
            title: "参数类型",
            key: "param_code",
            minWidth: 120,
            render: (h, params) => {
              return h("span", params.row.param_code == 2 ? "毛重浮动值" : params.row.param_code == 3 ? "皮重浮动值" : "其他");
            }
          },
          {
            title: "浮动值(吨)",
            key: "param_value",
            minWidth: 120,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.param_value));
            }
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
                      value: 'basedata.vechicleParamSetting.modify'
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
                      value: 'basedata.vechicleParamSetting.delete'
                      }
                    ],
                  },
                  "删除"
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
        this.getVehicleParamList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getVehicleParamList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getVehicleParamList();
      },
      // 删除
      delete(data){

        this.$Modal.confirm({
          title: '提示',
          content: `<p>确定<span style="color: red;font-size: 16px;"> 删除 </span>
                  车型为<span style="color: red;font-size: 16px;"> ${data.truckTypeName} </span>的参数设置吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .get("/car/deleteFloatValueParams", {
                pid: data.pid
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success("删除成功！");
                this.getVehicleParamList();
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
          pid: data.pid,
          floatValue: Number(data.param_value),
          truck_type: data.truck_type,
          param_code: data.param_code
        };
        this.dlgVisible = true;
        this.dlgTitle = "修改";
      },
      // 新增
      create(){
        this.$refs["formData"].resetFields();
        this.$refs["vechicleTypeSelect"].setQuery(null);
        this.$refs["parmaCodeSelect"].setQuery(null);
        this.formData = {
          pid: null,
          floatValue: null,
          truck_type: null,
          param_code: ""
        };
        this.dlgVisible = true;
        this.dlgTitle = "新增";
      },
      // 新增或者修改
      createSubmit(){

        this.$refs["formData"].validate(valid => {
          if (valid) {
            this.modifyLoading = true;
            let url = this.dlgTitle == "修改" ? "/car/updateFloatValueParam": "/car/addFloatValueParams";
            this.$commonService
              .post(url, {
                commonUserInDto: {
                  pid: this.formData.pid,
                  floatValue: this.formData.floatValue.toFixed(2),
                  truck_type: this.formData.truck_type,
                  param_code: this.formData.param_code
                }
              })
              .then(res => {
                this.modifyLoading = false;
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success(`${this.dlgTitle}成功！`);
                this.getVehicleParamList();
                this.dlgVisible = false;
              })
              .catch(err => {
                this.modifyLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });
      },
      getVehicleParamList(){
        this.loading = true;
        this.$commonService
          .post("/car/getFloatValueParamsList", {
            dto: {
              truck_type: this.vechicleType,
              currentPage: this.currentPage,
              pageSize: this.pageSize
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
      getVechicleTypeList() {
        this.$commonService
          .get("/basisType/getBasisTypeListByCode", {
            "code": "carType"
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.vechicleTypeList = res.data;
            
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      }
    },
    mounted(){
      this.getVechicleTypeList();
      this.getVehicleParamList();
    }
  }
</script>