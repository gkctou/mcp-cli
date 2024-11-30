import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { PathValidator } from '../security/path-validator.js';

interface InteractiveSession {
  id: string;
  process: ChildProcess;
  lastActivity: number;
  outputBuffer: string;
}

interface SessionParams {
  cwd: string;
  shell?: string;
  env?: Record<string, string>;
}

interface WriteParams {
  sessionId: string;
  input: string;
}

interface TerminateParams {
  sessionId: string;
}

interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export class InteractiveShellManager {
  private sessions: Map<string, InteractiveSession> = new Map();

  constructor(
    private readonly validator: PathValidator,
    private readonly sessionTimeout: number = 30 * 60 * 1000
  ) {
    setInterval(() => this.cleanupSessions(), 60 * 1000);
  }

  private cleanupSessions(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.lastActivity > this.sessionTimeout) {
        this.terminateSession(id);
      }
    }
  }

  private terminateSession(id: string): void {
    const session = this.sessions.get(id);
    if (session) {
      try {
        session.process.kill();
      } catch (error) {
        console.error('Process termination failed:', error);
      }
      this.sessions.delete(id);
    }
  }

  private updateActivity(id: string): void {
    const session = this.sessions.get(id);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  private getShellInfo(): { command: string; args: string[] } {
    if (process.platform === 'win32') {
      return {
        command: 'cmd.exe',
        args: ['/c']
      };
    }
    return {
      command: '/bin/bash',
      args: ['-c']
    };
  }

  private startProcess(cwd: string, env?: Record<string, string>): ChildProcess {
    const { command, args } = this.getShellInfo();
    const spawnOptions: SpawnOptions = {
      cwd,
      env: env ? { ...process.env, ...env } : process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      windowsHide: true
    };

    return spawn(command, args, spawnOptions);
  }

  private setupOutputCollection(session: InteractiveSession): void {
    if (session.process.stdout) {
      session.process.stdout.on('data', (data: Buffer) => {
        session.outputBuffer += data.toString();
      });
    }

    if (session.process.stderr) {
      session.process.stderr.on('data', (data: Buffer) => {
        session.outputBuffer += data.toString();
      });
    }

    session.process.on('error', (error: Error) => {
      session.outputBuffer += `Error: ${error.message}\n`;
    });
  }

  private getAndClearOutput(session: InteractiveSession): string {
    const output = session.outputBuffer;
    session.outputBuffer = '';
    return output;
  }

  public registerTools(server: any): void {
    // Create interactive session
    server.registerTool({
      name: 'createInteractiveSession',
      description: 'Create an interactive shell session',
      parameters: {
        cwd: {
          type: 'string',
          description: 'Working directory'
        },
        shell: {
          type: 'string',
          description: 'Specify shell to use',
          optional: true
        },
        env: {
          type: 'object',
          description: 'Environment variables',
          optional: true
        }
      },
      handler: async (params: SessionParams): Promise<ToolResponse> => {
        try {
          const safeCwd = await this.validator.validateWorkingDirectory(params.cwd);
          const sessionId = Math.random().toString(36).substring(2);
          const childProcess = this.startProcess(safeCwd, params.env);

          const session: InteractiveSession = {
            id: sessionId,
            process: childProcess,
            lastActivity: Date.now(),
            outputBuffer: ''
          };

          this.setupOutputCollection(session);
          this.sessions.set(sessionId, session);

          return {
            content: [{
              type: 'text',
              text: sessionId
            }]
          };
        } catch (error) {
          throw error instanceof Error
            ? error
            : new Error(`Failed to create session: ${error}`);
        }
      }
    });

    // Write to session
    server.registerTool({
      name: 'writeToSession',
      description: 'Write input to interactive session',
      parameters: {
        sessionId: {
          type: 'string',
          description: 'Session ID'
        },
        input: {
          type: 'string',
          description: 'Input to send'
        }
      },
      handler: async (params: WriteParams): Promise<ToolResponse> => {
        const session = this.sessions.get(params.sessionId);
        if (!session) {
          throw new Error('Session not found or already terminated');
        }

        try {
          this.updateActivity(params.sessionId);

          const input = params.input.endsWith('\n')
            ? params.input
            : params.input + '\n';

          if (!session.process.stdin) {
            throw new Error('Cannot write to process');
          }

          session.process.stdin.write(input);
          
          // Wait for output collection
          await new Promise(resolve => setTimeout(resolve, 100));
          const output = this.getAndClearOutput(session);

          return {
            content: [{
              type: 'text',
              text: output || '(no output)'
            }]
          };
        } catch (error) {
          throw error instanceof Error
            ? error
            : new Error(`Input processing failed: ${error}`);
        }
      }
    });

    // Terminate session
    server.registerTool({
      name: 'terminateSession',
      description: 'Terminate interactive session',
      parameters: {
        sessionId: {
          type: 'string',
          description: 'Session ID'
        }
      },
      handler: (params: TerminateParams): ToolResponse => {
        try {
          this.terminateSession(params.sessionId);
          return {
            content: [{
              type: 'text',
              text: 'Session terminated'
            }]
          };
        } catch (error) {
          throw error instanceof Error
            ? error
            : new Error(`Failed to terminate session: ${error}`);
        }
      }
    });
  }
}
