// ... 其他代碼保持不變 ...

  // 刪除檔案/目錄
  server.setToolHandler({
    name: 'remove',
    description: '刪除檔案或目錄',
    parameters: {
      path: {
        type: 'string',
        description: '要刪除的路徑'
      },
      recursive: {
        type: 'boolean',
        description: '若為目錄，是否递歷刪除其中的所有子目錄和檔案',
        optional: true,
        default: false
      },
      force: {
        type: 'boolean',
        description: '是否強制刪除，不問是否為唯讀或空目錄',
        optional: true,
        default: false
      }
    }
  }, async (params) => {
    try {
      const safePath = validator.validateWorkingDirectory(params.path);
      
      // 檢查路徑是否存在
      if (!shell.test('-e', safePath)) {
        throw new Error(`路徑不存在: ${safePath}`);
      }

      // 檢查是否為目錄
      const isDirectory = shell.test('-d', safePath);
      
      if (isDirectory) {
        // 如果是目錄
        if (!params.recursive) {
          // 檢查目錄是否為空
          const contents = shell.ls(safePath);
          if (contents.length > 0) {
            throw new Error(`目錄非空，需要指定 recursive: true 來刪除非空目錄: ${safePath}`);
          }
          
          // 刪除空目錄
          const result = shell.rm('-d', safePath);
          if (result.code !== 0) {
            throw new Error(`刪除目錄失敗: ${result.stderr}`);
          }
        } else {
          // 递歷刪除目錄及其內容
          let options = '-r';
          if (params.force) options += 'f';
          
          // 在刪除之前先列出所有將被刪除的檔案
          const filesToDelete = shell.find(safePath);
          
          const result = shell.rm(options, safePath);
          if (result.code !== 0) {
            throw new Error(`刪除目錄失敗: ${result.stderr}`);
          }

          // 回傳被刪除的檔案列表
          return {
            type: 'application/json',
            text: JSON.stringify({
              status: '刪除成功',
              path: safePath,
              type: '目錄',
              filesDeleted: filesToDelete.length,
              files: filesToDelete
            })
          };
        }
      } else {
        // 如果是檔案
        let options = '';
        if (params.force) options = '-f';
        
        const result = shell.rm(options, safePath);
        if (result.code !== 0) {
          throw new Error(`刪除檔案失敗: ${result.stderr}`);
        }
      }

      // 一般刪除成功的回傳
      return {
        type: 'application/json',
        text: JSON.stringify({
          status: '刪除成功',
          path: safePath,
          type: isDirectory ? '目錄' : '檔案'
        })
      };
    } catch (error) {
      throw error;
    }
  });

// ... 其他代碼保持不變 ...