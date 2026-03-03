<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <h3 class="login-title">进销存管理系统（IMS）</h3>
      <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          label-width="80px"
          class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%;">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: { username: '', password: '' },
      loginRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.$axios.post('/login/check', this.loginForm)
              .then(res => {
                if (res.data.code === 200) {
                  localStorage.setItem('ims_token', res.data.data.token)
                  localStorage.setItem('ims_username', res.data.data.username)
                  this.$message.success('登录成功！')
                  this.$router.push('/portal')
                } else {
                  this.$message.error(res.data.msg)
                }
              })
              .catch(err => {
                this.$message.error('登录异常：' + err.message)
              })
        } else {
          this.$message.warning('请完善登录信息！')
        }
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.login-card {
  width: 400px;
  max-width: 100%;
  padding: 20px;
}
.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #1989fa;
  font-size: 24px;
}
.login-form {
  margin-top: 20px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .login-container {
    padding: 10px;
  }
  .login-card {
    width: 100%;
    padding: 15px;
  }
  .login-title {
    font-size: 20px;
    margin-bottom: 15px;
  }
  ::v-deep .el-form-item__label {
    font-size: 14px;
  }
  ::v-deep .el-input__inner {
    font-size: 14px;
  }
}
</style>