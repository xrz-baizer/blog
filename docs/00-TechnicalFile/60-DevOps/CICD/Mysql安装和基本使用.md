# Mysql安装和基本使用

## Install

选择用docker安装

```shell
#MYSQL_ROOT_PASSWORD 指定登陆密码
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql:8.0
```

配置远程访问

```shell
#进入容器内部
docker exec -it mysql bash

#登入
mysql -u root -p

#配置外部访问且修改密码
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root321!';

#刷新
flush privileges;

```

![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220109103632271-153104180.png)




## 使用

![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220109103638884-590775929.png)
