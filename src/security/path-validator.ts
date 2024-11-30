import { normalize, resolve, isAbsolute, join } from 'path';

export class PathValidator {
  private readonly rootDir: string;

  constructor(rootDir: string) {
    // 確保 rootDir 是絕對路徑並標準化
    this.rootDir = normalize(resolve(rootDir));
  }

  /**
   * 驗證路徑是否在允許的根目錄內
   */
  public isPathSafe(targetPath: string): boolean {
    try {
      // 將目標路徑轉換為絕對路徑
      const absolutePath = isAbsolute(targetPath)
        ? normalize(targetPath)
        : normalize(join(this.rootDir, targetPath));

      // 標準化路徑並解析所有的 '..' 和 '.'
      const normalizedPath = normalize(resolve(absolutePath));

      // 檢查標準化後的路徑是否以根目錄開頭
      return normalizedPath.startsWith(this.rootDir);
    } catch (error) {
      // 如果路徑處理過程中出現錯誤，視為不安全
      console.error('Path validation error:', error);
      return false;
    }
  }

  /**
   * 獲取安全的絕對路徑
   * 如果路徑不安全，拋出錯誤
   */
  public getSafePath(targetPath: string): string {
    const absolutePath = isAbsolute(targetPath)
      ? normalize(targetPath)
      : normalize(join(this.rootDir, targetPath));

    const normalizedPath = normalize(resolve(absolutePath));

    if (!this.isPathSafe(normalizedPath)) {
      throw new Error(`不安全的路徑訪問嘗試: ${targetPath}`);
    }

    return normalizedPath;
  }
}
