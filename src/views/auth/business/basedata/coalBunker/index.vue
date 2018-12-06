<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <Input placeholder="关键字（名称、位置）" v-model="keywords" clearable style="width: 200px;margin-top: 5px;"/>
    <RadioGroup v-model="isvalid" type="button" style="margin-top: 5px;">
      <Radio :label="-1">全部</Radio>
      <Radio :label="0">草稿</Radio>
      <Radio :label="1">启用中</Radio>
      <Radio :label="2">禁用中</Radio>
    </RadioGroup>
    <Button v-auth="'basedata.coalBunker.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top: 5px;">查询</Button>
    <Button v-auth="'basedata.coalBunker.add'" type="warning" icon="plus-round" @click="create()" style="margin-top: 5px;">新增</Button>
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
        <FormItem label="仓场名称：" prop="bname">
          <Input v-model="formData.bname" placeholder="请输入（必填）" />
        </FormItem>
        <!-- <FormItem label="仓场位置：" prop="address">
          <Input v-model="formData.address" placeholder="请输入" />
        </FormItem> -->
        <FormItem label="仓场位置：" prop="addressId">
          <Select ref="addressSelect" v-model="formData.addressId" filterable placeholder="请选择">
            <Option v-for="(item, index) in addressList" :key="index" :value="item.value">{{item.label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="煤种：" prop="coalIds">
          <Select ref="coalTypeSelect" v-model="formData.coalIds" multiple filterable placeholder="请选择">
            <Option v-for="(item, index) in coalTypeList" :key="index" :value="item.id">{{item.coalName + '（' + item.coalTypeName +'）'}}</Option>
          </Select>
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
        isvalid: -1,
        keywords: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        columns: [
          {
            title: "仓场名称",
            key: "bname",
            minWidth: 120,
            fixed: "left"
          },
          // {
          //   title: "仓场编号",
          //   key: "bcode",
          //   minWidth: 120
          // },
          {
            title: "仓库位置",
            key: "address",
            minWidth: 120
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
            title: "煤种信息",
            key: "coalName",
            minWidth: 120
          },
          {
            title: "创建时间",
            key: "createTime",
            minWidth: 150
          },
          {
            title: "创建人",
            key: "creatorUserName",
            minWidth: 75
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
                      value: 'basedata.coalBunker.handle'
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
                      value: 'basedata.coalBunker.modify'
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
                      value: 'basedata.coalBunker.delete'
                      }
                    ],
                  },
                  "删除"
                )
              ]);
            }
          },
        ],
        rows: [],
        coalTypeList: [],
        addressList: [],
        dlgVisible: false,
        dlgTitle: "新增",
        formData:{
          bname: "",
          bnameId: "",
          coalIds: [],
          addressId: null,
          memo: ""
        },
        formDataRules: {
          bname: [
            { required: true, message: "仓场名称不能为空", trigger: "blur" },
            { type: "string", max: 20, message: "仓场名称不能超过20个字", trigger: "blur" }
          ],
          addressId: [
            { required: true, type: "number", message: "仓场位置不能为空", trigger: "change" }
          ],
          coalIds: [
            { required: true, type: "array", message: "煤种不能为空", trigger: "change" }
          ]
        }
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getCoalBunkersList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getCoalBunkersList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getCoalBunkersList();
      },
      // 删除
      delete(data){

        this.$Modal.confirm({
          title: '提示',
          content: `<p>确定<span style="color: red;font-size: 16px;"> 删除 </span>
                    仓场名称为<span style="color: red;font-size: 16px;"> ${data.bname} </span>的仓场吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/bunker/deleteBunkerById", {
                id: data.id
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("删除成功！");
                this.getCoalBunkersList();
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

        let url = data.isvalid == 1 ? "/bunker/stopBunkerById" : "/bunker/startBunkerById";
        let action = data.isvalid == 1 ? '禁用' : '启用';

        this.$Modal.confirm({
          title: '提示',
          content: `<p>确定<span style="color: red;font-size: 16px;"> ${action} </span>
                  仓场名称为<span style="color: red;font-size: 16px;"> ${data.bname} </span>的仓场吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post(url, {
                id: data.id
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success(`${action}成功！`);
                this.getCoalBunkersList();
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
          bname: data.bname,
          bnameId: data.id,
          addressId: data.addressId,
          coalIds: data.coalIds,
          memo: data.memo
        }

        this.dlgTitle = "修改";
        this.dlgVisible = true;
        
      },
      // 新增
      create(){

        this.$refs["formData"].resetFields();
        this.$refs["coalTypeSelect"].setQuery(null);
        this.$refs["addressSelect"].setQuery(null);

        this.formData = {
          bname: "",
          bnameId: "",
          addressId: null,
          coalIds: [],
          memo: ""
        }

        this.dlgTitle = "新增";
        this.dlgVisible = true;

      },
      // 新增或者修改
      createSubmit(){

        this.$refs["formData"].validate(valid => {
          if (valid) {
            this.modifyLoading = true;
            let params = Object.assign({}, this.formData);
            let url = this.dlgTitle == "修改" ? "/bunker/updateBunker" : "/bunker/addBunker";
            this.$commonService
              .post(url, {dto: params})
              .then(res => {
                this.modifyLoading = false;
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success(`${this.dlgTitle}成功！`);
                this.getCoalBunkersList();
                this.dlgVisible = false;
              })
              .catch(err => {
                this.modifyLoading = false;
                this.$Message.error(`${this.dlgTitle}出现未知错误！`);
              });
          }
        });
      },
      getCoalBunkersList(){
        this.loading = true;
        this.$commonService
          .get("/bunker/getBunkerList", {
            "isvalid": this.isvalid,
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
            this.$Message.error("查询用户出现未知错误！");
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
            this.$Message.error("查询煤种出现未知错误！");
          });
      },
      // 字典表获取仓场位置信息
      getAddressList() {
        this.$commonService
          .get("/basisType/getBasisTypeListByCode", {
            "code": "bunkerAddress"
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.addressList = res.data;
          })
          .catch(err => {
            this.$Message.error("查询仓场位置信息出现未知错误！");
          });
      }
    },
    mounted(){
      this.getCoalTypeList();
      this.getAddressList();
      this.getCoalBunkersList();
    }
  }
</script>