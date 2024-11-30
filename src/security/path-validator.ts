import { normalize, resolve, isAbsolute, join } from 'path';

export class PathValidator {
  private readonly rootDir: string;

  constructor(rootDir: string) {
    // 確保 rootDir 是絕對路徑並標準化
    this.rootDir = normalize(resolve(rootDir));
  }

  /**
   * 驗證工作目錄是否在白名單範圍內
   */
  public validateWorkingDirectory(cwd: string): string {
    try {
      const absoluteCwd = isAbsolute(cwd)
        ? normalize(cwd)
        : normalize(join(this.rootDir, cwd));

      const normalizedCwd = normalize(resolve(absoluteCwd));

      if (!normalizedCwd.startsWith(this.rootDir)) {
        throw new Error(`不安全的工作目錄: ${cwd}`);
      }

      return normalizedCwd;
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error(`無效的工作目錄: ${cwd}`);
    }
  }
}
