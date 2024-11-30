import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import shell from 'shelljs';
import os from 'os';

/**
 * 取得 Python 版本
 */
async function getPythonVersion(): Promise<string | null> {
  try {
    // 先嘗試 python3
    let result = shell.exec('python3 --version', { silent: true });
    if (result.code === 0) {
      return result.stdout.trim();
    }

    // 如果沒有 python3，嘗試 python
    result = shell.exec('python --version', { silent: true });
    if (result.code === 0) {
      return result.stdout.trim();
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 取得 Node.js 版本
 */
function getNodeVersion(): string {
  return process.version;
}

export function registerSystemInfoTools(server: Server) {
  // 取得系統平台資訊
  server.setToolHandler({
    name: 'getPlatformInfo',
    description: '取得當前系統平台資訊',
    parameters: {}
  }, async () => {
    const pythonVersion = await getPythonVersion();

    return {
      type: 'application/json',
      text: JSON.stringify({
        // 系統資訊
        platform: process.platform,
        arch: process.arch,
        release: os.release(),
        type: os.type(),
        hostname: os.hostname(),
        userInfo: os.userInfo(),
        cpus: os.cpus().length,
        totalmem: os.totalmem(),
        freemem: os.freemem(),
        tmpdir: os.tmpdir(),

        // 程式環境資訊
        node: {
          version: getNodeVersion(),
          processVersion: process.versions, // 包含 V8、libuv 等詳細版本
          env: process.env.NODE_ENV || 'not set'
        },
        python: {
          version: pythonVersion,
          available: pythonVersion !== null
        }
      })
    };
  });

  // 取得環境變數
  server.setToolHandler({
    name: 'getEnvVars',
    description: '取得當前環境變數',
    parameters: {}
  }, async () => {
    return {
      type: 'application/json',
      text: JSON.stringify(process.env)
    };
  });

  // 取得目前使用的 shell
  server.setToolHandler({
    name: 'getCurrentShell',
    description: '取得目前使用的 shell',
    parameters: {}
  }, async () => {
    const shell = process.env.SHELL || 
      (process.platform === 'win32' ? process.env.COMSPEC : '/bin/bash');

    return {
      type: 'text/plain',
      text: shell
    };
  });

  // 取得可用的 shells
  server.setToolHandler({
    name: 'getAvailableShells',
    description: '取得系統上可用的 shells',
    parameters: {}
  }, async () => {
    let shells: string[] = [];

    if (process.platform === 'win32') {
      // Windows shells
      shells = [
        process.env.COMSPEC || 'cmd.exe',  // cmd
        'powershell.exe',
        'pwsh.exe'  // PowerShell Core
      ].filter(shell => shell.which(shell));
    } else {
      // Unix-like shells
      const availableShells = shell.cat('/etc/shells').toString().split('\n')
        .filter(line => line && !line.startsWith('#'));
      shells = availableShells.filter(shell => shell.which(shell));
    }

    return {
      type: 'application/json',
      text: JSON.stringify(shells)
    };
  });
}
