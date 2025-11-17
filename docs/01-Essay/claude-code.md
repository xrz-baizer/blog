# Claude Code Best Practice

## Subscription

申请海外信用卡绑定Google Pay支付

- 或者使用 Claude Code + GLM 方案：https://docs.bigmodel.cn/cn/coding-plan/tool/claude

## Commands

> Official documentation: https://docs.anthropic.com/en/docs/claude-code/overview

- `# xxx` 实时写入Memory
- `! xxx` 执行本地bash命令
- `claude -p 'question'` 单次咨询claude

---

- `ctrl + j` 输入框换行
- `shift + tab`切换输入模式

## Specific

- 从0到1开始新项目（0～1）：https://github.com/github/spec-kit
- 在现有的模块在增加功能（1～N）：http://github.com/Fission-AI/OpenSpec
- 生成前端UI页面：https://stitch.withgoogle.com/?pli=1

### Spec kit

```sh
# 初始化项目
specify init [forest-focus] --ai claude


# 进入项目
cd forest-focus

# 1. 铁律
/constitution Keep the iOS Forest-style focus app radically simple and offline-first.
Enforce test-first development, 60fps animations, <2s cold start, and VoiceOver/Dynamic Type support.

# 2. 规范
/specify Build a Forest-style Pomodoro app for iOS: start a 25-minute session to "plant"
a tree that grows through 5 stages; cancel/quit kills the tree; completion saves it to a
personal forest. Show countdown, pause/resume, local notification, and background-accurate timing.
Store completed/abandoned sessions locally; show a forest grid and stats (total trees, total focus
time, today's count, daily streak). Out of scope: custom durations, species, sync, sharing, watch, widgets.

# 3. 澄清
/clarify

# 4. 计划
/plan Use SwiftUI + SwiftData on iOS 17+. Timer via Combine; local notifications via
UNUserNotificationCenter; smooth 60fps growth animations; no third-party deps.
Use XCTest/XCUITest; keep memory ~<50MB during active sessions.

# 5. 任务
/tasks

# 6. 分析
/analyze

# 7. 实现
/implement
```

## Prompt

> 主流AI系统提示词参考：https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools

- **思考强度：**`think` < `think hard` < `think harder` < `ultrathink`
- **上下文压缩：**`我需要总结当前所有工作内容，后续将由其他开发者接手继续开发`
- **修复问题：**`请分析此Bug的根本原因，并制定修复方案`
- **前端界面提示器：**`请你严格遵守苹果的设计规范和交互规范。帮我把这个页面写出来。`

### Develop Prompt

```
Add [a feature] to [a specific location].
Add input validation to the user registration form in the `user.js` file.
Add a function to recalculate the Supplier Assessment in the supplier module.
Add an import function to the supplier module.
Implement a button component that supports enabling and disabling automatic playback.
Implement a button component that supports switching themes.
Refactor this function to make it more [readable / efficient].
Refactor this code to make it better.
Convert this configuration from YAML to JSON.

Show me all the changes that I have made today.
Commit my changes with a descriptive message.
Commit my changes with the message "fix xxx".
Review my change and suggest improvements.

Summarize the changes I have made today.
Summarize the changes I have made today and generate a document.
Generate documentation in md format for this function.
Place it in the [current / `xxx/`] directory.

There is a bug where [describe the bug scenario]. Fix it.
There is a bug where the page crashes when the API returns null.
Suggest a few ways to fix [a specific code issue].
Error message in the [console / terminal]: xxx

Write unit tests for the recalculate function.
Generate test cases for the order process with an empty cart.

What does [this project / this file / this module] do?
What technologies does this project use?
Explain the structure of the project.
How is [a specific feature] implemented in this project?
```

### 代码生成模板

```
角色：{技术栈}专家
任务：实现{具体功能}
要求：
- 代码风格：{编码规范}
- 包含错误处理
- 添加必要注释
- 提供使用示例
- 考虑{特定约束}

输出格式：
1. 实现思路（简述）
2. 核心代码
3. 测试用例
4. 注意事项
```

###  问题诊断模板

```
系统问题诊断：

现象：｛具体表现｝
环境：｛技术栈和版本｝
重现步骤：｛详细步骤｝
错误日志：｛相关日志｝

请按以下流程分析：
1. 问题定位（可能原因排序） 
2. 诊断步骤（如何验证） 
3. 解決方案（临时＋永久） 
4. 预防措施（避免再次发生）
```

###  技术调研模板

```
技术调研：｛具体技术/框架｝

**基本信息**：
- 官方文档质量：★★★★★
- 社区活跃度：GitHub stars/issues/PR
- 更新频率：最近版本发布时间

**技术评估**：
- 学习曲线：［平缓/陡峭] + 理由
- 性能基准：与主流方案对比数据
- 生态完整度：周边工具/插件丰富程度

**业务适配**：
- 团队技能匹配度：【高/中/低］
- 项目时间线影响：［加速/无影响/延期］
- 长期维护成本：［高/中/低］

**决策建议**：［采用/观望/放弃］+理由
```



## Claude.md

`~/.claude/CLAUDE.md`

```md
# Preferences
- Language Style: Reply in English. Use clear, direct, and professional language. Avoid jargon where simpler terms suffice.
- Do not test the code by executing the relevant run command
```

## MCP

 https://mcpcat.io/guides/best-mcp-servers-for-claude-code/?utm_source=chatgpt.com#the-quick-answer

##  Plugins

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

### Gemini Balance

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

## Gemini CLI

### Login with Google

> 多账号可通过 `/chat` 切换会话记录

**Google个人账号请求限制：**

- **Free tier**: 60 requests/min and 1,000 requests/day

- 每分钟最高 **60 请求**
- 每天最多 **1 000 请求**

某些账号能需要配置项目ID：

```sh
echo 'export GOOGLE_CLOUD_PROJECT="test"' >> ~/.zshrc
```

### Use Gemini API Key

- **Free tier**: 100 requests/day with Gemini 2.5 Pro

```sh
echo 'export GEMINI_MODEL=gemini-2.5-pro' >> ~/.zshrc
echo 'export GOOGLE_GEMINI_BASE_URL="http://xxx.xxx.xxx.xxx:8000"' >> ~/.zshrc
echo 'export GEMINI_API_KEY="xxx"' >> ~/.zshrc

source ~/.zshrc
```

