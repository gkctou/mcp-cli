import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { spawn } from 'child_process';
import { PathValidator } from '../security/path-validator.js';
import { Readable, Writable } from 'stream';

interface InteractiveSession {
  id: string;
  process: ReturnType<typeof spawn>;
  lastActivity: number;
}

export class InteractiveShellManager {
  private sessions: Map<string, InteractiveSession> = new Map();

  constructor(
    private readonly validator: PathValidator,
    // 清理超過 30 分鐘未活動的會話
    private readonly sessionTimeout: number = 30 * 60 * 1000
  ) {
    // 定期清理逾時會話
    setInterval(() => this.cleanupSessions(), 60 * 1000);
  }

  private cleanupSessions() {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.lastActivity > this.sessionTimeout) {
        this.terminateSession(id);
      }
    }
  }

  private terminateSession(id: string) {
    const session = this.sessions.get(id);
    if (session) {
      session.process.kill();
      this.sessions.delete(id);
    }
  }

  private updateActivity(id: string) {
    const session = this.sessions.get(id);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  public registerTools(server: Server) {
    // 創建互動式會話
    server.setToolHandler({
      name: 'createInteractiveSession',
      description: '創建互動式 shell 會話',
      parameters: {
        cwd: {
          type: 'string',
          description: '工作目錄'
        },
        shell: {
          type: 'string',
          description: '指定使用的 shell',
          optional: true
        },
        env: {
          type: 'object',
          description: '環境變數',
          optional: true
        }
      }
    }, async (params) => {
      try {
        const safeCwd = this.validator.validateWorkingDirectory(params.cwd);
        
        // 根據平台選擇預設 shell
        const defaultShell = process.platform === 'win32'
          ? process.env.COMSPEC || 'cmd.exe'
          : process.env.SHELL || '/bin/bash';

        const shell = params.shell || defaultShell;

        // 創建子進程
        const childProcess = spawn(shell, [], {
          cwd: safeCwd,
          env: { ...process.env, ...params.env },
          stdio: ['pipe', 'pipe', 'pipe'],
          // Windows 特別設定
          windowsHide: true,
          // 啟用 pseudo-terminal
          ...(process.platform === 'win32'
            ? { windowsVerbatimArguments: true }
            : { detached: true })
        });

        const sessionId = Math.random().toString(36).substring(2);

        this.sessions.set(sessionId, {
          id: sessionId,
          process: childProcess,
          lastActivity: Date.now()
        });

        return {
          type: 'text/plain',
          text: sessionId
        };
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(`創建會話失敗: ${error}`);
      }
    });

    // 傳送輸入到會話
    server.setToolHandler({
      name: 'writeToSession',
      description: '傳送輸入到互動式會話',
      parameters: {
        sessionId: {
          type: 'string',
          description: '會話 ID'
        },
        input: {
          type: 'string',
          description: '要傳送的輸入'
        }
      }
    }, async (params) => {
      const session = this.sessions.get(params.sessionId);
      if (!session) {
        throw new Error('會話不存在或已結束');
      }

      try {
        // 更新會話活動時間
        this.updateActivity(params.sessionId);

        // 確保輸入以換行結尾
        const input = params.input.endsWith('\n')
          ? params.input
          : params.input + '\n';

        // 傳送輸入
        session.process.stdin.write(input);

        // 等待並收集輸出
        await new Promise(resolve => setTimeout(resolve, 100));

        // 取得輸出
        const output = session.process.stdout.read();
        const error = session.process.stderr.read();

        return {
          type: 'text/plain',
          text: (output || '') + (error || '')
        };
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(`輸入處理失敗: ${error}`);
      }
    });

    // 結束會話
    server.setToolHandler({
      name: 'terminateSession',
      description: '結束互動式會話',
      parameters: {
        sessionId: {
          type: 'string',
          description: '會話 ID'
        }
      }
    }, async (params) => {
      try {
        this.terminateSession(params.sessionId);
        return {
          type: 'text/plain',
          text: '會話已結束'
        };
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(`結束會話失敗: ${error}`);
      }
    });
  }
}
