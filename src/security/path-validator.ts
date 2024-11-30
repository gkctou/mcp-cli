import { normalize, resolve, isAbsolute, join } from 'path';
import { WhitelistManager } from '../config/whitelist.js';
import { MESSAGES } from '../constants/messages.js';

export class PathValidator {
  private readonly whitelistManager: WhitelistManager;

  constructor() {
    this.whitelistManager = WhitelistManager.getInstance();
  }

  /**
   * Validate working directory
   */
  public async validateWorkingDirectory(cwd: string): Promise<string> {
    try {
      const absoluteCwd = isAbsolute(cwd)
        ? normalize(cwd)
        : normalize(resolve(cwd));

      // 檢查路徑是否在白名單中
      const isWhitelisted = await this.whitelistManager.isPathWhitelisted(absoluteCwd);
      if (!isWhitelisted) {
        throw new Error(MESSAGES.formatPathError(absoluteCwd, MESSAGES.PATH_NOT_WHITELISTED));
      }

      return absoluteCwd;
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error(MESSAGES.formatPathError(cwd, MESSAGES.INVALID_WORKING_DIRECTORY));
    }
  }

  /**
   * Get whitelisted directories
   */
  public async getWhitelistedDirectories(): Promise<string[]> {
    return await this.whitelistManager.getWhitelistedDirectories();
  }

  /**
   * Add directory to whitelist
   */
  public async addToWhitelist(path: string): Promise<void> {
    await this.whitelistManager.addDirectory(path);
  }

  /**
   * Remove directory from whitelist
   */
  public async removeFromWhitelist(path: string): Promise<void> {
    await this.whitelistManager.removeDirectory(path);
  }
}
