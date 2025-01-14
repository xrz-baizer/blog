# Homebrew（Mac自带的包管理工具）

## 安装

官网：https://brew.sh/

**macOS (or Linux)一键安装脚本**

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## 常用命令


`brew install [xxx]`    安装指定软件包
`brew uninstall [xxx]`  卸载指定软件包
`brew reinstall [xxx]`  重新安装指定软件包

`brew list` 列出所有已安装的软件包
`brew search [xxx]` 搜索包含关键字的软件包
`brew info [xxx]`   查看指定软件包的信息

---

`brew --prefix [xxx]`   查找指定软件安装目录  
`brew upgrade [xxx]`    升级指定软件包（省略则升级所有包）  
`brew update`   更新 Homebrew 本身  
`brew cleanup`  清理旧版本的软件包和缓存  
`brew doctor`   检查系统和 Homebrew 是否有问题  

---

`brew services start [xxx]` 启动服务（如 MySQL、Redis）  
`brew services stop [xxx]`  停止服务  
`brew services list`    列出所有服务的状态

---

`brew tap [xxx]`    添加第三方软件源  
`brew untap [xx]`   移除第三方软件源  
`brew bundle`   使用 Brewfile 管理依赖包  
`brew config`   查看系统和 Homebrew 配置信息
`brew analytics off`    禁用 Homebrew 的分析数据收集
`brew autoremove`   删除未被使用的依赖项

