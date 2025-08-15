# Claude Code User Manual

## Commands

> Official documentation: https://docs.anthropic.com/en/docs/claude-code/overview

- `# xxx` 实时写入Memory
- `! xxx` 执行本地bash命令
- `claude -p 'question'` 单次咨询claude

---

- `ctrl + j` 输入框换行
- `shift + tab`切换输入模式

##  Plugins

- [集成 IntelliJ IDEA](https://docs.anthropic.com/en/docs/claude-code/ide-integrations#jet-brains)

- 代码回退支持：https://github.com/RonitSachdev/ccundo
  - Claude Code自带的`/resume`只能恢复之前的会话记录，不能回退代码。
  - 使用方法：结束Claude Code会话后，执行`ccundo list`（只能回退上一次会话）

- MCP
  - [Context7：帮助AI查找最新代码文档（让Claude Code能获取超过训练数据截止日期的数据）](https://github.com/upstash/context7)

- Claude Code UI：
  - https://github.com/getAsterisk/claudia
  - https://github.com/xuzhenpeng263/claudia-globa

### Claude Code Router

**支持Claude Code接入三方API，如Gemini、Qwen Coder、ChatGPT**

- https://github.com/musistudio/claude-code-router

```json
// Gemini配置参考：cat  ~/.claude-code-router/config.json
{
  "Providers": [
    {
      "name": "gemini",
      "api_base_url": "http://xxx.xxx.xxx.xx:8000/gemini/v1beta/models/models",
      "api_key": "xxx-xxx-XRZ",
      "models": ["gemini-2.5-flash", "gemini-2.5-pro"],
      "transformer": {
        "use": ["gemini"]
      }
    }
  ],
  "Router": {
    "default": "gemini,gemini-2.5-pro",
    "think": "gemini,gemini-2.5-pro",
    "webSearch": "gemini,gemini-2.5-flash"
  }
}
```

### Claude Balance

**Gemini2.5 Pro Key 轮询**

- https://github.com/snailyp/gemini-balance

配置文件`.env`参考：

```txt
MYSQL_HOST=xxx.xx.xx.xx
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=xxxxxxxx
MYSQL_DATABASE=custom_test

API_KEYS=["key1","key2"]
ALLOWED_TOKENS=["xxxxxxxx"]
AUTH_TOKEN=xxxxxxxx
```

> AUTH_TOKEN是登录密码（http://localhost:8000）
>
> ALLOWED_TOKENS是API KEY密码

安装命令参考：

```sh
docker run -d -p 8000:8000 --name gemini-balance \
-v ./data:/app/data \
--env-file .env \
-e TZ=Asia/Shanghai \
ghcr.io/snailyp/gemini-balance:latest
```

