# MCP CLI Server

[![NPM Version](https://img.shields.io/npm/v/mcp-shell.svg)](https://www.npmjs.com/package/mcp-shell)
[![License](https://img.shields.io/npm/l/mcp-shell.svg)](https://github.com/gkctou/mcp-shell/blob/main/LICENSE)

A Node.js implementation of the Model Context Protocol (MCP) server that provides secure file system operations and command execution capabilities. This server implements a comprehensive path whitelist validation mechanism, checking whether the working path or target path is within the specified whitelist before each file operation or command execution, ensuring that other data in your system won't be accidentally damaged.

[English](./README.md) | [繁體中文](./README-zhTW.md) | [日本語](./README-jaJP.md) | [한국어](./README-koKR.md) | [Español](./README-esES.md) | [Français](./README-frFR.md) | [Deutsch](./README-deDE.md) | [Italiano](./README-itIT.md)

### Using with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cli": {
      "command": "npx",
      "args": ["-y", "mcp-cli", "/path/to/allowed/directory", "/path/to/allowed/directory2", ...]
    }
  }
}
```

## Features

### Path Security
- Strict path whitelist mechanism
- Path validation before each operation
- Ensures all operations are within allowed directories
- Supports relative and absolute paths
- Prevents directory traversal attacks
- Protects other system data from accidental modification

### File Operations
- Read file content (requires path whitelist validation)
- Write file (requires path whitelist validation)
- Copy file (both source and target paths require whitelist validation)
- Move file (both source and target paths require whitelist validation)
- Delete file (requires path whitelist validation)

### Directory Operations
- Create directory (requires path whitelist validation)
- Remove directory (requires path whitelist validation)
- List directory contents (requires path whitelist validation)

### Command Execution
- Secure shell command execution
- Working directory must be within whitelist
- Environment variable support
- Cross-platform compatibility using cross-env

### System Information
- Node.js runtime information
- Python version information
- Operating system details
- Shell environment information
- CPU and memory usage status

## Available Tools

The server provides the following tools:

- validatePath: Validate if a path is within allowed whitelist directories
- executeCommand: Execute shell commands within whitelist directories
- readFile: Read file content from whitelist directories
- writeFile: Write file to whitelist directories
- copyFile: Copy files within whitelist directories
- moveFile: Move files within whitelist directories
- deleteFile: Delete files from whitelist directories
- createDirectory: Create new directory in whitelist directories
- removeDirectory: Remove directory from whitelist directories
- listDirectory: List contents of whitelist directories
- getSystemInfo: Get system information

## Security Features

- Path Whitelist Mechanism
  - Specify allowed directories at startup
  - All file and directory operations require whitelist validation
  - Prevents modification of critical system files
  - Restricts operations to safe directories
- Command Execution Security
  - Working directory restricted to whitelist
  - Commands executed in controlled environment
- Comprehensive error handling

## Error Handling

The server includes comprehensive error handling:

- Path whitelist validation errors
- File not found errors
- Directory not found errors
- Command execution errors
- System information retrieval errors

## Implementation Details

The server is built using:

- Model Context Protocol SDK
- shelljs for file system operations
- cross-env for cross-platform environment variables
- Zod for data validation
