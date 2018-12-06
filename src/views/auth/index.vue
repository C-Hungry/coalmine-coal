<style scoped lang="less">
.frame-main {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  min-width: 1024px;
  .frame-head {
    position: absolute;
    top: 0;
    height: 60px;
    left: 0;
    right: 0;
    background-color: #3a71cb;
    color: white;
    font-weight: bold;
    line-height: 60px;
    font-size: 18px;
    padding: 0 0 0 20px;
    .frame-user {
      float: right;
      height: 100%;
      max-width: 250px;
      padding: 0 5px;
      text-align: center;
      // border-left: solid 1px #2657a6;
    }
    .frame-link {
      float: right;
      height: 100%;
      width: 60px;
      text-align: center;
      // border-left: solid 1px #2657a6;
      cursor: pointer;
    }
  }
  .frame-body {
    position: absolute;
    top: 60px;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    background-color: #495060;
    .frame-menu {
      background-color: #495060;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      .frame-menu-item {
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
      }
      .frame-menu-selected {
        background-color: #2d8cf0;
      }
      .frame-menu-bottom {
        flex: 1;
        overflow: auto;
      }
      /*定义滚动条轨道*/
      .frame-menu-bottom::-webkit-scrollbar-track {
        background-color: #4c5e70;
        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.0);
      }
      /*定义滚动条高宽及背景*/
      .frame-menu-bottom::-webkit-scrollbar {
        width: 0px;
        background-color: rgba(0, 0, 0, 0.34);
      }
      /*定义滚动条*/
      .frame-menu-bottom::-webkit-scrollbar-thumb {
        background-color: #dee4e9;
        border-radius: 0px;
      }
    }
    .frame-menu-short {
      // width: 60px;
      background-color: #495060;
      .frame-menu-item {
        // border-bottom: solid 1px #242833;
        height: 45px;
        text-align: center;
        cursor: pointer;
      }
      .frame-menu-selected {
        background-color: #2d8cf0;
      }
      .frame-menu-subitem {
        height: 40px;
        line-height: 40px;
      }
      .frame-menu-icon {
        line-height: 49px;
        color: #fff;
      }
    }
    .frame-content {
      flex: 1;
      position: relative;
      overflow-y: hidden;
      .frame-fullScreen {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 1000;
        .frame-title {
          position: absolute;
          top: 0;
          height: 40px;
          left: 0;
          right: 0;
          background-color: #f1f2f6;
          line-height: 40px;
          font-size: 15px;
          .frame-fullScreen-btn {
            height: 100%;
            width: 80px;
            float: right;
            cursor: pointer;
            text-align: center;
          }
        }
        .frame-view {
          position: absolute;
          top: 40px;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: white;
          overflow: auto;
        }
        /*定义滚动条轨道*/
        .frame-view::-webkit-scrollbar-track {
          background-color: #4c5e70;
          -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.0);
        }
        /*定义滚动条高宽及背景*/
        .frame-view::-webkit-scrollbar {
          width: 0px;
          background-color: rgba(0, 0, 0, 0.34);
        }
        /*定义滚动条*/
        .frame-view::-webkit-scrollbar-thumb {
          background-color: #dee4e9;
          border-radius: 0px;
        }
      }
    }
  }
}
</style>
<style lang="less">
.frame-main {
  .ivu-menu-item-selected {
    color: white !important;
    background-color: #2d8cf0 !important;
  }
  .ivu-menu-vertical .ivu-menu-submenu-title-icon {
    position: absolute;
    top: 18px;
    right: 8px;
  }
}
</style>


<template>
  <div class="frame-main">
    <div class="frame-head">
      <img src="../../assets/cjg-logo.png" height="53" style="margin-top: 5px;" alt="">
      <span style="display: inline-block;margin: -44px 0 0 10px;vertical-align: middle;font-weight: 500;letter-spacing: 2px;font-size: 24px;font-family:'黑体';">运销管理系统</span>
      <div class="frame-user">
        <Dropdown trigger="click" @on-click="command" placement="bottom-end">
          <p href="javascript:void(0)" style="cursor: pointer; font-size: 16px; padding: 0 10px;">
            <span style="width: 100px;white-space:nowrap;overflow:hidden;text-overflow: ellipsis;">{{ userInfo.userName }}</span>
            <Icon type="arrow-down-b"></Icon>
          </p>
          <DropdownMenu slot="list">
            <DropdownItem name="userCenter">个人中心</DropdownItem>
            <DropdownItem name="updatePassword">修改密码</DropdownItem>
            <DropdownItem name="logout">退出</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div v-for="(item,index) in linkItems" :key="index" @click="$router.push(item.path)" class="frame-link">
        <Tooltip :content="item.menuName" placement="bottom">
            <Icon :type="item.icon"></Icon>
        </Tooltip>
      </div>
    </div>
    <div class="frame-body">
      <div style="transition: width 0.2s ease;position: relative;user-select: none;" :style="{width: hideMenu ? '60px' : '200px'}">
        <div v-if="!hideMenu" key="wide" class="frame-menu">
          <div class="frame-menu-item" v-on:click="toggleMenu()" style="height: 49px; text-align: center; cursor: pointer;">
            <Icon type="navicon-round" size="30" style="line-height: 49px; color: #fff;"></Icon>
          </div>
          <div class="frame-menu-bottom">
            <Menu theme="dark" ref="menuLeft" :active-name="activeName" :open-names="opennames" @on-select="linkTo" accordion style="width: 100%;">
              <template v-for="(item,index) in menuItems">
                <Submenu v-if="item.type=='sub'&&item.display" :name="item.name" :key="index" class="frame-menu-item">
                  <template slot="title">
                    <Icon :type="item.icon"></Icon> {{item.text}}
                  </template>
                  <MenuItem v-for="(subitem,subindex) in item.children" v-if="subitem.display" :name="subitem.name" :key="subindex">
                    &nbsp;{{subitem.text}}
                  </MenuItem>
                </Submenu>
                <MenuItem v-else-if="item.type=='item'&&item.display" :name="item.name" :key="item.name" class="frame-menu-item">
                  <Icon :type="item.icon" :key="item.name" style="width: 10.5px;"></Icon> {{item.text}}
                </MenuItem>
              </template>
            </Menu>
          </div>
        </div>
        <div v-else key="short" class="frame-menu-short">
          <div class="frame-menu-item" v-on:click="toggleMenu()">
            <Icon type="navicon-round" size="30" class="frame-menu-icon"></Icon>
          </div>
          <div v-for="(item,index) in menuItems" :key="index" class="frame-menu-item">
            <Poptip trigger="hover" v-if="item.type=='sub'&&item.display" placement="right" width="200">
              <Icon :type="item.icon" size="20" class="frame-menu-icon"></Icon>
                <div slot="content">
                  <div v-for="(subitem,subindex) in item.children" v-if="subitem.display" :name="subitem.name" :key="subindex" 
                    v-on:click="linkTo(subitem.name)" 
                    class="frame-menu-subitem">
                    {{subitem.text}}
                  </div>
                </div>
            </Poptip>
            <div v-else-if="item.type=='item'&&item.display" 
              v-on:click="linkTo(item.name)" class="frame-menu-subitem">
              <Icon size="20" :type="item.icon" class="frame-menu-icon"></Icon>
            </div>
          </div>
        </div>
      </div>
      
      <div class="frame-content">
        <div v-if="fullScreen" class="frame-fullScreen" style="position: fixed; z-index: 1000;">
          <div class="frame-view" style="top: 0;">
            <router-view></router-view>
          </div>
        </div>
        <div v-else class="frame-fullScreen" style="position: absolute; z-index: 1;">
          <div class="frame-title">
            <title style="height: 100%; width: 300px; display: inline-block; padding: 0 15px;">
              {{currentPosition}}
            </title>
            <div class="frame-fullScreen-btn" v-on:click="toggleFullScreen">
              <Icon type="arrow-expand" size="20" style="position: relative; top: 2px;"></Icon>&nbsp;全屏
            </div>
          </div>
          <div v-if="$store.getters.permissions.some(x=>x.path == $route.path) || $route.path == '/auth/home'" class="frame-view">
            <router-view></router-view>
          </div>
          <div v-else class="frame-view">
            <Spin fix>您无权限访问此界面，请联系管理员。</Spin>
          </div>
        </div>
      </div>

      <!-- 修改密码 -->
      <Modal v-model="isShowPasswordVisible" :closable="false" title="修改密码">
        <Form :label-width="100" ref="dlgUpdatePassword" :model="dlgUpdatePassword" :rules="dlgUpdatePasswordRules">
          <FormItem  label="原始密码：" prop="oldPassword">
            <Input type="password" v-model="dlgUpdatePassword.oldPassword" placeholder="请输入旧密码" />
          </FormItem>
          <FormItem label="新密码：" prop="newPassword">
            <Input type="password" v-model="dlgUpdatePassword.newPassword" placeholder="请输入新密码" />
          </FormItem>
          <FormItem label="再次输入：" prop="confirmPassword">
            <Input type="password" v-model="dlgUpdatePassword.confirmPassword" placeholder="请再次输入新密码" />
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="primary" @click="confirmPassword()" :loading="updatePasswordLoading">确定</Button>
          <Button @click="isShowPasswordVisible=false;updatePasswordLoading=false;">取消</Button>
        </div>
      </Modal>

      <!-- 个人中心 -->
      <Modal v-model="isShowUserCenter" :closable="false" title="个人中心">
        <Form :label-width="100">
          <FormItem  label="用户名：">{{userInfo.userName}}</FormItem>
          <FormItem  label="登录账号：">{{userInfo.loginAccount}}</FormItem>
          <FormItem  label="联系方式：">{{userInfo.telephone}}</FormItem>
          <FormItem  label="所属部门：">{{userInfo.deptName}}</FormItem>
          <FormItem  label="所属公司：">{{userInfo.companyName}}</FormItem>
        </Form>
        <div slot="footer">
          <Button type="primary" @click="isShowUserCenter=false">关闭</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isShowUserCenter: false,
      fullScreen: false,
      hideMenu: false,
      currentPosition: "",
      activeName: "",
      opennames: [],
      linkItems: [],
      userInfo: {},
      menuItems: [
        {
          name: "/auth/home",
          text: "首页",
          icon: "ios-home",
          type: "item",
          display: true
        }
      ],
      isShowPasswordVisible: false,
      updatePasswordLoading: false,
      dlgUpdatePassword: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      },
      dlgUpdatePasswordRules: {
        oldPassword: [
          {
            required: true, 
            type: "method",
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error("原始密码不能为空"));
              }         
              else if (value.length < 6 || value.length > 12 || !/^[0-9a-zA-Z]*$/.test(value)) {
                callback(new Error("密码必须为6-12位长度字母或数字组合"));
              }
              else{
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        newPassword: [
          {
            required: true, 
            type: "method",
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error("密码不能为空"));
              }         
              else if (value.length < 6 || value.length > 12 || !/^[0-9a-zA-Z]*$/.test(value)) {
                callback(new Error("密码必须为6-12位长度字母或数字组合"));
              }
              else if (this.dlgUpdatePassword.confirmPassword && this.dlgUpdatePassword.confirmPassword != value) {
                callback(new Error("密码不一致"));
              }
              else{
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        confirmPassword: [
          {
            required: true, 
            type: "method",
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error("密码不能为空"));
              }         
              else if (value.length < 6 || value.length > 12 || !/^[0-9a-zA-Z]*$/.test(value)) {
                callback(new Error("密码必须为6-12位长度字母或数字组合"));
              }
              else if (this.dlgUpdatePassword.newPassword && this.dlgUpdatePassword.newPassword != value) {
                callback(new Error("密码不一致"));
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
    toggleFullScreen() {
      this.fullScreen = !this.fullScreen;
      if(this.fullScreen) {
        this.$Message.info({
          content: '按ESC退出全屏',
          duration: 3,
          closable: true
        });
      }
    },
    updatePassword() {
      this.$refs["dlgUpdatePassword"].resetFields();
      this.dlgUpdatePassword = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      }
      this.isShowPasswordVisible = true;
    },
    confirmPassword() {
      this.$refs["dlgUpdatePassword"].validate(valid => {
        if (valid) {
          this.$Modal.confirm({
            title: "提示",
            content: "<p>密码修改成功后将自动跳转至登录页，确定要修改密码吗？</p>",
            loading: true,
            onOk: () => {
              this.$commonService
                .post("/user/updatePasswordByOldPassword", {
                  oldPassword: this.dlgUpdatePassword.oldPassword,
                  password: this.dlgUpdatePassword.newPassword
                })
                .then(res => {
                  if(!res.success){
                    this.$Message.error(res.msg);
                    this.$Modal.remove();
                    return;
                  }
                  this.$Message.success("修改密码成功！");
                  this.isShowPasswordVisible = false;
                  this.updatePasswordLoading = false;
                  this.$Modal.remove();
                  this.$loginService.logout();
                })
                .catch(err => {
                  console.log(err);
                  err.msg && this.$Message.error(err.msg);
                });
            }
          });
        }
      })
    },
    toggleMenu() {
      this.hideMenu = !this.hideMenu;
    },
    linkTo(target) {
      this.$router.push(target);
    },
    command(name) {
      switch (name) {
        case "userCenter": 
          this.showUserCenter();
          break;
        case "logout":
          this.$Modal.confirm({
            title: "提示",
            content: "<p>确定退出？</p>",
            loading: true,
            onOk: () => {
              this.$Modal.remove();
              this.$loginService.logout();
            }
          });
          break;
        case "updatePassword":
          this.updatePassword();
          break;
      }
    },
    showUserCenter() {
      this.isShowUserCenter = true;
    }
  },
  mounted() {
    // ESC退出全屏
    document.addEventListener("keyup",(event)=>{
      if(event.keyCode == 27) {
        this.fullScreen = false;
      }
    })

    setTimeout(() => {
      this.activeName = this.$route.path;
    }, 100);

    var userInfo = this.$storage.getUserInfo();
    if (userInfo) {
      this.userInfo = userInfo;
    } else {
      this.$loginService.logout();
      return;
    };

    //菜单
    this.$store.getters.permissions
      .filter(item => item.pid == -1)
      .forEach(item => {
        var obj = {
          name: item.path,
          text: item.menuName,
          icon: item.icon,
          children: [],
          type: item.type == "0" ? "sub" : "",
          display: true
        };
        this.$store.getters.permissions
          .filter(
            item2 =>
              item2.pid == item.id && (item2.type == "0" || item2.type == "2")
          )
          .forEach(item2 => {
            obj.children.push({
              name: item2.path,
              text: item2.menuName,
              display: true
            });
          });
        this.$store.getters.permissions
          .filter(item2 => item2.pid == item.id && item2.type == "3")
          .forEach(item2 => {
            obj.children.push({
              name: item2.path,
              text: item2.menuName,
              display: false
            });
          });
        this.menuItems.push(obj);
      });

    //快捷菜单
    this.$store.getters.permissions
      .filter(item => item.type == "2")
      .reverse()
      .forEach(item => {
        this.linkItems.push({
          menuName: item.menuName,
          path: item.path,
          icon: item.icon
        });
      });
  },
  watch: {
    $route(to, from) {
      this.activeName = to.path;
    },
    activeName(value) {
      for (var i = 0; i < this.menuItems.length; i++) {
        var temp = this.menuItems[i];
        if (temp.name == value) {
          this.currentPosition = temp.text;
          break;
        }
        if (temp.type != "sub") continue;
        for (var j = 0; j < temp.children.length; j++) {
          if (temp.children[j].name == value) {
            this.currentPosition = temp.text + " / " + temp.children[j].text;
            this.opennames = [temp.name];
            if (this.$refs.menuLeft)
              this.$refs.menuLeft.$nextTick().then(fn => {
                fn.updateOpened();
              });
            return;
          }
        }
      }
    }
  }
};
</script>
