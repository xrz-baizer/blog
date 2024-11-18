# Nexus安装和基本使用

## Install

选用docker安装

```shell
docker run -d -p 8081:8081 --name nexus --restart=always sonatype/nexus3
```

访问 http://x1:8081
![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220104222252059-1207076573.png)

```shell
#进入容器内部获取密码
docker exec -it nexus /bin/bash

#查看密码
cat /nexus-data/admin.password
```
![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220104222545110-2005515765.png)

Sign in

![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220104222706544-1735103334.png)

重新设置密码
![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220104222858652-1851687252.png)


是否允许匿名用户访问，看个人。这边选择否
![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220104222845423-1502482751.png)

查看仓库
![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220104222952315-2052785774.png)

#### 调整启动内存大小

默认内存大小是2703m
详情调整可看官网：https://help.sonatype.com/repomanager3/installation-and-upgrades/configuring-the-runtime-environment

docker run时增加启动项
```
 -e "INSTALL4J_ADD_VM_PARAMS=-Xms2G -Xmx2G -XX:MaxDirectMemorySize=2G -Djava.util.prefs.userRoot=/nexus-data/javaprefs"
```

## Repository配置

#### 常用仓库说明

- maven-central：maven 中央库，默认从 https://repo1.maven.org/maven2/ 拉取 jar
- maven-releases：私库发行版本
    - 新增时需注意 Deployment policy设置为Allow redeploy（允许重复推送）
- maven-snapshots：私库快照版本
- maven-public：仓库分组，把上面三个仓库组合在一起对外提供服务

#### 仓库类型

- hosted：私有仓库
- proxy：代理仓库
- group：聚合仓库；内部设置了多个仓库，访问顺序取决于配置顺序

#### 新增仓库

1. 新增阿里代理仓库
   地址配置为：http://maven.aliyun.com/nexus/content/groups/public/
   ![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220109112345857-735612156.png)

2. 新增个人私有仓库
   ![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220109113305888-1766321930.png)

3. 新增聚合仓库
   ![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220109113606299-486886306.png)


## 上传/下载 jar 配置

> 注意：
>  - 若项目版本号末尾带有 -SNAPSHOT，则会发布到snapshots快照版本仓库
>  - 若项目版本号末尾带有 -RELEASES 或什么都不带，则会发布到releases正式版本仓库

#### pom文件配置

`id` 对应Maven settings.xml的server id
`url` 对应私服仓库地址
`name` 非必需

```xml
 <!--项目发布-->
    <distributionManagement>
        <repository>
            <id>xurongze-release</id>
            <name>xurongze-release</name>
            <url>http://x2:8081/repository/xurongze-release/</url>
        </repository>
        <snapshotRepository>
            <id>xurongze-snapshots</id>
            <name>xurongze-snapshots</name>
            <url>http://x2:8081/repository/xurongze-snapshots/</url>
        </snapshotRepository>
    </distributionManagement>
    <!-- 依赖下载地址 -->
    <repositories>
        <repository>
            <id>xurongze</id>
            <name>xurongze</name>
            <url>http://x2:8081/repository/xurongze/</url>
        </repository>
    </repositories>
```

#### Maven settings.xml配置

设置pom文件中id对应的账号密码

```xml
<servers>
      <server>
          <id>xurongze-release</id>
          <username>admin</username>
          <password>admin123</password>
      </server>
      <server>
          <id>xurongze-snapshots</id>
          <username>admin</username>
          <password>admin123</password>
      </server>
      <server>
          <id>xurongze</id>
          <username>admin</username>
          <password>admin123</password>
      </server>
</servers>
```
#### Maven deploy发布

![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220109122806371-473513273.png)

![](https://img2020.cnblogs.com/blog/1473551/202201/1473551-20220109122937532-1666426459.png)


## 空间清理

> 清除多余的快照版本：新建两个定时任务，一个用于逻辑删除，一个物理删除

#### 新增逻辑删除任务

![](https://img2022.cnblogs.com/blog/1473551/202201/1473551-20220123103557697-219947867.png)

![](https://img2022.cnblogs.com/blog/1473551/202201/1473551-20220123103820997-20003528.png)

#### 新增物理删除任务

启动时间设定建议比逻辑删除任务晚一点
![](https://img2022.cnblogs.com/blog/1473551/202201/1473551-20220123104331986-1269512514.png)
