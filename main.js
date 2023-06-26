const {
  app, BrowserWindow,
  ipcMain,
  dialog
} = require('electron')
const axios = require('axios');  // 你需要先使用 npm install axios 安装这个库

const fs = require('fs');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        title: 'Coder Helper',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
});

ipcMain.on('change-tab', (event, tabName) => {
    fs.readFile(path.join(__dirname, `html/${tabName}.html`), 'utf-8', (err, data) => {
        if (err) {
            console.error(`Failed to load tab ${tabName}: ${err.message}`);
            return;
        }

        event.sender.send('load-content', tabName, data);
    });
});

let isDialogOpen = false;
ipcMain.on('open-file-dialog', (event) => {
    // Prevent multiple dialogs.
    if (isDialogOpen) {
        return;
    }
    isDialogOpen = true;
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }]
    }).then(result => {
        // Reset the flag.
        isDialogOpen = false;

        if (!result.canceled) {
            fs.readFile(result.filePaths[0], (err, data) => {
                if (err) {
                    console.error(`Failed to read file ${result.filePaths[0]}: ${err.message}`);
                    return;
                }

                const base64Image = `data:image/jpeg;base64,${data.toString('base64')}`;
                event.sender.send('selected-file', base64Image);
            });
        }
    }).catch(err => {
        console.error(err);
    });
});

// 接收渲染进程的消息
ipcMain.on('query', (event, data) => {
    // 发送 HTTP 请求到 Python 后端
    axios.post('http://127.0.0.1:8900/query', data)
        .then(response => {
            // 将答案发送回渲染进程
            event.reply('query-reply', response.data.answer);
        })
        .catch(error => {
            console.log('Error:', error);
        });
});