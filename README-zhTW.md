# MCP Shell Server

[![NPM Version](https://img.shields.io/npm/v/mcp-shell.svg)](https://www.npmjs.com/package/mcp-shell)
[![License](https://img.shields.io/npm/l/mcp-shell.svg)](https://github.com/gkctou/mcp-shell/blob/main/LICENSE)

一個提供安全的 Command line interface (CLI) 和檔案系統操作的 Model Context Protocol (MCP) 伺服器實作。

[English](./README.md) | [繁體中文](./README-zhTW.md) | [日本語](./README-jaJP.md)

## 概述

MCP CLI Server 使 AI 助手能夠：
- 安全地執行 CLI 命令
- 管理檔案和目錄
- 搜尋檔案名稱和內容
- 存取系統資訊

所有操作都受到白名單系統的限制，預設為使用者的 Documents 目錄。

## 功能特色

### Shell 操作
- 在指定的 Shell 中執行命令（cmd、powershell、bash、zsh 等）
- 支援互動式命令
- 環境變數管理
- 工作目錄驗證
- 命令執行進度通知
- 長時間運行操作的狀態回報

### 檔案操作
- 基本操作（讀取、寫入、複製、移動、刪除）
- 目錄列表和建立
- 檔案/目錄統計資訊
- 檔案名稱和內容搜尋
- 遞迴操作安全檢查
- 支援二進制和文字檔案處理
- 檔案變更即時通知
- 分頁式資源存取

### 安全性
- 目錄白名單系統
- 安全路徑驗證
- 遞迴操作保護機制
- 平台特定路徑處理
- 資源存取權限控制

### 系統資訊
- 平台詳細資訊
- 環境變數
- 可用的 Shell
- Node.js 和 Python 版本
- 系統資源使用狀況

## 使用方法

### 在 Claude Desktop 中使用

在您的 `claude_desktop_config.json` 中加入：

```json
{
  "mcpServers": {
    "shell": {
      "command": "npx",
      "args": ["-y", "mcp-shell"],
      "env": {
        "MCP_SHELL_ROOT": "/path/to/safe/directory"
      }
    }
  }
}
```
