# Git常用操作

## Other

#### 回退commit
> 想修改上一次的commit信息可以用这个

`git commit --amend` 适用于未push或者最后一次push

#### 拉取指定commit
`git cherry-pick [commit-id]` 当前分支拉取其它分支指定的commit

批量拉取
`git cherry-pick 9dba07f4^..32aba548` ##出错版本后的第一个commit直至最新commit

#### 忽略本地文件

> 某些配置文件想在本地修改，但是又不想提交到远程仓库（多人开发时，在本地保留自己修改），可以使用此命令
> 例：
>
> git update-index --assume-unchanged ms-starter/src/main/resources/application.yml
> git update-index --assume-unchanged ms-starter/src/main/resources/application-local.yml
>
>.gitingnore或者.git/info/exclude文件只对未被git追踪的文件有效，对应已经被版本管理控制的文件会忽略失效。

`git update-index --assume-unchanged <file>`  告诉Git暂时忽略对文件的更改

`git update-index --no-assume-unchanged <file>`还原

上述命令在 切换分支时会有问题。可以使用alias自定义全局命令：

>alias commitall="git add . && git commit -m"
>alias commit="git add . &&
>git restore --staged ms-starter/src/main/resources/application.yml &&
>git restore --staged ms-starter/src/main/resources/application-local.yml &&
>git restore --staged ms-starter/src/main/resources/application-message.yml &&
>git commit -m"

#### 本地配置隔离

- 建立本地配置分支：`git checkout -b xrz-local-configuration`
- 切换到业务分支，合并配置分支：`git merge xrz-local-configuration`
- 自测完毕，清除配置分支：`git reset --hard origin/业务分支`


## 暂存区（stash）

`git stash` 暂存当前改动
`git stash save "优化XXX"` 暂存当前改动，添加备注
`git stash  pop` 还原最近一次暂存
`git stash  list` 查看所有暂存
`git stash show -p ` 查看最近一次暂存详细信息
`git stash show -p stash@{0}` 查看指定暂存详细信息
`git stash clear` 清除所有stash

## 版本回退

通过`git log`查看指定`commit-id`

**回退到指定提交ID（提交记录也会回退）**

`git reset --hard [commit-id]`
> 如果存在远程分支则需要强制覆盖（需要相应的权限）

**回退到指定提交ID（保留提交记录）**

`git revert [commit-id]`

**查看提交与回退到日志（用于反回退）**

`git reflog`

再通过`git push -f`强制推送覆盖远程分支

## 处理冲突

场景：个人分支(feature/v1) 合并至 远程分支(dev) 冲突

前置：无直接合并dev分支的权限

1. `git checkout dev`本地拉取远程分支
2. `git pull`更新远程分支
3. `git pull origin feaature/v1`拉取个人分支至当前分支
4. 处理冲突 commit
5. `git checkout -b temp_dev`根据当前分支创建临时版本分支
6. `git push`推送临时分支至远程仓库
7. 创建temp_dev合并至dev的合并请求

## Pull or Push

**更新当前分支**

`git pull`
`git pull -f`

**拉取指定分支至当前分支**

`git pull origin [branch-name]`

**推送当前分支到远程仓库**

`git push`
`git push -f`

**将指定分支合并到当前分支**

`git merge [branch-name]`

## 查看提交日志

**查看当前分支日志**

`git log`

**查看当前分支日志 一行展示**

`git log -- oneline`

**查看当前分支日志详情**

`git log -p`

**查看指定分支日志详情**

`git log [branch-name] -p`

> 翻页：`b`/`f`     上一页/下一页

## 创建分支

**根据当前分支创建副本**

`git checkout -b [new-branch-name]`

**根据指定分支创建副本**

`git checkout -b [new-branch-name] [branch-name]`

**切换分支**

`git checkout [branch-name]`

**清除当前缓冲区的内容**

`git checkout -f`

**强制切换分支（会清除当前缓冲区的内容）**

`git checkout -f [branch-name]`

## 查看分支

**查看本地分支**

`git branch`

**查看远程分支**

`git branch -r`

**查看所有分支**

`git branch -a`

## 删除分支

**强制删除本地分支**

`git branch -D [branch-name]`

**删除远程分支**

`git push origin --delete [branch-name]`

**清除所有本地分支，除了（production）**

`git branch | grep -v 'production' | xargs git branch -D`