import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import shell from 'shelljs';
import { join, extname } from 'path';
import { PathValidator } from '../security/path-validator.js';

// 文字檔副檔名清單
const TEXT_FILE_EXTENSIONS = new Set([
  '.txt', '.md', '.json', '.xml', '.csv', '.log',
  '.js', '.ts', '.jsx', '.tsx', '.html', '.css',
  '.yaml', '.yml', '.ini', '.conf', '.config',
  '.py', '.rb', '.php', '.java', '.c', '.cpp', '.h',
  '.sh', '.bash', '.zsh', '.fish',
  '.properties', '.env'
]);

// 檢查是否為文字檔
function isTextFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  if (TEXT_FILE_EXTENSIONS.has(ext)) return true;

  // 如果沒有副檔名，檢查檔案內容
  if (!ext) {
    try {
      // 使用 file 命令檢查檔案類型（如果有）
      const result = shell.exec(`file -b "${filePath}"`, { silent: true });
      return result.stdout.toLowerCase().includes('text');
    } catch {
      return false;
    }
  }

  return false;
}

export function registerFileSearch(server: Server, rootDir: string) {
  const validator = new PathValidator(rootDir);

  // 依檔名搜尋
  server.setToolHandler({
    name: 'searchByName',
    description: '依檔名搜尋檔案',
    parameters: {
      path: {
        type: 'string',
        description: '搜尋的起始目錄'
      },
      pattern: {
        type: 'string',
        description: '要搜尋的檔名模式（支援 glob 模式）'
      },
      recursive: {
        type: 'boolean',
        description: '是否搜尋子目錄',
        optional: true
      }
    }
  }, async (params) => {
    try {
      const safePath = validator.validateWorkingDirectory(params.path);

      // 準備搜尋模式
      let pattern = params.pattern;
      if (!pattern.includes('*')) {
        pattern = `*${pattern}*`; // 加入萬用字元來搜尋部分符合
      }

      // 执行搜尋
      const findOptions = params.recursive ? '-l' : '-d';
      const files = shell.find(findOptions, safePath)
        .filter(file => shell.test('-f', file)) // 只要檔案
        .filter(file => shell.test('-name', pattern, file)); // 模式匹配

      return {
        type: 'application/json',
        text: JSON.stringify(files.map(file => ({
          path: file,
          name: file.split('/').pop(),
          isDirectory: false
        })))
      };
    } catch (error) {
      throw error;
    }
  });

  // 依內容搜尋
  server.setToolHandler({
    name: 'searchByContent',
    description: '依內容搜尋文字檔案',
    parameters: {
      path: {
        type: 'string',
        description: '搜尋的起始目錄'
      },
      pattern: {
        type: 'string',
        description: '要搜尋的文字內容'
      },
      recursive: {
        type: 'boolean',
        description: '是否搜尋子目錄',
        optional: true
      },
      ignoreCase: {
        type: 'boolean',
        description: '是否忽略大小寫',
        optional: true
      }
    }
  }, async (params) => {
    try {
      const safePath = validator.validateWorkingDirectory(params.path);

      // 先找出所有文字檔
      const findOptions = params.recursive ? '-l' : '-d';
      const textFiles = shell.find(findOptions, safePath)
        .filter(file => shell.test('-f', file))
        .filter(isTextFile);

      // 準備搜尋選項
      const grepOptions = [];
      if (params.ignoreCase) grepOptions.push('-i');
      grepOptions.push('-l'); // 只輸出檔名

      // 對每個文字檔執行 grep
      const results = [];
      for (const file of textFiles) {
        try {
          const grepResult = shell.exec(
            `grep ${grepOptions.join(' ')} "${params.pattern}" "${file}"`,
            { silent: true }
          );

          if (grepResult.code === 0) {
            // 取得匹配的行和上下文
            const content = shell.cat(file).toString();
            const lines = content.split('\n');
            const matches = [];

            lines.forEach((line, index) => {
              if (params.ignoreCase
                ? line.toLowerCase().includes(params.pattern.toLowerCase())
                : line.includes(params.pattern)
              ) {
                matches.push({
                  line: index + 1,
                  content: line.trim(),
                  // 加入上下文（如果有）
                  context: {
                    before: lines[index - 1]?.trim() || null,
                    after: lines[index + 1]?.trim() || null
                  }
                });
              }
            });

            results.push({
              path: file,
              name: file.split('/').pop(),
              matches
            });
          }
        } catch (error) {
          console.error(`Error searching file ${file}:`, error);
        }
      }

      return {
        type: 'application/json',
        text: JSON.stringify(results)
      };
    } catch (error) {
      throw error;
    }
  });
}
