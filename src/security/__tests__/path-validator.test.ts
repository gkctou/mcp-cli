import { PathValidator } from '../path-validator';
import { join } from 'path';

describe('PathValidator', () => {
  const rootDir = '/Users/jason/safe-root';
  let validator: PathValidator;

  beforeEach(() => {
    validator = new PathValidator(rootDir);
  });

  test('安全的路徑應該通過驗證', () => {
    expect(validator.isPathSafe(join(rootDir, 'file.txt'))).toBe(true);
    expect(validator.isPathSafe(join(rootDir, 'subdir/file.txt'))).toBe(true);
  });

  test('使用相對路徑的目錄遍歷應該被檢測到', () => {
    expect(validator.isPathSafe('../forbidden.txt')).toBe(false);
    expect(validator.isPathSafe('subdir/../../forbidden.txt')).toBe(false);
  });

  test('使用絕對路徑的目錄遍歷應該被檢測到', () => {
    expect(validator.isPathSafe('/etc/passwd')).toBe(false);
    expect(validator.isPathSafe('/usr/bin/evil')).toBe(false);
  });

  test('getSafePath 應該正確處理安全路徑', () => {
    const safePath = join(rootDir, 'file.txt');
    expect(() => validator.getSafePath(safePath)).not.toThrow();
  });

  test('getSafePath 應該拋出不安全路徑的錯誤', () => {
    expect(() => validator.getSafePath('../forbidden.txt')).toThrow();
    expect(() => validator.getSafePath('/etc/passwd')).toThrow();
  });
});
