import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PathValidator } from '../security/path-validator.js';

const execAsync = promisify(exec);

export function registerShellTools(server: Server, rootDir: string) {
  const validator = new PathValidator(rootDir);

  // 工作目錄驗證 API
  server.setToolHandler({
    name: 'validateWorkingDirectory',
    description: '驗證工作目錄是否在安全範圍內',
    parameters: {
      path: {
        type: 'string',
        description: '要驗證的工作目錄路徑'
      }
    }
  }, async (params) => {
    try {
      const safeCwd = validator.validateWorkingDirectory(params.path);
      return {
        type: 'text/plain',
        text: safeCwd
      };
    } catch (error) {
      throw error;
    }
  });

  // Shell 命令執行 API
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
        optional: false  // 變為必需參數
      }
    }
  }, async (params) => {
    try {
      // 驗證工作目錄
      const safeCwd = validator.validateWorkingDirectory(params.cwd);

      // 執行命令
      const { stdout, stderr } = await execAsync(params.command, {
        cwd: safeCwd
      });

      return {
        type: 'text/plain',
        text: stdout || stderr
      };
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error(`命令執行失敗: ${error}`);
    }
  });
}
