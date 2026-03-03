module.exports = {
  // 生产环境打包配置（核心）
  publicPath: '/', // 打包后静态文件的基础路径，设为/即可
  outputDir: 'dist', // 打包输出目录，默认就是dist
  productionSourceMap: false, // 关闭生产环境sourcemap，减小体积

  // 开发环境配置（你原来的内容，保留）
  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 注意：这里要改！打包后Nginx会处理/api，所以这里不要重写路径
        pathRewrite: { '^/api': '' }
      }
    }
  }
}