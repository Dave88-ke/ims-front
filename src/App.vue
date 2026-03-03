<template>
  <div id="app">
    <!-- 核心：必须保留 router-view，用于渲染当前路由对应的页面 -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  #app {
    font-size: 14px;
  }
}
</style>