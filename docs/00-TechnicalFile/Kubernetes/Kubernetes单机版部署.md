# Kubernetes单机版部署

## 前言

仅记录部署**单机版K8S**的流程，用于测试实验

- 集群版的部署流程：https://www.cnblogs.com/xurongze/articles/15756399.html
- K3S官网：https://docs.k3s.io/

## 准备配置

### 服务器

- 系统：CentOS7.6
- 配置：4CPUs/8GB/180GB/12M

>部署K3S最低要求 `1CPUs/512MB`，推荐 `2CPUs/1GB`

### 服务器配置

安装Docker：https://www.cnblogs.com/xurongze/articles/15756738.html

```sh
# 调整命令行字符颜色（防止眼瞎）
cat >> ~/.bashrc <<EOF
PS1='\[\e[32;40m\]\u@\h \W ➤ \e[m'
EOF

source ~/.bashrc
```

### 本地配置（配置免密登录）

```sh
# 配置host映射，后续可直接使用hostname登入服务器
cat >> /etc/hosts <<EOF
123.207.57.211 txcloud
EOF

# 配置免密登陆，先生成密钥对
ssh-keygen -t rsa

# 将本地公钥发送到服务器上（提示没有ssh目录时自行创建）
ssh root@txcloud 'cat >> .ssh/authorized_keys' < ~/.ssh/id_rsa.pub
```

## 安装K3S

使用官网安装脚本，默认使用containerd运行容器，需要在后面加上`-s --docker`参数选择使用Docker（依据上文提前安装）

```sh
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | INSTALL_K3S_MIRROR=cn sh -s - --docker

# [INFO]  Creating /usr/local/bin/kubectl symlink to k3s
# [INFO]  Creating /usr/local/bin/crictl symlink to k3s
# [INFO]  Creating /usr/local/bin/ctr symlink to k3s
# [INFO]  Creating killall script /usr/local/bin/k3s-killall.sh
# [INFO]  Creating uninstall script /usr/local/bin/k3s-uninstall.sh
# [INFO]  env: Creating environment file /etc/systemd/system/k3s.service.env
# [INFO]  systemd: Creating service file /etc/systemd/system/k3s.service
# [INFO]  systemd: Enabling k3s unit Created symlink from /etc/systemd/system/multi-user.target.wants/k3s.service to /etc/systemd/system/k3s.service.
# [INFO]  systemd: Starting k3s
```

>运行此安装后：
>
>- K3s 服务将被配置为在节点重启后或进程崩溃或被杀死时自动重启。
>- 将安装其他实用程序，包括 `kubectl`、`crictl`、`ctr`、`k3s-killall.sh` 和 `k3s-uninstall.sh`。
>- [kubeconfig](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) 文件将写入到 `/etc/rancher/k3s/k3s.yaml`，由 K3s 安装的 kubectl 将自动使用该文件。
>
>单节点 Server 安装是一个功能齐全的 Kubernetes 集群，它包括了托管工作负载 pod 所需的所有数据存储、control plane、kubelet 和容器运行时组件。除非你希望向集群添加容量或冗余，否则没有必要添加额外的 Server 或 Agent 节点。

查询K3S信息

```sh
 k3s kubectl get node
 
# NAME             STATUS   ROLES                  AGE     VERSION
# vm-20-3-centos   Ready    control-plane,master   2m40s   v1.26.5+k3s1
```

查询节点信息

```sh
kubectl get node -o wide

# NAME             STATUS   ROLES                  AGE     VERSION        INTERNAL-IP   EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION                CONTAINER-RUNTIME
# vm-20-3-centos   Ready    control-plane,master   2m30s   v1.26.5+k3s1   10.0.20.3     <none>        CentOS Linux 7 (Core)   3.10.0-1160.88.1.el7.x86_64   docker://24.0.2
```

卸载K3S

```sh
/usr/local/bin/k3s-uninstall.sh
```

## 基本使用

kubectl：https://www.cnblogs.com/xurongze/p/17377559.html

### 创建命名空间

使用命令行方式

```sh
# 创建命名空间 dev （ns = namespace）
kubectl create ns dev
```

使用yaml方式，新增`namespace.yaml`文件

```yaml
apiVersion: v1
kind: Namespace  #对象类型
metadata: # 元信息
  name: dev # 空间名称
```

```sh
# 执行
kubectl apply -f namespace.yaml

# 查看所有命名空间
kubectl get ns

#删除
kubectl delete ns dev
```

### 创建ConfigMap

使用yaml方式，新增`configmap.yaml`文件

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: configmap-erp-test #名称
  namespace: dev	#指定命名空间
data:
  erp.test.replicas: "2"
  application.yaml: |-
    test:
      enabled: true
```

```sh
# 执行
kubectl apply -f configmap.yaml

# 查看
kubectl get cm -n dev
kubectl describe cm -n dev configmap-erp-test

#删除
kubectl delete cm 
```

使用命令行方式指定文件创建

```sh
kubectl create configmap configmap-erp-test \
--from-file=application1.yaml \
--from-file=application2.yaml
```

挂载至指定应用内部（方式二支持热更新）

```yaml
apiVersion: v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          env: # 注入环境变量
          - name: ERP_RESPLICAS  # 声明变量名称
            valueFrom:
              configMapKeyRef:
                name: configmap-erp-test  # 引用ConfigMap的name
                key: erp.test.replicas # 将ConfigMap中erp.test.replicas的值注入到ERP_RESPLICAS中
---
apiVersion: v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          volumeMounts: # 挂载数据卷声明
            - name: configmap-volume # 要挂载数据卷的名称
              mountPath: /app/configmap  #挂载至容器内的路径
      volumes: # 声明数据卷
        - name: configmap-volume
          configMap:
            name: configmap-erp-test # 引用ConfigMap的name

```

验证

```sh
# 进入容器内部（exit 退出）
kubectl exec -it <pod_name> /bin/sh -n dev

# 查看全局环境变量
echo $ERP_RESPLICAS

# 查看挂载文件
cat /app/configmap/application.yaml
```

### 创建Deployment

新增`nginx.yaml`文件

```yaml
apiVersion: apps/v1 #这里需要使用<group>/<version>的格式
kind: Deployment #对象类型
metadata: # 元信息
  name: nginx-dev
  namespace: dev # 指定命名空间
spec: # 详细参数配置
  replicas: 1 # pod的副本数
  selector:
    matchLabels:
      erpselector: nginx-test #标签
  template:
    metadata:
      labels:
        erpselector: nginx-test  #标签
    spec:
      containers: # 容器信息
        - name: nginx
          image: nginx:latest # 指定拉取的镜像
          ports:
            - containerPort: 80 # 指定容器的端口
```

通过内网访问验证

```sh
# 执行
kubectl apply -f nginx.yaml

# 查看就绪状态，容器ID
kubectl get pods -n dev -o wide

# 测试内网访问
curl 10.42.0.9
```

### 创建Service

新增`service.yaml`文件，将NginxPod暴露公网访问

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  namespace: dev
spec:
  type: NodePort #节点端口转发类型
  selector: #设置标签选择器。POD根据匹配此标签来加入到此service下
    erpselector: nginx-test # 转发到指定标签的pods
  ports:
    - port: 80  # Service绑定的端口（该serive的请求端口，主要是用于集群内部调用）
      targetPort: 80 #表示Service转发外部请求到容器的目标端口80（nginx-test的80）
      protocol: TCP  #示Service转发请求到容器的协议是TCP
      nodePort: 30080 #指定Service对外开放的节点端口（默认：30000-32767）
  externalIPs: #指定暴露的公网IP（此为轻量云服务特殊情况使用）
    - 123.207.57.211
```

验证

```sh
# 执行
 kubectl apply -f service.yaml
 
#查看
 kubectl get svc -n dev
#NAME            TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
#nginx-service   NodePort   10.43.244.230   <none>        80:30080/TCP   3m6s

```

公网访问：http://123.207.57.211:30080/

## 其它

### Linux快速创建yaml文件

```sh
cat <<EOF >./filename.yaml
...
EOF
```