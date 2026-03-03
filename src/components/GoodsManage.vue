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
      <el-table-column prop="goodsId" label="商品 ID" width="100"></el-table-column>
      <el-table-column prop="goodsName" label="商品名称" min-width="150"></el-table-column>
      <el-table-column prop="goodsCategory" label="商品类别" width="120"></el-table-column>
      <el-table-column prop="factory" label="生产厂家" min-width="150"></el-table-column>
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
    >
      <div class="dialog-content" style="max-height: 500px; overflow-y: auto;">
        <div v-for="(item, index) in addGoodsList" :key="index" class="form-item">
          <el-form :model="item" label-width="80px">
            <el-row :gutter="10">
              <el-col :xs="24" :sm="12" style="margin-bottom: 10px;">
                <el-form-item label="商品名称：">
                  <el-input v-model="item.goodsName" placeholder="请输入商品名称"></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" style="margin-bottom: 10px;">
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
              <el-col :xs="24" style="margin-bottom: 10px;">
                <el-form-item label="生产厂家：">
                  <el-input v-model="item.factory" placeholder="请输入生产厂家"></el-input>
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
      isMobile: false,
      searchParams: {
        goodsCategory: '',
        factory: ''
      },
      categoryOptions: [
        { label: '大米', value: '大米' },
        { label: '白面', value: '白面' },
        { label: '色拉油', value: '色拉油' },
        { label: '香油', value: '香油' },
        { label: '挂面', value: '挂面' },
        { label: '玉米油', value: '玉米油' },
        { label: '大豆油', value: '大豆油' },
        { label: '花生油', value: '花生油' },
        { label: '菜籽油', value: '菜籽油' },
        { label: '调和油', value: '调和油' },
        { label: '花椒油', value: '花椒油' },
        { label: '芝麻酱', value: '芝麻酱' },
        { label: '花生酱', value: '花生酱' },
        { label: '酱油', value: '酱油' },
        { label: '醋', value: '醋' },
        { label: '料酒', value: '料酒' },
        { label: '食盐', value: '食盐' },
        { label: '味精', value: '味精' },
        { label: '鸡精', value: '鸡精' },
        { label: '白糖', value: '白糖' },
        { label: '红糖', value: '红糖' },
        { label: '花椒', value: '花椒' },
        { label: '大料', value: '大料' },
        { label: '桂皮', value: '桂皮' },
        { label: '香叶', value: '香叶' },
        { label: '干辣椒', value: '干辣椒' },
        { label: '胡椒', value: '胡椒' },
        { label: '孜然', value: '孜然' },
        { label: '豆瓣酱', value: '豆瓣酱' },
        { label: '甜面酱', value: '甜面酱' },
        { label: '黄豆酱', value: '黄豆酱' },
        { label: '粉条', value: '粉条' },
        { label: '粉丝', value: '粉丝' },
        { label: '木耳', value: '木耳' },
        { label: '腐竹', value: '腐竹' }
      ],
      addGoodsList: [{
        goodsName: '',
        goodsCategory: '',
        factory: ''
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
      this.selectedIds = val.map(item => item.goodsId);
    },

    batchDeleteGoods() {
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
        factory: ''
      });
    },

    removeGoodsRow(index) {
      this.addGoodsList.splice(index, 1);
    },

    resetAddForm() {
      this.addGoodsList = [{
        goodsName: '',
        goodsCategory: '',
        factory: ''
      }];
    },

    submitBatchAdd() {
      const isValid = this.addGoodsList.every(item => {
        if (!item.goodsName) {
          this.$message.warning('商品名称不能为空！');
          return false;
        }
        if (!item.goodsCategory) {
          this.$message.warning('商品类别不能为空！');
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
}
</style>