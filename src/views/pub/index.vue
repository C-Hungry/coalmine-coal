<style scoped lang="less">
  .frame {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>

<template>
  <div class="frame">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        fullScreen: false,
        hideMenu: false,
      };
    }
  }
</script>
