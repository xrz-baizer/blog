# Windows Defender内核隔离无法关闭，提示此设置由管理员进行管理

**原因：本身为WIN10专业版，是不会有这个问题的，本地安装了一个docker之后，就凉了，后续本地不用docker了发现虚拟机凉了， 百度前几页就这个管用。**


前往注册表以下位置：

`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity\Enabled`


将注册表中这个值设为0就可以关闭。

**重启。**