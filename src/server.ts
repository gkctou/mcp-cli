import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import shell from "shelljs";
import path from "path";
import os from "os";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Get detailed system information
const getDetailedSystemInfo = () => {
  const nodeVersion = process.version;
  const pythonVersion = shell.exec("python --version", { silent: true }).stdout.trim() ||
    shell.exec("python3 --version", { silent: true }).stdout.trim() ||
    "Python not found";

  const osInfo = {
    type: os.type(),
    platform: process.platform,
    release: os.release(),
    version: os.version(),
    arch: process.arch,
    cpus: os.cpus().map(cpu => ({
      model: cpu.model,
      speed: cpu.speed,
    })),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
  };

  let shellInfo = {
    type: "Unknown",
    version: "N/A",
  };

  if (process.platform === "win32") {
    // Try to get cmd.exe version
    const cmdVersionResult = shell.exec("cmd.exe /c ver", { silent: true });
    if (cmdVersionResult.code === 0 && cmdVersionResult.stdout.trim()) {
      shellInfo.type = "cmd.exe";
      shellInfo.version = cmdVersionResult.stdout.trim();
    } else {
      // Try to get PowerShell version
      const psVersionResult = shell.exec("powershell -Command \"$PSVersionTable.PSVersion.ToString()\"", { silent: true });
      if (psVersionResult.code === 0 && psVersionResult.stdout.trim()) {
        shellInfo.type = "PowerShell";
        shellInfo.version = psVersionResult.stdout.trim();
      }
    }
  } else {
    const shellPath = shell.exec("echo $SHELL", { silent: true }).stdout.trim();
    if (shellPath) {
      shellInfo.type = shellPath;
      const shellVersionResult = shell.exec(`${shellPath} --version`, { silent: true });
      if (shellVersionResult.code === 0 && shellVersionResult.stdout.trim()) {
        shellInfo.version = shellVersionResult.stdout.trim().split('\n')[0]; // Take the first line for version
      }
    }
  }

  return {
    runtimes: {
      node: {
        version: nodeVersion,
        execPath: process.execPath,
        features: process.features,
      },
      python: {
        version: pythonVersion,
      },
    },
    os: osInfo,
    shell: shellInfo,
    env: process.env,
  };
};

// Shell command input schema with working directory and environment variables
const ExecuteCommandSchema = z.object({
  workingDirectory: z.string().describe("Working directory for command execution"),
  command: z.string().describe("Shell command to execute"),
  args: z.array(z.string()).describe("Command arguments").optional(),
  env: z.record(z.string()).describe("Environment variables to set").optional(),
});

// File operation schemas with working directory
const FileOperationSchema = z.object({
  workingDirectory: z.string().describe("Working directory for file operation"),
  path: z.string().describe("File path"),
});

const CopyFileSchema = z.object({
  workingDirectory: z.string().describe("Working directory for file operation"),
  source: z.string().describe("Source file path"),
  destination: z.string().describe("Destination file path"),
});

const MoveFileSchema = z.object({
  workingDirectory: z.string().describe("Working directory for file operation"),
  source: z.string().describe("Source file path"),
  destination: z.string().describe("Destination file path"),
});

// Directory operation schema with working directory
const DirectoryOperationSchema = z.object({
  workingDirectory: z.string().describe("Working directory for directory operation"),
  path: z.string().describe("Directory path"),
});

// Path validation schema
const PathValidationSchema = z.object({
  targetPath: z.string().describe("Target path to validate"),
  workingDirectory: z.string().describe("Current working directory"),
});

// Available tool names
enum ToolName {
  VALIDATE_PATH = "validatePath",
  EXECUTE_COMMAND = "executeCommand",
  READ_FILE = "readFile",
  WRITE_FILE = "writeFile",
  COPY_FILE = "copyFile",
  MOVE_FILE = "moveFile",
  DELETE_FILE = "deleteFile",
  CREATE_DIRECTORY = "createDirectory",
  REMOVE_DIRECTORY = "removeDirectory",
  LIST_DIRECTORY = "listDirectory",
  GET_SYSTEM_INFO = "getSystemInfo",
}

// Error handling function
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
  return {
    content: [
      {
        type: "text",
        text: "An unknown error occurred",
      },
    ],
  };
};

// Result wrapper function
const wrapResult = (success: boolean, message: string, data?: any) => {
  const result = {
    success,
    message,
    ...(data && { data }),
  };
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
};

// Build environment variables command
const buildEnvCommand = (env: Record<string, string> = {}) => {
  const envPairs = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  return envPairs.length > 0 ? `npx cross-env ${envPairs.join(" ")}` : "";
};

class PathValidator {
  private readonly allowedPaths: string[];

  constructor(allowedPaths: string[]) {
    // Normalize all allowed paths to absolute paths
    this.allowedPaths = allowedPaths.map(p => path.resolve(p));
  }

  // Get allowed paths
  getAllowedPaths(): string[] {
    return [...this.allowedPaths];
  }

  // Check if a path is within allowed directories
  validatePath(targetPath: string, workingDirectory: string): {
    isValid: boolean;
    absolutePath: string;
    error?: string;
  } {
    try {
      // Normalize paths
      const absoluteWorkingDir = path.resolve(workingDirectory);
      const absoluteTargetPath = path.resolve(absoluteWorkingDir, targetPath);

      // Check if path is under working directory
      if (!absoluteTargetPath.startsWith(absoluteWorkingDir)) {
        return {
          isValid: false,
          absolutePath: absoluteTargetPath,
          error: `Path must be within working directory: ${absoluteWorkingDir}`,
        };
      }

      // Check if path is under any allowed directory
      const isUnderAllowedPath = this.allowedPaths.some(allowedPath =>
        absoluteTargetPath.startsWith(allowedPath)
      );

      if (!isUnderAllowedPath) {
        return {
          isValid: false,
          absolutePath: absoluteTargetPath,
          error: `Path must be within allowed directories: ${this.allowedPaths.join(", ")}`,
        };
      }

      return {
        isValid: true,
        absolutePath: absoluteTargetPath,
      };
    } catch (error) {
      return {
        isValid: false,
        absolutePath: targetPath,
        error: `Invalid path: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  // Validate multiple paths
  validatePaths(paths: string[], workingDirectory: string): {
    isValid: boolean;
    results: { path: string; isValid: boolean; error?: string }[];
  } {
    const results = paths.map(p => {
      const result = this.validatePath(p, workingDirectory);
      return {
        path: p,
        isValid: result.isValid,
        error: result.error,
      };
    });

    return {
      isValid: results.every(r => r.isValid),
      results,
    };
  }
}

export const createServer = (allowedPaths: string[]) => {
  const pathValidator = new PathValidator(allowedPaths);

  const server = new Server(
    {
      name: "mcp-shell",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tool list request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = [
      {
        name: ToolName.VALIDATE_PATH,
        description: "Validate if a path is within allowed directories",
        inputSchema: zodToJsonSchema(PathValidationSchema) as ToolInput,
      },
      {
        name: ToolName.EXECUTE_COMMAND,
        description: "Execute a shell command with environment variables support. All paths in command must be validated first.",
        inputSchema: zodToJsonSchema(ExecuteCommandSchema) as ToolInput,
      },
      {
        name: ToolName.READ_FILE,
        description: "Read file content. Path must be validated first.",
        inputSchema: zodToJsonSchema(FileOperationSchema) as ToolInput,
      },
      {
        name: ToolName.WRITE_FILE,
        description: "Write content to file. Path must be validated first.",
        inputSchema: zodToJsonSchema(
          FileOperationSchema.extend({
            content: z.string().describe("Content to write"),
          })
        ) as ToolInput,
      },
      {
        name: ToolName.COPY_FILE,
        description: "Copy a file. Both paths must be validated first.",
        inputSchema: zodToJsonSchema(CopyFileSchema) as ToolInput,
      },
      {
        name: ToolName.MOVE_FILE,
        description: "Move a file. Both paths must be validated first.",
        inputSchema: zodToJsonSchema(MoveFileSchema) as ToolInput,
      },
      {
        name: ToolName.DELETE_FILE,
        description: "Delete a file. Path must be validated first.",
        inputSchema: zodToJsonSchema(FileOperationSchema) as ToolInput,
      },
      {
        name: ToolName.CREATE_DIRECTORY,
        description: "Create a directory. Path must be validated first.",
        inputSchema: zodToJsonSchema(DirectoryOperationSchema) as ToolInput,
      },
      {
        name: ToolName.REMOVE_DIRECTORY,
        description: "Remove a directory. Path must be validated first.",
        inputSchema: zodToJsonSchema(DirectoryOperationSchema) as ToolInput,
      },
      {
        name: ToolName.LIST_DIRECTORY,
        description: "List directory contents. Path must be validated first.",
        inputSchema: zodToJsonSchema(DirectoryOperationSchema) as ToolInput,
      },
      {
        name: ToolName.GET_SYSTEM_INFO,
        description: "Get detailed system information including Node.js, Python versions, OS info, and allowed paths",
        inputSchema: zodToJsonSchema(z.object({})) as ToolInput,
      },
    ];

    return { tools };
  });

  // Handle tool call request
  // Helper function to quote arguments if necessary, especially for Windows compatibility
  const quoteArgIfNeeded = (arg: string): string => {
    // Check if quoting is needed: contains space and not already quoted
    if (arg.includes(' ') && !(arg.startsWith('"') && arg.endsWith('"'))) {
      // Escape inner quotes by doubling them (for cmd.exe), then wrap in quotes
      return `"${arg.replace(/"/g, '""')}"`;
    }
    return arg; // Return as is if no quoting needed
  };

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === ToolName.VALIDATE_PATH) {
        const validatedArgs = PathValidationSchema.parse(args);
        const result = pathValidator.validatePath(
          validatedArgs.targetPath,
          validatedArgs.workingDirectory
        );
        return wrapResult(result.isValid, result.isValid ?
          "Path validation successful" :
          `Path validation failed: ${result.error}`,
          result
        );
      }

      // IMPORTANT FOR WINDOWS COMPATIBILITY:
      // Thoroughly test command execution on a Windows environment,
      // especially with commands, paths, and arguments containing spaces.
      // While quoting has been implemented, Windows shell (cmd.exe) behavior
      // can have subtleties.
      if (name === ToolName.EXECUTE_COMMAND) {
        const validatedArgs = ExecuteCommandSchema.parse(args);
        const { workingDirectory, command, args: commandArgs = [], env = {} } = validatedArgs;

        // Validate working directory
        const workingDirValidation = pathValidator.validatePath(
          workingDirectory,
          process.cwd()
        );

        if (!workingDirValidation.isValid) {
          throw new Error(`Working directory validation failed: ${workingDirValidation.error}`);
        }

        // Build command with environment variables using cross-env
        const envCommand = buildEnvCommand(env);
        // Process arguments for safe execution
        const processedCommandArgs = commandArgs.map(quoteArgIfNeeded).join(" ");
        // The command variable itself is enclosed in double quotes as per instruction.
        const fullCommand = `cd "${workingDirValidation.absolutePath}" && ${envCommand} "${command}" ${processedCommandArgs}`;

        // Execute command
        const result = shell.exec(fullCommand, { silent: true });

        return wrapResult(
          result.code === 0,
          result.code === 0 ? "Command executed successfully" : "Command execution failed",
          {
            stdout: result.stdout,
            stderr: result.stderr,
            code: result.code,
            command: fullCommand,
            env,
          }
        );
      }

      if (name === ToolName.READ_FILE) {
        const validatedArgs = FileOperationSchema.parse(args);
        const pathValidation = pathValidator.validatePath(
          validatedArgs.path,
          validatedArgs.workingDirectory
        );

        if (!pathValidation.isValid) {
          throw new Error(pathValidation.error);
        }

        if (!shell.test("-f", pathValidation.absolutePath)) {
          throw new Error("File does not exist");
        }

        const content = shell.cat(pathValidation.absolutePath);
        return wrapResult(true, "File read successfully", { content });
      }

      if (name === ToolName.WRITE_FILE) {
        const validatedArgs = FileOperationSchema.extend({
          content: z.string(),
        }).parse(args);

        const pathValidation = pathValidator.validatePath(
          validatedArgs.path,
          validatedArgs.workingDirectory
        );

        if (!pathValidation.isValid) {
          throw new Error(pathValidation.error);
        }

        shell.ShellString(validatedArgs.content).to(pathValidation.absolutePath);
        return wrapResult(true, "File written successfully");
      }

      if (name === ToolName.COPY_FILE) {
        const validatedArgs = CopyFileSchema.parse(args);

        const sourceValidation = pathValidator.validatePath(
          validatedArgs.source,
          validatedArgs.workingDirectory
        );
        const destValidation = pathValidator.validatePath(
          validatedArgs.destination,
          validatedArgs.workingDirectory
        );

        if (!sourceValidation.isValid) {
          throw new Error(`Source: ${sourceValidation.error}`);
        }
        if (!destValidation.isValid) {
          throw new Error(`Destination: ${destValidation.error}`);
        }

        if (!shell.test("-f", sourceValidation.absolutePath)) {
          throw new Error("Source file does not exist");
        }

        const result = shell.cp(sourceValidation.absolutePath, destValidation.absolutePath);
        return wrapResult(result.code === 0, "File copied successfully");
      }

      if (name === ToolName.MOVE_FILE) {
        const validatedArgs = MoveFileSchema.parse(args);

        const sourceValidation = pathValidator.validatePath(
          validatedArgs.source,
          validatedArgs.workingDirectory
        );
        const destValidation = pathValidator.validatePath(
          validatedArgs.destination,
          validatedArgs.workingDirectory
        );

        if (!sourceValidation.isValid) {
          throw new Error(`Source: ${sourceValidation.error}`);
        }
        if (!destValidation.isValid) {
          throw new Error(`Destination: ${destValidation.error}`);
        }

        if (!shell.test("-f", sourceValidation.absolutePath)) {
          throw new Error("Source file does not exist");
        }

        const result = shell.mv(sourceValidation.absolutePath, destValidation.absolutePath);
        return wrapResult(result.code === 0, "File moved successfully");
      }

      if (name === ToolName.DELETE_FILE) {
        const validatedArgs = FileOperationSchema.parse(args);

        const pathValidation = pathValidator.validatePath(
          validatedArgs.path,
          validatedArgs.workingDirectory
        );

        if (!pathValidation.isValid) {
          throw new Error(pathValidation.error);
        }

        if (!shell.test("-f", pathValidation.absolutePath)) {
          throw new Error("File does not exist");
        }

        const result = shell.rm(pathValidation.absolutePath);
        return wrapResult(result.code === 0, "File deleted successfully");
      }

      if (name === ToolName.CREATE_DIRECTORY) {
        const validatedArgs = DirectoryOperationSchema.parse(args);

        const pathValidation = pathValidator.validatePath(
          validatedArgs.path,
          validatedArgs.workingDirectory
        );

        if (!pathValidation.isValid) {
          throw new Error(pathValidation.error);
        }

        const result = shell.mkdir("-p", pathValidation.absolutePath);
        return wrapResult(result.code === 0, "Directory created successfully");
      }

      if (name === ToolName.REMOVE_DIRECTORY) {
        const validatedArgs = DirectoryOperationSchema.parse(args);

        const pathValidation = pathValidator.validatePath(
          validatedArgs.path,
          validatedArgs.workingDirectory
        );

        if (!pathValidation.isValid) {
          throw new Error(pathValidation.error);
        }

        if (!shell.test("-d", pathValidation.absolutePath)) {
          throw new Error("Directory does not exist");
        }

        const result = shell.rm("-rf", pathValidation.absolutePath);
        return wrapResult(result.code === 0, "Directory removed successfully");
      }

      if (name === ToolName.LIST_DIRECTORY) {
        const validatedArgs = DirectoryOperationSchema.parse(args);

        const pathValidation = pathValidator.validatePath(
          validatedArgs.path,
          validatedArgs.workingDirectory
        );

        if (!pathValidation.isValid) {
          throw new Error(pathValidation.error);
        }

        if (!shell.test("-d", pathValidation.absolutePath)) {
          throw new Error("Directory does not exist");
        }

        const files = shell.ls(pathValidation.absolutePath);
        return wrapResult(true, "Directory listing retrieved successfully", { files });
      }

      if (name === ToolName.GET_SYSTEM_INFO) {
        const systemInfo = getDetailedSystemInfo();
        return wrapResult(true, "System information retrieved successfully", {
          ...systemInfo,
          security: {
            allowedPaths: pathValidator.getAllowedPaths(),
          },
        });
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      return handleError(error);
    }
  });

  return { server };
};
