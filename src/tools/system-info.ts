import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import shell from 'shelljs';
import os from 'os';

export function registerSystemInfoTools(server: Server) {
  // 取得系統平台資訊
  server.setToolHandler({
    name: 'getPlatformInfo',
    description: '取得當前系統平台資訊',
    parameters: {}
  }, async () => {
    return {
      type: 'application/json',
      text: JSON.stringify({
        platform: process.platform,
        arch: process.arch,
        release: os.release(),
        type: os.type()
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
