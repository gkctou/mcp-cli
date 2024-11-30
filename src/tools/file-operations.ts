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
      throw error;
    }
  });

  // Create directory
  server.setToolHandler({
    name: 'createDirectory',
    description: 'Create a new directory',
    parameters: {
      path: {
        type: 'string',
        description: 'Directory path to create'
      }
    }
  }, async (params) => {
    try {
      const safePath = await validator.validateWorkingDirectory(params.path);
      const result = shell.mkdir('-p', safePath);
      
      if (result.code !== 0) {
        throw new Error(MESSAGES.ERROR_CREATING_DIRECTORY);
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
        description: 'File path to read'
      }
    }
  }, async (params) => {
    try {
      const safePath = await validator.validateWorkingDirectory(params.path);
      const content = shell.cat(safePath);
      
      if (shell.error()) {
        throw new Error(MESSAGES.ERROR_READING_FILE);
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
        description: 'File path to write'
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
      
      // Ensure target directory exists
      shell.mkdir('-p', dirname(safePath));

      if (params.append) {
        shell.ShellString(params.content).toEnd(safePath);
      } else {
        shell.ShellString(params.content).to(safePath);
      }
      
      if (shell.error()) {
        throw new Error(MESSAGES.ERROR_WRITING_FILE);
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
        description: 'Copy directories recursively',
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
        throw new Error(MESSAGES.formatCommandError('copy', result.stderr));
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
        throw new Error(MESSAGES.formatCommandError('move', result.stderr));
      }

      return {
        type: 'text/plain',
        text: MESSAGES.formatMoveOperation(safeSource, safeDestination)
      };
    } catch (error) {
      throw error;
    }
  });

  // Remove file/directory
  server.setToolHandler({
    name: 'remove',
    description: 'Remove file or directory',
    parameters: {
      path: {
        type: 'string',
        description: 'Path to remove'
      },
      recursive: {
        type: 'boolean',
        description: 'Remove directories recursively',
        optional: true,
        default: false
      },
      force: {
        type: 'boolean',
        description: 'Force removal',
        optional: true,
        default: false
      }
    }
  }, async (params) => {
    try {
      const safePath = await validator.validateWorkingDirectory(params.path);
      
      // Check if path exists
      if (!shell.test('-e', safePath)) {
        throw new Error(MESSAGES.FILE_NOT_FOUND);
      }

      // Check if it's a directory
      const isDirectory = shell.test('-d', safePath);
      
      if (isDirectory) {
        // If it's a directory
        if (!params.recursive) {
          // Check if directory is empty
          const contents = shell.ls(safePath);
          if (contents.length > 0) {
            throw new Error(MESSAGES.DIRECTORY_NOT_EMPTY);
          }
          
          // Remove empty directory
          const result = shell.rm('-d', safePath);
          if (result.code !== 0) {
            throw new Error(MESSAGES.ERROR_DELETING_FILE);
          }
        } else {
          // Recursively remove directory and its contents
          let options = '-r';
          if (params.force) options += 'f';
          
          // List all files to be deleted
          const filesToDelete = shell.find(safePath);
          
          const result = shell.rm(options, safePath);
          if (result.code !== 0) {
            throw new Error(MESSAGES.ERROR_DELETING_FILE);
          }

          // Return list of deleted files
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
        // If it's a file
        let options = '';
        if (params.force) options = '-f';
        
        const result = shell.rm(options, safePath);
        if (result.code !== 0) {
          throw new Error(MESSAGES.ERROR_DELETING_FILE);
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
}
