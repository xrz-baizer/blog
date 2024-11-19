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

echo "==========> 同步知识库文章到 Blog 项目中..."
for DIR in "${SYNC_DIRS[@]}"; do
  SOURCE_DIR="$REPO_PATH/$DIR"
  TARGET_DIR="$BLOG_PATH/docs/$DIR"

  if [ -d "$SOURCE_DIR" ]; then
    rsync -av --delete "$SOURCE_DIR/" "$TARGET_DIR/"
    if [ $? -ne 0 ]; then
      echo "$DIR 文件同步失败，请检查！"
      exit 1
    fi
  else
    echo "源目录 $SOURCE_DIR 不存在，跳过同步。"
  fi
done
echo "知识库文章同步完成。"

echo "==========> 开始提交并推送GitHub中..."
cd "$BLOG_PATH" || { echo "无法进入 $BLOG_PATH，请检查路径！"; exit 1; }
git add .
git commit -m "$COMMIT"
git push
if [ $? -ne 0 ]; then
  echo "Git 提交或推送失败，请检查！"
  exit 1
fi
echo "提交并推送成功。"

## 构建静态文件
#echo "==========> 开始构建静态文件..."
#cd "$BLOG_PATH" || { echo "无法进入 $BLOG_PATH，请检查路径！"; exit 1; }
#yarn build
#if [ $? -ne 0 ]; then
#  echo "静态文件构建失败，请检查！"
#  exit 1
#fi
#echo "静态文件构建成功。"


# 上传静态文件到云服务器
echo "==========> 压缩静态文件..."
DIST_PATH="$BLOG_PATH/docs/.vitepress/dist"
ARCHIVE_NAME="dist.tar.gz"

# 压缩 dist 目录
tar -czvf "$DIST_PATH/$ARCHIVE_NAME" -C "$DIST_PATH" .
if [ $? -ne 0 ]; then
  echo "静态文件压缩失败，请检查！"
  exit 1
fi
echo "静态文件压缩成功：$DIST_PATH/$ARCHIVE_NAME"

# 上传压缩文件到服务器
echo "==========> 上传压缩文件到云服务器..."
scp "$DIST_PATH/$ARCHIVE_NAME" "$REMOTE_SERVER:$REMOTE_PATH/"
if [ $? -ne 0 ]; then
  echo "压缩文件上传失败，请检查！"
  exit 1
fi
echo "压缩文件上传成功。"

# 解压文件并覆盖到目标路径
echo "==========> 解压文件到目标路径..."
ssh "$REMOTE_SERVER" "mkdir -p $REMOTE_PATH && tar -xzvf $REMOTE_PATH/$ARCHIVE_NAME -C $REMOTE_PATH && rm $REMOTE_PATH/$ARCHIVE_NAME"
if [ $? -ne 0 ]; then
  echo "文件解压失败，请检查！"
  exit 1
fi
echo "文件解压并覆盖成功。"

echo "部署完成！"

## 上传静态文件到云服务器
#echo "==========> 上传静态文件到云服务器..."
##rsync -av --delete "$BLOG_PATH/docs/.vitepress/dist/" "$REMOTE_SERVER:$REMOTE_PATH/"
#scp -r "$BLOG_PATH/docs/.vitepress/dist/" "$REMOTE_SERVER:$REMOTE_PATH/"
#if [ $? -ne 0 ]; then
#  echo "静态文件上传失败，请检查！"
#  exit 1
#fi
#echo "静态文件上传成功。"
#
#echo "部署完成！"
