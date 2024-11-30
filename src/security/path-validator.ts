import { normalize, resolve, isAbsolute, join } from 'path';
import { WhitelistManager } from '../config/whitelist.js';

export class PathValidator {
  private readonly whitelistManager: WhitelistManager;

  constructor() {
    this.whitelistManager = WhitelistManager.getInstance();
  }

  /**
   * 驗證工作目錄
   */
  public async validateWorkingDirectory(cwd: string): Promise<string> {
    try {
      const absoluteCwd = isAbsolute(cwd)
        ? normalize(cwd)
        : normalize(resolve(cwd));

      // 檢查路徑是否在白名單中
      const isWhitelisted = await this.whitelistManager.isPathWhitelisted(absoluteCwd);
      if (!isWhitelisted) {
        throw new Error(`目錄不在白名單中: ${absoluteCwd}`);
      }

      return absoluteCwd;
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error(`無效的工作目錄: ${cwd}`);
    }
  }

  /**
   * 取得白名單目錄列表
   */
  public async getWhitelistedDirectories(): Promise<string[]> {
    return await this.whitelistManager.getWhitelistedDirectories();
  }

  /**
   * 新增目錄到白名單
   */
  public async addToWhitelist(path: string): Promise<void> {
    await this.whitelistManager.addDirectory(path);
  }

  /**
   * 從白名單移除目錄
   */
  public async removeFromWhitelist(path: string): Promise<void> {
    await this.whitelistManager.removeDirectory(path);
  }
}
