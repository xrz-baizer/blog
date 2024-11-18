# 1-Kubernetes安装和基本使用

## 选K8S的理由

- 负载均衡
- 服务发现
- 弹性伸缩
- 自我修复
- 版本回退
- ...


## K8S架构

- Master——控制集群（Control Plane控制面板）
    - Contoller Manager——控制管理器
    - Etcd——键值数据库，存储集群所有数据
    - Scheduler——调度器，负责把容器调度到最合适到node节点
    - API Server——集群访问入口，网关
- Node——工作节点
    - Kubelet——创建、管理pod（容器）
    - Kube-proxy——负责管理流量，请求转发

## 服务器准备

百度云同一账号下的三台服务器，确保内网能PING通（注意需同一地域，同一VPC）

|HostName| IP        | Liunx OS | Specs                 | Roles  |
| -------------- | ------------- | --------------------- | ------ | ---------- |
|master| 106.13.123.123 / 172.16.16.5 | CentOS7.6     | 2CPUs/4GB/40GB/1M | Master |
|node1| 182.61.123.123 / 172.16.16.6 | CentOS7.6     | 2CPUs/4GB/40GB/1M | Node1  |
|node2| 106.13.123.123 / 172.16.16.4 | CentOS7.6     | 2CPUs/4GB/40GB/1M | Node2  |

#### 本地配置

配置host映射，后续可直接使用hostname登入服务器

```sh
cat >> /etc/hosts <<EOF
106.13.123.123  master
182.61.123.123  node1
106.13.123.123  node2
EOF
```

配置免密登陆，先生成密钥对

```sh
ssh-keygen -t rsa
```

将本地公钥发送到服务器上（提示没有ssh目录时自行创建）

```sh
ssh root@master 'cat >> .ssh/authorized_keys' < ~/.ssh/id_rsa.pub
ssh root@node1 'cat >> .ssh/authorized_keys' < ~/.ssh/id_rsa.pub
ssh root@node2 'cat >> .ssh/authorized_keys' < ~/.ssh/id_rsa.pub
```

测试

![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220101225220102-225994064.png)


#### 基础配置

```sh
#修改主机名（购买服务器时可提前设置）

#调整命令行字符颜色（防止眼瞎）
cat >> ~/.bashrc <<EOF
PS1='\[\e[32;40m\]\u@\h \W ➤ \e[m'
EOF

source ~/.bashrc

#添加Host解析（直接配置内网）
cat >> /etc/hosts <<EOF
172.16.16.5	 master
172.16.16.6 node1
172.16.16.4 node2
EOF

#调整防火墙规则
iptables -P FORWARD ACCEPT

#关闭挂载swap分区
swapoff -a

sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

#关闭防火墙和SELINUX
sed -ri 's#(SELINUX=).*#\1disabled#' /etc/selinux/config

setenforce 0

systemctl disable firewalld && systemctl stop firewalld

#开启内核对流量的转发
cat <<EOF > /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward=1
vm.max_map_count=262144
EOF

modprobe br_netfilter

sysctl -p /etc/sysctl.d/k8s.conf

#配置contos7阿里云的yum源
curl -o /etc/yum.repos.d/Centos-7.repo http://mirrors.aliyun.com/repo/Centos-7.repo

#配置docker阿里云的yum源
curl -o /etc/yum.repos.d/docker-ce.repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

#自定义kubernetes yum源
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=http://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=0
repo_gpgcheck=0
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
 http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

#生成yum缓存
yum clean all && yum makecache

```

#### 安装docker

```sh
#刚刚配置了阿里的yum源，直接使用yum安装
yum install docker-ce -y

#配置阿里云镜像仓库加速地址（阿里控制台获取个人加速地址）
mkdir -p /etc/docker

cat <<EOF > /etc/docker/daemon.json
{
 "registry-mirrors": ["https://gs41u9fe.mirror.aliyuncs.com"]
}
EOF

#启动docker
systemctl start docker

#查看状态
systemctl status docker
```
![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220101225243913-583415635.png)


官方镜像仓库地址

> https://hub.docker.com/search?type=image

##### docker常用命令

```sh
#强制删除所有镜像
docker rmi -f `docker images -q`

#强制删除所有容器
docker rm -f `docker ps -a -q`

#实时查看容器镜像日志
docker logs -f [CONTAINER ID or NAME]

#搜索指定镜像
docker images | grep [NAME]
```

## 安装Kubernetes

#### 安装 kubeadm，kubelet ， kubectl（所有节点执行）

> - kubeadm:  用于初始化集群的指令，安装集群
> - kubelet: 管理docker，下载镜像、创建容器、启动容器
> - kubectl: 用于与集群通讯的命令行工具

```sh
yum install -y kubelet-1.18.4 kubeadm-1.18.4 kubectl-1.18.4 --disableexcludes=kubernetes
#查看版本
kubeadm version
 
#设置kubelet开机启动,确保服务器一开机 kubelet服务就会启动，然后自动管理pod（容器）
systemctl enable kubelet
```

#### 初始化配置文件（master节点执行）

```sh
#创建文件夹
mkdir ~/k8s-install && cd ~/k8s-install

#打印k8s默认的初始化配置文件至kubeadm.yaml中
kubeadm config print init-defaults > kubeadm.yaml

#调整配置文件
vim kubeadm.yaml
```

```yaml
apiVersion: kubeadm.k8s.io/v1beta2
bootstrapTokens:
- groups:
  - system:bootstrappers:kubeadm:default-node-token
  token: abcdef.0123456789abcdef
  ttl: 24h0m0s
  usages:
  - signing
  - authentication
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 172.16.16.5 #设置master的内网IP
  bindPort: 6443
nodeRegistration:
  criSocket: /var/run/dockershim.sock
  name: master
  taints:
  - effect: NoSchedule
    key: node-role.kubernetes.io/master
---
apiServer:
  timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta2
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controllerManager: {}
dns:
  type: CoreDNS
etcd:
  local:
    dataDir: /var/lib/etcd
imageRepository: registry.aliyuncs.com/google_containers #更换阿里云镜像仓库地址
kind: ClusterConfiguration
kubernetesVersion: v1.18.4 #调整指定版本
networking:
  dnsDomain: cluster.local
  podSubnet: 172.17.0.0/16 #添加pod网段，设置容器内网络
  serviceSubnet: 10.96.0.0/12
scheduler: {}
```

> 对象属性详解官方地址：https://godoc.org/k8s.io/kubernetes/cmd/kubeadm/app/apis/kubeadm/v1beta2

```sh
# 列出镜像列表
kubeadm config images list --config kubeadm.yaml

#提前下载镜像
kubeadm config images pull --config kubeadm.yaml

#查看镜像
docker images | grep aliyun
```

#### 初始化Master节点（master节点执行）

```sh
kubeadm init --config kubeadm.yaml

#Your Kubernetes control-plane has initialized successfully!
#
#To start using your cluster, you need to run the following as a regular user:
#
#  mkdir -p $HOME/.kube
#  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
#  sudo chown $(id -u):$(id -g) $HOME/.kube/config
#
#You should now deploy a pod network to the cluster.
#Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
#  https://kubernetes.io/docs/concepts/cluster-administration/addons/
#
#Then you can join any number of worker nodes by running the following on each as root:
#
#kubeadm join 172.16.16.5:6443 --token abcdef.0123456789abcdef \
#    --discovery-token-ca-cert-hash sha256:bad36063ad45dc798080c46e5b5f4044b350974c00852797f0132ca0998edede
```

按提示创建配置文件

```sh
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

#### Node节点加入集群（node节点执行）

```sh
kubeadm join 172.16.16.5:6443 --token 1y7sq9.hsbge758tve7jq7h   \
  --discovery-token-ca-cert-hash sha256:bad36063ad45dc798080c46e5b5f4044b350974c00852797f0132ca0998edede
```

#### 配置集群网络（master节点执行）

```sh
#下载calico网络插件配置文件（calico目前为企业主流）
wget https://docs.projectcalico.org/manifests/calico.yaml --no-check-certificate

#应用
kubectl apply -f calico.yaml
```

查看pod启动状态

```sh
kubectl get pod --all-namespaces
```

STATUS均为Running时 查看全部节点是否就绪

```sh
kubectl get nodes -o wide
```
![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220101225312695-886999323.png)

启动失败时可用log排查

```sh
#查看最后20条日志
kubectl logs --tail=20 [PodName]
```



## 基本使用

#### 使用deployment文件部署应用

```sh
vim nginx.yaml
```

```yaml
apiVersion: apps/v1 
kind: Deployment #对象类型
metadata: # 元信息
  name: nginx-deployment
  labels:
    app: nginx # 标签
  namespace: default # 放到默认的命名空间
spec: # 详细参数配置
  replicas: 1 # pod的副本数
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers: # 容器信息
        - name: nginx
          image: nginx:latest # 指定拉取的镜像
          ports:
            - containerPort: 80 # 指定容器的端口
```

启动nginx

```sh
kubectl apply -f nginx.yaml
```

查看启动状态
```sh
kubectl get pods -o wide
```

测试内网访问

![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220101225331372-595025952.png)


#### 创建Service提供外网访问

> 将多个POD划分到同一个逻辑组中，并统一向外提供服务，这个逻辑组就是一个service。POD是通过Label Selector加入到指定的service中。Service相当于是一个负载均衡器，用户请求会先到达service，再由service转发到它内部的某个POD上（默认以round-robin方式转发）

```sh
vim nginx-service.yaml
```

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: nginx
  name: nginx-deployment
  namespace: default
spec:
  ports:
    - port: 9000  # Service绑定的端口
      name: nginx-service80
      protocol: TCP  #示Service转发请求到容器的协议是TCP
      targetPort: 80 #表示Service转发外部请求到容器的目标端口80
      nodePort: 30080 #表示Service对外开放的节点端口
  selector: #设置标签选择器。POD根据匹配此标签来加入到此service下
    app: nginx # 转发到指定标签的pods
  type: NodePort #节点端口转发类型
```

启动nginx-service
```sh
kubectl apply -f nginx-service.yaml
```

查看启动状态
```sh
kubectl get service -o wide
```

测试公网访问

http://106.13.123.123:30080/

http://182.61.123.123:30080/

http://106.13.123.123:30080/

## 使用rancher管理K8S

#### 安装rancher

这边选择在master节点上使用docker安装

```sh
docker run -d --restart=unless-stopped \
-p 80:80 -p 443:443 \
--privileged \
--restart=unless-stopped \
--name rancher \
rancher/rancher:v2.4.8
```

#### 导入集群

直接在网页打开rancher的yml文件
https://106.13.123.123/v3/import/w76slwv8qq78wqj6cn5g6crv8tbx7mt7mqpwb822gsj95l4jtjd4p5.yaml

```sh
#手动创建rancher.yml文件,将网页中的配置文件复制进去
vim rancher.yaml

#执行
kubectl apply -f rancher.yaml
```

![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220101225350218-1656210065.png)


Waiting...

![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220101225408239-706951742.png)


![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220101225426465-1383453168.png)


![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220101225440879-1094726914.png)


![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220101225452531-1923672882.png)

#### 使用rancher部署应用

![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220101225503267-1083564965.png)


![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220101225514786-1726560534.png)


![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220101225525055-931297511.png)

## 其它

#### 新增node节点

前置条件：与master节点在同一内网下
基础配置： 参考上文

1、在master节点生成新的join token `kubeadm token create --print-join-command` （该token有效期为24小时，可考虑增加 --ttl=0 生成永不失效的token）
![](https://img2022.cnblogs.com/blog/1473551/202201/1473551-20220128232230017-107720838.png)

2、node节点执行 `kubeadm join 172.16.16.5:6443 --token ...`
![](https://img2022.cnblogs.com/blog/1473551/202201/1473551-20220128232349717-631026003.png)

3、master节点查看 `kubectl get nodes` or `kubectl get nodes -owide`
![](https://img2022.cnblogs.com/blog/1473551/202201/1473551-20220128232444270-1625385065.png)
等待 STATUS 为 Ready即可

4、查看Rancher
![](https://img2022.cnblogs.com/blog/1473551/202201/1473551-20220128232607700-1487105036.png)


#### 删除node节点

> kubectl delete node [node-name]

end