<template>
  <div class="goods-container">
    <h2 class="page-title">商品管理</h2>

    <!-- 筛选条件栏 -->
    <div class="search-group" style="margin-bottom: 15px; padding: 10px; border: 1px solid #ebeef5; border-radius: 4px;">
      <el-row :gutter="10">
        <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
          <el-select
              v-model="searchParams.goodsCategory"
              placeholder="请选择商品类别"
              clearable
              filterable
              allow-create
              style="width: 100%;"
          >
            <el-option
                v-for="category in categoryOptions"
                :key="category.value"
                :label="category.label"
                :value="category.value"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
          <el-input
              v-model="searchParams.factory"
              placeholder="请输入生产厂家"
              clearable
              style="width: 100%;"
          ></el-input>
        </el-col>
        <el-col :xs="24" :sm="24" :md="8" style="margin-bottom: 10px;">
          <el-button type="primary" @click="queryGoods()">查询</el-button>
          <el-button type="default" @click="resetSearch()">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 按钮组 -->
    <div class="button-group">
      <el-row :gutter="10">
        <el-col :xs="24" :sm="12" :md="6" style="margin-bottom: 10px;">
          <el-button type="success" @click="showAddDialog = true" style="width: 100%;">批量新增商品</el-button>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" style="margin-bottom: 10px;">
          <el-button type="danger" @click="batchDeleteGoods()" :disabled="selectedIds.length === 0" style="width: 100%;">批量删除选中商品</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 商品列表 -->
    <el-table
        :data="goodsList"
        border
        stripe
        @selection-change="handleSelectionChange"
        style="width: 100%;margin-top: 20px;"
        v-loading="loading"
        :default-sort="{prop: 'createTime', order: 'descending'}"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="goodsName" label="商品名称" width="150"></el-table-column>
      <el-table-column prop="goodsCategory" label="商品类别" width="120"></el-table-column>
      <el-table-column prop="unit" label="单位" width="70"></el-table-column>
      <el-table-column prop="factory" label="生产厂家" width="150"></el-table-column>
      <el-table-column prop="createUser" label="创建人" width="100"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160">
        <template slot-scope="scope">
          {{ formatTime(scope.row.createTime) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 批量新增弹窗 -->
    <el-dialog
        title="批量新增商品"
        :visible.sync="showAddDialog"
        width="90%"
        :fullscreen="isMobile"
        @close="resetAddForm()"
        :close-on-click-modal="false"
    >
      <div class="dialog-content" style="max-height: 500px; overflow-y: auto;" v-loading="submitting" element-loading-text="正在提交中...">
        <div v-for="(item, index) in addGoodsList" :key="index" class="form-item">
          <el-form :model="item" label-width="100px">
            <el-row :gutter="10">
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="商品名称：">
                  <el-input v-model="item.goodsName" placeholder="请输入商品名称"></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="商品类别：">
                  <el-select
                      v-model="item.goodsCategory"
                      placeholder="请选择/输入商品类别"
                      filterable
                      allow-create
                      default-first-option
                      style="width: 100%;"
                  >
                    <el-option
                        v-for="category in categoryOptions"
                        :key="category.value"
                        :label="category.label"
                        :value="category.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="单位：">
                  <el-select
                      v-model="item.unit"
                      placeholder="请选择单位"
                      filterable
                      allow-create
                      style="width: 100%;"
                  >
                    <el-option label="件" value="件"></el-option>
                    <el-option label="袋" value="件"></el-option>
                    <el-option label="箱" value="箱"></el-option>
                    <el-option label="包" value="包"></el-option>
                    <el-option label="个" value="个"></el-option>       
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :xs="24" :md="24" style="margin-bottom: 10px;">
                <el-form-item label="生产厂家：">
                  <el-select
                      v-model="item.factory"
                      placeholder="请选择/输入生产厂家"
                      filterable
                      allow-create
                      default-first-option
                      style="width: 100%;"
                  >
                    <el-option
                        v-for="factory in factoryOptions"
                        :key="factory.value"
                        :label="factory.label"
                        :value="factory.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-divider v-if="index < addGoodsList.length - 1"></el-divider>
          </el-form>
        </div>

        <el-button type="text" @click="addGoodsRow()" style="margin-bottom: 15px;">+ 新增一行商品</el-button>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitBatchAdd()">确定新增</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "GoodsManage",
  data() {
    return {
      goodsList: [],
      selectedIds: [],
      showAddDialog: false,
      loading: false,
      submitting: false, // 防止重复提交
      isMobile: false,
      searchParams: {
        goodsCategory: '',
        factory: ''
      },
      categoryOptions: [
        { label: '米', value: '米' },
        { label: '面', value: '面' },
        { label: '油', value: '油' },
        { label: '香油', value: '香油' },
        { label: '挂面', value: '挂面' },
        { label: '酱油', value: '酱油' },
        { label: '醋', value: '醋' },
        { label: '料酒', value: '料酒' },
        { label: '食盐', value: '食盐' },
        { label: '味精', value: '味精' },
        { label: '鸡精', value: '鸡精' }
      ],
      factoryOptions: [
        { label: '中粮集团', value: '中粮集团' },
        { label: '益海嘉里', value: '益海嘉里' },
        { label: '福临门', value: '福临门' },
        { label: '鲁花', value: '鲁花' },
        { label: '海天', value: '海天' },
        { label: '九三', value: '九三' },
        { label: '李锦记', value: '李锦记' },
        { label: '恒顺', value: '恒顺' },
        { label: '加加', value: '加加' },
        { label: '大连金石', value: '大连金石' },
        { label: '太太乐', value: '太太乐' },
        { label: '五得利', value: '五得利' },
        { label: '金沙河', value: '金沙河' },
        { label: '陈克明', value: '陈克明' },
        { label: '北大荒', value: '北大荒' },
        { label: '西王', value: '西王' },
        { label: '长寿花', value: '长寿花' },
        { label: '多力', value: '多力' },
        { label: '厨邦', value: '厨邦' },
        { label: '欣和', value: '欣和' },
        { label: '千禾', value: '千禾' },
        { label: '其他', value: '其他' }
      ],
      addGoodsList: [{
        goodsName: '',
        goodsCategory: '油',
        unit: '件',
        factory: '益海嘉里'
      }],
      username: localStorage.getItem('ims_username') || 'admin'
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    console.log('商品管理页面已加载，等待手动查询');
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile);
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    queryGoods() {
      this.loading = true;
      this.$axios.get('/goodsInfo/list', {


        params: this.searchParams
      })
          .then(res => {
            this.loading = false;
            if (res.data.code === 200) {
              this.goodsList = res.data.data;
              this.$message.success(`查询到 ${this.goodsList.length} 条商品数据！`);
            } else {
              this.goodsList = [];
              this.$message.warning(res.data.msg);
            }
          })
          .catch(err => {
            this.loading = false;
            this.goodsList = [];
            this.$message.error('查询异常：' + err.message);
          })
    },

    resetSearch() {
      this.searchParams = {
        goodsCategory: '',
        factory: ''
      };
      this.goodsList = [];
      this.$message.info('筛选条件已重置');
    },

    handleSelectionChange(val) {
      // 保存选中行的商品名称列表
      this.selectedIds = val.map(item => item.goodsName);
    },

    batchDeleteGoods() {
      if (!this.selectedIds || this.selectedIds.length === 0) {
        this.$message.warning('请先选择要删除的商品！');
        return;
      }
      this.$confirm('确定删除选中的' + this.selectedIds.length + '个商品？', '提示', { type: 'warning' })
          .then(() => {
            this.$axios.post('/goodsInfo/batchDelete', this.selectedIds)
                .then(res => {
                  if (res.data.code === 200) {
                    this.$message.success(res.data.msg);
                    this.queryGoods();
                  } else {
                    this.$message.error(res.data.msg);
                  }
                })
                .catch(err => {
                  this.$message.error('删除异常：' + err.message);
                })
          })
          .catch(() => {
            this.$message.info('已取消删除');
          })
    },

    addGoodsRow() {
      this.addGoodsList.push({
        goodsName: '',
        goodsCategory: '',
        unit: '袋',
        factory: '益海嘉里'
      });
    },

    removeGoodsRow(index) {
      this.addGoodsList.splice(index, 1);
    },

    resetAddForm() {
      this.addGoodsList = [{
        goodsName: '',
        goodsCategory: '油',
        unit: '件',
        factory: ''
      }];
    },

    submitBatchAdd() {
      // 防止重复提交
      if (this.submitting) {
        this.$message.warning('正在提交中，请勿重复点击！');
        return;
      }

      const isValid = this.addGoodsList.every(item => {
        if (!item.goodsName) {
          this.$message.warning('商品名称不能为空！');
          return false;
        }
        if (!item.goodsCategory) {
          this.$message.warning('商品类别不能为空！');
          return false;
        }
        if (!item.unit) {
          this.$message.warning('单位不能为空！');
          return false;
        }
        if (!item.factory) {
          this.$message.warning('生产厂家不能为空！');
          return false;
        }
        return true;
      });

      if (!isValid) return;

      const submitData = {
        createUser: this.username,
        goodsList: this.addGoodsList
      };

      // 设置提交中状态
      this.submitting = true;

      this.$axios.post('/goodsInfo/batchAdd', submitData)
          .then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.showAddDialog = false;
              this.queryGoods();
              this.resetAddForm();
            } else {
              this.$message.error(res.data.msg);
            }
          })
          .catch(err => {
            this.$message.error('新增异常：' + err.message);
          })
          .finally(() => {
            // 释放提交锁
            this.submitting = false;
          })
    },

    formatTime(timeStr) {
      if (!timeStr) return '';
      const date = new Date(timeStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  }
}
</script>

<style scoped>
.goods-container {
  width: 90%;
  margin: 20px auto;
  max-width: 1400px;
}
.page-title {
  text-align: left;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}
.button-group {
  margin-bottom: 10px;
}
.form-item {
  margin-bottom: 15px;
}
.search-group {
  background: #f8f9fa;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .goods-container {
    width: 95%;
    margin: 10px auto;
    padding: 0 5px;
  }
  .page-title {
    font-size: 20px;
    margin-bottom: 15px;
  }
  .button-group {
    margin-bottom: 5px;
  }
  ::v-deep .el-table {
    font-size: 13px;
  }
  ::v-deep .el-table th {
    padding: 8px 0;
  }
  ::v-deep .el-table td {
    padding: 8px 0;
  }
  ::v-deep .el-dialog {
    width: 95% !important;
  }
  ::v-deep .el-form-item__label {
    font-size: 14px;
  }
  ::v-deep .el-input__inner {
    font-size: 14px;
  }
}

@media screen and (max-width: 480px) {
  .page-title {
    font-size: 18px;
  }
  ::v-deep .el-table {
    font-size: 12px;
  }
  /* 弹窗内的表单元素适配 */
  ::v-deep .el-dialog .form-item {
    margin-bottom: 8px;
  }
  ::v-deep .el-dialog .el-form-item__label {
    font-size: 13px;
    padding-right: 3px !important;
    white-space: nowrap;
  }
  ::v-deep .el-dialog .el-input__inner,
  ::v-deep .el-dialog .el-select .el-input__inner {
    font-size: 13px;
    height: 32px;
    line-height: 32px;
  }
  ::v-deep .el-dialog .el-button {
    padding: 8px 10px;
    font-size: 13px;
  }
}
