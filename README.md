# MCP Shell Server

[![NPM Version](https://img.shields.io/npm/v/mcp-shell.svg)](https://www.npmjs.com/package/mcp-shell)
[![License](https://img.shields.io/npm/l/mcp-shell.svg)](https://github.com/gkctou/mcp-shell/blob/main/LICENSE)

A Model Context Protocol (MCP) server implementation that provides secure shell and file system operations.

[English](./README.md) | [繁體中文](./README-zhTW.md) | [日本語](./README-jaJP.md)

## Overview

MCP Shell Server enables AI assistants to:
- Execute shell commands securely
- Manage files and directories
- Search files by name and content
- Access system information

All operations are constrained by a whitelist system that defaults to the user's Documents directory.

## Features

### Shell Operations
- Execute commands in specified shells (cmd, powershell, bash, zsh, etc.)
- Support for interactive commands
- Environment variable management
- Working directory validation

### File Operations
- Basic operations (read, write, copy, move, delete)
- Directory listing and creation
- File/directory stats
- File search by name and content
- Recursive operations with safety checks

### Security
- Directory whitelist system
- Safe path validation
- Recursive operation safeguards
- Platform-specific path handling

### System Information
- Platform details
- Environment variables
- Available shells
- Node.js and Python versions

## Installation

```bash
npm install mcp-shell
```

## Usage

### In Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "shell": {
      "command": "npx",
      "args": ["-y", "mcp-shell"],
      "env": {
        "MCP_SHELL_ROOT": "/path/to/safe/directory"
      }
    }
  }
}
```

### Available Tools

1. Shell Command Execution:
```typescript
await client.request({
  method: 'tools/invoke',
  params: {
    name: 'shell',
    parameters: { 
      command: 'ls -la',
      cwd: './project',
      shell: 'bash'  // optional
    }
  }
});
```

2. File Operations:
```typescript
// Read file
await client.request({
  method: 'tools/invoke',
  params: {
    name: 'readFile',
    parameters: { 
      path: './project/file.txt'
    }
  }
});

// Search files
await client.request({
  method: 'tools/invoke',
  params: {
    name: 'searchByContent',
    parameters: { 
      path: './project',
      pattern: 'TODO',
      recursive: true
    }
  }
});
```

3. System Information:
```typescript
await client.request({
  method: 'tools/invoke',
  params: {
    name: 'getPlatformInfo'
  }
});
```

## Configuration

Environment variables:
- `MCP_SHELL_ROOT`: Root directory for file operations (default: user's Documents folder)

## Security Considerations

- All file operations are restricted to whitelisted directories
- Directory traversal attempts are blocked
- Non-empty directory deletion requires explicit confirmation
- Interactive commands are automatically detected and handled safely

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Start server
npm start
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT
