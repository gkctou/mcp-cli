export const MESSAGES = {
  // General messages
  SUCCESS: 'Success',
  FAILED: 'Failed',

  // File operations
  FILE_NOT_FOUND: 'File not found',
  DIRECTORY_NOT_FOUND: 'Directory not found',
  DIRECTORY_NOT_EMPTY: 'Directory is not empty, use recursive: true to delete non-empty directory',
  DIRECTORY_CREATED: 'Directory created successfully',
  FILE_DELETED: 'File deleted successfully',
  DIRECTORY_DELETED: 'Directory deleted successfully',
  FILE_COPIED: 'File copied successfully',
  FILE_MOVED: 'File moved successfully',
  FILE_WRITTEN: 'File written successfully',
  FILE_APPENDED: 'Content appended to file successfully',

  // Path validation
  PATH_NOT_WHITELISTED: 'Path is not in whitelist',
  INVALID_WORKING_DIRECTORY: 'Invalid working directory',
  INVALID_PATH: 'Invalid path',
  PATH_EXISTS: 'Path already exists',
  PATH_ACCESS_DENIED: 'Access denied to path',

  // Command execution
  COMMAND_EXECUTION_FAILED: 'Command execution failed',
  COMMAND_NOT_FOUND: 'Command not found',
  COMMAND_TIMEOUT: 'Command execution timed out',
  COMMAND_INTERRUPTED: 'Command execution interrupted',

  // Whitelist management
  DIRECTORY_ADDED_TO_WHITELIST: 'Directory added to whitelist',
  DIRECTORY_REMOVED_FROM_WHITELIST: 'Directory removed from whitelist',
  WHITELIST_EMPTY: 'Whitelist is empty',

  // Session management
  SESSION_CREATED: 'Interactive session created',
  SESSION_TERMINATED: 'Session terminated',
  SESSION_NOT_FOUND: 'Session not found or already terminated',
  SESSION_TIMEOUT: 'Session timed out',

  // File search
  SEARCH_NO_RESULTS: 'No matching files found',
  SEARCH_ERROR: 'Error occurred during search',

  // Error messages
  ERROR_READING_FILE: 'Error reading file',
  ERROR_WRITING_FILE: 'Error writing file',
  ERROR_DELETING_FILE: 'Error deleting file',
  ERROR_CREATING_DIRECTORY: 'Error creating directory',
  ERROR_ACCESSING_PATH: 'Error accessing path',
  ERROR_INVALID_OPERATION: 'Invalid operation',
  ERROR_PERMISSION_DENIED: 'Permission denied',
  ERROR_SYSTEM: 'System error occurred',

  // Format functions
  formatPathError: (path: string, error?: string) => 
    `Error accessing path: ${path}${error ? ` (${error})` : ''}`,

  formatCommandError: (command: string, error?: string) =>
    `Command execution failed: ${command}${error ? ` (${error})` : ''}`,

  formatFileOperation: (operation: string, path: string) =>
    `${operation} successful: ${path}`,

  formatCopyOperation: (source: string, destination: string) =>
    `File copied successfully: ${source} -> ${destination}`,

  formatMoveOperation: (source: string, destination: string) =>
    `File moved successfully: ${source} -> ${destination}`,

  formatDeleteOperation: (path: string, type: 'file' | 'directory') =>
    `${type === 'file' ? 'File' : 'Directory'} deleted successfully: ${path}`,

  formatSearchResults: (count: number) =>
    `Found ${count} matching ${count === 1 ? 'file' : 'files'}`,
};
