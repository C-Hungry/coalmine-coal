<style scoped lang="less">
  .org {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 0;
    .tree{
      height: 100%;
      margin: 0 10px;
      min-width: 300px;
      position: relative;
      .switch-list{
        padding: 0 15px;
        list-style: none;
        .switch-item {
          height: 40px;
          line-height: 40px;
          display: inline-block;
          margin-right: 16px;
        }
      }
      .content{
        position: absolute;
        top: 40px;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 10px;
        overflow-y: auto;
        overflow-x: hidden;
      }
    }
  }
</style>

<template>
  <div class="org">
    <div class="tree">
      <ul class="switch-list">
        <li class="switch-item">
          <Switch v-model="props.isFold" size="small"></Switch>&nbsp;&nbsp;<span style="vertical-align: middle;">全部展开</span>
        </li>
        <li class="switch-item">
          <Switch v-model="props.showIndex" size="small"></Switch>&nbsp;&nbsp;<span style="vertical-align: middle;">显示序号</span>
        </li>
        <li class="switch-item">
          <Switch v-model="props.showHeader" size="small"></Switch>&nbsp;&nbsp;<span style="vertical-align: middle;">显示标题</span>
        </li>
      </ul>
      <div class="content">
        <Spin fix v-if="loading" size="large"></Spin>
        <zk-table
          ref="table"
          :data="data"
          :columns="columns"
          :border="props.border"
          :show-header="props.showHeader"
          :show-index="props.showIndex"
          :is-fold="!props.isFold"
          :expand-type="props.expandType"
          :selection-type="props.selectionType">
          <template slot="operation" slot-scope="scope">
            <Button type="success" size="small" v-if="!scope.row.pid" @click="create(scope.row)" v-auth="'system.dict.add'">新增</Button>
            <Button type="warning" size="small" :disabled="!scope.row.isDel" @click="edit(scope.row)" v-auth="'system.dict.modify'">修改</Button>
            <Button type="error" size="small" :disabled="!scope.row.isDel" @click="del(scope.row)" v-auth="'system.dict.delete'">删除</Button>
          </template>
        </zk-table>
      </div>
    </div>

    <!-- 修改或新增 -->
    <Modal v-model="dlgVisible" :title="dlgTitle">
      <Form :label-width="100" ref="formData" :model="formData" :rules="formDataRules">
        <FormItem label="名称：" prop="name">
          <Input v-model="formData.name" placeholder="请输入（必填且唯一）" />
        </FormItem>
        <FormItem label="编码：" prop="code">
          <Input v-model="formData.code" :disabled="dlgTitle == '修改'" placeholder="请输入（必填且唯一，确认后不可修改）" />
        </FormItem>
        <FormItem label="排序：" prop="sortNum">
          <Input v-model.number="formData.sortNum" placeholder="请输入（必填）" />
        </FormItem>
        <FormItem label="参数值：">
          <Input v-model="formData.parameter" placeholder="请输入" />
        </FormItem>
        <FormItem label="说明：">
          <Input v-model="formData.remark" placeholder="请输入" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="dlgTitle=='新增'?createSubmit():editSubmit()" :loading="submitLoading">确定</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        props: {
          border: true,
          showHeader: true,
          showIndex: false,
          isFold: false,
          expandType: false,
          selectionType: false,
        },
        loading: false,
        submitLoading: false,
        data: [],
        columns: [
          {
            label: '名称',
            prop: 'name',
            minWidth: '200px'
          },
          {
            label: '编码',
            prop: 'code',
          },
          {
            label: '参数值',
            prop: 'parameter',
          },
          {
            label: '排序',
            prop: 'sortNum',
          },
          {
            label: '说明',
            prop: 'remark',
          },
          {
            label: "操作",
            prop: "operation",
            align: "right",
            width: 148,
            type: 'template',
            template: 'operation'
          }
        ],
        dlgTitle: "",
        dlgVisible: false,
        formData:{
          "name": "",
          "parameter": "",
          "pid": "",
          "remark": "",
          "code": "",
          "id": 0,
          "isModify": 0,
          "sortNum": null,
        },
        formDataRules: {
          "name": [
            { required: true, message: "名称不能为空", trigger: "blur" }
          ],
          "code": [
             { required: true, message: "编码不能为空", trigger: "blur" }
          ],
          "sortNum": [
            {
              required: true, 
              type: "method",
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error("排序不能为空"));
                }
                else if (!/^\+?[0-9][0-9]*$/.test(value)) {
                  callback(new Error("排序必须为≥0的整数"));
                }
                else{
                  callback();
                }
              },
              trigger: "blur"
            }
          ]
        }
      };
    },
    methods: {
      // 新增基础类型
      create(dept){

        this.$refs["formData"].resetFields();

        this.formData.name = "";
        this.formData.pid = dept.id;
        this.formData.remark = "";
        this.formData.parameter = "";
        this.formData.sortNum = null,
        this.formData.code = "";
        this.formData.isModify = dept.isModify;
        
        this.dlgTitle = "新增"
        this.dlgVisible = true;

      },
      // 新增类型
      createSubmit(){
        
        this.$refs["formData"].validate(valid => {
          if (valid) {

            this.submitLoading = true;
            this.$commonService
              .post("/basisType/addBasisType", {
                commonDeptDto: {
                  "name": this.formData.name,
                  "pid": this.formData.pid,
                  "remark": this.formData.remark,
                  "parameter": this.formData.parameter,
                  "code": this.formData.code,
                  "isModify": this.formData.isModify,
                  "sortNum": this.formData.sortNum
                }
              })
              .then(res => {
                this.submitLoading = false;
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.dlgVisible = false
                this.$Message.success("新增类型成功！");
                this.query();
              })
              .catch(err => {
                this.submitLoading = false;
                err.msg && this.$Message.error(err.msg);
              });

          }
        });
        
      },
      // 修改类型
      edit(data){

        this.$refs["formData"].resetFields();

        this.formData = {
          name: data.name,
          id: data.id,
          pid: data.pid,
          remark: data.remark,
          parameter: data.parameter,
          code: data.code,
          isModify: data.isModify,
          sortNum: data.sortNum
        }

        this.dlgTitle = "修改";
        this.dlgVisible = true;

      },
      // 修改组织机构提交
      editSubmit(){

        this.$refs["formData"].validate(valid => {
          if (valid) {
            this.submitLoading = true;
            this.$commonService
              .post("/basisType/updateBasisType", {
                commonDeptDto: {
                  "name": this.formData.name,
                  "id": this.formData.id,
                  "name": this.formData.name,
                  "code": this.formData.code,
                  "parameter": this.formData.parameter,
                  "pid": this.formData.pid,
                  "isModify": this.formData.isModify,
                  "remark": this.formData.remark,
                  "sortNum": this.formData.sortNum
                }
              })
              .then(res => {
                this.submitLoading = false;
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }
                this.dlgVisible = false
                this.$Message.success("修改类型信息成功！");
                this.query();
              })
              .catch(err => {
                this.submitLoading = false;
                err.msg && this.$Message.error(err.msg);
              });
          }
        });

      },
      // 删除组织机构
      del(data){
        this.$Modal.confirm({
          title: '提示',
          content: '<p>确定删除此类型？</p>',
          loading: true,
          onOk: () => {

            this.$commonService
              .post("/basisType/deleteByPIdAndId", {
                id: data.id
              })
              .then(res => {
                this.$Modal.remove();
                if(!res.success){
                  this.$Message.error(res.msg);
                  return;
                }

                this.$Message.success("删除成功！");
                this.query();

              })
              .catch(err => {
                this.$Modal.remove();
                err.msg && this.$Message.error(err.msg);
              });
          }
        });
      },
      // 查询基础类型
      query(){
        this.loading = true;
        this.$commonService
          .get("/basisType/getBasisTypeList", {})
          .then(res => {
            this.loading = false;
            if(!res.success){
              this.$Message.error(res.msg);
              return;
            }
            
            let self = this;
            var formate = function(data, deep, isParentsFold) {
              data.forEach((item,index) => {
                
                var row = (self.$refs.table._data && self.$refs.table._data.bodyData.filter(row => row.id == item.id)[0]) || null;
                if(row){
                  item._isHide = row._isHide;
                  item._isFold = row._isFold;
                }
                else if(self.$refs.table._data.bodyData.length > 0){
                  item._isHide = isParentsFold;
                  item._isFold = true;
                }
                item.isDel = deep > 0 && item.isModify == 1;
                if(item.children && item.children.length > 0) formate(item.children, deep + 1, (row && row._isFold) || isParentsFold)
              });
            };
            
            formate(res.data, 0, false);

            this.data = res.data;

          })
          .catch(err => {
            console.log(err)
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      }
    },
    mounted(){
      this.query();
    }
  }
</script>

