import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PathValidator } from '../security/path-validator.js';

const execAsync = promisify(exec);

export function registerShellTools(server: Server, rootDir: string) {
  const validator = new PathValidator(rootDir);

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
      }
    }
  }, async (params) => {
    try {
      // 1. 驗證工作目錄
      const safeCwd = validator.validateWorkingDirectory(params.cwd);

      // 2. 构建包含 cd 命令的完整指令
      // 使用 cd && 確保在正確的目錄下執行命令
      const fullCommand = `cd "${safeCwd}" && ${params.command}`;

      // 3. 執行完整命令
      const { stdout, stderr } = await execAsync(fullCommand, {
        // 不使用 cwd 選項，因為我們已經在命令中包含了 cd
        shell: true  // 確保可以執行 shell 命令
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
