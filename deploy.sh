#!/bin/bash

# 定义变量
REPO_PATH="/Users/xrz/Library/Mobile Documents/com~apple~CloudDocs/KnowledgeRepository"
BLOG_PATH="/Users/Work/Pagoda/this/Blog"
SYNC_DIRS=("00-TechnicalFile" "01-Essay" "02-English" "Image")

REMOTE_SERVER="root@cloudserver"
REMOTE_PATH="/app"

# 默认 Commit 信息
if [ -z "$1" ]; then
  COMMIT="auto commit"
else
  COMMIT="$1"
fi

# 自动提交并推送代码
echo "==========> 开始提交代码..."
cd "$BLOG_PATH" || { echo "无法进入 $BLOG_PATH，请检查路径！"; exit 1; }
git add .
git commit -m "$COMMIT"
git push
if [ $? -ne 0 ]; then
  echo "Git 提交或推送失败，请检查！"
  exit 1
fi
echo "代码提交并推送成功。"

# 同步文件到 Blog 项目目录
echo "==========> 同步文档到 Blog 项目中..."
for DIR in "${SYNC_DIRS[@]}"; do
  SOURCE_DIR="$REPO_PATH/$DIR"
  TARGET_DIR="$BLOG_PATH/docs/$DIR"

  if [ -d "$SOURCE_DIR" ]; then
    rsync -av --delete "$SOURCE_DIR/" "$TARGET_DIR/"
    if [ $? -ne 0 ]; then
      echo "$DIR 文件同步失败，请检查！"
      exit 1
    fi
    echo "$DIR 文件同步成功。"
  else
    echo "源目录 $SOURCE_DIR 不存在，跳过同步。"
  fi
done
echo "文档同步完成。"

# 构建静态文件
echo "==========> 开始构建静态文件..."
cd "$BLOG_PATH" || { echo "无法进入 $BLOG_PATH，请检查路径！"; exit 1; }
yarn build
if [ $? -ne 0 ]; then
  echo "静态文件构建失败，请检查！"
  exit 1
fi
echo "静态文件构建成功。"

# 上传静态文件到云服务器
echo "==========> 上传静态文件到云服务器..."
rsync -av --delete --iconv=UTF-8,UTF-8 "$BLOG_PATH/docs/.vitepress/dist/" "$REMOTE_SERVER:$REMOTE_PATH/"
if [ $? -ne 0 ]; then
  echo "静态文件上传失败，请检查！"
  exit 1
fi
echo "静态文件上传成功。"

echo "部署完成！"
