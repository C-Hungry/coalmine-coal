<style scoped>
  @import 'styles/common.css';
</style>

<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    data() {
      return {}
    },
    mounted() {
      document.domain = document.domain;
    },
    beforeDestroy() {},
    methods: {}
  }
</script>
