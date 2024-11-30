import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import shell from 'shelljs';
import { PathValidator } from '../security/path-validator.js';

export function registerShellTools(server: Server, rootDir: string) {
  const validator = new PathValidator(rootDir);

  server.setToolHandler({
    name: 'shell',
    description: '在指定的工作目錄中執行 Shell 命令',
    parameters: {
      command: {
        type: 'string',
        description: '要執行的命令'
      },
      cwd: {
        type: 'string',
        description: '工作目錄',
        optional: false
      },
      env: {
        type: 'object',
        description: '環境變數',
        optional: true
      },
      shell: {
        type: 'string',
        description: '指定使用的 shell',
        optional: true
      }
    }
  }, async (params) => {
    try {
      // 驗證工作目錄
      const safeCwd = validator.validateWorkingDirectory(params.cwd);
      
      // 準備執行選項
      const options: shell.ExecOptions = {
        cwd: safeCwd,
        silent: true
      };

      // 如果指定 shell，添加到選項
      if (params.shell) {
        options.shell = params.shell;
      }

      // 添加環境變數
      if (params.env) {
        options.env = { ...process.env, ...params.env };
      }

      // 執行命令
      const result = shell.exec(params.command, options);

      if (result.code !== 0) {
        throw new Error(result.stderr || result.stdout);
      }

      return {
        type: 'text/plain',
        text: result.stdout
      };
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error(`命令執行失敗: ${error}`);
    }
  });
}
