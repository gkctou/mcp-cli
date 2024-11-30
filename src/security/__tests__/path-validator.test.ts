import { PathValidator } from '../path-validator';
import { WhitelistManager } from '../../config/whitelist';
import { join } from 'path';

// Mock WhitelistManager
jest.mock('../../config/whitelist', () => {
  return {
    WhitelistManager: {
      getInstance: jest.fn().mockReturnValue({
        isPathWhitelisted: jest.fn(),
        getWhitelistedDirectories: jest.fn(),
        addDirectory: jest.fn(),
        removeDirectory: jest.fn()
      })
    }
  };
});

describe('PathValidator', () => {
  let validator: PathValidator;
  let mockWhitelistManager: jest.Mocked<WhitelistManager>;

  beforeEach(() => {
    // Clear all mock states
    jest.clearAllMocks();
    
    validator = new PathValidator();
    mockWhitelistManager = WhitelistManager.getInstance() as jest.Mocked<WhitelistManager>;
  });

  describe('validateWorkingDirectory', () => {
    const testPath = '/test/path';

    test('should allow whitelisted paths', async () => {
      mockWhitelistManager.isPathWhitelisted.mockResolvedValue(true);

      const result = await validator.validateWorkingDirectory(testPath);
      expect(result).toBe(testPath);
      expect(mockWhitelistManager.isPathWhitelisted).toHaveBeenCalledWith(testPath);
    });

    test('should reject non-whitelisted paths', async () => {
      mockWhitelistManager.isPathWhitelisted.mockResolvedValue(false);

      await expect(validator.validateWorkingDirectory(testPath))
        .rejects
        .toThrow();
      expect(mockWhitelistManager.isPathWhitelisted).toHaveBeenCalledWith(testPath);
    });

    test('should handle relative paths correctly', async () => {
      mockWhitelistManager.isPathWhitelisted.mockResolvedValue(true);
      const relativePath = './test';
      const absolutePath = join(process.cwd(), 'test');

      const result = await validator.validateWorkingDirectory(relativePath);
      expect(result).toBe(absolutePath);
      expect(mockWhitelistManager.isPathWhitelisted).toHaveBeenCalledWith(absolutePath);
    });

    test('should throw error for invalid paths', async () => {
      mockWhitelistManager.isPathWhitelisted.mockRejectedValue(new Error('Invalid path'));

      await expect(validator.validateWorkingDirectory(''))
        .rejects
        .toThrow();
    });
  });

  describe('whitelist management', () => {
    test('getWhitelistedDirectories should return whitelist directories', async () => {
      const mockDirs = ['/test/dir1', '/test/dir2'];
      mockWhitelistManager.getWhitelistedDirectories.mockResolvedValue(mockDirs);

      const result = await validator.getWhitelistedDirectories();
      expect(result).toEqual(mockDirs);
      expect(mockWhitelistManager.getWhitelistedDirectories).toHaveBeenCalled();
    });

    test('addToWhitelist should add directory to whitelist', async () => {
      const testDir = '/test/dir';
      await validator.addToWhitelist(testDir);
      expect(mockWhitelistManager.addDirectory).toHaveBeenCalledWith(testDir);
    });

    test('removeFromWhitelist should remove directory from whitelist', async () => {
      const testDir = '/test/dir';
      await validator.removeFromWhitelist(testDir);
      expect(mockWhitelistManager.removeDirectory).toHaveBeenCalledWith(testDir);
    });
  });
});
