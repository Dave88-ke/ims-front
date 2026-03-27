
<template>
  <div class="stock-container">
    <h2 class="page-title">库存管理</h2>

    <!-- 筛选条件栏 -->
    <div class="search-group" style="margin-bottom: 15px; padding: 10px; border: 1px solid #ebeef5; border-radius: 4px;">
      <el-row :gutter="10">
        <el-col :xs="24" :sm="12" :md="6" style="margin-bottom: 10px;">
          <el-select
              v-model="searchParams.warehouseLocation"
              placeholder="请选择存放库房"
              filterable
              style="width: 100%;"
          >
            <el-option
                v-for="warehouse in warehouseOptions"
                :key="warehouse.value"
                :label="warehouse.label"
                :value="warehouse.value"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" style="margin-bottom: 10px;">
          <el-select
              v-model="searchParams.goodsCategory"
              placeholder="请选择商品类别"
              filterable
              clearable
              style="width: 100%;"
              @change="handleCategoryChange"
          >
            <el-option
                v-for="category in categoryOptions"
                :key="category.value"
                :label="category.label"
                :value="category.value"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" style="margin-bottom: 10px;">
          <el-select
              v-model="searchParams.goodsName"
              placeholder="请选择商品名称"
              filterable
              default-first-option
              clearable
              style="width: 100%;"
              @change="handleGoodsNameChange"
          >
            <el-option
                v-for="goods in filteredGoodsOptions"
                :key="goods.value"
                :label="goods.label"
                :value="goods.value"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="24" :md="6" style="margin-bottom: 10px;">
          <el-button type="primary" @click="queryStock()" style="width: 100%;">查询库存</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 按钮组 -->
    <div class="button-group">
      <el-row :gutter="10">
        <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
          <el-button type="success" @click="showInDialog = true" style="width: 100%;">入库操作</el-button>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
          <el-button type="warning" @click="showOutDialog = true" style="width: 100%;">出库操作</el-button>
        </el-col>
        <el-col :xs="24" :sm="24" :md="8" style="margin-bottom: 10px;">
          <el-button type="info" @click="showCheckDialog = true" style="width: 100%;">库存盘点</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 库存列表 -->
    <el-table
        :data="stockList"
        border
        stripe
        style="width: auto;margin-top: 20px;"
        v-loading="loading"
        :max-width="isMobile ? '420' : '800'"
        @row-click="handleRowClick"
        class="clickable-table"
    >
      <el-table-column prop="goodsName" label="商品名称" :width="isMobile ? 100 : 150"></el-table-column>
      <el-table-column prop="goodsCategory" label="商品类别" :width="isMobile ? 75 : 150"></el-table-column>
      <el-table-column prop="warehouseLocation" label="存放库房" :width="isMobile ? 90 : 150"></el-table-column>
      <el-table-column prop="totalQuantity" label="库存数量" :width="isMobile ? 70 : 150">
        <template slot-scope="scope">
          <el-tag :type="getStockTagType(scope.row.totalQuantity)" :size="isMobile ? 'mini' : ''">{{ scope.row.totalQuantity }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="unit" label="单位" :width="isMobile ? 60 : 150"></el-table-column>
    </el-table>

    <!-- 入库弹窗 -->
    <el-dialog
        title="批量入库操作"
        :visible.sync="showInDialog"
        width="90%"
        :fullscreen="isMobile"
        @close="resetInForm"
        :close-on-click-modal="false"
    >
      <div class="dialog-content" style="max-height: 500px; overflow-y: auto;" v-loading="submitting" element-loading-text="正在提交中...">
        <!-- 库房选择 -->
        <div style="margin-bottom: 20px;">
          <el-form :model="inForm" label-width="100px">
            <el-form-item label="存放库房"required>
              <el-select
                  v-model="inForm.warehouseLocation"
                  placeholder="请选择库房"
                  style="width: 100%;"
              >
                <el-option label="一库" value="一库"></el-option>
                <el-option label="二库" value="二库"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 入库商品列表 -->
        <div v-for="(item, index) in inForm.stockInSimpleDTOList" :key="index" class="form-item">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin: 0;">商品 {{ index + 1 }}</h4>
            <el-button 
                v-if="inForm.stockInSimpleDTOList.length > 1" 
                type="danger" 
                size="small" 
                @click="removeInGoods(index)"
                icon="el-icon-delete"
            >删除此商品</el-button>
          </div>
          <el-form :model="item" label-width="100px">
            <el-row :gutter="10">
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="商品名称"required>
                  <el-select
                      v-model="item.goodsName"
                      placeholder="请选择商品"
                      filterable
                      style="width: 100%;"
                      @change="handleInGoodsChange(index)"
                  >
                    <el-option
                        v-for="goods in allGoodsOptions"
                        :key="goods.value"
                        :label="goods.label"
                        :value="goods.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="入库方式"required>
                  <el-select
                      v-model="item.inType"
                      style="width: 100%;"
                      @change="handleInTypeChange(index)"
                  >
                    <el-option label="厂家来货" value="厂家来货"></el-option>
                    <el-option label="首次录入" value="首次录入"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="条形码"required>
                  <div style="display: flex; align-items: center; gap: 5px;">
                    <el-input
                        v-model="item.barcode"
                        placeholder="请输入条形码"
                        style="flex: 1;"
                    ></el-input>
                    <el-button
                        v-if="isMobile"
                        size="small"
                        @click="scanBarcode(index)"
                        icon="el-icon-camera"
                    >扫码</el-button>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="批次号"required>
                  <el-input
                      v-model="item.batchNumber"
                      placeholder="批次号"
                      style="width: 100%;"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="入库数量"required>
                  <el-input-number
                      v-model="item.stockInQuantity"
                      :min="1"
                      :max="99999"
                      style="width: 100%;"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="单位">
                  <el-input
                      v-model="item.unit"
                      disabled
                      placeholder="选择商品后自动带出"
                      style="width: 100%;"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="来货厂家">
                  <el-input
                      v-model="item.supplier"
                      disabled
                      placeholder="选择商品后自动带出"
                      style="width: 100%;"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="进价">
                  <el-input-number
                      v-model="item.purchasePrice"
                      :min="0"
                      :precision="2"
                      :step="0.1"
                      placeholder="0.00"
                      style="width: 100%;"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="16" style="margin-bottom: 10px;">
                <el-form-item label="备注">
                  <el-input
                      v-model="item.remark"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入备注（可选）"
                      style="width: 100%;"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider v-if="index < inForm.stockInSimpleDTOList.length - 1"></el-divider>
          </el-form>
        </div>

        <el-button type="text" @click="addInGoods" style="margin-bottom: 15px;">+ 添加商品</el-button>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showInDialog = false">取消</el-button>
        <el-button type="primary" @click.prevent="submitInStock" :loading="submitting">确认入库</el-button>
      </div>
    </el-dialog>

    <!-- 出库弹窗 -->
    <el-dialog
        title="批量出库操作"
        :visible.sync="showOutDialog"
        width="90%"
        :fullscreen="isMobile"
        @close="resetOutForm"
        :close-on-click-modal="false"
    >
      <div class="dialog-content" style="max-height: 500px; overflow-y: auto;" v-loading="submitting" element-loading-text="正在提交中...">
        <!-- 库房选择 -->
        <div style="margin-bottom: 20px;">
          <el-form :model="outForm" label-width="100px">
            <el-form-item label="存放库房" required>
              <el-select
                  v-model="outForm.warehouseLocation"
                  placeholder="请选择库房"
                  style="width: 100%;"
                  @change="handleWarehouseChange"
              >
                <el-option label="一库" value="一库"></el-option>
                <el-option label="二库" value="二库"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 出库商品列表 -->
        <div v-for="(item, index) in outForm.stockOutSimpleDTOList" :key="index" class="form-item">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin: 0;">商品 {{ index + 1 }}</h4>
            <el-button 
                v-if="outForm.stockOutSimpleDTOList.length > 1" 
                type="danger" 
                size="small" 
                @click="removeOutGoods(index)"
                icon="el-icon-delete"
            >删除此商品</el-button>
          </div>
          <el-form :model="item" label-width="100px">
            <el-row :gutter="10">
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="商品名称"required>
                  <el-select
                      v-model="item.goodsName"
                      placeholder="请选择商品"
                      filterable
                      style="width: 100%;"
                      @change="handleOutGoodsChange(index)"
                  >
                    <el-option
                        v-for="goods in allGoodsOptions"
                        :key="goods.value"
                        :label="goods.label"
                        :value="goods.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="条形码" required>
                  <el-select
                      v-model="item.barcode"
                      placeholder="请选择条形码"
                      filterable
                      style="width: 100%;"
                      @change="handleOutBarcodeChange(index)"
                  >
                    <el-option
                        v-for="barcode in item.barcodeOptions"
                        :key="barcode"
                        :label="barcode"
                        :value="barcode"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="批次号" required>
                  <el-select
                      v-model="item.batchNumber"
                      placeholder="请先选择条形码"
                      filterable
                      :disabled="!item.barcode"
                      style="width: 100%;"
                      @change="handleOutBatchChange(index)"
                  >
                    <el-option
                        v-for="batch in item.batchOptions"
                        :key="batch"
                        :label="batch"
                        :value="batch"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="库存数量" required>
                  <el-input
                      v-model="item.stockQuantity"
                      disabled
                      placeholder="选择商品后自动带出"
                      style="width: 100%;"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="单位">
                  <el-input
                      v-model="item.unit"
                      disabled
                      placeholder="选择商品后自动带出"
                      style="width: 100%;"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="10">
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="出库方式" required>
                  <el-select
                      v-model="item.outType"
                      style="width: 100%;"
                      @change="handleOutTypeChange(index)"
                  >
                    <el-option label="销售出库" value="销售"></el-option>
                    <el-option label="调拨出库" value="调拨"></el-option>
                    <el-option label="报损出库" value="报损"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="出库数量" required>
                  <el-input-number
                      v-model="item.quantity"
                      :min="1"
                      :max="99999"
                      style="width: 100%;"
                  ></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="10">
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="出货商家" :required="item.outType === '销售'">
                  <el-input
                      v-model="item.customer"
                      :disabled="item.outType === '调拨' || item.outType === '报损'"
                      :placeholder="getCustomerPlaceholder()"
                      style="width: 100%;"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="售价" :required="item.outType === '销售'">
                  <el-input
                      v-model="item.salePrice"
                      type="number"
                      :disabled="item.outType === '调拨' || item.outType === '报损'"
                      :placeholder="getSalePricePlaceholder()"
                      style="width: 100%;"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="10">
              <el-col :xs="24" :sm="12" :md="8" style="margin-bottom: 10px;">
                <el-form-item label="调拨库房" :required="item.outType === '调拨'">
                  <el-select
                      v-model="item.targetWarehouse"
                      :placeholder="getTargetWareHousePlaceholder()"
                      :disabled="item.outType !== '调拨'"
                      style="width: 100%;"
                  >
                    <el-option 
                        v-for="wh in warehouseOptions" 
                        :key="wh.value" 
                        :label="wh.label" 
                        :value="wh.value"
                        :disabled="wh.value === outForm.warehouseLocation"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :xs="24" :sm="24" :md="16" style="margin-bottom: 10px;">
                <el-form-item label="备注" :required="item.outType === '报损'">
                  <el-input
                      v-model="item.remark"
                      type="textarea"
                      :rows="2"
                      :placeholder="getRemarkPlaceholder()"
                      style="width: 100%;"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider v-if="index < outForm.stockOutSimpleDTOList.length - 1"></el-divider>
          </el-form>
        </div>

        <el-button type="text" @click="addOutGoods" style="margin-bottom: 15px;">+ 添加商品</el-button>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="showOutDialog = false">取消</el-button>
        <el-button type="primary" @click.prevent="submitOutStock" :loading="submitting">确认出库</el-button>
      </div>
    </el-dialog>

    <!-- 盘点弹窗 -->
    <el-dialog
        title="库存盘点"
        :visible.sync="showCheckDialog"
        width="60%"
        :fullscreen="isMobile"
        @close="resetCheckForm"
    >
      <el-form :model="checkForm" label-width="100px">
        <el-form-item label="盘点日期：">
          <el-date-picker
              v-model="checkForm.checkDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%;"
              value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="盘点人：">
          <el-input v-model="checkForm.checkUser" placeholder="请输入盘点人姓名" style="width: 100%;"></el-input>
        </el-form-item>
        <el-form-item label="盘点商品：">
          <el-table :data="checkForm.checkList" border style="width: 100%;">
            <el-table-column prop="goodsName" label="商品名称" width="200"></el-table-column>
            <el-table-column prop="systemQuantity" label="系统数量" width="120"></el-table-column>
            <el-table-column label="实际数量" width="150">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.actualQuantity" :min="0" :max="9999" size="small"></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="差异" width="100">
              <template slot-scope="scope">
                <el-tag :type="getDiffTagType(scope.row.actualQuantity - scope.row.systemQuantity)">
                  {{ scope.row.actualQuantity - scope.row.systemQuantity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="danger" size="mini" @click="removeCheckItem(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="text" @click="addCheckItem" style="margin-top: 10px;">+ 添加盘点商品</el-button>
        </el-form-item>
        <el-form-item label="盘点说明：">
          <el-input v-model="checkForm.remark" type="textarea" :rows="3" placeholder="请输入盘点说明"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showCheckDialog = false">取消</el-button>
        <el-button type="primary" @click="submitCheckStock">确认盘点</el-button>
      </div>
    </el-dialog>

    <!-- 库存详情弹窗 -->
    <el-dialog
        title="库存明细"
        :visible.sync="showDetailDialog"
        width="70%"
        :fullscreen="isMobile"
        @close="resetDetail"
    >
      <el-table :data="detailList" border stripe style="width: 100%;" v-loading="detailLoading">
        <el-table-column prop="goodsName" label="商品名称" :width="isMobile ? 100 : 150"></el-table-column>
        <el-table-column prop="barcode" label="条形码" :width="isMobile ? 100 : 140"></el-table-column>
        <el-table-column prop="batchNumber" label="生产批次" :width="isMobile ? 100 : 140"></el-table-column>
        <el-table-column prop="stockQuantity" label="库存数量" :width="isMobile ? 70 : 100"></el-table-column>
        <el-table-column prop="unit" label="单位" :width="isMobile ? 70 : 100"></el-table-column>
        <el-table-column prop="warehouseLocation" label="库房" :width="isMobile ? 70 : 100"></el-table-column>
        <el-table-column prop="supplier" label="来货厂家" :width="isMobile ? 100 : 150"></el-table-column>
        <el-table-column prop="purchasePrice" label="进价" :width="isMobile ? 70 : 100">
          <template slot-scope="scope">¥{{ scope.row.purchasePrice }}</template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" :width="isMobile ? 120 : 160">
          <template slot-scope="scope">{{ formatTime(scope.row.updateTime) }}</template>
        </el-table-column>
        <el-table-column prop="updateOperation" label="更新操作" :width="isMobile ? 80 : 120"></el-table-column>
        <el-table-column prop="updateUser" label="更新人" :width="isMobile ? 70 : 100"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "StockManage",
  data() {
    return {
      stockList: [],
      selectedIds: [],
      loading: false,
      isMobile: false,
      searchParams: {
        goodsName: '',
        goodsCategory: '',
        warehouseLocation: '一库'
      },
      warehouseOptions: [
        { label: '一库', value: '一库' },
        { label: '二库', value: '二库' }
      ],
      categoryOptions: [],
      allGoodsOptions: [], // 存储所有商品选项
      showInDialog: false,
      showOutDialog: false,
      showCheckDialog: false,
      showDetailDialog: false,
      detailLoading: false,
      detailList: [],
      submitting: false, // 防止重复提交
      outBarcodeOptions: [], // 出库条形码选项
      outBatchOptions: [], // 出库批次号选项
      outStockInventory: [], // 出库库存数据
      inForm: {
        warehouseLocation: '一库',
        createUser: localStorage.getItem('ims_username'),
        stockInSimpleDTOList: [{
          goodsName: '',
          inType: '',
          barcode: '',
          batchNumber: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          stockInQuantity: 1,
          unit: '',
          supplier: '',
          purchasePrice: 0,
          remark: ''
        }]
      },
      outForm: {
        warehouseLocation: '一库',
        goodsName: '',
        barcode: '',
        batchNumber: '',
        quantity: 1,
        outType: '销售',
        unit: '',
        customer: '',
        salePrice: '',
        targetWarehouse: '',
        remark: ''
      },
      checkForm: {
        checkDate: new Date().toISOString().split('T')[0],
        checkUser: localStorage.getItem('ims_username') || 'admin',
        checkList: [],
        remark: ''
      },
      username: localStorage.getItem('ims_username') || 'admin'
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    this.loadGoodsOptions();
    // 页面初始化时不自动查询，等待用户点击查询按钮
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile);
  },
  computed: {
    // 根据类别筛选商品选项
    filteredGoodsOptions() {
      if (!this.searchParams.goodsCategory) {
        return this.allGoodsOptions;
      }
      return this.allGoodsOptions.filter(goods => goods.category === this.searchParams.goodsCategory);
    }
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },

    // 加载商品选项和类别选项
    loadGoodsOptions() {
      this.$axios.get('/goodsInfo/list').then(res => {
        if (res.data.code === 200) {
          const list = res.data.data || [];
          // 转换为商品选项格式
          this.allGoodsOptions = list.map(item => ({
            label: item.goodsName,
            value: item.goodsName,
            category: item.goodsCategory,
            factory: item.factory,
            unit: item.unit
          }));
          // 提取不重复的商品类别
          const categories = [...new Set(list.map(item => item.goodsCategory))];
          this.categoryOptions = categories.map(cat => ({
            label: cat,
            value: cat
          }));
        }
      }).catch(err => {
        console.error('加载商品列表失败:', err);
      });
    },

    // 处理类别变化
    handleCategoryChange() {
      // 切换类别时清空已选商品
      this.searchParams.goodsName = '';
      // 强制重新渲染商品下拉框的选项
      this.$nextTick(() => {
        // 这里不需要额外操作，因为 filteredGoodsOptions 会自动根据类别过滤
      });
    },

    // 处理商品名称变化
    handleGoodsNameChange(selectedValue) {
      if (selectedValue) {
        // 找到选中商品的类别并赋值
        const goods = this.allGoodsOptions.find(g => g.value === selectedValue);
        if (goods) {
          this.searchParams.goodsCategory = goods.category;
        }
      }
    },

    // 查询库存
    queryStock() {
      if (!this.searchParams.warehouseLocation) {
        this.$message.warning('请选择存放库房！');
        return;
      }
      if (!this.searchParams.goodsCategory) {
        this.$message.warning('请选择商品类别！');
        return;
      }
      this.loading = true;
      this.$axios.get('/stock/listStockSummary', {
        params: this.searchParams
      })
          .then(res => {
            this.loading = false;
            if (res.data.code === 200) {
              this.stockList = res.data.data;
              this.$message.success(`查询到 ${this.stockList.length} 条库存数据！`);
            } else {
              this.stockList = [];
              this.$message.warning(res.data.msg);
            }
          })
          .catch(err => {
            this.loading = false;
            this.stockList = [];
            this.$message.error('查询异常：' + err.message);
          })
    },

    // 获取库存标签类型
    getStockTagType(quantity) {
      if (quantity <= 50) return 'danger';
      if (quantity <= 200) return 'warning';
      return 'success';
    },

    // 显示库存详情
    showDetail(row) {
      this.detailLoading = true;
      this.$axios.get('/stock/detail', {
        params: {
          goodsName: row.goodsName,
          warehouseLocation: row.warehouseLocation
        }
      })
      .then(res => {
        this.detailLoading = false;
        if (res.data.code === 200) {
          this.detailList = res.data.data;
          this.showDetailDialog = true;
        } else {
          this.$message.error(res.data.msg || '查询详情失败');
        }
      })
      .catch(err => {
        this.detailLoading = false;
        this.$message.error('查询异常：' + err.message);
      });
    },

    // 处理行点击事件
    handleRowClick(row) {
      this.showDetail(row);
    },

    resetDetail() {
      this.detailList = [];
    },

    // 添加入库商品
    addInGoods() {
      const today = new Date();
      const batchNumber = today.getFullYear().toString() + 
                          String(today.getMonth() + 1).padStart(2, '0') + 
                          String(today.getDate()).padStart(2, '0');
      
      this.inForm.stockInSimpleDTOList.push({
        goodsName: '',
        inType: '',
        barcode: '',
        batchNumber: batchNumber,
        stockInQuantity: 1,
        unit: '',
        supplier: '',
        purchasePrice: 0,
        remark: ''
      });
    },

    // 删除入库商品
    removeInGoods(index) {
      if (this.inForm.stockInSimpleDTOList.length === 1) {
        this.$message.warning('至少保留一个商品！');
        return;
      }
      this.inForm.stockInSimpleDTOList.splice(index, 1);
    },

    // 处理商品选择变化
    handleInGoodsChange(index) {
      const item = this.inForm.stockInSimpleDTOList[index];
      if (item.goodsName) {
        // 从 allGoodsOptions 中找到对应的商品
        const goods = this.allGoodsOptions.find(g => g.value === item.goodsName);
        if (goods) {
          // 自动填充单位和厂家
          item.unit = goods.unit || '';
          item.supplier = goods.factory || '';
        }
      }
    },

    // 处理入库方式变化
    handleInTypeChange(index) {
      const item = this.inForm.stockInSimpleDTOList[index];
      // 选择首次录入时，清空批次号
      if (item.inType === '首次录入') {
        item.batchNumber = '';
      }
    },

    // 添加出库商品
    addOutGoods() {
      this.outForm.stockOutSimpleDTOList.push({
        goodsName: '',
        barcode: '',
        batchNumber: '',
        stockQuantity: '',
        unit: '',
        outType: '销售',
        quantity: 1,
        customer: '',
        salePrice: '',
        targetWarehouse: '',
        remark: '',
        barcodeOptions: [],
        batchOptions: []
      });
    },

    // 删除出库商品
    removeOutGoods(index) {
      if (this.outForm.stockOutSimpleDTOList.length === 1) {
        this.$message.warning('至少保留一个商品！');
        return;
      }
      this.outForm.stockOutSimpleDTOList.splice(index, 1);
    },

    // 处理出库商品选择变化
    handleOutGoodsChange(index) {
      const item = this.outForm.stockOutSimpleDTOList[index];
      if (item.goodsName) {
        // 从 allGoodsOptions 中找到对应的商品
        const goods = this.allGoodsOptions.find(g => g.value === item.goodsName);
        if (goods) {
          // 自动填充单位
          item.unit = goods.unit || '';
          
          // 清空之前的选择
          item.barcode = '';
          item.batchNumber = '';
          item.stockQuantity = '';
          
          // 查询当前商品的库存信息
          this.loadOutStockInventory(index);
        }
      }
    },

    // 加载出库库存信息
    loadOutStockInventory(index) {
      const item = this.outForm.stockOutSimpleDTOList[index];
      if (!item.goodsName || !this.outForm.warehouseLocation) {
        return;
      }
      
      this.$axios.get('/stock/detail', {
        params: {
          goodsName: item.goodsName,
          warehouseLocation: this.outForm.warehouseLocation
        }
      })
      .then(res => {
        if (res.data.code === 200) {
          const validStock = res.data.data || [];
          
          // 提取不重复的条形码
          const barcodes = [...new Set(validStock.map(s => s.barcode))];
          item.barcodeOptions = barcodes;
          item.batchOptions = []; // 清空批次号选项
          
          // 存储库存数据供后续使用
          item.stockInventory = validStock;
          
          if (barcodes.length === 0) {
            this.$message.info('该商品在当前库房无可用库存');
          }
        } else {
          this.$message.warning(res.data.msg || '查询库存失败');
          item.barcodeOptions = [];
          item.batchOptions = [];
          item.stockInventory = [];
        }
      })
      .catch(err => {
        console.error('查询库存失败:', err);
        this.$message.error('查询异常：' + err.message);
        item.barcodeOptions = [];
        item.batchOptions = [];
        item.stockInventory = [];
      });
    },

    // 处理出库条形码选择变化
    handleOutBarcodeChange(index) {
      const item = this.outForm.stockOutSimpleDTOList[index];
      if (item.barcode) {
        // 清空批次号选择和库存数量
        item.batchNumber = '';
        item.stockQuantity = '';
        
        // 根据条形码过滤批次号
        const filteredStock = item.stockInventory.filter(s => s.barcode === item.barcode);
        
        // 提取不重复的批次号
        const batches = [...new Set(filteredStock.map(s => s.batchNumber))];
        item.batchOptions = batches;
        
        if (batches.length === 0) {
          this.$message.warning('该条形码下无可用批次');
        }
      } else {
        // 如果清空条形码，也清空批次号选项和库存数量
        item.batchOptions = [];
        item.batchNumber = '';
        item.stockQuantity = '';
      }
    },

    // 处理出库批次号选择变化
    handleOutBatchChange(index) {
      const item = this.outForm.stockOutSimpleDTOList[index];
      if (item.batchNumber) {
        // 根据条形码和批次号找到对应的库存记录
        const stock = item.stockInventory.find(
          s => s.barcode === item.barcode && s.batchNumber === item.batchNumber
        );
        
        if (stock) {
          // 自动填充库存数量
          item.stockQuantity = stock.stockQuantity;
          // 赋值库存 ID
          item.stockId = stock.id;
        }
        
        // 校验库存唯一性（基于 stockId）
        this.checkStockUniqueness(index);
      } else {
        // 如果清空批次号，也清空库存数量和 stockId
        item.stockQuantity = '';
        item.stockId = null;
      }
    },

    // 校验库存唯一性（基于 stockId）
    checkStockUniqueness(currentIndex) {
      const currentItem = this.outForm.stockOutSimpleDTOList[currentIndex];
      
      // 遍历所有商品，检查是否有重复的 stockId
      for (let i = 0; i < this.outForm.stockOutSimpleDTOList.length; i++) {
        if (i === currentIndex) continue; // 跳过自己
        
        const item = this.outForm.stockOutSimpleDTOList[i];
        // 只校验已有 stockId 的商品
        if (!item.stockId) continue;
        
        if (item.stockId === currentItem.stockId) {
          this.$message.error(`第${i + 1}个商品和第${currentIndex + 1}个商品选择了相同的库存（商品：${currentItem.goodsName}，条形码：${currentItem.barcode}，批次号：${currentItem.batchNumber}），请修改！`);
          // 清空当前选择的批次号和 stockId，让用户重新选择
          this.outForm.stockOutSimpleDTOList[currentIndex].batchNumber = '';
          this.outForm.stockOutSimpleDTOList[currentIndex].stockQuantity = '';
          this.outForm.stockOutSimpleDTOList[currentIndex].stockId = null;
          return false;
        }
      }
      return true;
    },

    // 处理出库方式变化
    handleOutTypeChange(index) {
      const item = this.outForm.stockOutSimpleDTOList[index];
      // 切换出库方式时，清空调拨库房
      if (item.outType !== '调拨') {
        item.targetWarehouse = '';
      }
    },

    // 处理库房变化
    handleWarehouseChange() {
      // 切换库房时，重新加载所有已选商品的库存信息
      this.outForm.stockOutSimpleDTOList.forEach((item, index) => {
        if (item.goodsName) {
          // 清空选择
          item.barcode = '';
          item.batchNumber = '';
          item.stockQuantity = '';
          item.barcodeOptions = [];
          item.batchOptions = [];
          // 重新加载库存
          this.loadOutStockInventory(index);
        }
      });
    },

    // 获取出货商家 placeholder
    getCustomerPlaceholder() {
      if (this.outForm.outType === '调拨' || this.outForm.outType === '报损') {
        return '调拨/报损无需填写';
      }
      return '请输入出货商家';
    },

    // 获取售价 placeholder
    getSalePricePlaceholder() {
      if (this.outForm.outType === '调拨' || this.outForm.outType === '报损') {
        return '调拨/报损无需填写';
      }
      return '请输入售价';
    },
    // 获取调拨库房 placeholder
    getTargetWareHousePlaceholder() {
      if (this.outForm.outType === '调拨') {
        return '请输入调拨库房';
      }
      return '销售/报损无需填写';
    },

    // 获取备注 placeholder
    getRemarkPlaceholder() {
      if (this.outForm.outType === '报损') {
        return '请输入报损原因（必填）';
      }
      return '请输入备注（可选）';
    },

    // 扫码功能（手机端）
    scanBarcode(index) {
      // TODO: 调用相机扫码功能
      this.$message.info('扫码功能开发中...');
      // 可以使用 html5-qrcode 或其他扫码库实现
    },

    // 入库操作

    submitInStock() {
      // 防止重复提交
      if (this.submitting) {
        this.$message.warning('正在提交中，请勿重复点击！');
        return;
      }

      if (!this.inForm.warehouseLocation) {
        this.$message.warning('请选择存放库房！');
        return;
      }
      if (this.inForm.stockInSimpleDTOList.length === 0) {
        this.$message.warning('请至少添加一个商品！');
        return;
      }

      // 验证必填字段
      for (let i = 0; i < this.inForm.stockInSimpleDTOList.length; i++) {
        const item = this.inForm.stockInSimpleDTOList[i];
        if (!item.goodsName) {
          this.$message.warning(`第${i + 1}个商品未选择`);
          return;
        }
        if (!item.inType) {
          this.$message.warning(`请选择第${i + 1}个商品的入库方式`);
          return;
        }
        if (!item.barcode) {
          this.$message.warning(`请输入第${i + 1}个商品的条形码`);
          return;
        }
        if (!item.batchNumber) {
          this.$message.warning(`请输入第${i + 1}个商品的批次号`);
          return;
        }
        if (!item.stockInQuantity || item.stockInQuantity < 1) {
          this.$message.warning(`第${i + 1}个商品的入库数量必须大于 0`);
          return;
        }
      }

      const submitData = {
        warehouseLocation: this.inForm.warehouseLocation,
        createUser: this.inForm.createUser,
        stockInSimpleDTOList: this.inForm.stockInSimpleDTOList.map(item => ({
          goodsName: item.goodsName,
          barcode: item.barcode,
          inType: item.inType,
          batchNumber: item.batchNumber,
          stockInQuantity: item.stockInQuantity,
          unit: item.unit,
          purchasePrice: item.purchasePrice,
          supplier: item.supplier,
          remark: item.remark
        }))
      };

      // 设置提交中状态
      this.submitting = true;

      this.$axios.post('/stock/in', submitData)
          .then(res => {
            if (res.data.code === 200) {
              this.$message.success('入库成功！');
              this.showInDialog = false;
              this.queryStock();
            } else {
              this.$message.error(res.data.msg);
            }
          })
          .catch(err => {
            this.$message.error('入库异常：' + err.message);
          })
          .finally(() => {
            // 释放提交锁
            this.submitting = false;
          })
    },

    resetInForm() {
      this.inForm = {
        warehouseLocation: '一库',
        createUser: localStorage.getItem('ims_username') || 'admin',
        stockInSimpleDTOList: [{
          goodsName: '',
          inType: '',
          barcode: '',
          batchNumber: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          stockInQuantity: 1,
          unit: '',
          supplier: '',
          purchasePrice: 0,
          remark: ''
        }]
      };
    },

    submitOutStock() {
      // 防止重复提交
      if (this.submitting) {
        this.$message.warning('正在提交中，请勿重复点击！');
        return;
      }

      if (!this.outForm.warehouseLocation) {
        this.$message.warning('请选择存放库房！');
        return;
      }
      if (this.outForm.stockOutSimpleDTOList.length === 0) {
        this.$message.warning('请至少添加一个商品！');
        return;
      }

      // 验证每个商品的必填字段
      for (let i = 0; i < this.outForm.stockOutSimpleDTOList.length; i++) {
        const item = this.outForm.stockOutSimpleDTOList[i];
        if (!item.stockId) {
          this.$message.warning(`请选择第${i + 1}个商品的批次号`);
          return;
        }
        if (item.outType === '销售' && !item.customer) {
          this.$message.warning(`第${i + 1}个商品的销售出库必须填写出货商家！`);
          return;
        }
        if (item.outType === '销售' && (!item.salePrice || item.salePrice <= 0)) {
          this.$message.warning(`第${i + 1}个商品的销售出库必须填写售价！`);
          return;
        }
        if (item.outType === '报损' && !item.remark) {
          this.$message.warning(`第${i + 1}个商品的报损出库必须填写备注说明！`);
          return;
        }
        if (item.outType === '调拨' && item.targetWarehouse === this.outForm.warehouseLocation) {
          this.$message.warning(`第${i + 1}个商品的调拨库房不能与当前库房一致！`);
          return;
        }

        // 校验出库数量是否超过库存数量
        if (!item.quantity || item.quantity < 1) {
          this.$message.warning(`第${i + 1}个商品的出库数量必须大于 0！`);
          return;
        }
        if (item.stockQuantity && item.quantity > item.stockQuantity) {
          this.$message.error(`第${i + 1}个商品的出库数量不能超过库存数量（当前库存：${item.stockQuantity}）！`);
          return;
        }
      }

      // 设置提交中状态
      this.submitting = true;

      // 构建提交数据
      const submitData = {
        createUser: localStorage.getItem('ims_username'),
        stockOutSimpleDTOListList: this.outForm.stockOutSimpleDTOList.map(item => ({
          stockId: item.stockId,
          salePrice: item.salePrice ? parseFloat(item.salePrice) : 0,
          stockOutQuantity: item.quantity,
          remark:item.remark,
          customer: item.customer
        }))
      };

      // 调用后端接口
      this.$axios.post('/stock/out', submitData)
        .then(res => {
          if (res.data.code === 200) {
            this.$message.success('出库成功！');
            this.showOutDialog = false;
            this.queryStock();
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch(err => {
          this.$message.error('出库异常：' + err.message);
        })
        .finally(() => {
          // 释放提交锁
          this.submitting = false;
        });
    },

    resetOutForm() {
      this.outForm = {
        warehouseLocation: '一库',
        createUser: localStorage.getItem('ims_username') || 'admin',
        stockOutSimpleDTOList: [{
          goodsName: '',
          barcode: '',
          batchNumber: '',
          stockQuantity: '',
          unit: '',
          outType: '销售',
          quantity: 1,
          customer: '',
          salePrice: '',
          targetWarehouse: '',
          remark: '',
          stockId: '', // 隐藏的库存 ID 字段
          barcodeOptions: [],
          batchOptions: []
        }]
      };
    },

    // 盘点操作
    addCheckItem() {
      if (this.checkForm.checkList.length >= 10) {
        this.$message.warning('一次最多盘点 10 个商品！');
        return;
      }
      this.checkForm.checkList.push({
        goodsName: '',
        systemQuantity: 0,
        actualQuantity: 0
      });
    },

    removeCheckItem(index) {
      this.checkForm.checkList.splice(index, 1);
    },

    submitCheckStock() {
      if (this.checkForm.checkList.length === 0) {
        this.$message.warning('请至少选择一个商品进行盘点！');
        return;
      }

      const hasEmpty = this.checkForm.checkList.some(item => !item.goodsName);
      if (hasEmpty) {
        this.$message.warning('请完善所有盘点商品信息！');
        return;
      }

      const submitData = {
        ...this.checkForm,
        createUser: this.username
      };

      this.$axios.post('/stock/check', submitData)
          .then(res => {
            if (res.data.code === 200) {
              this.$message.success('盘点完成！');
              this.showCheckDialog = false;
              this.queryStock();
            } else {
              this.$message.error(res.data.msg);
            }
          })
          .catch(err => {
            this.$message.error('盘点异常：' + err.message);
          })
    },

    resetCheckForm() {
      this.checkForm = {
        checkDate: new Date().toISOString().split('T')[0],
        checkUser: localStorage.getItem('ims_username') || 'admin',
        checkList: [],
        remark: ''
      };
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
.stock-container {
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

/* 可点击表格行样式 */
.clickable-table ::v-deep .el-table__row {
  cursor: pointer;
}
.clickable-table ::v-deep .el-table__row:hover {
  background-color: #f5f7fa !important;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .stock-container {
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
    font-size: 12px;
  }
  ::v-deep .el-table th,
  ::v-deep .el-table td {
    padding: 6px 4px;
  }
  ::v-deep .el-table__header {
    font-size: 12px;
  }
  ::v-deep .el-table__body {
    font-size: 12px;
  }
  ::v-deep .el-tag {
    transform: scale(0.9);
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
</style>
