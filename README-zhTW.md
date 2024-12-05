# MCP CLI Server

[![NPM Version](https://img.shields.io/npm/v/mcp-shell.svg)](https://www.npmjs.com/package/mcp-shell)
[![License](https://img.shields.io/npm/l/mcp-shell.svg)](https://github.com/gkctou/mcp-shell/blob/main/LICENSE)

一個基於 Model Context Protocol (MCP) 的 Node.js 伺服器實作，提供安全的檔案系統操作和命令執行功能。此伺服器實作了完整的路徑白名單驗證機制，在每一次檔案操作或命令執行前，都會檢查工作路徑或目標路徑是否在規定的白名單中，確保不會意外損壞系統中的其他資料。

[English](./README.md) | [繁體中文](./README-zhTW.md) | [日本語](./README-jaJP.md) | [한국어](./README-koKR.md) | [Español](./README-esES.md) | [Français](./README-frFR.md) | [Deutsch](./README-deDE.md) | [Italiano](./README-itIT.md)

### 在 Claude Desktop 中使用

在你的 `claude_desktop_config.json` 中加入：

```json
{
  "mcpServers": {
    "cli": {
      "command": "npx",
      "args": ["-y", "mcp-cli", "/path/to/allowed/directory", "/path/to/allowed/directory2", ...]
    }
  }
}
```

## 功能特色

### 路徑安全
- 嚴格的路徑白名單機制
- 每次操作前都進行路徑驗證
- 確保所有操作都在允許的目錄範圍內
- 支援相對路徑和絕對路徑
- 防止目錄遍歷攻擊
- 保護系統中的其他資料不被意外修改

### 檔案操作
- 讀取檔案內容（需通過路徑白名單驗證）
- 寫入檔案（需通過路徑白名單驗證）
- 複製檔案（源路徑和目標路徑都需通過白名單驗證）
- 移動檔案（源路徑和目標路徑都需通過白名單驗證）
- 刪除檔案（需通過路徑白名單驗證）

### 目錄操作
- 建立目錄（需通過路徑白名單驗證）
- 刪除目錄（需通過路徑白名單驗證）
- 列出目錄內容（需通過路徑白名單驗證）

### 命令執行
- 安全的 shell 命令執行
- 工作目錄必須在白名單範圍內
- 支援環境變數設定
- 使用 cross-env 確保跨平台兼容性

### 系統資訊
- Node.js 執行環境資訊
- Python 版本資訊
- 作業系統詳細資訊
- Shell 環境資訊
- CPU 和記憶體使用狀況

## 可用工具

伺服器提供以下工具：

- validatePath：驗證路徑是否在允許的白名單目錄範圍內
- executeCommand：在白名單目錄中執行 shell 命令
- readFile：讀取白名單目錄中的檔案內容
- writeFile：寫入檔案到白名單目錄
- copyFile：在白名單目錄範圍內複製檔案
- moveFile：在白名單目錄範圍內移動檔案
- deleteFile：刪除白名單目錄中的檔案
- createDirectory：在白名單目錄中建立新目錄
- removeDirectory：刪除白名單目錄中的目錄
- listDirectory：列出白名單目錄中的內容
- getSystemInfo：獲取系統資訊

## 安全特性

- 路徑白名單機制
  - 在啟動時指定允許操作的目錄白名單
  - 所有檔案和目錄操作都需要通過白名單驗證
  - 防止對系統重要檔案的意外修改
  - 限制操作範圍在安全的目錄內
- 命令執行安全
  - 工作目錄限制在白名單範圍內
  - 命令執行在受控環境中進行
- 完整的錯誤處理機制

## 錯誤處理

伺服器包含全面的錯誤處理：

- 路徑白名單驗證錯誤
- 檔案不存在錯誤
- 目錄不存在錯誤
- 命令執行錯誤
- 系統資訊獲取錯誤

## 實作細節

伺服器使用以下技術構建：

- Model Context Protocol SDK
- shelljs 用於檔案系統操作
- cross-env 用於跨平台環境變數支援
- Zod 用於資料驗證
