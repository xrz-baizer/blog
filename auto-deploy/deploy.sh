#!/bin/bash

# 定义变量
start_time=$(date +%s)
REPO_PATH="/Users/xrz/Library/Mobile Documents/com~apple~CloudDocs/KnowledgeRepository"
BLOG_PATH="/Users/Work/Pagoda/this/Blog"
SYNC_DIRS=("00-TechnicalFile" "01-Essay" "02-Other" "Image")

#REMOTE_SERVER="root@cloudserver"
REMOTE_SERVER="root@tencentserver"

#REMOTE_PATH="/app"
#CONTAINER_NAME="nginxBlog"
#CONFIGURATION_PATH="/"
#CONFIGURATION_FILE="nginx.config"

REMOTE_PATH="/caddy/app"
CONTAINER_NAME="caddyBlog"
CONFIGURATION_PATH="/caddy"
CONFIGURATION_FILE="Caddyfile"



# 默认 Commit 信息
if [ -z "$1" ]; then
  COMMIT="auto commit"
else
  COMMIT="$1"
fi

echo "==============================> 同步知识库到Blog项目docs目录中..."
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

echo "==============================> 进入Blog项目执行Git提交并推送..."
cd "$BLOG_PATH" || { echo "无法进入 $BLOG_PATH，请检查路径！"; exit 1; }
git add .
git commit -m "$COMMIT"
git push
if [ $? -ne 0 ]; then
  echo "Git 提交或推送失败，请检查！"
  exit 1
fi


echo "==============================> 执行'yarn build'构建静态文件..."
cd "$BLOG_PATH" || { echo "无法进入 $BLOG_PATH，请检查路径！"; exit 1; }
yarn build
if [ $? -ne 0 ]; then
  echo "静态文件构建失败，请检查！"
  exit 1
fi

echo "==============================> 压缩静态文件并上传到云服务器 $REMOTE_PATH ..."
DIST_PATH="$BLOG_PATH/docs/.vitepress/dist"
ARCHIVE_NAME="dist.tar.gz"

tar -czf "$DIST_PATH/$ARCHIVE_NAME" -C "$DIST_PATH" .
if [ $? -ne 0 ]; then
  echo "静态文件压缩失败，请检查！"
  exit 1
fi

scp "$DIST_PATH/$ARCHIVE_NAME" "$REMOTE_SERVER:/"
if [ $? -ne 0 ]; then
  echo "压缩文件上传失败，请检查！"
  exit 1
fi
echo "文件上传成功！"

echo "==============================> 覆盖更新配置文件 $CONFIGURATION_PATH/$CONFIGURATION_FILE ..."
scp "$BLOG_PATH/auto-deploy/$CONFIGURATION_FILE" "$REMOTE_SERVER:$CONFIGURATION_PATH"
if [ $? -ne 0 ]; then
  echo "$CONTAINER_NAME 覆盖更新配置文件，请检查！"
  exit 1
fi

echo "==============================> 解压覆盖静态资源并重启 $CONTAINER_NAME 容器..."
ssh "$REMOTE_SERVER" "tar -xzf /$ARCHIVE_NAME -C /$REMOTE_PATH"
if [ $? -ne 0 ]; then
  echo "文件解压失败，请检查！"
  exit 1
fi
ssh "$REMOTE_SERVER" "docker restart $CONTAINER_NAME"
if [ $? -ne 0 ]; then
  echo "$CONTAINER_NAME 容器重启失败，请检查！"
  exit 1
fi

end_time=$(date +%s)
elapsed_time=$((end_time - start_time))

echo "==========> 部署完成！执行耗时: $elapsed_time 秒"

