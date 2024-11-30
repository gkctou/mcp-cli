import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import shell from 'shelljs';
import { join, basename, dirname } from 'path';
import { PathValidator } from '../security/path-validator.js';

export function registerFileOperations(server: Server, rootDir: string) {
  const validator = new PathValidator(rootDir);

  // 列出目錄內容
  server.setToolHandler({
    name: 'listDirectory',
    description: '列出目錄內容',
    parameters: {
      path: {
        type: 'string',
        description: '目錄路徑'
      }
    }
  }, async (params) => {
    try {
      const safePath = validator.validateWorkingDirectory(params.path);
      const files = shell.ls('-lA', safePath);
      
      return {
        type: 'application/json',
        text: JSON.stringify(files.map(file => ({
          name: file.name,
          size: file.size,
          isDirectory: file.isDirectory(),
          isFile: file.isFile(),
          isSymlink: file.isSymbolicLink(),
          mode: file.mode,
          mtime: file.mtime
        })))
      };
    } catch (error) {
      throw error;
    }
  });

  // 創建目錄
  server.setToolHandler({
    name: 'createDirectory',
    description: '創建目錄',
    parameters: {
      path: {
        type: 'string',
        description: '目錄路徑'
      }
    }
  }, async (params) => {
    try {
      const safePath = validator.validateWorkingDirectory(params.path);
      const result = shell.mkdir('-p', safePath);
      
      if (result.code !== 0) {
        throw new Error(`創建目錄失敗: ${result.stderr}`);
      }

      return {
        type: 'text/plain',
        text: `目錄創建成功: ${safePath}`
      };
    } catch (error) {
      throw error;
    }
  });

  // 讀取檔案
  server.setToolHandler({
    name: 'readFile',
    description: '讀取檔案內容',
    parameters: {
      path: {
        type: 'string',
        description: '檔案路徑'
      }
    }
  }, async (params) => {
    try {
      const safePath = validator.validateWorkingDirectory(params.path);
      const content = shell.cat(safePath);
      
      if (shell.error()) {
        throw new Error(`讀取檔案失敗: ${shell.error()}`);
      }

      return {
        type: 'text/plain',
        text: content
      };
    } catch (error) {
      throw error;
    }
  });

  // 寫入檔案
  server.setToolHandler({
    name: 'writeFile',
    description: '寫入檔案內容',
    parameters: {
      path: {
        type: 'string',
        description: '檔案路徑'
      },
      content: {
        type: 'string',
        description: '要寫入的內容'
      },
      append: {
        type: 'boolean',
        description: '是否追加內容',
        optional: true
      }
    }
  }, async (params) => {
    try {
      const safePath = validator.validateWorkingDirectory(params.path);
      
      // 確保目標目錄存在
      shell.mkdir('-p', dirname(safePath));

      if (params.append) {
        shell.ShellString(params.content).toEnd(safePath);
      } else {
        shell.ShellString(params.content).to(safePath);
      }
      
      if (shell.error()) {
        throw new Error(`寫入檔案失敗: ${shell.error()}`);
      }

      return {
        type: 'text/plain',
        text: `檔案${params.append ? '追加' : '寫入'}成功: ${safePath}`
      };
    } catch (error) {
      throw error;
    }
  });

  // 複製檔案/目錄
  server.setToolHandler({
    name: 'copy',
    description: '複製檔案或目錄',
    parameters: {
      source: {
        type: 'string',
        description: '來源路徑'
      },
      destination: {
        type: 'string',
        description: '目標路徑'
      },
      recursive: {
        type: 'boolean',
        description: '是否遍歷目錄',
        optional: true
      }
    }
  }, async (params) => {
    try {
      const safeSource = validator.validateWorkingDirectory(params.source);
      const safeDestination = validator.validateWorkingDirectory(params.destination);

      const options = params.recursive ? '-R' : '';
      const result = shell.cp(options, safeSource, safeDestination);
      
      if (result.code !== 0) {
        throw new Error(`複製失敗: ${result.stderr}`);
      }

      return {
        type: 'text/plain',
        text: `複製成功: ${safeSource} -> ${safeDestination}`
      };
    } catch (error) {
      throw error;
    }
  });

  // 移動/重命名檔案或目錄
  server.setToolHandler({
    name: 'move',
    description: '移動或重命名檔案/目錄',
    parameters: {
      source: {
        type: 'string',
        description: '來源路徑'
      },
      destination: {
        type: 'string',
        description: '目標路徑'
      }
    }
  }, async (params) => {
    try {
      const safeSource = validator.validateWorkingDirectory(params.source);
      const safeDestination = validator.validateWorkingDirectory(params.destination);

      const result = shell.mv(safeSource, safeDestination);
      
      if (result.code !== 0) {
        throw new Error(`移動失敗: ${result.stderr}`);
      }

      return {
        type: 'text/plain',
        text: `移動成功: ${safeSource} -> ${safeDestination}`
      };
    } catch (error) {
      throw error;
    }
  });

  // 刪除檔案/目錄
  server.setToolHandler({
    name: 'remove',
    description: '刪除檔案或目錄',
    parameters: {
      path: {
        type: 'string',
        description: '要刪除的路徑'
      },
      recursive: {
        type: 'boolean',
        description: '是否遍歷刪除目錄',
        optional: true
      },
      force: {
        type: 'boolean',
        description: '是否強制刪除',
        optional: true
      }
    }
  }, async (params) => {
    try {
      const safePath = validator.validateWorkingDirectory(params.path);
      
      let options = '';
      if (params.recursive) options += 'r';
      if (params.force) options += 'f';
      
      const result = shell.rm(`-${options}`, safePath);
      
      if (result.code !== 0) {
        throw new Error(`刪除失敗: ${result.stderr}`);
      }

      return {
        type: 'text/plain',
        text: `刪除成功: ${safePath}`
      };
    } catch (error) {
      throw error;
    }
  });

  // 檢查檔案/目錄資訊
  server.setToolHandler({
    name: 'stat',
    description: '取得檔案或目錄的資訊',
    parameters: {
      path: {
        type: 'string',
        description: '要檢查的路徑'
      }
    }
  }, async (params) => {
    try {
      const safePath = validator.validateWorkingDirectory(params.path);
      const stats = shell.test('-e', safePath) ? shell.ls('-ld', safePath)[0] : null;

      if (!stats) {
        throw new Error(`檔案或目錄不存在: ${safePath}`);
      }

      return {
        type: 'application/json',
        text: JSON.stringify({
          name: basename(safePath),
          size: stats.size,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
          isSymlink: stats.isSymbolicLink(),
          mode: stats.mode,
          mtime: stats.mtime,
          exists: true
        })
      };
    } catch (error) {
      throw error;
    }
  });
}
