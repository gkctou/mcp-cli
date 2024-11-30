import { ChildProcess, spawn } from 'child_process';
import { Readable, Writable } from 'stream';
import { platform } from 'os';

interface ProcessOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  shell?: string;
}

export class InteractiveProcess {
  private process: ChildProcess | null = null;
  private isWindows = platform() === 'win32';

  constructor(
    private command: string,
    private args: string[],
    private options: ProcessOptions = {}
  ) {}

  /**
   * 啟動互動式程序
   */
  start(): void {
    // Windows 上需要特別處理來支援 PTY
    const spawnOptions = {
      ...this.options,
      stdio: ['pipe', 'pipe', 'pipe'] as const,
      // Windows 下需要額外的終端機設定
      windowsHide: false,
      windowsVerbatimArguments: true
    };

    // 啟動程序
    this.process = spawn(this.command, this.args, spawnOptions);

    // 設定緩衝區緩解讀寫壓力
    if (this.process.stdin) {
      this.process.stdin.setDefaultEncoding('utf-8');
    }
    if (this.process.stdout) {
      this.process.stdout.setEncoding('utf-8');
    }
    if (this.process.stderr) {
      this.process.stderr.setEncoding('utf-8');
    }

    // 設定錯誤處理
    this.process.on('error', (error) => {
      console.error('Process error:', error);
    });
  }

  /**
   * 取得標準輸入串流
   */
  getStdin(): Writable | null {
    return this.process?.stdin || null;
  }

  /**
   * 取得標準輸出串流
   */
  getStdout(): Readable | null {
    return this.process?.stdout || null;
  }

  /**
   * 取得標準錯誤串流
   */
  getStderr(): Readable | null {
    return this.process?.stderr || null;
  }

  /**
   * 傳送輸入到程序
   */
  write(data: string): boolean {
    if (!this.process?.stdin) return false;

    // Windows 上可能需要額外的換行符處理
    const input = this.isWindows ? `${data}\r\n` : `${data}\n`;
    return this.process.stdin.write(input);
  }

  /**
   * 結束程序
   */
  terminate(): void {
    if (!this.process) return;

    if (this.isWindows) {
      // Windows 上需要特別處理來確保完全終止
      spawn('taskkill', ['/pid', this.process.pid!.toString(), '/f', '/t']);
    } else {
      // Unix-like 系統可以直接發送信號
      this.process.kill('SIGTERM');
    }
  }

  /**
   * 取得程序 PID
   */
  getPid(): number | null {
    return this.process?.pid || null;
  }

  /**
   * 程序是否還在執行
   */
  isRunning(): boolean {
    return this.process?.connected ?? false;
  }
}
