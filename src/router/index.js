import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Portal from '@/components/Portal'
import GoodsManage from '@/components/GoodsManage'
import StockManage from '@/components/StockManage'

Vue.use(Router)

const router = new Router({
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', name: 'Login', component: Login },
        {
            path: '/portal',
            name: 'Portal',
            component: Portal,
            meta: { requiresAuth: true }
        },
        {
            path: '/goods-manage',
            name: 'GoodsManage',
            component: GoodsManage,
            meta: { requiresAuth: true }
        },
        {
            path: '/stock-manage',
            name: 'StockManage',
            component: StockManage,
            meta: { requiresAuth: true }
        }
    ]
})

// 核心修复：全局捕获重复导航错误
const originalPush = router.push
router.push = function push(location) {
    return originalPush.call(this, location).catch(err => {
        // 如果是重复导航错误，直接静默忽略
        if (err.name === 'NavigationDuplicated') {
            return
        }
        // 其他类型的路由错误仍正常抛出，便于排查
        return Promise.reject(err)
    })
}

export default router