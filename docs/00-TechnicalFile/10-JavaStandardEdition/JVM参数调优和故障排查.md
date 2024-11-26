# JVM参数调优和故障排查

继上一篇：[JVM的内存管理](0-JVM的内存管理.md)

## JVM参数

### 关键参数

`-XX:MaxRAMPercentage=80.0`	百分比形式的Xmx，最大堆内存设置为物理服务器（或容器）中的总可用内存大小的80% ，默认值25%

`-XX:InitialRAMPercentage=80.0`	百分比形式的Xms，初始堆内存设置为物理服务器（或容器）中的总可用内存大小的80% ，默认值1.5625%，即系统可用物理内存的 1/64。

>在K8S中，Pod一般会配置资源限制的相关参数，而上述百分比参数则作用于resources.limits.memory。

`-XX:MinRAMPercentage=80.0`	当物理服务器（或容器）的内存小于 200MB时，此参数会替代MaxRAMPercentage，默认是 50%

`-XX:MetaspaceSize=512m`	元空间初始值，默认是 21MB

`-XX:MaxMetaspaceSize=512m`	元空间大小调整需要Full GC，与初始值设置一样来避免

`-XX:MaxGCPauseMillis=100`	指定STW时间，默认值200ms

`-XX:G1HeapRegionSize=n`	指定Region大小，必须是2次幂，最大是32m，具体取值有1MB、2MB、4MB、8MB、16MB、32MB。默认Region大小等于堆大小除以2048

`-XX:G1NewSizePercent`	新生代最小值，默认值5%

`-XX:G1MaxNewSizePercent`	新生代最大值，默认值60%。在运行过程中，JVM会不停的给年轻代增加更多的Region，但是最多新生代的占比不会超过G1MaxNewSizePercent值

#### Dockerfile的配置（G1配置参考）

```sh
# FROM openjdk:8
FROM registry.cn-shenzhen.aliyuncs.com/xurongze/jre:8
ARG JAR_NAME
ADD ${JAR_NAME}/ms-starter/target/${JAR_NAME}.jar app.jar
ENTRYPOINT java -jar \
-Dfile.encoding=UTF-8 \
-Dsun.jnu.encoding=UTF-8 \
# GC日志相关配置
-XX:+PrintGCDetails \
-XX:+PrintGCDateStamps \
-XX:+PrintGCCause \
-Xloggc:/logs/gc/gc-%t.log \
#配置Jvm发生致命错误时生成hs_err_pid文件的路径（栈异常信息）
-XX:ErrorFile=/logs/gc/hs_err_pid%p.log \
#Dump异常快照以及以文件形式导出（堆异常信息）
-XX:+HeapDumpOnOutOfMemoryError \
-XX:HeapDumpPath=/logs/gc \
#禁用Jvm对异常栈信息的优化 https://www.jianshu.com/p/cc1bd35466cb
-XX:-OmitStackTraceInFastThrow \
#启用多线程并行处理Reference https://www.jianshu.com/p/79d4a0516f11
-XX:+ParallelRefProcEnabled \
#设置堆外内存 https://www.jianshu.com/p/007052ee3773
-XX:MaxDirectMemorySize=64m \
# 启用G1
-XX:+UseG1GC \
# STW时间
-XX:MaxGCPauseMillis=100 \
# 最大堆内存设置为物理服务器（或容器）中的总可用内存大小的80%
-XX:MaxRAMPercentage=80.0 \ 
-XX:MinRAMPercentage=80.0 \
-XX:MetaspaceSize=512m \
-XX:MaxMetaspaceSize=512m \
# 栈深度
-Xss256k \
-Xms256m \
-Xmx256m \
/app.jar
```

> 注意：最大堆内存+堆外内存设置 不能超过 Kubernetes中Pod的`Memory Limit`

## 故障排查

### 相关指令

`top`查看CPU使用率和获取PID（进程ID）

`jps`获取Java进程ID

`jinfo [pid]`查看进程的JVM参数

`jmap -heap [pid]`查看当前使用的JDK版本和垃圾回收器

`jmap -dump:format=b,file=heapDump [pid]`获取当前内存快照Dump文件

`top -Hp [pid]`查看某个进程中使用 CPU 最多的线程信息

`printf %x\n [线程id]`转换线程ID为16进制

`jstack [pid] | grep [16进制的线程ID] -A 20` 通过jstack查看线程情况

### 发现问题

- 业务操作系统出现异常，提故障单报运维，运维再反馈研发。
- 通过系统监控工具Prometheus+Grafana，查看堆内存使用和GC时间、GC频率、CPU使用率等，定期检测。

### 排查步骤

一般线上的服务器很少有权限可以直接访问（就算有，一般也不会直接在线上服务器进行操作），所以大多数都是通过dump文件来分析。

而且事故现场一般不会保留，所以项目上线时，JVM参数必须做以下配置：

```sh
#Dump异常快照以及以文件形式导出（堆异常信息）
-XX:+HeapDumpOnOutOfMemoryError \
-XX:HeapDumpPath=/logs/gc \
```

>如果服务是部署在容器Pod上，HeapDumpPath的路径还需要通过Pod配置挂载在服务主机上，否则内存溢出后Pod自动重启，Dump文件也会被清除，只能通过挂载容器主机的形式保留Dump文件。

从服务器上下载Dump文件后，再导入到可视化工具MAT分析

### 排查工具

**MAT**：

- Java 堆内存分析工具，主要用于分析和查找 Java 堆中的内存泄漏和内存消耗问题。
- 可以从 Java 堆转储文件中分析内存使用情况，并提供丰富的报告，如内存泄漏疑点、最大对象和 GC 根信息。
- 支持通过图形界面查询对象，以及检查对象间的引用关系。

**Arthas**：

- 阿里巴巴开源的 Java 诊断工具，主要用于线上的应用诊断。
- 支持在不停机的情况下进行 Java 应用的诊断。
- 包括 JVM 信息查看、监控、Trace 命令、反编译等。

## 参考

[MAT：一次线上内存泄漏排查 - 掘金](https://juejin.cn/post/6847902222202880008)
[Java中9种常见的CMS GC问题分析与解决](https://mp.weixin.qq.com/s?__biz=MjM5NjQ5MTI5OA==&mid=2651754955&idx=1&sn=8411133d2e5f22b9e2c5a34cdc67985d&chksm=bd1248868a65c1900dd1b7203ce17159740253df2324a208ea9c71ee764e1bde1ed2616d77ce&scene=21#wechat_redirect)