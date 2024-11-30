import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerShellTools } from './tools/shell.js';
import { registerFileOperations } from './tools/file-operations.js';
import { registerFileSearch } from './tools/file-search.js';
import { registerSystemInfoTools } from './tools/system-info.js';

export async function startServer() {
  try {
    // 創建伺服器實例
    const server = new Server({
      name: 'mcp-shell',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });

    // 取得根目錄
    const rootDir = process.env.MCP_SHELL_ROOT || process.cwd();

    // 註冊所有工具
    registerSystemInfoTools(server);
    registerShellTools(server, rootDir);
    registerFileOperations(server, rootDir);
    registerFileSearch(server, rootDir);

    // 創建 stdio 傳輸層
    const transport = new StdioServerTransport();

    // 啟動伺服器
    await server.connect(transport);

    console.error('MCP Shell Server started');
  } catch (error) {
    console.error('Failed to start MCP Shell Server:', error);
    process.exit(1);
  }
}

// 當直接執行時啟動伺服器
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
