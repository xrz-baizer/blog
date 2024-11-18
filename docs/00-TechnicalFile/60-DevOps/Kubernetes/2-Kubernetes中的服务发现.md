# 2-Kubernetes中的服务发现

## 前言

使用kubernetes成功部署服务之后，解决服务与服务之间的调用（依靠SVC进行服务发现）

## 项目配置

### 项目结构

ms和dm之间选择使用feign方式调用
![](https://img2022.cnblogs.com/blog/1473551/202202/1473551-20220210095302556-205210863.png)


### 相关配置

#### dm和ms项目分别引入`spring-cloud-starter-kubernetes-client`包

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-kubernetes-client</artifactId>
</dependency>
```

#### 启动类上均增加注解`@EnableDiscoveryClient`

```java
package com.xurongze.user;

@SpringBootApplication
@EnableDiscoveryClient
public class MsStarter {
	public static void main(String[] args) {
		SpringApplication.run(MsStarter.class, args);
	}
}
```
```java
package com.xurongze.user;

@SpringBootApplication
@EnableFeignClients("com.xurongze.user.feign")
@EnableDiscoveryClient
public class DmStarter {
	public static void main(String[] args) {
		SpringApplication.run(DmStarter.class, args);
	}
}
```

#### ms-user接口配置

就正常提供接口即可，这边单独将接口声明在ms-sdk.rpc包中，是为了方便外部引用直接继承该接口

```java
package com.xurongze.user.rpc;

public interface UserManagementRpc {
    @GetMapping("/ms-user/findList")
    List<UserBO> findList();
}
```
impl
```java
package com.xurongze.user.rpc;

@RestController
public class UserManagementRpcImpl implements UserManagementRpc {
    @Override
    public List<UserBO> findList() {
        Random random = new Random();
        return Arrays.asList(
                new UserBO(random.nextLong(), "六宫粉黛无颜色", "password"),
                new UserBO(random.nextLong(), "天朝读书人", "password"),
                new UserBO(random.nextLong(), "天高任鸟飞", "password"),
                new UserBO(random.nextLong(), "星光不问赶路人", "password"),
                new UserBO(random.nextLong(), "花有重开日", "password"),
                new UserBO(random.nextLong(), "君子不立危墙之下", "password"),
                new UserBO(random.nextLong(), "此生何用声声叹", "password"),
                new UserBO(random.nextLong(), "海阔凭鱼跃", "password")
        );
    }
}
```

#### feign接口声明
dm项目中声明feign接口，直接继承ms-sdk包中rpc接口
```java
package com.xurongze.user.feign;

@FeignClient(
        name = "${feign-rpc.ms-user}",
        url = "${feign-rpc.ms-user}"
)
public interface UserManagementFeign extends UserManagementRpc {}
```

#### dm-user的application文件配置
application-local.yml（本地调试无需依赖k8s进行服务发现，直接localhost调用）
```yml
spring:
  cloud:
    kubernetes:
      discovery:
        enabled: false  #禁用kubernetes-client （本地启动会报错，不影响使用）
feign-rpc:
  ms-user: http://127.0.0.1:8888
```
application-test.yml（`http://ms-user:8888`对应ms项目的`srping.appliction.name`和`server.port`）
```yml
spring:
  cloud:
    kubernetes:
      discovery:
        enabled: true  #启用kubernetes-client
feign-rpc:
  ms-user: http://ms-user:8888
```

## Rancher配置

### 部署ms-user

![](https://img2022.cnblogs.com/blog/1473551/202202/1473551-20220210095346887-1069496282.png)



- 容器端口：8888
- 网络模式：选择Cluster IP ，集群内部可访问（rancher会自动生成一个svc）
- 主机监听端口：与容器端口保持一致

### 部署dm-user

![](https://img2022.cnblogs.com/blog/1473551/202202/1473551-20220210095401677-2044599143.png)



- 容器端口：8080
- 网络模式：NodePort （提供外部访问）
- 主机监听端口：30080

### 测试访问

![](https://img2022.cnblogs.com/blog/1473551/202202/1473551-20220210095411527-343962739.png)



## 异常

`Message: Forbidden!Configured service account doesn't have access. Service account may have been revoked. services is forbidden: User "system:serviceaccount:default:default" cannot list resource "services" in API group "" in the namespace "default".`

提升serviceaccount的权限

```sh
kubectl create clusterrolebinding permissive-binding \
--clusterrole=cluster-admin \
--user=admin \
--user=kubelet \
--group=system:serviceaccounts
```