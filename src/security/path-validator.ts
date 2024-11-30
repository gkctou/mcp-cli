import { normalize, resolve, isAbsolute, join } from 'path';

export class PathValidator {
  private readonly rootDir: string;

  constructor(rootDir: string) {
    // 確保 rootDir 是絕對路徑並標準化
    this.rootDir = normalize(resolve(rootDir));
  }

  /**
   * 驗證路徑是否在允許的範圍內
   * @param targetPath 目標路徑
   * @param cwd 當前工作目錄
   */
  public isPathSafe(targetPath: string, cwd?: string): boolean {
    try {
      // 如果提供了 cwd，先驗證 cwd 是否在允許範圍內
      let basePath = this.rootDir;
      if (cwd) {
        const absoluteCwd = isAbsolute(cwd) 
          ? normalize(cwd)
          : normalize(join(this.rootDir, cwd));

        const normalizedCwd = normalize(resolve(absoluteCwd));
        
        if (!normalizedCwd.startsWith(this.rootDir)) {
          return false; // 不安全的工作目錄
        }
        basePath = normalizedCwd;
      }

      // 將目標路徑轉換為絕對路徑
      const absolutePath = isAbsolute(targetPath)
        ? normalize(targetPath)
        : normalize(join(basePath, targetPath));

      // 標準化路徑並解析所有的 '..' 和 '.'
      const normalizedPath = normalize(resolve(absolutePath));

      // 確保路徑在根目錄內
      return normalizedPath.startsWith(this.rootDir);
    } catch (error) {
      console.error('Path validation error:', error);
      return false;
    }
  }

  /**
   * 獲取安全的絕對路徑
   * @param targetPath 目標路徑
   * @param cwd 當前工作目錄
   */
  public getSafePath(targetPath: string, cwd?: string): string {
    const isValid = this.isPathSafe(targetPath, cwd);
    if (!isValid) {
      throw new Error(`不安全的路徑: ${targetPath}`);
    }

    let basePath = cwd ? 
      normalize(resolve(isAbsolute(cwd) ? cwd : join(this.rootDir, cwd))) :
      this.rootDir;

    const absolutePath = isAbsolute(targetPath)
      ? normalize(targetPath)
      : normalize(join(basePath, targetPath));

    return normalize(resolve(absolutePath));
  }
}
