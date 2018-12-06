<style scoped lang="less">

</style>

<template>
  <div class="business-container">
    <Input placeholder="关键字（车牌号、车主）" v-model="keywords" clearable style="width: 200px;margin-top: 5px;" />
    <Select v-model="carType" filterable clearable style="width:200px;margin-top: 5px;" placeholder="车型">
      <Option v-for="(item, index) in carTypeList" :key="index" :value="item.value">{{item.label}}</Option>
    </Select>
    <Select v-model="useType" filterable clearable style="width:200px;margin-top: 5px;" placeholder="内外部车辆">
      <Option :value="0">外部车辆</Option>
      <Option :value="1">内部车辆</Option>
    </Select>
    <RadioGroup v-model="carStatus" type="button" style="margin-top: 5px;">
      <Radio :label="-1">全部</Radio>
      <Radio :label="0">草稿</Radio>
      <Radio :label="1">启用中</Radio>
      <Radio :label="2">禁用中</Radio>
    </RadioGroup>
    <Button v-auth="'basedata.vehicle.query'" type="primary" icon="ios-search" @click="onSearch()" :loading="loading" style="margin-top: 5px;">查询</Button>
    <Button v-auth="'basedata.vehicle.add'" type="warning" icon="plus-round" @click="create()" style="margin-top: 5px;">新增</Button>
    <Button v-auth="'basedata.vehicle.excel'" type="warning" icon="archive" @click="importExcel()" style="margin-top: 5px;">导入excel</Button>
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
    <Modal v-model="dlgVisible" :title="dlgTitle" width="660">
      <Form ref="formData" :model="formData" :rules="formDataRules" :label-width="110">
        <Row :gutter="24">
          <Col span="12">
            <FormItem label="车牌号：" prop="truck_no">
              <Input v-model="formData.truck_no" :disabled="formData.isvalid!=0" placeholder="请输入（必填）" />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="车辆类型：" prop="truck_type">
              <Select ref="truckTypeSelect" v-model="formData.truck_type" @on-change="onSelectChange" filterable clearable placeholder="请选择（必填）">
                <Option v-for="(item, index) in carTypeList" :key="index" :value="item.value">{{item.label}}</Option>
              </Select>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="24">
          <Col span="12">
            <FormItem label="额定载重：" prop="rated_load">
              <Input v-model.number="formData.rated_load" placeholder="请输入（必填）" >
                <span slot="append">吨</span>
              </Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="车辆皮重：" prop="tare">
              <Input v-model.number="formData.tare" placeholder="请输入（必填）" >
                <span slot="append">吨</span>
              </Input>
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="24">
          <Col span="12">
            <FormItem label="是否内部车辆：" prop="use_type">
              <RadioGroup v-model="formData.use_type">
                <Radio :label="1">是</Radio>
                <Radio :label="0">否</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="车主：" prop="owner">
              <Input v-model="formData.owner" placeholder="请输入" />
            </FormItem>
          </Col>
        </Row>
        <Row :gutter="24">
          <Col span="12">
            <FormItem label="车主电话：" prop="owner_tel">
              <Input v-model="formData.owner_tel" placeholder="请输入" />
            </FormItem>              
          </Col>
          <Col span="12">
            <FormItem label="车主地址：" prop="owner_add">
              <Input v-model="formData.owner_add" placeholder="请输入" />
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="24">
          <Col span="12">
            <FormItem label="司机：" prop="driver">
              <Input v-model="formData.driver" placeholder="请输入" />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="司机电话：" prop="driver_tel">
              <Input v-model="formData.driver_tel" placeholder="请输入" />
            </FormItem>              
          </Col>
        </Row>
        <Row :gutter="24">
          <Col span="12">
            <FormItem label="车厢长度：" prop="truck_length">
              <Input v-model.number="formData.truck_length" placeholder="请输入" >
                <span slot="append">米</span>
              </Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="车厢宽度：" prop="truck_width">
              <Input v-model.number="formData.truck_width" placeholder="请输入" >
                <span slot="append">米</span>
              </Input>
            </FormItem>              
          </Col>
        </Row>
         <Row :gutter="24">
          <Col span="12">
            <FormItem label="车身颜色：" prop="truck_colour">
              <Input v-model="formData.truck_colour" placeholder="请输入" />
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="备注：">
              <Input v-model="formData.memo" placeholder="请输入" type="textarea" />
            </FormItem>            
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="createSubmit()" :loading="modifyLoading">确定</Button>
        <Button type="default" @click="dlgVisible=false" >取消</Button>
      </div>
    </Modal>

    <!-- 导入excel -->
    <Modal v-model="excelDlgVisible" title="导入excel" width="400px;">
      <Upload
        type="drag"
        name="excelFile"
        accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
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
        dlgTitle: "新增",
        loading: false, // 列表
        modifyLoading: false, // 新增修改
        uploadFile: null,
        uploadAction: this.$config.get('commonBaseUrl') + "/excel/importTruckInfo",
        carStatus: -1,
        carType: "",
        useType: -1,
        keywords: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        carTypeList: [],
        rows: [],
        formData:{
          "truck_colour": "",
          "truck_length": null,
          "truck_no": "",
          "owner": "",
          "owner_add": "",
          "owner_tel": "",
          "use_type": 0,
          "isvalid": "", // 车辆状态:0表示草稿状态，1表示启用，2表示禁用
          "truck_type": "",
          "truck_width": null,
          "driver": "",
          "driver_tel": "",
          "tid": "",
          "rated_load": null,
          "remark": "",
          "tare": null
        },
        formDataRules: {
          truck_no: [
            { required: true, message: "车牌号不能为空", trigger: "blur" },
            {
              type: "method",
              validator: (rule, value, callback) => {
                if (value && !/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/.test(value)) {
                  callback(new Error("车牌号格式不正确"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          use_type: [
            { required: true, type: "number", message: "是否内部用车不能为空", trigger: "change" },
          ],
          truck_colour: [
            { max: 10, message: "车身颜色不能超过10个字", trigger: "blur" },
          ],
          truck_length: [
            {
              type: "method",
              validator: (rule, value, callback) => {
                if (value && !/^([1-9]\d?(\.\d{1,2})?|0\.\d{1,2}|100)$/.test(value)) {
                  callback(new Error("必须>0且≤100，可保留两位小数"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            },
          ],
          owner: [
            { max: 10, message: "车主姓名不能超过10个字", trigger: "blur" },
          ],
          owner_add: [
            { max: 40, message: "车主地址不能超过40个字", trigger: "blur" },
          ],
          owner_tel: [
            {
              type: "method",
              validator: (rule, value, callback) => {
                let filter = /^1\d{10}$/;
                if (value && !filter.test(value)) {
                  callback(new Error("请输入11位正确格式"));
                } else {
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          truck_type: [
            { required: true, type: "number", message: "车辆类型不能为空", trigger: "change" },
          ],
          truck_width: [
            {
              type: "method",
              validator: (rule, value, callback) => {
                if (value && !/^([1-9]\d?(\.\d{1,2})?|0\.\d{1,2}|100)$/.test(value)) {
                  callback(new Error("必须>0且≤100，可保留两位小数"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          driver: [
            { max: 10, message: "司机姓名不能超过10个字", trigger: "blur" },
          ],
          driver_tel: [
            {
              type: "method",
              validator: (rule, value, callback) => {
                let filter = /^1\d{10}$/;
                if (value && !filter.test(value)) {
                  callback(new Error("请输入11位正确格式"));
                } else {
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          rated_load: [
            {
              required: true,
              type: "method",
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error("额定载重不能为空"));
                }
                else if (!/^([1-9]\d?(\.\d{1,2})?|0\.\d{1,2}|100)$/.test(value)) {
                  callback(new Error("必须>0且≤100，可保留两位小数"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ],
          tare: [
            {
              required: true,
              type: "method",
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error("车辆皮重不能为空"));
                }
                else if (!/^([1-9]\d?(\.\d{1,2})?|0\.\d{1,2}|100)$/.test(value)) {
                  callback(new Error("必须>0且≤100，可保留两位小数"));
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
          // {
          //   type: 'selection',
          //   key: "id",
          //   fixed: "left",
          //   width: 60,
          // },
          {
            title: "车牌号",
            key: "truck_no",
            fixed: "left",
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
            title: "状态",
            key: "isvalid",
            minWidth: 75,
            render: (h, params) => {
              return h("span", params.row.isvalid == 0 ? "草稿" : params.row.isvalid == 1 ? "启用中" : "禁用中");
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
            title: "是否内部用车",
            key: "use_type",
            minWidth: 110,
            render: (h, params) => {
              return h("span", params.row.use_type == 0 ? "否" : params.row.use_type == 1 ? "是" : "");
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
                      value: 'basedata.vehicle.handle'
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
                      value: 'basedata.vehicle.modify'
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
                      value: 'basedata.vehicle.delete'
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
          .post("/excel/importTruckInfo", formData)
          .then(res => {
            this.excelLoading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.$Message.success(res.msg);
            this.getVehicleList();
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
        this.getVehicleList();
      },
      // 分页
      onPageChanged(page){
        this.currentPage = page;
        this.getVehicleList();
      },
      // 分页
      onPageSizeChanged(size) {
        this.currentPage = 1;
        this.pageSize = size;
        this.getVehicleList();
      },
      // 下拉框change
      onSelectChange(value) {
        for(let i = 0; i < this.carTypeList.length;i++) {
          if (this.carTypeList[i].value == value) {
            this.formData.rated_load = this.carTypeList[i].parameter;
            break;
          }
        }
      },
      // 删除
      delete(data){

        this.$Modal.confirm({
          title: '提示',
          content:  `<p>确定<span style="color: red;font-size: 16px;"> 删除 </span>
                    车牌号为<span style="color: red;font-size: 16px;"> ${data.truck_no} </span>车辆吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post("/car/deleteCar", {
                dto: {
                  car_id: [data.tid]
                }
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success("删除成功！");
                this.getVehicleList();
              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }
        });
      },
      // 改变状态
      changeStatus(data) {

        // 车辆状态:0表示草稿状态，1表示启用，2表示禁用
        let url = data.isvalid == 1 ? "/car/disableCar" : "/car/enableCar";
        let action = data.isvalid == 1 ? '禁用' : '启用';

        this.$Modal.confirm({
          title: '提示',
          content: `<p>确定<span style="color: red;font-size: 16px;"> ${ action } </span>
                  车牌号为<span style="color: red;font-size: 16px;"> ${ data.truck_no } </span>车辆吗？</p>`,
          loading: true,
          onOk: () => {
            this.$commonService
              .post(url, {
                dto: {
                  car_id: [data.tid]
                }
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success(`${ action }成功！`);
                this.getVehicleList();
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
          "truck_colour": data.truck_colour,
          "truck_length": data.truck_length,
          "truck_no": data.truck_no,
          "owner": data.owner,
          "owner_add": data.owner_add,
          "owner_tel": data.owner_tel,
          "use_type": data.use_type,
          "isvalid": data.isvalid, // 车辆状态:0表示草稿状态，1表示启用，2表示禁用
          "truck_type": data.truck_type,
          "truck_width": data.truck_width,
          "driver": data.driver,
          "driver_tel": data.driver_tel,
          "tid": data.tid,
          "rated_load": data.rated_load,
          "tare": data.tare,
          "memo": data.memo
        };

        this.dlgVisible = true;
        this.dlgTitle = "修改";

      },
      // 新增
      create(){
        
        this.$refs["formData"].resetFields();
        this.$refs["truckTypeSelect"].setQuery(null);

        this.formData = {
          "truck_colour": "",
          "truck_width": null,
          "truck_no": "",
          "owner": "",
          "owner_add": "",
          "owner_tel": "",
          "use_type": 0,
          "isvalid": "", // 车辆状态:0表示草稿状态，1表示启用，2表示禁用
          "truck_type": "",
          "truck_length": null,
          "driver": "",
          "driver_tel": "",
          "id": "",
          "rated_load": null,
          "memo": "",
          "tare": null,
        }

        this.dlgVisible = true;
        this.dlgTitle = "新增";

      },
      // 新增或者修改
      createSubmit(){

        this.$refs["formData"].validate(valid => {
          if (valid) {

            let params = Object.assign({},this.formData);
            params.truck_no = params.truck_no.toUpperCase();

            for (let i = 0;i<this.carTypeList.length;i++) {
              if (this.carTypeList[i].value == params.truck_type) {
                params.truck_type_name = this.carTypeList[i].label;
                break;
              }
            }

            this.modifyLoading = true;

            // 车辆状态:0表示草稿状态，1表示启用，2表示禁用
            let url = this.dlgTitle == '修改' ? "/car/updateCar" : "/car/addCar";
            this.$commonService
              .post(url, {
                dto: params
              })
              .then(res => {
                this.modifyLoading = false;
                
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                
                this.$Message.success(`${this.dlgTitle}成功！`);
                this.getVehicleList();
                this.dlgVisible = false;
              })
              .catch(err => {
                this.modifyLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });

      },
      getVehicleList(){
        this.loading = true;
        this.$commonService
          .post("/car/getCarList", {
            dto: {
              "isvalid": this.carStatus,
              "truck_type": this.carType,
              "keywords": this.keywords,
              "use_type": this.useType >= 0 ? this.useType : -1,
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
      },
      getCarTypeList() {
        this.$commonService
          .get("/basisType/getBasisTypeListByCode", {
            "code": "carType"
          })
          .then(res => {
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            this.carTypeList = res.data;
            this.carTypeList.map(item=>{
              item.parameter = item.parameter ? Number(item.parameter) : null;
              return item;
            })
          })
          .catch(err => {
            err.msg && this.$Message.error(err.msg);
          });
      }
    },
    mounted(){
      this.getCarTypeList();
      this.getVehicleList();
    }
  }
</script>