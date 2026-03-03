<template>
  <div class="portal-container">
    <el-header class="portal-header">
      <div class="header-content">
        <el-dropdown>
          <i class="el-icon-setting" style="margin-right: 15px; cursor: pointer;"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span>欢迎回来，{{ username }}</span>
      </div>
    </el-header>

    <el-main class="portal-main">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="(menu, index) in menuList" :key="index" style="margin-bottom: 20px;">
          <el-card class="menu-card" shadow="hover" @click.native="menu.action && menu.action()">
            <div class="menu-content">
              <i :class="menu.icon" class="menu-icon"></i>
              <h3>{{ menu.title }}</h3>
              <p>{{ menu.description }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>

    <el-footer class="portal-footer">
      进销存管理系统（IMS）©2026 零成本版
    </el-footer>
  </div>
</template>

<script>
export default {
  name: 'Portal',
  data() {
    return {
      username: '',
      menuList: [
        {
          title: '商品管理',
          description: '商品的查询、新增、删除维护',
          icon: 'el-icon-goods',
          action: () => this.goToGoodsManage()
        },
        {
          title: '库房管理',
          description: '库房信息维护（待开发）',
          icon: 'el-icon-location',
          action: null
        },
        {
          title: '库存统计',
          description: '库存数据统计分析（待开发）',
          icon: 'el-icon-s-data',
          action: null
        }
      ]
    }
  },
  mounted() {
    this.username = localStorage.getItem('ims_username') || 'admin'
  },
  methods: {
    goToGoodsManage() {
      this.$router.push('/goods-manage')
    },
    handleLogout() {
      this.$confirm('确定退出登录吗？', '提示', { type: 'warning' })
          .then(() => {
            localStorage.removeItem('ims_token')
            localStorage.removeItem('ims_username')
            this.$message.success('退出成功！')
            this.$router.push('/login')
          })
          .catch(() => {
            this.$message.info('已取消退出')
          })
    }
  }
}
</script>

<style scoped>
.portal-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.portal-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}
.header-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}
.welcome-text {
  font-size: 16px;
  margin-right: 10px;
}
.portal-footer {
  background-color: #fff;
  color: #333;
  line-height: 40px;
  border-top: 1px solid #e6e6e6;
  text-align: center;
}
.portal-main {
  flex: 1;
  background-color: #f5f5f5;
  padding: 20px;
  overflow-y: auto;
}
.menu-card {
  height: 200px;
  cursor: pointer;
  transition: all 0.3s;
}
.menu-card:hover {
  transform: scale(1.02);
}
.menu-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.menu-icon {
  font-size: 48px;
  color: #1989fa;
  margin-bottom: 15px;
}
.menu-content h3 {
  margin-bottom: 10px;
  font-size: 20px;
}
.menu-content p {
  color: #999;
  font-size: 14px;
  text-align: center;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .portal-header {
    padding: 0 15px;
    line-height: 50px;
  }
  .header-content {
    justify-content: space-between;
  }
  .welcome-text {
    font-size: 14px;
  }
  .portal-main {
    padding: 15px;
  }
  .menu-card {
    height: 180px;
  }
  .menu-icon {
    font-size: 40px;
  }
  .menu-content h3 {
    font-size: 18px;
  }
  .menu-content p {
    font-size: 13px;
  }
  .portal-footer {
    line-height: 30px;
    font-size: 12px;
  }
}

@media screen and (max-width: 480px) {
  .menu-card {
    height: 160px;
  }
  .menu-icon {
    font-size: 36px;
  }
  .menu-content h3 {
    font-size: 16px;
  }
}
</style>