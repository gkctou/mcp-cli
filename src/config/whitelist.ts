import { homedir } from 'os';
import { join, normalize } from 'path';
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
   * Get system user's default directory
   */
  private async getDefaultDirectory(): Promise<string> {
    const username = process.env.USER || process.env.USERNAME;
    let defaultPath: string;

    // Get Documents directory based on different systems
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
      // Linux and other Unix-like systems
      defaultPath = join(homedir(), 'Documents');
      // Try other possible names if not exists
      if (!shell.test('-d', defaultPath)) {
        defaultPath = join(homedir(), 'Desktop');
        if (!shell.test('-d', defaultPath)) {
          defaultPath = homedir();
        }
      }
    }

    // Ensure directory exists and is writable
    try {
      await fs.access(defaultPath, fs.constants.W_OK);
      return defaultPath;
    } catch {
      // If cannot access or write, fallback to home directory
      return homedir();
    }
  }

  /**
   * Ensure configuration directory exists
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
   * Read whitelist configuration
   */
  private async readConfig(): Promise<WhitelistConfig> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      // If cannot read or parse, create default configuration
      const defaultDir = await this.getDefaultDirectory();
      const defaultConfig: WhitelistConfig = {
        directories: [defaultDir],
        lastUpdated: new Date().toISOString()
      };

      // Ensure config directory exists and write default configuration
      await this.ensureConfigDir();
      await fs.writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2));

      return defaultConfig;
    }
  }

  /**
   * Get whitelisted directories
   */
  public async getWhitelistedDirectories(): Promise<string[]> {
    if (!this.config) {
      this.config = await this.readConfig();
    }
    return this.config.directories;
  }

  /**
   * Check if path is in whitelist
   */
  public async isPathWhitelisted(path: string): Promise<boolean> {
    const whitelistedDirs = await this.getWhitelistedDirectories();
    const normalizedPath = normalize(path);

    return whitelistedDirs.some(dir => {
      const normalizedDir = normalize(dir);
      return normalizedPath.startsWith(normalizedDir);
    });
  }

  /**
   * Add directory to whitelist
   */
  public async addDirectory(path: string): Promise<void> {
    if (!this.config) {
      this.config = await this.readConfig();
    }

    const normalizedPath = normalize(path);
    if (!this.config.directories.includes(normalizedPath)) {
      this.config.directories.push(normalizedPath);
      this.config.lastUpdated = new Date().toISOString();

      await this.ensureConfigDir();
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
    }
  }

  /**
   * Remove directory from whitelist
   */
  public async removeDirectory(path: string): Promise<void> {
    if (!this.config) {
      this.config = await this.readConfig();
    }

    const normalizedPath = normalize(path);
    this.config.directories = this.config.directories.filter(dir => normalize(dir) !== normalizedPath);
    this.config.lastUpdated = new Date().toISOString();

    await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
  }
}
