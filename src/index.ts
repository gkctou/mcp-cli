import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const server = new Server({
  name: "mcp-shell",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {}
  }
});

// 定義執行 shell 命令的工具
server.setToolHandler({
  name: "shell",
  description: "執行 shell 命令",
  parameters: {
    command: {
      type: "string",
      description: "要執行的 shell 命令"
    }
  }
}, async (params) => {
  try {
    const { stdout, stderr } = await execAsync(params.command);
    return {
      type: "text/plain",
      text: stdout || stderr
    };
  } catch (error) {
    throw new Error(`執行命令失敗：${error.message}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
