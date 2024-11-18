# Kubectl的基本使用

## 前言

使用kubectl工具管理kubernetes集群

> 其它参考官方地址：https://kubernetes.io/zh-cn/docs/reference/kubectl/

## 安装

用 Homebrew 在 macOS 系统上安装（注意版本）

```SH
## 安装 默认最新版本
brew install kubectl
## 验证
kubectl version --client
```

> 其它参考官方地址：https://kubernetes.io/zh-cn/docs/tasks/tools/#kubectl

## 配置

将本地的kubectl与远程的kubernetes集群关联起来

- 获取集群的kubeConfig文件
- 维护至本地的`~/.kube/config`文件中，多个环境选择手工合并

```yaml
apiVersion: v1
kind: Config
clusters: #集群地址
  - name: "dev"
    cluster:
      server: "https://k8s-rancher.kdev/k8s/clusters/local"
  - name: "test"
    cluster:
      server: "https://k8s-rancher.ktest/k8s/clusters/local"
  - name: "uat"
    cluster:
      server: "https://k8s-rancher.kstaging/k8s/clusters/local"
users:  #对应的用户组信息
  - name: "dev"
    user:
      token: "kubeconfig-u-qccxxxxxxxxx" #登录方式选择token 或者账号密码
      # password: some-password
    	# username: exp
  - name: "test"
    user:
      token: "kubeconfig-u-qccxxxxxxxxx"
  - name: "uat"
    user:
      token: "kubeconfig-u-qccxxxxxxxxx"
contexts: #上下文配置
  - name: "test"
    context:
      user: "test"
      cluster: "test"
  - name: "dev"
    context:
      user: "dev"
      cluster: "dev"
  - name: "uat"
    context:
      user: "uat"
      cluster: "uat"
# 指定当前操作的上下文配置
current-context: "test"
```

- 查看集群信息，*表示当前环境

```sh
kubectl config get-contexts
```

- 切换dev环境

```sh
kubectl config use-context dev
```

> 其它参考官方地址：https://kubernetes.io/zh-cn/docs/tasks/access-application-cluster/configure-access-multiple-clusters/

## 使用

### 查询

kubectl get pods -n erp-mt | grep purchase

kubectl get pods -n erp-web | grep purchase

kubectl get pods -n mt | grep purchase



kubectl get deployment -n erp-mt | grep purchase

kubectl get deployment -n mt | grep purchase



kubectl logs -f --tail 200 ms-purchase-7d467bdfcd-265sj -n mt

### 重启deployment

kubectl rollout restart deployment -n mt ms-purchase

### 指定参数更新deployment

kubectl patch deployment ms-purchase -n mt -p '{"spec": {"template": {"spec": {"containers": [{"name": "ms-purchase", "resources": {"limits": {"cpu": "2", "memory": "4Gi"}, "requests": {"cpu": "1", "memory": "2Gi"}}, "livenessProbe": {"initialDelaySeconds": 60}, "readinessProbe": {"initialDelaySeconds": 60}}]}}}}'

### 命令大全

https://kubernetes.io/zh-cn/docs/reference/kubectl/cheatsheet/