#!/bin/bash

# 检查是否传递提交备注 1
if [ -z "$1" ]; then
  echo "请提供提交备注，例如：git deploy '本次提交备注'"
  exit 1
fi

# 定义变量
REPO_PATH="/Users/xrz/Library/Mobile\ Documents/com~apple~CloudDocs/KnowledgeRepository"
BLOG_PATH="/Users/Work/Pagoda/this/Blog"
# 同步的文件夹
SYNC_DIRS=("00-TechnicalFile" "01-Essay" "02-English" "Image")
REMOTE_SERVER="root@cloudserver"
REMOTE_PATH="/app"

# 自动提交并推送代码
echo "==========>开始提交代码..."
git add .
git commit -m "$1"
git push
if [ $? -ne 0 ]; then
  echo "Git 提交或推送失败，请检查！"
  exit 1
fi
echo "代码提交并推送成功。"

# 移动文件到目标目录
echo "==========>移动文档到 Blog 项目中..."

for DIR in "${SYNC_DIRS[@]}"; do
  if [ -d "$REPO_PATH/$DIR" ]; then
    rsync -av --delete  "$REPO_PATH/$DIR/" "$BLOG_PATH/$DIR/"
    echo "$DIR 文件同步成功。"
  else
    echo "源目录 $REPO_PATH/$DIR 不存在，跳过同步。"
  fi
done
echo "文档移动成功。"

# 进入 Blog 项目目录并构建静态文件
echo "==========>开始构建静态文件..."
cd "$BLOG_PATH" || exit 1
yarn docs:build
if [ $? -ne 0 ]; then
  echo "静态文件构建失败，请检查！"
  exit 1
fi
echo "静态文件构建成功。"

# 上传静态文件到云服务器
echo "==========>上传静态文件到云服务器..."
rsync -av --delete "$BLOG_PATH/docs/.vitepress/dist/" "$REMOTE_SERVER:$REMOTE_PATH/"
if [ $? -ne 0 ]; then
  echo "文件上传失败，请检查！"
  exit 1
fi
echo "静态文件上传成功。"

echo "部署完成！"
