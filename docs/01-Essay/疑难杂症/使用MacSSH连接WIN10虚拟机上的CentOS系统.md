# 使用Mac SSH连接 WIN10虚拟机上的CentOS系统

## WIN10

- 关闭防火墙

## VMware配置

- 设置虚拟网络编辑器
    - VMnet0设置为桥接模式
    - 桥接到 当前主机网卡（可在 控制面板->网络和Internet->网络连接->以太网 or WLAN 中查看）

- 设置CentOS虚拟机的网络适配器
    - 网络连接 -> 桥接模式（复制物理网络连接状态）

## Liunx(CentOS7.6)配置

- 配置网卡
    - > vi /etc/syscofig/network-scripts/ifcfg-ens33
```
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=static            //开启静态IP
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=ens33
UUID=3cabeac0-b295-4294-878c-ca081c26ca52
DEVICE=ens33

ONBOOT=yes                  //启用此网卡
NETMASK=255.255.255.0       //WIN10主机的子网掩码
IPADDR=192.168.10.10        //前三段与主机IPv4保持一致，第四段可自定义
BROADCAST=192.168.10.255    //广播地址（可不设置）  
GATEWAY=192.168.10.1        //WIN10主机的默认网关
```

- 重启网络
    - > systemctl restart network.service

- 测试网络
    - > ping -c 5 www.baidu.com

## Mac

> ssh root@192.168.10.10
