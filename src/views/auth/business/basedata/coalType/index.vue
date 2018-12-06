<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <Input placeholder="关键字（名称、矿区）" v-model="keywords" clearable style="width: 200px;margin-top: 5px;" />
    <RadioGroup v-model="status" type="button" style="margin-top: 5px;">
      <Radio :label="-1">全部</Radio>
      <Radio :label="0">草稿</Radio>
      <Radio :label="1">启用中</Radio>
      <Radio :label="2">禁用中</Radio>
    </RadioGroup>
    <Button v-auth="'basedata.coalType.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top: 5px;">查询</Button>
    <Button v-auth="'basedata.coalType.add'" type="warning" icon="plus-round" @click="create()" style="margin-top: 5px;">新增</Button>
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
        <FormItem label="煤种名称：" prop="coalName">
          <Input v-model="formData.coalName" placeholder="请输入（必填）" />
        </FormItem>
        <FormItem label="煤种分类：" prop="coalType">
          <Select ref="coalTypeSelect" v-model="formData.coalType" filterable placeholder="请选择（必填）">
            <Option v-for="(item, index) in baseCoalTypeList" :key="index" :value="item.value">{{item.label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="矿区：" prop="coalmine">
          <Input v-model="formData.coalmine" placeholder="请输入（必填）" />
        </FormItem>
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
        status: -1,
        keywords: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        baseCoalTypeList: [],
        dlgVisible: false,
        dlgTitle: "新增",
        formData:{
          coalName: "",
          id: null,
          coalType: null,
          coalmine: "",
          memo: "",
          isvalid: null,
        },
        formDataRules: {
          coalName: [
            { required: true, message: "煤种名称不能为空", trigger: "blur" },
            { type: "string", max: 20, message: "煤种名称不能超过20个字", trigger: "blur" }
          ],
          coalType: [
            { required: true, type: "number", message: "煤种不能为空", trigger: "change" }
          ],
          coalmine: [
            { required: true, message: "矿区不能为空", trigger: "blur" },
            { type: "string", max: 20, message: "矿区不能超过20个字", trigger: "blur" }
          ]
        },
        columns: [
          {
            title: "煤种名称",
            key: "coalName",
            minWidth: 90,
            fixed: "left"
          },
          // {
          //   title: "煤种编号",
          //   key: "coalNo",
          //   minWidth: 120
          // },
          {
            title: "煤种分类",
            key: "coalTypeName",
            minWidth: 90
          },
          {
            title: "矿区",
            key: "coalmine",
            minWidth: 100
          },
          {
            title: "状态",
            key: "isvalid",
            minWidth: 75,
            render: (h, params) => {
              return h("span", params.row.isvalid == 0 ? "草稿" : params.row.isvalid == 1 ? "启用中" : "禁用中");
            }
          },
          {
            title: "创建时间",
            key: "creationTime",
            minWidth: 150
          },
           {
            title: "创建人",
            key: "creatorUserName",
            minWidth: 80
          },
          {
            title: "备注",
            key: "memo",
            minWidth: 120
          },
          {
            title: "操作",
            width: 143,
            fixed: "right",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: params.row.isvalid == 1 ? "warning" : "success",
                      size: "small"
                    },
                    style: {
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.changeStatus(params.row);
                      }
                    },
                    directives: [
                      {
                      name: 'auth',
                      value: 'basedata.coalType.handle'
                      }
                    ],
                  },
                  params.row.isvalid == 1 ? "禁用" : "启用"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small",
                      disabled: params.row.isvalid != 0
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
                      value: 'basedata.coalType.modify'
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
                      size: "small",
                      disabled: params.row.isvalid != 0
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
                      value: 'basedata.coalType.delete'
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
        this.getCoalTypeList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getCoalTypeList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getCoalTypeList();
      },
      // 删除
      delete(data){

        this.$Modal.confirm({
          title: '提示',
          content: `<p>确定<span style="color: red;font-size: 16px;"> 删除 </span>
                    煤种名称为<span style="color: red;font-size: 16px;"> ${data.coalName} </span>的煤种吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/coalType/deleteCoalTypeById", {
                id: data.id
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("删除成功！");
                this.getCoalTypeList();
              })
              .catch(err => {
                this.$Modal.remove();
                this.$Message.error("删除出现未知错误！");
              });
          }
        });
      },
      // 改变状态
      changeStatus(data) {

        let url = data.isvalid == 1 ? "/coalType/stopCoalTypeById" : "/coalType/startCoalTypeById";
        let action = data.isvalid == 1 ? '禁用' : '启用';

        this.$Modal.confirm({
          title: '提示',
          content: `<p>确定<span style="color: red;font-size: 16px;"> ${ action } </span>
                  煤种名称为<span style="color: red;font-size: 16px;"> ${ data.coalName } </span>的煤种吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post(url, {
                id: data.id,
                isvalid: data.isvalid == 1 ? 2 : 1
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success(`${action}成功！`);
                this.getCoalTypeList();
              })
              .catch(err => {
                this.$Modal.remove();
                this.$Message.error(`${action}出现未知错误！`);
              });
          }
        });
      },
      // 修改
      edit(data){

        this.$refs["formData"].resetFields();

        this.formData = {
          coalName: data.coalName,
          id: data.id,
          coalType: data.coalTypeId,
          coalmine: data.coalmine,
          memo: data.memo,
        }
        
        this.dlgVisible = true;
        this.dlgTitle = "修改";
      },
      // 新增
      create(){
        this.$refs["formData"].resetFields();
        this.$refs["coalTypeSelect"].setQuery(null);

        this.formData = {
          coalName: "",
          id: null,
          coalType: null,
          coalmine: "",
          memo: ""
        }

        this.dlgVisible = true;
        this.dlgTitle = "新增";

      },
      // 新增或者修改
      createSubmit(){

        this.$refs["formData"].validate(valid => {
          if (valid) {
            this.modifyLoading = true;

            let url = this.dlgTitle == "修改" ? "/coalType/updateCoalType": "/coalType/addCoalType";

            let params = Object.assign({},this.formData);

            for (let i = 0;i<this.baseCoalTypeList.length;i++) {
              if (params.coalType == this.baseCoalTypeList[i].value) {
                params.coalTypeName = this.baseCoalTypeList[i].label;
                break;
              }
            }

            this.$commonService
              .post(url, {dto: params})
              .then(res => {
                this.modifyLoading = false;
                
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success(`${this.dlgTitle}成功！`);
                this.getCoalTypeList();
                this.dlgVisible = false;
              })
              .catch(err => {
                this.modifyLoading = false;
                this.$Message.error(`${this.dlgTitle}出现未知错误！`);
              });
            }
        });

      },
      getCoalTypeList(){
        this.loading = true;
        this.$commonService
          .get("/coalType/getCoalTypeList", {
            "isvalid": this.status,
            "keywords": this.keywords,
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
            this.$Message.error("查询煤种出现未知错误！");
          });
      },
      getBaseCoalTypeList() {
        this.$commonService
          .get("/basisType/getBasisTypeListByCode", {
            "code": "coalType"
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }

            this.baseCoalTypeList = res.data;

          })
          .catch(err => {
            this.$Message.error("查询基础煤种类型列表出现未知错误！");
          });
      }
    },
    mounted(){
      this.getBaseCoalTypeList();
      this.getCoalTypeList();
    }
  }
</script>