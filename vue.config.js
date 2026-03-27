module.exports = {
  // 生产环境打包配置（核心）
  publicPath: '/', // 打包后静态文件的基础路径，设为/即可
  outputDir: 'dist', // 打包输出目录，默认就是 dist
  productionSourceMap: false, // 关闭生产环境 sourcemap，减小体积

  // 开发环境配置
  devServer: {
    port: 8081,
    host: '0.0.0.0', // 允许外部访问
    allowedHosts: 'all', // 允许所有主机访问（Vue CLI 5.0+ 新配置）
    https: false, // 禁用 HTTPS
    hot: false, // 禁用热更新，避免 WebSocket 问题
    liveReload: true, // 启用实时刷新
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
}