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

- 支持Claude Code接入三方API，如Gemini、Qwen Coder、ChatGPT：https://github.com/musistudio/claude-code-router
- Gemini2.5 Pro Key 轮询：https://github.com/snailyp/gemini-balance
- 集成 IntelliJ IDEA：https://docs.anthropic.com/en/docs/claude-code/ide-integrations#jet-brains
- 回退代码变更：https://github.com/RonitSachdev/ccundo
- MCP
  - 让Claude Code超过训练数据有截止日期，获取最新的软件库文档信息：https://github.com/upstash/context7
- Claude Code UI：
  - https://github.com/getAsterisk/claudia
  - https://github.com/xuzhenpeng263/claudia-globa