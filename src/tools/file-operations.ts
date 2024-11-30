import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import shell from 'shelljs';
import { join, basename, dirname } from 'path';
import { PathValidator } from '../security/path-validator.js';
import { MESSAGES } from '../constants/messages.js';

export function registerFileOperations(server: Server) {
  const validator = new PathValidator();

  // List directory contents
  server.setToolHandler({
    name: 'listDirectory',
    description: 'List directory contents',
    parameters: {
      path: {
        type: 'string',
        description: 'Directory path to list'
      }
    }
  }, async (params) => {
    try {
      const safePath = await validator.validateWorkingDirectory(params.path);
      const files = shell.ls('-lA', safePath);
      
      return {
        type: 'application/json',
        text: JSON.stringify(files.map(file => ({
          name: file.name,
          size: file.size,
          isDirectory: file.isDirectory(),
          isFile: file.isFile(),
          isSymlink: file.isSymbolicLink(),
          mode: file.mode,
          mtime: file.mtime
        })))
      };
    } catch (error) {
      throw error instanceof Error 
        ? error 
        : new Error(MESSAGES.formatPathError(params.path, MESSAGES.ERROR_READING_FILE));
    }
  });

  // Create directory
  server.setToolHandler({
    name: 'createDirectory',
    description: 'Create a new directory',
    parameters: {
      path: {
        type: 'string',
        description: 'Path for the new directory'
      }
    }
  }, async (params) => {
    try {
      const safePath = await validator.validateWorkingDirectory(params.path);
      const result = shell.mkdir('-p', safePath);
      
      if (result.code !== 0) {
        throw new Error(MESSAGES.formatPathError(safePath, result.stderr));
      }

      return {
        type: 'text/plain',
        text: MESSAGES.formatFileOperation('Directory creation', safePath)
      };
    } catch (error) {
      throw error;
    }
  });

  // Read file
  server.setToolHandler({
    name: 'readFile',
    description: 'Read file contents',
    parameters: {
      path: {
        type: 'string',
        description: 'Path to the file'
      }
    }
  }, async (params) => {
    try {
      const safePath = await validator.validateWorkingDirectory(params.path);
      const content = shell.cat(safePath);
      
      if (shell.error()) {
        throw new Error(MESSAGES.formatPathError(safePath, MESSAGES.ERROR_READING_FILE));
      }

      return {
        type: 'text/plain',
        text: content
      };
    } catch (error) {
      throw error;
    }
  });

  // Write file
  server.setToolHandler({
    name: 'writeFile',
    description: 'Write content to file',
    parameters: {
      path: {
        type: 'string',
        description: 'Path to the file'
      },
      content: {
        type: 'string',
        description: 'Content to write'
      },
      append: {
        type: 'boolean',
        description: 'Whether to append content',
        optional: true
      }
    }
  }, async (params) => {
    try {
      const safePath = await validator.validateWorkingDirectory(params.path);
      
      shell.mkdir('-p', dirname(safePath));

      if (params.append) {
        shell.ShellString(params.content).toEnd(safePath);
      } else {
        shell.ShellString(params.content).to(safePath);
      }
      
      if (shell.error()) {
        throw new Error(MESSAGES.formatPathError(safePath, MESSAGES.ERROR_WRITING_FILE));
      }

      return {
        type: 'text/plain',
        text: MESSAGES.formatFileOperation(
          params.append ? 'Content append' : 'File write',
          safePath
        )
      };
    } catch (error) {
      throw error;
    }
  });

  // Copy file/directory
  server.setToolHandler({
    name: 'copy',
    description: 'Copy file or directory',
    parameters: {
      source: {
        type: 'string',
        description: 'Source path'
      },
      destination: {
        type: 'string',
        description: 'Destination path'
      },
      recursive: {
        type: 'boolean',
        description: 'Whether to copy directories recursively',
        optional: true
      }
    }
  }, async (params) => {
    try {
      const safeSource = await validator.validateWorkingDirectory(params.source);
      const safeDestination = await validator.validateWorkingDirectory(params.destination);

      const options = params.recursive ? '-R' : '';
      const result = shell.cp(options, safeSource, safeDestination);
      
      if (result.code !== 0) {
        throw new Error(MESSAGES.formatPathError(safeSource, result.stderr));
      }

      return {
        type: 'text/plain',
        text: MESSAGES.formatCopyOperation(safeSource, safeDestination)
      };
    } catch (error) {
      throw error;
    }
  });

  // Move/rename file or directory
  server.setToolHandler({
    name: 'move',
    description: 'Move or rename file/directory',
    parameters: {
      source: {
        type: 'string',
        description: 'Source path'
      },
      destination: {
        type: 'string',
        description: 'Destination path'
      }
    }
  }, async (params) => {
    try {
      const safeSource = await validator.validateWorkingDirectory(params.source);
      const safeDestination = await validator.validateWorkingDirectory(params.destination);

      const result = shell.mv(safeSource, safeDestination);
      
      if (result.code !== 0) {
        throw new Error(MESSAGES.formatPathError(safeSource, result.stderr));
      }

      return {
        type: 'text/plain',
        text: MESSAGES.formatMoveOperation(safeSource, safeDestination)
      };
    } catch (error) {
      throw error;
    }
  });

  // Delete file/directory
  server.setToolHandler({
    name: 'remove',
    description: 'Delete file or directory',
    parameters: {
      path: {
        type: 'string',
        description: 'Path to delete'
      },
      recursive: {
        type: 'boolean',
        description: 'Whether to delete directories recursively',
        optional: true,
        default: false
      },
      force: {
        type: 'boolean',
        description: 'Force deletion',
        optional: true,
        default: false
      }
    }
  }, async (params) => {
    try {
      const safePath = await validator.validateWorkingDirectory(params.path);
      
      // Check if path exists
      if (!shell.test('-e', safePath)) {
        throw new Error(MESSAGES.PATH_NOT_FOUND);
      }

      // Check if it's a directory
      const isDirectory = shell.test('-d', safePath);
      
      if (isDirectory) {
        if (!params.recursive) {
          // Check if directory is empty
          const contents = shell.ls(safePath);
          if (contents.length > 0) {
            throw new Error(MESSAGES.DIRECTORY_NOT_EMPTY);
          }
          
          // Delete empty directory
          const result = shell.rm('-d', safePath);
          if (result.code !== 0) {
            throw new Error(MESSAGES.formatPathError(safePath, result.stderr));
          }
        } else {
          // List files to be deleted first
          const filesToDelete = shell.find(safePath);
          
          // Recursive delete
          let options = 'r';
          if (params.force) options += 'f';
          
          const result = shell.rm(`-${options}`, safePath);
          if (result.code !== 0) {
            throw new Error(MESSAGES.formatPathError(safePath, result.stderr));
          }

          return {
            type: 'application/json',
            text: JSON.stringify({
              status: MESSAGES.SUCCESS,
              path: safePath,
              type: 'directory',
              filesDeleted: filesToDelete.length,
              files: filesToDelete
            })
          };
        }
      } else {
        // Delete file
        let options = '';
        if (params.force) options = 'f';
        
        const result = shell.rm(`-${options}`, safePath);
        if (result.code !== 0) {
          throw new Error(MESSAGES.formatPathError(safePath, result.stderr));
        }
      }

      return {
        type: 'application/json',
        text: JSON.stringify({
          status: MESSAGES.SUCCESS,
          path: safePath,
          type: isDirectory ? 'directory' : 'file'
        })
      };
    } catch (error) {
      throw error;
    }
  });

  // Get file/directory info
  server.setToolHandler({
    name: 'stat',
    description: 'Get file or directory information',
    parameters: {
      path: {
        type: 'string',
        description: 'Path to check'
      }
    }
  }, async (params) => {
    try {
      const safePath = await validator.validateWorkingDirectory(params.path);
      const stats = shell.test('-e', safePath) ? shell.ls('-ld', safePath)[0] : null;

      if (!stats) {
        throw new Error(MESSAGES.PATH_NOT_FOUND);
      }

      return {
        type: 'application/json',
        text: JSON.stringify({
          name: basename(safePath),
          size: stats.size,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
          isSymlink: stats.isSymbolicLink(),
          mode: stats.mode,
          mtime: stats.mtime,
          exists: true
        })
      };
    } catch (error) {
      throw error;
    }
  });
}
