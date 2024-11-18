# Vue3+TypeScript的基本使用（2）

## 前言

继上一篇：[Vue3+TypeScript的基本使用（1）](./Vue3+TypeScript的基本使用（1）.md)

使用`localStorage`简单完善登录的逻辑

### 后端前置准备

- 登录成功返回有时效性的token

- 增加网关拦截所有请求，限制headers必须携带token
  - 登录接口开放白名单
  - 校验token的有效性（无效返回401）

### 前端处理思路

- 登录成功获取token存至localStorage
- 拦截（除登录外）所有路由，token为空时跳转至登录页面
- 所有后端请求头统一增加token入参，后端返回token失效时清除并且跳转至登录页面

## LocalStorage

HTML5的新特性，一个存储本地数据的API

### 特点

- 对比Cookie突破了4K的限制，达到了5M的大小（IE浏览器会小一点）
- 只存储String
- 浏览器的隐私模式下无法读取
- 即使关闭浏览器，也能保存
  - 清除的方式
    - 调用API手动清除
    - 用户手动在Web中清除浏览数据
  - 如果需要关闭浏览器/选项卡时就自动清空数据可以使用`SessionStorage`

### 封装使用

在store目录下新建`localStoage.ts`文件

```js
/**
 * 封装操作localstorage本地存储的方法
 */
const TOKEN = "token";

const $localStorage = {
    //存储
    set(key: string, value: any) {
        localStorage.setItem(key, JSON.stringify(value))
    },
    //取出数据
    get<T>(key: string) {
        const value = localStorage.getItem(key)
        if (value && value != "undefined" && value != "null") {
            return <T>JSON.parse(value)
        }
    },
    // 删除数据
    remove(key: string) {
        localStorage.removeItem(key)
    },
    //操作token的方法
    setToken(token: string) {   this.set(TOKEN,token)                       },
    getToken(): string      {   return this.get<string>(TOKEN) as string    },
    removeToken()           {   this.remove(TOKEN)                          }
};
export default $localStorage;
```

## 页面改造

### http改造

修改`http/index.ts`文件

调整请求拦截和响应拦截

```js
// 请求拦截
this.service.interceptors.request.use((config: AxiosRequestConfig) => {
  //请求头中赋值token
  (config.headers as AxiosRequestHeaders).token = $localStorage.getToken();
  return config
}, error => Promise.reject(error)) // 为了可以在代码中catch到错误信息


// 响应拦截
this.service.interceptors.response.use((response: AxiosResponse<any>) => {
  const data = response.data
  const { code } = data

  //判断请求响应码
  if (code != 200) {
    ElMessage.error(data.message)
    return Promise.reject(data)
  }
  //判断后台自定义响应码
  switch (data.data.code) {
    case 401:
      ElMessage.error(data.data.message)
      router.replace("/login") //鉴权失败，直接跳转至登录页面
      return Promise.reject(data);
  }

  return data
}, error => {
  // 超出 2xx 范围的状态码都会触发该函数。
  ElMessage.error(error.message)
  return Promise.reject(error)
})
```

### router改造

修改`router/index.ts`文件

调整默认页面为`/home`，独立出`/login`页面

```js

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        component: LoginView
    },
    {
        path: '/', //默认渲染至App.vue中，配合<router-view/>使用
        redirect: '/userlist', //设置默认重定向的子页面
      ...
    }
]
```

增加导航守卫，拦截所有路由

```js
const router = createRouter({
    history: createWebHashHistory(),
    routes
})

//导航守卫 路由跳转前触发
router.beforeEach((to,from,next) => {
    //去登录页面时无需校验
    if (to.path !== "/login"){
        //校验用户登录信息
        const token = $localStorage.getToken()
        if (token === undefined || token === ""){
            next("/login");
        }else next();
    }else next()
})

export default router
```

### LoginView.vue

```js
const loginData = ref<ILogin>({
  userName:"",
  userPassword:"",
  toLogin() {
    if(!this.userName || !this.userPassword){
      ElMessage.warning("Please input name or password!")
      return
    }

    $http.post<string>("/login",this).then(res => {
      ElMessage.success("Login successful!")
      //登录成功，存储token
      $localStorage.setToken(res.data)
      routers.push("/")
    })
  }
})
```

### HomeView.vue

登出按钮绑定事件，清除token

```html
<el-button round id="logout" @click="logout()">Logout</el-button>
```

```js
const logout = () => {
  $localStorage.removeToken()
  router.push('/login')
}
```
