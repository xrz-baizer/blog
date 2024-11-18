# Apache Bench（Mac自带的压力测试工具）

 一个命令行web接口测试工具

### 基本信息

```sh
#查看当前版本
ab -V

#查看帮助
ab --help
```

> 格式：`ab [options] [http[s]://]hostname[:port]/path`

### 常用参数

`-n`	总请求次数

`-c`	并发数

`-t`	测试所进行的最大秒数，默认没有时间限制

`-r`	抛出异常继续执行测试任务

`-p`	包含了需要 POST 的数据的文件，文件格式根据`-T`决定

`-T` 	POST 数据所使用的 Content-type 头信息，如`-T "application/json"`，配合`-p`使用

`-H`	header参数，例`-H "token:xxx"`；多个参数时使用多个`-H`

`-C` Cookie参数，例如`-C name=value`

`-w` 	以 HTML 表的格式输出结果

### 请求用例

#### GET请求

```sh
ab -n 100 -c 10 https://www.baidu.com/
```
总共100个请求，每次并发10个请求去调用该接口

#### POST请求

```sh
ab \
-n 10 \
-c 2 \
-C PAGODA_JSESSIONID=3dad67d1-ce05-48f1-b173-19383dc69ec2 \
-T "application/json;charset=UTF-8" \
-p parm.json \
https://erp2.ktest.pagoda.com.cn/erp_pur/PurOrderService/findOrderListByParams
```
`parm.json`
```json
{
  "createdAtStart": "2022-02-01 00:00:00",
  "createdAtEnd": "2022-02-25 23:59:59",
  "pageable": {
    "pageNumber": 0,
    "pageSize": 15
  },
  "type": 10
}
```

#### 保存结果为HTML文件

```sh
ab -n 100 -c 10 -w https://www.baidu.com/ > abRes.html
```

### 结果说明

```sh
This is ApacheBench, Version 2.3 <$Revision: 1879490 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking www.baidu.com (be patient).....done


Server Software:        BWS/1.1
Server Hostname:        www.baidu.com
Server Port:            443
SSL/TLS Protocol:       TLSv1.2,ECDHE-RSA-AES128-GCM-SHA256,2048,128
Server Temp Key:        ECDH P-256 256 bits
TLS Server Name:        www.baidu.com

Document Path:          /
Document Length:        227 bytes

Concurrency Level:      10
Time taken for tests:   0.857 seconds	#测试的持续时间
Complete requests:      100						#完成的请求数量
Failed requests:        0							#失败的请求数量
Total transferred:      111094 bytes
HTML transferred:       22700 bytes
Requests per second:    116.75 [#/sec] (mean) #吞吐率：每秒请求完成数（TPS）
Time per request:       85.652 [ms] (mean) #平均TPS响应时间
Time per request:       8.565 [ms] (mean, across all concurrent requests)
Transfer rate:          126.66 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:       41   58   8.8     56      88
Processing:    12   17   4.3     16      36
Waiting:       12   17   3.8     16      34
Total:         58   75   8.9     73     104

Percentage of the requests served within a certain time (ms)
  50%     73
  66%     77
  75%     80
  80%     83
  90%     89
  95%     94
  98%     98
  99%    104
 100%    104 (longest request)
```
