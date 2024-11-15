## 基础操作

#### 下载
```
curl -O https://arthas.aliyun.com/arthas-boot.jar
```
#### 启动
```
java -jar arthas-boot.jar
```
#### 退出
此命令会退出所有arthas客户端
```
stop
```

## 【jad】查看源码

```
jad java.lang.String
```


## 【watch】实时查看方法出入参
- -x 遍历参数的深度
```
watch com.xrz.submitOrder {params,returnObj} 'params[1].userCode=="10086"' -x 2 -n 2
```



```sh

watch com.xrz.submitOrder {params,returnObj} 'params[1].userCode=="10086"' -x 2 -n 2



watch com.pagoda.platform.security.AuthorizationSessionStore decompressData {params,returnObj}  -x 2 -e
```

