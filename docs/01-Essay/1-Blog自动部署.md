# Blog自动部署

## 前言

为建立个人知识库，打造个人博客，用于记录成体系的知识、随笔等。

最终实现效果：

1. 在本地Typora编写文章
2. 执行`publish-blog`命令即可发布（执行deploy.sh脚本）
   1. 将需要发布的文章复制到Blog项目的docs目录中
   2. 重新构建Vitepress生成静态html文件
   3. 压缩静态文件推送至远程服务器/app目录再解压（配合Nginx部署）
   4. 推送本地项目至Github


## 编写Blog项目

经过多方考察，最终选择了VitePress。

- VitePress 是一个[静态站点生成器](https://en.wikipedia.org/wiki/Static_site_generator) (SSG)，专为构建快速、以内容为中心的站点而设计。
- 简而言之，VitePress 获取用 Markdown 编写的内容，对其应用主题，并生成可以轻松部署到任何地方的静态 HTML 页面。



安装启动运行参考官网：[Vitepress快速开始](https://vitepress.dev/zh/guide/getting-started)

- 根据文件目录自动生成侧边栏插件：https://github.com/QC2168/vite-plugin-vitepress-auto-sidebar

- 样式美化参考：https://vitepress.yiov.top/style.html

## 本地配置自动部署

部署方式有很多种，最终选择本地编写脚本的方式部署，因为本地的各种环境已经搭建好，而且有自己有云服务器，所以只要构建好静态文件推送到服务器即可。

### 服务器准备

在根目录/下创建app文件夹，创建nginx.conf配置文件

- `/app`用于存放Vitepres构建的静态文件
- `/nginx.conf`参考Vitepress提供的配置文件，不过需要做一些调整，否则会出现各种问题
  - Vitepress提供Nginx配置文件：https://vitepress.dev/zh/guide/deploy#nginx

完整nginx.conf配置如下：

```sh

# 设置并行CPU核心数，在轻量级应用或单核环境中：可以设置为 1。
worker_processes 1;

events {
    # 定义每个 worker_process 可以同时处理的最大连接数。默认值1024
    worker_connections 1024;
}

http {

    # 确保JavaScript文件被服务器识别为js文件
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        listen 80;
        server_name _;
        index index.html;

        location / {
            # 静态文件目录
            root /app;

            # exact matches -> reverse clean urls -> folders -> not found
            try_files $uri $uri.html $uri/ =404;

            # non existent pages
            error_page 404 /404.html;

            # a folder without index.html raises 403 in this setup
            error_page 403 /404.html;

            # adjust caching headers
            # files in the assets folder have hashes filenames
            location ~* ^/assets/ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
    }
}
```

安装Nginx：参考另一篇博客 [使用ECS为本地搭建开发环境](./0-使用ECS为本地搭建开发环境.md) 中使用docker部署Nginx

- 注意挂载目录的路径

设置编码格式：（解决上传的静态文件名中文乱码的问题）

```sh
# 检查当前服务器的语言环境 
locale

# 使用cat <<EOF >快速写入
cat <<EOF >/etc/locale.conf
LANG=zh_CN.UTF-8
LC_ALL=zh_CN.UTF-8
EOF

# 配置刷新
source /etc/locale.conf
```


### 编写deploy.sh

`REPO_PATH`是本地编写文章的知识库目录。（放置iCloud中多重保险）

`BLOG_PATH`Blog项目，进入该目录执行git、yarn构建相关命令。（会推送GitHub）

`SYNC_DIRS`知识库部分内容包含隐私内容，所以会指定同步的文件夹，只有这些文件夹的内容才需要打包构建。如果全部内容都是开放的甚至可以直接在Blog项目中编写文章，就不需要移动复制了。

```sh
#!/bin/bash

# 定义变量
start_time=$(date +%s)
REPO_PATH="/Users/xrz/Library/Mobile Documents/com~apple~CloudDocs/KnowledgeRepository"
BLOG_PATH="/Users/Work/Pagoda/this/Blog"
SYNC_DIRS=("00-TechnicalFile" "01-Essay" "02-English" "Image")

#REMOTE_SERVER="root@cloudserver"
REMOTE_SERVER="root@tencentserver"
REMOTE_PATH="/app"
NGINX_CONTAINER_NAME="nginxBlog"



# 默认 Commit 信息
if [ -z "$1" ]; then
  COMMIT="auto commit"
else
  COMMIT="$1"
fi

echo "==========> 同步知识库到Blog项目docs目录中..."
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

echo "==========> 进入Blog项目执行Git提交并推送..."
cd "$BLOG_PATH" || { echo "无法进入 $BLOG_PATH，请检查路径！"; exit 1; }
git add .
git commit -m "$COMMIT"
git push
if [ $? -ne 0 ]; then
  echo "Git 提交或推送失败，请检查！"
  exit 1
fi

echo "==========> 执行'yarn build'构建静态文件..."
cd "$BLOG_PATH" || { echo "无法进入 $BLOG_PATH，请检查路径！"; exit 1; }
yarn build
if [ $? -ne 0 ]; then
  echo "静态文件构建失败，请检查！"
  exit 1
fi

echo "==========> 压缩静态文件并上传到云服务器 $REMOTE_PATH ..."
DIST_PATH="$BLOG_PATH/docs/.vitepress/dist"
ARCHIVE_NAME="dist.tar.gz"

tar -czf "$DIST_PATH/$ARCHIVE_NAME" -C "$DIST_PATH" .
if [ $? -ne 0 ]; then
  echo "静态文件压缩失败，请检查！"
  exit 1
fi

ssh "$REMOTE_SERVER" "rm -rf $REMOTE_PATH && mkdir -p $REMOTE_PATH"
scp "$DIST_PATH/$ARCHIVE_NAME" "$REMOTE_SERVER:$REMOTE_PATH/"
if [ $? -ne 0 ]; then
  echo "压缩文件上传失败，请检查！"
  exit 1
fi
echo "文件上传成功！"

echo "==========> 解压文件并重启 $NGINX_CONTAINER_NAME 容器..."
ssh "$REMOTE_SERVER" "tar -xzf $REMOTE_PATH/$ARCHIVE_NAME -C $REMOTE_PATH"
if [ $? -ne 0 ]; then
  echo "文件解压失败，请检查！"
  exit 1
fi
ssh "$REMOTE_SERVER" "docker restart $NGINX_CONTAINER_NAME"
if [ $? -ne 0 ]; then
  echo "$NGINX_CONTAINER_NAME 容器重启失败，请检查！"
  exit 1
fi

end_time=$(date +%s)
elapsed_time=$((end_time - start_time))

echo "部署完成！执行耗时: $elapsed_time 秒"
```

### 配置全局命令（alias）

本地使用的是zsh，在 `~/.zshrc` 中配置对应的命令别名，执行deploy.sh

```sh
alias publish-blog="/Users/Work/this/Blog/deploy.sh"
```

使配置生效

```sh
source ~/.zshrc
```

之后在Terminal任意处执行`publish-blog`即可发布博客

![blogAutoDeploymentEffectPicture.png](../Image/blogAutoDeploymentEffectPicture.png)


## 其它部署方式

Vitepress各种部署方式参考：https://vitepress.dev/zh/guide/deploy

### GitHub Pages

如果选择部署到Github Pages可以使用Github Action。当检测到分支合并，自动执行脚本进行部署。

- Github Action：https://docs.github.com/zh/actions
- 优点：免费流量、天然集成Github
- 缺点：域名有限制、国内网络不好

### Webhooks

Github提供的一个钩子，监听到代码合并时，可以执行一个请求。

- Webhooks：https://docs.github.com/en/webhooks/about-webhooks
- 缺点：需要在服务器上部署jar，而且需要为执行sh脚本搭建所需的环境。 

比如可以编写一个jar部署到云服务器上， 提供一个接口，当前调用时执行自定义的sh。

示例代码：

```java
@RestController
@RequestMapping("/webhook")
public class WebhookListener {
    
    @GetMapping("/publish")
    public String publish(){
        try {
            String fullName = "/deploy.sh";
            
            ProcessBuilder processBuilder = new ProcessBuilder("sh", fullName);
            processBuilder.redirectErrorStream(true);
            // 执行
            Process process = processBuilder.start();

            // 读取执行结果
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line,mesg= "";
            while ((line = reader.readLine()) != null) {
                mesg = mesg+line+"\n";
            }
            //校验执行码
            int exitCode = process.waitFor();
            if(exitCode != 0) return mesg;

        } catch (Exception e) {
            return "ErrorMesage:"+e.getMessage();
        }
        return "SUCCESS";
    }
}
```

