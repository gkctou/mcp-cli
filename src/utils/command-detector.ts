// 預設的互動式命令清單
const INTERACTIVE_COMMANDS = new Set([
  'vim', 'vi', 'nano', 'emacs',  // 文字編輯器
  'top', 'htop',                  // 系統監控
  'mysql', 'psql', 'sqlite3',     // 數據庫管理工具
  'python', 'node', 'ruby',       // REPL 環境
  'ssh', 'telnet',                // 遠端連線
  'ftp', 'sftp',                  // 檔案傳輸
  'less', 'more'                  // 分頁顯示
]);

// 通常需要互動的命令參數
const INTERACTIVE_FLAGS = new Set([
  '-i', '--interactive',
  '-t', '--tty'
]);

/**
 * 檢查命令是否為互動式
 */
export function isInteractiveCommand(command: string): boolean {
  // 切分命令和參數
  const parts = command.trim().split(/\s+/);
  const mainCommand = parts[0];
  
  // 1. 檢查主要命令
  if (INTERACTIVE_COMMANDS.has(mainCommand)) {
    return true;
  }

  // 2. 如果是直接執行 python/node 檔案，不視為互動式
  if (['python', 'node', 'ruby'].includes(mainCommand) && parts.length > 1) {
    return false;
  }

  // 3. 檢查參數中是否包含互動標記
  return parts.some(part => INTERACTIVE_FLAGS.has(part));
}

/**
 * 分析命令的互動特性
 */
export function analyzeCommand(command: string): {
  isInteractive: boolean;
  reason?: string;
} {
  const parts = command.trim().split(/\s+/);
  const mainCommand = parts[0];

  if (INTERACTIVE_COMMANDS.has(mainCommand)) {
    return {
      isInteractive: true,
      reason: '命令為互動式工具'
    };
  }

  const interactiveFlag = parts.find(part => INTERACTIVE_FLAGS.has(part));
  if (interactiveFlag) {
    return {
      isInteractive: true,
      reason: `包含互動式參數: ${interactiveFlag}`
    };
  }

  return {
    isInteractive: false
  };
}
