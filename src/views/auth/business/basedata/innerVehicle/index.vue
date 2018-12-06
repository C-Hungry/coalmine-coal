<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <Input placeholder="车牌号" v-model="vehicleNum" clearable style="width: 200px;margin-top:5px;" />
    <Select v-model="groupId" clearable placeholder="班组" style="width: 200px;margin-top:5px;" >
      <Option v-for="(item, index) in groupList" :key="index" :value="item.value">{{item.label}}</Option>
    </Select>
    <Button type="primary" v-auth="'basedata.innerVehicle.query'" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top:5px;">查询</Button>
    <Button type="warning" v-auth="'basedata.innerVehicle.setGroup'" icon="plus-round" @click="create()" style="margin-top:5px;">班组设置</Button>
    <br><br>
    <Table 
      border 
      :columns="columns" 
      :data="rows" 
      :loading="loading"
      @on-selection-change="onTableSelectChange"
      ></Table>
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
      <Form ref="formData" :model="formData" :rules="formDataRules" :label-width="120">
        <Row :gutter="12">
          <FormItem label="班组：" prop="team_id">
            <Select ref="groupSelect" style="width: 300px;" v-model="formData.team_id" filterable clearable placeholder="请选择（必填）">
              <Option v-for="(item, index) in groupList" :key="index" :value="item.value">{{item.label}}</Option>
            </Select>
          </FormItem>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="createSubmit()" :loading="modifyLoading">确定</Button>
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
        dlgTitle: "新增",
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        vehicleNum: "",
        groupId: null,
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        rows: [],
        groupList: [],
        formData:{
          "team_name": "",
          "team_id": null,
          "car_ids": []
        },
        formDataRules: {
          team_id: [
            { required: true, type: "number" ,message: "班组不能为空", trigger: "change" }
          ]
        },
        columns: [
          {
            type: "selection",
            key: "tid",
            fixed: "left",
            width: 53,
          },
          {
            title: "车牌号",
            key: "truck_no",
            fixed: "left",
            minWidth: 95
          },
          {
            title: "班组",
            key: "team_name",
            minWidth: 95
          },
          {
            title: "车型",
            key: "truck_type_name",
            minWidth: 85
          },
          {
            title: "额定载重(吨)",
            key: "rated_load",
            minWidth: 105,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.rated_load));
            }
          },
          {
            title: "皮重(吨)",
            key: "tare",
            minWidth: 85,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.tare));
            }
          },
          {
            title: "车主",
            key: "owner",
            minWidth: 80
          },
          {
            title: "车主电话",
            key: "owner_tel",
            minWidth: 115
          },
          {
            title: "车主地址",
            key: "owner_add",
            minWidth: 120
          },
          {
            title: "司机",
            key: "driver",
            minWidth: 75
          },
          {
            title: "司机电话",
            key: "driver_tel",
            minWidth: 115
          },
          {
            title: "颜色",
            key: "truck_colour",
            minWidth: 80
          },
          {
            title: "车厢长度(米)",
            key: "truck_length",
            minWidth: 110,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.truck_length));
            }
          },
          {
            title: "车厢宽度(米)",
            key: "truck_width",
            minWidth: 110,
            render: (h, params) => {
              return h("span", this.$utils.formatNum(params.row.truck_width));
            }
          },
          {
            title: "创建人",
            key: "creator_user_name",
            minWidth: 75
          },
          {
            title: "创建时间",
            key: "create_time",
            minWidth: 150
          },
          {
            title: "备注",
            key: "memo",
            minWidth: 160
          }
        ]
      };
    },
    methods:{
      // 搜索
      onSearch() {
        this.currentPage = 1;
        this.getInnerTruckList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getInnerTruckList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getInnerTruckList();
      },
      // 多选变化
      onTableSelectChange(selection) {
        this.formData.car_ids = [];
        selection.forEach(item=>{
          this.formData.car_ids.push(item.tid);
        })
      },
      // 新增
      create(){
        if (this.formData.car_ids.length == 0) {
          this.$Message.warning("请先选择车辆！");
          return;
        }
        this.$refs["formData"].resetFields();
        this.$refs["groupSelect"].setQuery(null);
        this.formData.team_id = null;
        this.formData.team_name = "";
        this.dlgVisible = true;
        this.dlgTitle = "新增";
      },
      // 新增或者修改
      createSubmit(){
        this.$refs["formData"].validate(valid => {
          if (valid) {
            this.modifyLoading = true;
            this.$commonService
              .post("/car/setTruckBatch", {
                dto: this.formData
              })
              .then(res => {
                this.modifyLoading = false;
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.success(`班组设置成功！`);
                this.getInnerTruckList();
                this.dlgVisible = false;
              })
              .catch(err => {
                this.modifyLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });

      },
      // 获取内部车辆列表
      getInnerTruckList(){
        this.loading = true;
        this.$commonService
          .post("/car/getInnerTruckList", {
            dto: {
              "currentPage": this.currentPage,
              "pageSize": this.pageSize,
              "card_type": -1,
              "truck_no": this.vehicleNum,
              "team_id": this.groupId || -1
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
      // 获取班组列表
      getGroupList() {
        this.$commonService
          .get("/basisType/getBasisTypeListByCode", {
            "code": "group"
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.groupList = res.data;
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      },
    },
    mounted(){
      this.getGroupList();
      this.getInnerTruckList();
    }
  }
</script>