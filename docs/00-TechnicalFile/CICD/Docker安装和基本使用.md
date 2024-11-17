# Docker安装和基本使用

## install

``` sh
#配置docker阿里云的yum源
curl -o /etc/yum.repos.d/docker-ce.repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

#生成yum缓存
yum clean all && yum makecache

#使用yum安装
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

官方镜像仓库地址

> https://hub.docker.com/search?type=image

## 不常用命令

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

## 其它

一键安装脚本
```sh
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```
