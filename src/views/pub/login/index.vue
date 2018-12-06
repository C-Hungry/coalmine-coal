<style scoped lang="less">
  .login {
    // background: -webkit-linear-gradient(#5cadff, #90CBF2);
    background-image: url(../../../assets/login-bg.jpg);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: bottom center;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    .login-form {
      margin: 0;
      padding: 0 !important;
      border: 0;
      width: 480px;
      height: 360px;
      padding: 10px;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: solid 1px #ddd;
      border-radius: 10px;
      background-color: rgba(255, 255, 255, 0.1);
      .login-form-area {
        position: absolute;
        top: 10px;
        bottom: 10px;
        left: 10px;
        right: 10px;
        border-radius: 8px;
        background-color: #e8f2f9;
        .login-title {
          display: block;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 5px 5px 0 0;
          height: 130px;
          color: #084489;
          font-size: 26px;
          line-height: 130px;
          text-align: center;
          img {
            width: 200px;
            margin-top: 30px;
          }
        }
        .login-content {
          position: absolute;
          top: 130px;
          bottom: 0;
          left: 0;
          right: 0;
          margin: 0 64px;
        }
      }
    }
    .footer {
      position: absolute;
      bottom: 60px;
      left: 50%;
      transform: translate(-50%, 0);
      color: #ccc;
      font-size: 13px;
      line-height: 25px;
      text-align: center;
    }
  }
</style>

<template>
  <div class="login">
    
    <div class="footer">
      陕西中矿科技有限公司&nbsp;&nbsp;提供技术支持
      <!-- <br> COPYRIGHT©陕西中矿WWW.ZKKJGS.COM&nbsp;陕ICP备&nbsp;13013915号-3&nbsp;ICP证：陕B2-20140148 -->
    </div>
    <div class="login-form">
      <div class="login-form-area">
        <div class="login-title">
          <img src="../../../assets/cjg-logo.png" alt="">
          <span style="display: inline-block;margin: -50px -4px 0px;font-size: 22px;vertical-align: middle;color: #f80;">&nbsp;|&nbsp;运销管理系统</span>
        </div>
        <!-- <label class="login-title">柴家沟煤矿</label> -->
        <div class="login-content">
          <Form ref="login" :model="frmLogin" :rules="ruleLogin">
            <FormItem prop="userName">
              <Input type="text" v-model="frmLogin.userName" placeholder="账号" @on-keydown="keydown">
                <Icon type="ios-person-outline" :size="18" style="padding: 0 5px;" slot="prepend"></Icon>
              </Input>
            </FormItem>
            <FormItem prop="password">
              <Input type="password" v-model="frmLogin.password" placeholder="密码" @on-keydown="keydown">
                <Icon type="ios-locked-outline" :size="18" style="padding: 0 5px;" slot="prepend"></Icon>
              </Input>
            </FormItem>
            <FormItem>
              <Button type="primary" long @click="submit()" :loading="loading">登录</Button>
            </FormItem>
          </Form>
        </div>
      </div>
    </div>
    <Modal v-model="frmChooseCompany.visible" title="选择公司" width="360" :mask-closable="false">
      <div style="text-align:center">
        <RadioGroup v-model="frmChooseCompany.current">
          <Radio v-for="(company,index) in frmChooseCompany.depts" :key="index" :label="company.id"> {{company.deptName}}</Radio>
        </RadioGroup>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" @click="choose()">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      frmLogin: {
        userName: "",
        password: ""
      },
      ruleLogin: {
        userName: [{
          required: true,
          message: "请输入账号",
          trigger: "blur"
        }],
        password: [{
          required: true,
          message: "请输入密码",
          trigger: "blur"
        }]
      },
      frmChooseCompany:{
        visible: false,
        depts: [
          // {
          //   id: 1,
          //   deptName: "陕西中矿",
          //   token: "asdfsa232r2fsff"
          // }
        ],
        userInfo: null,
        current: "",
      },
    };
  },
  methods: {
    keydown(e) {
      var eCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
      if (eCode == 13) {
        this.submit();
      }
    },
    authorized(userInfo, deptInfo){
      let info = {
        loginAccount: this.frmLogin.userName,
        userName: userInfo.userName,
        telephone: userInfo.telephone,
        userId: userInfo.id,
        deptName: deptInfo.deptName,
        deptType: null,
        companyName: "",
        companyId: ""
      }

      this.$storage.saveToken(deptInfo.token);
      this.$storage.saveUserInfo(info);

      this.$store.dispatch('loadPermissions').then(() => {
        this.$Message.success("登录成功！");
        this.$router.replace("/auth/home");
      });

      // 获取所属公司信息
      this.$commonService
        .get("/user/getUserCompany", {})
        .then(res => {

          if(!res.success){
            this.$Message.error(res.msg);
            return;
          }

          info.companyName = res.data.deptName;
          info.companyId = res.data.id;
          info.deptType = res.data.deptType;
          this.$storage.saveUserInfo(info);
        })
        .catch(err => {
          err.msg && this.$Message.error(err.msg);
        });

    },
    choose(){

      if(!this.frmChooseCompany.current){
        this.$Message.warning("请选择登录公司！");
        return;
      }
      
      this.frmChooseCompany.visible = false;
      var deptInfo = this.frmChooseCompany.depts.filter(x=>x.id == this.frmChooseCompany.current)[0];
      this.authorized(this.frmChooseCompany.userInfo, deptInfo);
    },
    submit() {

      this.$storage.removeToken();

      this.$refs.login.validate(valid => {
        
        if (!valid) return;

        this.loading = true;

        this.$loginService
          .post("/login/login", {
            username: this.frmLogin.userName,
            password: this.frmLogin.password
          })
          .then(res => {
            
            this.loading = false;

            if (!res.success) {
              this.$Message.error(res.msg);
              return;
            }

            //无所属公司，报错
            if(res.data.deptList.length<=0){
              this.$Message.error("未获取到所属组织机构！");
              return;
            }

            //当用户只有一个所属公司时，直接跳转
            if(res.data.deptList.length==1){
              this.authorized(res.data,res.data.deptList[0]);
              return;
            }

            //当用户有多个所属公司时，需要选择
            this.frmChooseCompany.userInfo = res.data;
            this.frmChooseCompany.depts = res.data.deptList;
            this.frmChooseCompany.visible = true;
            
          })
          .catch(err => {
            console.log(err);
            this.loading = false;
            err.msg && this.$Message.error(err.msg);
          });
      });
    }
  }
};
</script>
