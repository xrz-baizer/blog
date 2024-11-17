# kubernetes之配置域名访问

## 前言

为Kuberentes部署的应用配置TLS（TLS 1.0 = SSL 3.0）

### 域名

- 百度云购买，备案（xurongze.com）

- 解析
    - 主机记录填写 user
    - 记录值填写 kuberentes某个工作节点公网IP（master节点默认80端口是给rancher使用）

### 证书

选择百度云的TrustAsia证书品牌，单域名版本（子域名也需独立申请，最多可免费申请二十张）

下载证书格式为：PEM_Nginx

##  使用Docker部署Nginx

### 在服务器上新建相关文件

```sh
mkdir ~/nginx
#用于存放html文件
mkdir ~/ningx/html
#用于存放基本配置文件
mkdir ~/ningx/config
#用于存放证书
mkdir ~/ningx/ssl
```

###  本地上传相关资源至服务器

```sh
scp -r ./ root@x1:~/nginx/ssl
scp -r ./ root@x1:~/nginx/html
```

### 在服务器上新增编辑default.conf文件

```sh
vim ~/nginx/config/default.conf
```

```
server {
    listen    443 ssl;
    server_name  xurongze.com;

    # 增加ssl
    ssl on;        #强制HTTPs访问
    ssl_certificate /nginx/ssl/xurongze.com.crt; #配置ssl证书的位置，注意下载证书的格式
    ssl_certificate_key /nginx/ssl/xurongze.com.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    # 指定密码为openssl支持的格式
    ssl_protocols  SSLv2 SSLv3 TLSv1.2;

    ssl_ciphers  HIGH:!aNULL:!MD5;  # 密码加密方式
    ssl_prefer_server_ciphers  on;   # 依赖SSLv3和TLSv1协议的服务器密码将优先于客户端密码

    location / {
        root   /nginx/html; #配置第定义的目录
        index  index.html index.htm;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html; #使用docker容器内部默认的文件
    }
}
```

### 启动Nginx

```sh
docker run -d \
-p 80:80 \
-p 443:443 \
-v ~/nginx/config:/etc/nginx/conf.d \
-v ~/nginx/html:/nginx/html \
-v ~/nginx/ssl:/nginx/ssl \
--name nginx \
nginx:latest
```

### 测试访问

https://xurongze.com

## Ingress-Nginx

### Ingress-nginx-controller

根据kuberentes版本选择

> 官方部署链接：https://github.com/kubernetes/ingress-nginx/blob/main/deploy/static/provider/baremetal/1.19/deploy.yaml

如下新增`hostNetwork: true`配置，使用宿主机网络

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  template:
    spec:
      hostNetwork: true #新增
      dnsPolicy: ClusterFirst
```

在Master上进行部署

```sh
kubectl apply -f ingress-nginx-controller.yaml
```

### 配置TLS证书

将本地下载好的证书传输至服务器

```sh
scp -r ./  root@master:~/user.xurongze.com
```

创建kuberentes中的secret

```sh
kubectl create secret tls https-user --key user.xurongze.com.key --cert user.xurongze.com.crt
```

![](https://img2022.cnblogs.com/blog/1473551/202202/1473551-20220224171754208-2063494523.png)



### Ingress配置规则

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: user-web
  annotations:
    kubernetes.io/ingress.class: "nginx" # 指定 Ingress Controller 的类型
    # 配置跨域  
    # headers 指定可传递的请求头，如果需要传递自定义请求头参数，需在此声明（必须大写开头）；例Token
    nginx.ingress.kubernetes.io/cors-allow-headers: Token,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization
    nginx.ingress.kubernetes.io/cors-allow-methods: PUT, GET, POST, OPTIONS
    nginx.ingress.kubernetes.io/cors-allow-origin: '*'
    nginx.ingress.kubernetes.io/enable-cors: "true"
spec:
  tls:
  - hosts:
    - user.xurongze.com
    secretName: https-user #secret证书名称
  rules:
    - host: user.xurongze.com
      http:
        paths:
        - path: /
          pathType: Prefix
          backend:
            serviceName: dm-user
            servicePort: 8080
```

### 测试访问

接口：`/user/finList`

https://user.xurongze.com/user/findList
