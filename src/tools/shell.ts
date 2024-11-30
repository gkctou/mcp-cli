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
      }
    }
  }, async (params) => {
    const isValid = validator.isPathSafe(params.path);
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
      }
    }
  }, async (params) => {
    try {
      const normalizedPath = validator.getSafePath(params.path);
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
      }
    }
  }, async (params) => {
    // 此處不再需要進行路徑驗證
    // 因為 AI 應該已經使用 validatePath 或 normalizePath 進行驗證
    try {
      const { stdout, stderr } = await execAsync(params.command);
      return {
        type: 'text/plain',
        text: stdout || stderr
      };
    } catch (error) {
      throw new Error(`命令執行失敗: ${error.message}`);
    }
  });
}
