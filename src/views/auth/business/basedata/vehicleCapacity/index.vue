<style scoped lang="less">
  
</style>

<template>
  <div class="business-container">
    <!-- <DatePicker format="yyyy/MM/dd" type="daterange" placeholder="创建时间" style="width: 200px"></DatePicker> -->
    <Input placeholder="煤种名称" v-model="keywords" clearable style="width: 200px;margin-top: 5px;" />
    <!-- <Select style="width: 200px;" v-model="coalType" filterable clearable placeholder="请选择煤种">
      <Option v-for="(item, index) in coalTypeList" :key="index" :value="item.id">{{item.coalName}}</Option>
    </Select> -->
    <Button v-auth="'basedata.vehicleCapacity.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top: 5px;">查询</Button>
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
    <Modal v-model="dlgVisible" :title="dlgTitle" width="350px">
      <Form :label-width="80" ref="formData" :model="formData" :rules="formDataRules">
        <FormItem label="煤种名称：">
          {{formData.coalName}}
        </FormItem>
        <FormItem label="容量值：" prop="max_trucknum">
          <Input style="width: 200px;" v-model.number="formData.max_trucknum" placeholder="请输入（必填）">
            <span slot="append">辆</span>
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
        keywords: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        coalType: "",
        coalTypeList: [],
        columns: [
          // {
          //   title: "煤种编号",
          //   key: "coal_no",
          //   minWidth: 120,
          // },
          {
            title: "煤种名称",
            key: "coal_name",
            minWidth: 120
          },
          {
            title: "煤种分类",
            key: "name",
            minWidth: 120
          },
          {
            title: "矿区",
            key: "coalmine",
            minWidth: 120
          },
          {
            title: "容量车数",
            key: "max_trucknum",
            minWidth: 120,
            render: (h, params) => {
              return h("span", params.row.max_trucknum == -1 ? "未设置" : params.row.max_trucknum);
            }
          },
          {
            title: "操作",
            width: 90,
            align: "center",
            fixed: "right",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "warning",
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
                      value: 'basedata.vehicleCapacity.set'
                      }
                    ],
                  },
                  "容量设置"
                )
              ]);
            }
          },
        ],
        rows: [],
        dlgTitle: "容量设置",
        dlgVisible: false,
        formData:{
          coalId: 0,
          coalName: "",
          max_trucknum: ""
        },
        formDataRules: {
          max_trucknum: [
            {
              required: true, 
              type: "method",
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error("容量值不能为空"));
                }
                else if (!/^\+?[0-9][0-9]*$/.test(value)) {
                  callback(new Error("容量值必须为大于等于0的整数"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ]
        },
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getVehicleCapacityList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getVehicleCapacityList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getVehicleCapacityList();
      },
      // 容量设置
      edit(data){

        this.$refs["formData"].resetFields();

        this.formData = {
          coalId: data.cid,
          coalName: data.coal_name,
          max_trucknum: data.max_trucknum == -1 ? null : data.max_trucknum
        }

        this.dlgVisible = true;
        
      },
      // 设置确定
      createSubmit(){

        this.$refs["formData"].validate(valid => {

          if (valid) {

            this.modifyLoading = true;

            this.$commonService
              .post("/coal/updateMaxTruckNum", this.formData)
              .then(res => {
                this.modifyLoading = false;
                
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("修改成功！");
                this.getVehicleCapacityList();
                this.dlgVisible = false;
              })
              .catch(err => {
                this.modifyLoading = false;
                err.msg && this.$Message.error(err.msg);
              });

          }
        });

      },
      getVehicleCapacityList(){
        this.loading = true;
        this.$commonService
          .post("/coal/getCoalList", {
            dto: {
              "keywords": this.keywords,
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
      // this.getCoalTypeList();
      this.getVehicleCapacityList();
    }
  }
</script>