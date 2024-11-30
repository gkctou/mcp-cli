import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { PathValidator } from '../security/path-validator.js';
import shell from 'shelljs';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';

export function registerFileSystemTools(server: Server, rootDir: string) {
  const validator = new PathValidator(rootDir);

  // 檢查檔案/目錄是否存在
  server.setToolHandler({
    name: 'exists',
    description: '檢查路徑是否存在',
    parameters: {
      path: {
        type: 'string',
        description: '要檢查的路徑'
      },
      cwd: {
        type: 'string',
        description: '當前工作目錄',
        optional: true
      }
    }
  }, async (params) => {
    const safePath = validator.validateWorkingDirectory(
      params.cwd ? join(params.cwd, params.path) : params.path
    );
    return {
      type: 'text/plain',
      text: await fs.access(safePath).then(() => 'true').catch(() => 'false')
    };
  });

  // 列出目錄內容
  server.setToolHandler({
    name: 'list',
    description: '列出目錄內容',
    parameters: {
      path: {
        type: 'string',
        description: '目錄路徑'
      },
      cwd: {
        type: 'string',
        description: '當前工作目錄',
        optional: true
      }
    }
  }, async (params) => {
    const safePath = validator.validateWorkingDirectory(
      params.cwd ? join(params.cwd, params.path) : params.path
    );
    const files = await fs.readdir(safePath, { withFileTypes: true });
    const fileList = await Promise.all(
      files.map(async (file) => {
        const fullPath = join(safePath, file.name);
        const stats = await fs.stat(fullPath);
        return {
          name: file.name,
          type: file.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          modifiedTime: stats.mtime
        };
      })
    );
    return {
      type: 'application/json',
      text: JSON.stringify(fileList)
    };
  });

  // 讀取檔案
  server.setToolHandler({
    name: 'read',
    description: '讀取檔案內容',
    parameters: {
      path: {
        type: 'string',
        description: '檔案路徑'
      },
      cwd: {
        type: 'string',
        description: '當前工作目錄',
        optional: true
      }
    }
  }, async (params) => {
    const safePath = validator.validateWorkingDirectory(
      params.cwd ? join(params.cwd, params.path) : params.path
    );
    const content = await fs.readFile(safePath, 'utf-8');
    return {
      type: 'text/plain',
      text: content
    };
  });

  // 寫入檔案
  server.setToolHandler({
    name: 'write',
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
      cwd: {
        type: 'string',
        description: '當前工作目錄',
        optional: true
      }
    }
  }, async (params) => {
    const safePath = validator.validateWorkingDirectory(
      params.cwd ? join(params.cwd, params.path) : params.path
    );
    await fs.mkdir(dirname(safePath), { recursive: true });
    await fs.writeFile(safePath, params.content);
    return {
      type: 'text/plain',
      text: '檔案寫入成功'
    };
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
      cwd: {
        type: 'string',
        description: '當前工作目錄',
        optional: true
      }
    }
  }, async (params) => {
    const safeSource = validator.validateWorkingDirectory(
      params.cwd ? join(params.cwd, params.source) : params.source
    );
    const safeDest = validator.validateWorkingDirectory(
      params.cwd ? join(params.cwd, params.destination) : params.destination
    );
    
    shell.cp('-R', safeSource, safeDest);
    return {
      type: 'text/plain',
      text: '複製成功'
    };
  });

  // 移動檔案/目錄
  server.setToolHandler({
    name: 'move',
    description: '移動檔案或目錄',
    parameters: {
      source: {
        type: 'string',
        description: '來源路徑'
      },
      destination: {
        type: 'string',
        description: '目標路徑'
      },
      cwd: {
        type: 'string',
        description: '當前工作目錄',
        optional: true
      }
    }
  }, async (params) => {
    const safeSource = validator.validateWorkingDirectory(
      params.cwd ? join(params.cwd, params.source) : params.source
    );
    const safeDest = validator.validateWorkingDirectory(
      params.cwd ? join(params.cwd, params.destination) : params.destination
    );
    
    shell.mv(safeSource, safeDest);
    return {
      type: 'text/plain',
      text: '移動成功'
    };
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
      cwd: {
        type: 'string',
        description: '當前工作目錄',
        optional: true
      },
      force: {
        type: 'boolean',
        description: '是否強制刪除',
        optional: true
      }
    }
  }, async (params) => {
    const safePath = validator.validateWorkingDirectory(
      params.cwd ? join(params.cwd, params.path) : params.path
    );
    
    if (params.force) {
      shell.rm('-rf', safePath);
    } else {
      shell.rm(safePath);
    }
    
    return {
      type: 'text/plain',
      text: '刪除成功'
    };
  });

  // 創建目錄
  server.setToolHandler({
    name: 'mkdir',
    description: '創建目錄',
    parameters: {
      path: {
        type: 'string',
        description: '要創建的目錄路徑'
      },
      cwd: {
        type: 'string',
        description: '當前工作目錄',
        optional: true
      }
    }
  }, async (params) => {
    const safePath = validator.validateWorkingDirectory(
      params.cwd ? join(params.cwd, params.path) : params.path
    );
    
    await fs.mkdir(safePath, { recursive: true });
    return {
      type: 'text/plain',
      text: '目錄創建成功'
    };
  });
}
