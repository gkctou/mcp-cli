import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import shell from 'shelljs';
import crossEnv from 'cross-env';
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
      }
    }
  }, async (params) => {
    try {
      // 驗證工作目錄
      const safeCwd = validator.validateWorkingDirectory(params.cwd);

      // 準備環境變數字串
      let envString = '';
      if (params.env) {
        envString = Object.entries(params.env)
          .map(([key, value]) => `${key}=${value}`)
          .join(' ');
      }

      // 构建完整命令
      const cdCommand = `cd "${safeCwd}"`;
      const fullCommand = envString 
        ? `${cdCommand} && ${envString} ${params.command}`
        : `${cdCommand} && ${params.command}`;

      // 使用 cross-env-shell 執行命令
      const result = shell.exec(
        `cross-env-shell "${fullCommand.replace(/"/g, '\\"')}"`,
        { silent: true }
      );

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
