import { homedir } from 'os';
import { join } from 'path';
import shell from 'shelljs';
import fs from 'fs/promises';

interface WhitelistConfig {
  directories: string[];
  lastUpdated: string;
}

export class WhitelistManager {
  private static instance: WhitelistManager;
  private configPath: string;
  private config: WhitelistConfig | null = null;

  private constructor() {
    this.configPath = join(homedir(), '.mcp-shell', 'whitelist.json');
  }

  public static getInstance(): WhitelistManager {
    if (!WhitelistManager.instance) {
      WhitelistManager.instance = new WhitelistManager();
    }
    return WhitelistManager.instance;
  }

  /**
   * 取得系統用戶的預設目錄
   */
  private async getDefaultDirectory(): Promise<string> {
    const username = process.env.USER || process.env.USERNAME;
    let defaultPath: string;

    // 根據不同系統取得 Documents 目錄
    if (process.platform === 'win32') {
      // Windows
      defaultPath = join(homedir(), 'Documents');
      if (!shell.test('-d', defaultPath)) {
        defaultPath = join(homedir(), 'Desktop');
        if (!shell.test('-d', defaultPath)) {
          defaultPath = homedir();
        }
      }
    } else if (process.platform === 'darwin') {
      // macOS
      defaultPath = join(homedir(), 'Documents');
      if (!shell.test('-d', defaultPath)) {
        defaultPath = join(homedir(), 'Desktop');
        if (!shell.test('-d', defaultPath)) {
          defaultPath = homedir();
        }
      }
    } else {
      // Linux 和其他 Unix-like 系統
      defaultPath = join(homedir(), 'Documents');
      // 如果不存在，嘗試其他可能的名稱
      if (!shell.test('-d', defaultPath)) {
        defaultPath = join(homedir(), 'Desktop');
        if (!shell.test('-d', defaultPath)) {
          defaultPath = homedir();
        }
      }
    }

    // 確保目錄存在且可寫入
    try {
      await fs.access(defaultPath, fs.constants.W_OK);
      return defaultPath;
    } catch {
      // 如果無法存取或寫入，回到 home 目錄
      return homedir();
    }
  }

  /**
   * 確保配置目錄存在
   */
  private async ensureConfigDir(): Promise<void> {
    const configDir = join(homedir(), '.mcp-shell');
    try {
      await fs.access(configDir);
    } catch {
      await fs.mkdir(configDir, { recursive: true });
    }
  }

  /**
   * 讀取白名單配置
   */
  private async readConfig(): Promise<WhitelistConfig> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      // 如果無法讀取或解析，則建立預設配置
      const defaultDir = await this.getDefaultDirectory();
      const defaultConfig: WhitelistConfig = {
        directories: [defaultDir],
        lastUpdated: new Date().toISOString()
      };

      // 確保配置目錄存在並寫入預設配置
      await this.ensureConfigDir();
      await fs.writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2));

      return defaultConfig;
    }
  }

  /**
   * 取得白名單目錄
   */
  public async getWhitelistedDirectories(): Promise<string[]> {
    if (!this.config) {
      this.config = await this.readConfig();
    }
    return this.config.directories;
  }

  /**
   * 檢查路徑是否在白名單中
   */
  public async isPathWhitelisted(path: string): Promise<boolean> {
    const whitelistedDirs = await this.getWhitelistedDirectories();
    const normalizedPath = shell.pwd().toString();

    return whitelistedDirs.some(dir => normalizedPath.startsWith(dir));
  }

  /**
   * 新增目錄到白名單
   */
  public async addDirectory(path: string): Promise<void> {
    if (!this.config) {
      this.config = await this.readConfig();
    }

    const normalizedPath = shell.pwd().toString();
    if (!this.config.directories.includes(normalizedPath)) {
      this.config.directories.push(normalizedPath);
      this.config.lastUpdated = new Date().toISOString();

      await this.ensureConfigDir();
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
    }
  }

  /**
   * 從白名單移除目錄
   */
  public async removeDirectory(path: string): Promise<void> {
    if (!this.config) {
      this.config = await this.readConfig();
    }

    const normalizedPath = shell.pwd().toString();
    this.config.directories = this.config.directories.filter(dir => dir !== normalizedPath);
    this.config.lastUpdated = new Date().toISOString();

    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
  }
}
