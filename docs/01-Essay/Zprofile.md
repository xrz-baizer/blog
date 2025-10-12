# .zprofile

## 统计单个目录视频总时长

```sh
# === 统计单个目录视频总时长 (函数版) ===
sumvideo() {
  # 1. 设定目标目录：如果提供了参数，则使用第一个参数；否则，使用当前目录。
  local target_dir="${1:-.}"

  # 2. 检查 ffprobe (ffmpeg) 是否已安装
  if ! command -v ffprobe >/dev/null 2>&1; then
    echo "错误: 未找到 ffprobe 命令，请先安装 ffmpeg。" >&2
    return 1
  fi

  # 3. 使用 find 和 ffprobe 获取所有视频时长的总和（秒）
  local total_seconds
  total_seconds=$(find "$target_dir" -maxdepth 1 -type f \( \
    -iname "*.mp4" -o -iname "*.mkv" -o -iname "*.mov" \
    -o -iname "*.avi" -o -iname "*.flv" -o -iname "*.webm" \
    -o -iname "*.wmv" -o -iname "*.ts" -o -iname "*.m4v" \
    \) -print0 | xargs -0 -I {} ffprobe -v error \
    -show_entries format=duration \
    -of default=noprint_wrappers=1:nokey=1 "{}" | awk '{s+=$1} END {print s}')

  # 4. 检查是否找到了任何视频
  if [ -z "$total_seconds" ]; then
    echo "在目录 '$target_dir' 中未找到支持的视频文件。"
    return 0
  fi

  # 5. 使用 awk 将总秒数格式化为 时:分:秒 并输出
  echo "$total_seconds" | awk -v dir="$target_dir" '{
    h=int($1/3600);
    m=int(($1%3600)/60);
    s=$1%60;
    printf "目录 '\''%s'\'' 视频总时长: %02d小时 %02d分 %.0f秒\n", dir, h, m, s
  }'
}
```



##  Proxy 开关

```sh
# 定义 proxy 函数
proxy() {
    # 代理服务器地址和端口
    local proxy_address="http://127.0.0.1:7890"

    # 新增逻辑：检查第二个参数是否为 'silent'
    local is_silent=false
    if [ "$2" = "silent" ]; then
        is_silent=true
    fi

    case "$1" in
        on)
            export http_proxy="$proxy_address"
            export https_proxy="$proxy_address"
            # 只有在非静默模式下才输出信息
            if [ "$is_silent" = false ]; then
                echo -e "\033[32m✓ Proxy has been turned ON.\033[0m"
                echo "  http_proxy  = $http_proxy"
                echo "  https_proxy = $https_proxy"
            fi
            ;;
        off)
            unset http_proxy
            unset https_proxy
            # 只有在非静默模式下才输出信息
            if [ "$is_silent" = false ]; then
                echo -e "\033[31m✗ Proxy has been turned OFF.\033[0m"
            fi
            ;;
        status|*)
            if [ -n "$http_proxy" ] || [ -n "$https_proxy" ]; then
                echo "Proxy is currently ON."
                [ -n "$http_proxy" ] && echo "  http_proxy  = $http_proxy"
                [ -n "$https_proxy" ] && echo "  https_proxy = $https_proxy"
            else
                echo "Proxy is currently OFF."
            fi
            echo "Usage: proxy [on|off|status]"
            ;;
    esac
}

# --- 修改此处的调用方式 ---
# 以静默模式 (silent) 自动开启代理，这样就不会有任何输出
proxy on silent
```

## ~/.zprofile

```sh
# 默认进入工作目录
cd /Users/Work/xxxx

# 添加 Homebrew 环境变量
eval "$(/opt/homebrew/bin/brew shellenv)"

# === 统计单个目录视频总时长 (函数版) ===
sumvideo() {
  # 1. 设定目标目录：如果提供了参数，则使用第一个参数；否则，使用当前目录。
  local target_dir="${1:-.}"

  # 2. 检查 ffprobe (ffmpeg) 是否已安装
  if ! command -v ffprobe >/dev/null 2>&1; then
    echo "错误: 未找到 ffprobe 命令，请先安装 ffmpeg。" >&2
    return 1
  fi

  # 3. 使用 find 和 ffprobe 获取所有视频时长的总和（秒）
  local total_seconds
  total_seconds=$(find "$target_dir" -maxdepth 1 -type f \( \
    -iname "*.mp4" -o -iname "*.mkv" -o -iname "*.mov" \
    -o -iname "*.avi" -o -iname "*.flv" -o -iname "*.webm" \
    -o -iname "*.wmv" -o -iname "*.ts" -o -iname "*.m4v" \
    \) -print0 | xargs -0 -I {} ffprobe -v error \
    -show_entries format=duration \
    -of default=noprint_wrappers=1:nokey=1 "{}" | awk '{s+=$1} END {print s}')

  # 4. 检查是否找到了任何视频
  if [ -z "$total_seconds" ]; then
    echo "在目录 '$target_dir' 中未找到支持的视频文件。"
    return 0
  fi

  # 5. 使用 awk 将总秒数格式化为 时:分:秒 并输出
  echo "$total_seconds" | awk -v dir="$target_dir" '{
    h=int($1/3600);
    m=int(($1%3600)/60);
    s=$1%60;
    printf "目录 '\''%s'\'' 视频总时长: %02d小时 %02d分 %.0f秒\n", dir, h, m, s
  }'
}

# 定义 proxy 函数
proxy() {
    # 代理服务器地址和端口
    local proxy_address="http://127.0.0.1:7890"

    # 新增逻辑：检查第二个参数是否为 'silent'
    local is_silent=false
    if [ "$2" = "silent" ]; then
        is_silent=true
    fi

    case "$1" in
        on)
            export http_proxy="$proxy_address"
            export https_proxy="$proxy_address"
            # 只有在非静默模式下才输出信息
            if [ "$is_silent" = false ]; then
                echo -e "\033[32m✓ Proxy has been turned ON.\033[0m"
                echo "  http_proxy  = $http_proxy"
                echo "  https_proxy = $https_proxy"
            fi
            ;;
        off)
            unset http_proxy
            unset https_proxy
            # 只有在非静默模式下才输出信息
            if [ "$is_silent" = false ]; then
                echo -e "\033[31m✗ Proxy has been turned OFF.\033[0m"
            fi
            ;;
        status|*)
            if [ -n "$http_proxy" ] || [ -n "$https_proxy" ]; then
                echo "Proxy is currently ON."
                [ -n "$http_proxy" ] && echo "  http_proxy  = $http_proxy"
                [ -n "$https_proxy" ] && echo "  https_proxy = $https_proxy"
            else
                echo "Proxy is currently OFF."
            fi
            echo "Usage: proxy [on|off|status]"
            ;;
    esac
}

# --- 修改此处的调用方式 ---
# 以静默模式 (silent) 自动开启代理，这样就不会有任何输出
proxy on silent

```

