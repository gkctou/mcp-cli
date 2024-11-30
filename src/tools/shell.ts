import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PathValidator } from '../security/path-validator.js';

const execAsync = promisify(exec);

export function registerShellTools(server: Server, rootDir: string) {
  const validator = new PathValidator(rootDir);

  // 路徑驗證 API
  server.setToolHandler({
    name: 'validatePath',
    description: '驗證路徑是否安全可用',
    parameters: {
      path: {
        type: 'string',
        description: '要驗證的路徑'
      },
      cwd: {
        type: 'string',
        description: '當前工作目錄',
        optional: true
      }
    }
  }, async (params) => {
    const isValid = validator.isPathSafe(params.path, params.cwd);
    return {
      type: 'text/plain',
      text: isValid ? 'valid' : 'invalid'
    };
  });

  // 取得標準化路徑 API
  server.setToolHandler({
    name: 'normalizePath',
    description: '取得標準化且安全的路徑',
    parameters: {
      path: {
        type: 'string',
        description: '要標準化的路徑'
      },
      cwd: {
        type: 'string',
        description: '當前工作目錄',
        optional: true
      }
    }
  }, async (params) => {
    try {
      const normalizedPath = validator.getSafePath(params.path, params.cwd);
      return {
        type: 'text/plain',
        text: normalizedPath
      };
    } catch (error) {
      throw new Error(`不安全的路徑: ${params.path}`);
    }
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
        description: '當前工作目錄',
        optional: true
      }
    }
  }, async (params) => {
    try {
      // 如果提供了 cwd，先驗證其安全性
      let workingDir = undefined;
      if (params.cwd) {
        if (!validator.isPathSafe(params.cwd)) {
          throw new Error(`不安全的工作目錄: ${params.cwd}`);
        }
        workingDir = validator.getSafePath(params.cwd);
      }

      const { stdout, stderr } = await execAsync(params.command, {
        cwd: workingDir
      });

      return {
        type: 'text/plain',
        text: stdout || stderr
      };
    } catch (error) {
      throw new Error(`命令執行失敗: ${error.message}`);
    }
  });
}
