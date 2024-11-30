import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import shell from 'shelljs';
import { PathValidator } from '../security/path-validator.js';
import { InteractiveShellManager } from './interactive-shell.js';
import { isInteractiveCommand, analyzeCommand } from '../utils/command-detector.js';

export function registerShellTools(server: Server, rootDir: string) {
  const validator = new PathValidator(rootDir);
  const interactiveManager = new InteractiveShellManager(validator);

  // 註冊互動式 shell 工具
  interactiveManager.registerTools(server);

  // 命令互動性檢查 API
  server.setToolHandler({
    name: 'checkCommandInteractive',
    description: '檢查命令是否為互動式',
    parameters: {
      command: {
        type: 'string',
        description: '要檢查的命令'
      }
    }
  }, async (params) => {
    const analysis = analyzeCommand(params.command);
    return {
      type: 'application/json',
      text: JSON.stringify(analysis)
    };
  });

  // Shell 命令執行 API
  server.setToolHandler({
    name: 'shell',
    description: '執行 Shell 命令',
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
      },
      forceInteractive: {
        type: 'boolean',
        description: '強制使用互動模式',
        optional: true
      }
    }
  }, async (params) => {
    try {
      const needsInteractive = params.forceInteractive || 
        isInteractiveCommand(params.command);

      if (needsInteractive) {
        // 創建互動式會話
        const sessionResult = await server.request({
          method: 'tools/invoke',
          params: {
            name: 'createInteractiveSession',
            parameters: {
              cwd: params.cwd,
              env: params.env,
              shell: params.shell  // 傳入指定的 shell
            }
          }
        });

        // 發送命令
        const result = await server.request({
          method: 'tools/invoke',
          params: {
            name: 'writeToSession',
            parameters: {
              sessionId: sessionResult.text,
              input: params.command
            }
          }
        });

        // 結束會話
        await server.request({
          method: 'tools/invoke',
          params: {
            name: 'terminateSession',
            parameters: {
              sessionId: sessionResult.text
            }
          }
        });

        return result;
      } else {
        // 一般命令執行
        const safeCwd = validator.validateWorkingDirectory(params.cwd);
        
        const options: shell.ExecOptions = {
          cwd: safeCwd,
          silent: true
        };

        if (params.env) {
          options.env = { ...process.env, ...params.env };
        }

        if (params.shell) {
          options.shell = params.shell;
        }

        const result = shell.exec(params.command, options);

        if (result.code !== 0) {
          throw new Error(result.stderr || result.stdout);
        }

        return {
          type: 'text/plain',
          text: result.stdout
        };
      }
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error(`命令執行失敗: ${error}`);
    }
  });
}
