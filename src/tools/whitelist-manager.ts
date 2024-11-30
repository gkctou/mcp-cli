import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { PathValidator } from '../security/path-validator.js';
import { MESSAGES } from '../constants/messages.js';

export function registerWhitelistTools(server: Server) {
  const validator = new PathValidator();

  // Get whitelisted directories
  server.setToolHandler({
    name: 'getWhitelistedDirectories',
    description: 'Get the list of whitelisted directories',
    parameters: {}
  }, async () => {
    const directories = await validator.getWhitelistedDirectories();
    return {
      type: 'application/json',
      text: JSON.stringify(directories)
    };
  });

  // Add directory to whitelist
  server.setToolHandler({
    name: 'addToWhitelist',
    description: 'Add a directory to whitelist',
    parameters: {
      path: {
        type: 'string',
        description: 'Path to add to whitelist'
      }
    }
  }, async (params) => {
    await validator.addToWhitelist(params.path);
    return {
      type: 'text/plain',
      text: MESSAGES.DIRECTORY_ADDED_TO_WHITELIST
    };
  });

  // Remove directory from whitelist
  server.setToolHandler({
    name: 'removeFromWhitelist',
    description: 'Remove a directory from whitelist',
    parameters: {
      path: {
        type: 'string',
        description: 'Path to remove from whitelist'
      }
    }
  }, async (params) => {
    await validator.removeFromWhitelist(params.path);
    return {
      type: 'text/plain',
      text: MESSAGES.DIRECTORY_REMOVED_FROM_WHITELIST
    };
  });
}
