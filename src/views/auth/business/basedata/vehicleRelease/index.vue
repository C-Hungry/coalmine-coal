<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <Select style="width: 200px;margin-top: 5px;" v-model="coalType" filterable clearable placeholder="煤种">
      <Option v-for="(item, index) in coalTypeList" :key="index" :value="item.id">{{item.coalName + "（" + item.coalTypeName + "）"}}</Option>
    </Select>
    <Select style="width: 200px;margin-top: 5px;" v-model="releaseType" filterable clearable placeholder="放行模式">
      <Option :value="'01'">手动放行</Option>
      <Option :value="'02'">自动放行</Option>
      <Option :value="'03'">按比例放行</Option>
    </Select>
    <Button v-auth="'basedata.vehicleRelease.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top: 5px;">查询</Button>
    <Button v-auth="'basedata.vehicleRelease.add'" type="warning" icon="plus-round" @click="create()" style="margin-top: 5px;">新增</Button>
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
      <Form :label-width="100" ref="formData" :model="formData" :rules="formDataRules">
        <FormItem label="煤种名称：" prop="cid">
          <Select ref="coalTypeSelect" style="width: 300px;" v-model="formData.cid" filterable placeholder="请选择（必填）">
            <Option v-for="(item, index) in coalTypeList" :key="index" :value="item.id">{{item.coalName + "（" + item.coalTypeName + "）"}}</Option>
          </Select>
        </FormItem>
        <FormItem label="放行方式：" prop="param_value">
          <RadioGroup v-model="formData.param_value">
            <Radio :label="'01'">手动放行</Radio>
            <Radio :label="'02'">自动放行</Radio>
            <Radio :label="'03'">按比率放行</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="参数说明：">
          01:手动放行，02:自动放行，03:自动按比率放行
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
        keywords: "",
        coalType: "",
        releaseType: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        coalTypeList:[],
        rows: [],
        dlgVisible: false,
        dlgTitle: "新增",
        formData:{
          cid: "",
          pid: "",
          param_value: "01"
        },
        formDataRules: {
          cid: [
            { required: true, type: "number", message: "煤种不能为空", trigger: "change" }
          ],
          param_value: [
            { required: true, message: "放行模式不能为空", trigger: "blur" }
          ],
        },
        columns: [
          {
            title: "煤种名称",
            key: "coal_name",
            minWidth: 120
          },
          {
            title: "参数名称",
            key: "param_name",
            minWidth: 120
          },
          {
            title: "放行方式",
            key: "param_value",
            minWidth: 120,
            render: (h, params) => {
              let str = params.row.param_value == "01" ? "手动放行" : 
                        params.row.param_value == "02" ? "自动放行" :
                        params.row.param_value == "03" ? "按比率放行" : "未知";
              return h("span", str)
            }
          },
          // {
          //   title: "参数说明",
          //   key: "memo",
          //   minWidth: 120
          // },
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
                      value: 'basedata.vehicleRelease.modify'
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
                      value: 'basedata.vehicleRelease.delete'
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
        this.getVehicleReleaseList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getVehicleReleaseList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getVehicleReleaseList();
      },
      // 删除
      delete(data){

        this.$Modal.confirm({
          title: '提示',
          content: `<p>确定<span style="color: red;font-size: 16px;"> 删除 </span>
                  煤种名称为<span style="color: red;font-size: 16px;"> ${data.coal_name} </span>的煤种吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/car/deleteCarPass", {
                pid: data.pid
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("删除成功！");
                this.getVehicleReleaseList();
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
          cid: data.cid,
          pid: data.pid,
          param_value: data.param_value
        };

        this.dlgVisible = true;
        this.dlgTitle = "修改";

      },
      // 新增
      create(){

        this.$refs["formData"].resetFields();
        this.$refs["coalTypeSelect"].setQuery(null);

        this.formData = {
          cid: "",
          pid: "",
          param_value: "01"
        };

        this.dlgVisible = true;
        this.dlgTitle = "新增";

      },
      // 新增或者修改
      createSubmit(){

        this.$refs["formData"].validate(valid => {
          if (valid) {

            this.modifyLoading = true;

            let url = this.dlgTitle == "修改" ? "/car/updateCarPass": "/car/addCarPassParams";

            this.$commonService
              .post(url, {
                commonUserInDto: this.formData
              })
              .then(res => {
                this.modifyLoading = false;
                
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success(`${this.dlgTitle}成功！`);
                this.getVehicleReleaseList();
                this.dlgVisible = false;
              })
              .catch(err => {
                this.modifyLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });

      },
      getVehicleReleaseList(){
        this.loading = true;
        this.$commonService
          .post("/car/getCarPassList", {
            dto: {
              cid: this.coalType || -1,
              param_value: this.releaseType,
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
    },
    mounted(){
      this.getCoalTypeList();
      this.getVehicleReleaseList();
    }
  }
</script>