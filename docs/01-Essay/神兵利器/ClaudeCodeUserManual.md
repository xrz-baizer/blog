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

- [支持Claude Code接入三方API，如Gemini、Qwen Coder、ChatGPT](https://github.com/musistudio/claude-code-router)

  - ```json
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

- Gemini2.5 Pro Key 轮询：https://github.com/snailyp/gemini-balance

- [集成 IntelliJ IDEA](https://docs.anthropic.com/en/docs/claude-code/ide-integrations#jet-brains)

- 代码回退支持：https://github.com/RonitSachdev/ccundo
  - Claude Code自带的`/resume`只能恢复之前的会话记录，不能回退代码。
  - 使用方法：结束Claude Code会话后，执行`ccundo list`（只能回退上一次会话）

- MCP
  - [让Claude Code超过训练数据有截止日期，获取最新的软件库文档信息](https://github.com/upstash/context7)

- Claude Code UI：
  - https://github.com/getAsterisk/claudia
  - https://github.com/xuzhenpeng263/claudia-globa