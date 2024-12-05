# MCP CLI Server

[![NPM Version](https://img.shields.io/npm/v/mcp-shell.svg)](https://www.npmjs.com/package/mcp-shell)
[![License](https://img.shields.io/npm/l/mcp-shell.svg)](https://github.com/gkctou/mcp-shell/blob/main/LICENSE)

A secure Node.js implementation of the Model Context Protocol (MCP) that provides controlled file system operations and command execution capabilities. This server implements a comprehensive path whitelist validation mechanism as its core security feature, meticulously validating whether the working path or target path is within the specified whitelist before each file operation or command execution. This strict validation ensures that operations are confined to designated safe directories, preventing accidental or malicious access to sensitive system data.

Key Security Features:
- Path Whitelist Validation: Every file and directory operation is validated against a predefined whitelist
- Secure Command Execution: All shell commands are executed in a controlled environment with strict directory restrictions
- Access Control: Prevents unauthorized access to system files and directories outside the whitelist
- Error Prevention: Comprehensive error handling to prevent system data corruption

[English](./README.md) | [繁體中文](./README-zhTW.md) | [日本語](./README-jaJP.md) | [한국어](./README-koKR.md) | [Español](./README-esES.md) | [Français](./README-frFR.md) | [Deutsch](./README-deDE.md) | [Italiano](./README-itIT.md)

### Using with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cli": {
      "command": "npx",
      "args": [
        "-y", 
        "mcp-cli", 
        "/path/to/allowed/directory", 
        "/path/to/allowed/directory2", 
        ...
        ]
    }
  }
}
```

## Security Features

### Path Security
- Strict path whitelist validation mechanism
  - Every path operation is validated against the whitelist
  - Prevents directory traversal attacks
  - Blocks access to sensitive system directories
  - Validates both absolute and relative paths
- Real-time path validation
  - Pre-execution validation for all operations
  - Continuous monitoring of path boundaries
  - Prevention of path manipulation attempts
- Access control enforcement
  - Strict directory permissions
  - Prevention of unauthorized access
  - Protection against privilege escalation

### Command Execution Security
- Controlled execution environment
  - Commands run in isolated contexts
  - Working directory restrictions
  - Environment variable sanitization
- Command validation
  - Pre-execution security checks
  - Parameter sanitization
  - Output handling security
- Resource usage controls
  - Process isolation
  - Resource limitation
  - Execution timeout management

## File System Operations

### Secure File Operations
- Read file content (with whitelist validation)
  - Content access control
  - Binary file handling
  - Stream-based reading for large files
- Write file (with whitelist validation)
  - Atomic write operations
  - Backup creation
  - Permission preservation
- Copy file (source and target path validation)
  - Secure copy mechanisms
  - Metadata preservation
  - Error recovery
- Move file (source and target path validation)
  - Atomic move operations
  - Cross-device support
  - Permission handling
- Delete file (with whitelist validation)
  - Secure deletion
  - Resource cleanup
  - Deletion verification

### Directory Operations
- Create directory (with whitelist validation)
  - Permission structure setup
  - Parent directory validation
  - Recursive creation support
- Remove directory (with whitelist validation)
  - Safe recursive deletion
  - Resource cleanup
  - Permission verification
- List directory contents (with whitelist validation)
  - Content filtering
  - Permission-based listing
  - Metadata inclusion

## System Integration

### Environment Management
- Node.js runtime integration
- Python version compatibility
- Shell environment configuration
- Cross-platform support
  - Windows compatibility
  - Unix-like systems support
  - Path normalization

### Resource Monitoring
- CPU usage tracking
- Memory allocation monitoring
- Disk space management
- Process monitoring
  - Active process tracking
  - Resource limitation
  - Performance optimization

## Available Tools

The server provides a comprehensive set of secure tools:

- validatePath: Validates path against whitelist with detailed security checks
- executeCommand: Executes shell commands in a secure, controlled environment
- readFile: Securely reads file content with access control
- writeFile: Performs secure file writing with atomic operations
- copyFile: Implements secure file copying with integrity checks
- moveFile: Executes secure file moving with transaction support
- deleteFile: Performs secure file deletion with verification
- createDirectory: Creates directories with proper security controls
- removeDirectory: Safely removes directories with resource cleanup
- listDirectory: Lists directory contents with security filtering
- getSystemInfo: Retrieves system information securely

## Error Handling

Comprehensive error handling system:

- Path validation errors
  - Invalid path detection
  - Whitelist violation alerts
  - Path manipulation attempts
- File operation errors
  - Access denied handling
  - Resource unavailable
  - Corruption prevention
- Command execution errors
  - Execution failure handling
  - Resource exhaustion
  - Security violation detection
- System information errors
  - Data collection failures
  - Resource access issues
  - Permission problems

## Implementation Details

Built with enterprise-grade security:

- Model Context Protocol SDK
  - Secure communication
  - Protocol validation
  - Data integrity checks
- shelljs for secure file system operations
  - Command sanitization
  - Path validation
  - Error handling
- cross-env for secure cross-platform support
  - Environment isolation
  - Variable sanitization
  - Platform compatibility
- Zod for strict data validation
  - Schema enforcement
  - Type safety
  - Input sanitization
