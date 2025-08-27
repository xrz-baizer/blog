# Claude Code User Manual

## Subscription

tbd

## Commands

> Official documentation: https://docs.anthropic.com/en/docs/claude-code/overview

- `# xxx` 实时写入Memory
- `! xxx` 执行本地bash命令
- `claude -p 'question'` 单次咨询claude

---

- `ctrl + j` 输入框换行
- `shift + tab`切换输入模式

## Prompt

- **思考强度：**`think` < `think hard` < `think harder` < `ultrathink`
- **上下文压缩：**`我需要总结当前所有工作内容，后续将由其他开发者接手继续开发`
- **修复问题：**`请分析此Bug的根本原因，并制定修复方案`
- **前端界面提示器：**`请你严格遵守苹果的设计规范和交互规范。帮我把这个页面写出来。`

### 其它参考提示词

-  https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/blob/main/Claude%20Code/claude-code-system-prompt.txt

## Claude.md

`~/.claude/CLAUDE.md`

```md
# Preferences
- Language Style: Reply in English. Use clear, direct, and professional language. Avoid jargon where simpler terms suffice.
- Do not test the code by executing the relevant run command
```

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



### Qwen3-Code

[阿里云百炼API官方文档：如何接入Claude Code](https://bailian.console.aliyun.com/?spm=5176.29619931.J__Z58Z6CX7MY__Ll8p1ZOR.1.74cd521cCg9KEb&tab=doc#/doc/?type=model&url=2949529)

**设置环境变量：**

- 获取key：https://bailian.console.aliyun.com/?tab=model#/api-key

```sh
echo 'export ANTHROPIC_BASE_URL="https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy"' >> ~/.zshrc
echo 'export ANTHROPIC_AUTH_TOKEN="YOUR_DASHSCOPE_API_KEY"' >> ~/.zshrc
```
```bash
source ~/.zshrc
```

```bash
echo $ANTHROPIC_BASE_URL
echo $ANTHROPIC_AUTH_TOKEN
```
