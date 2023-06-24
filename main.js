const {
  app, BrowserWindow,
  ipcMain,
  dialog
} = require('electron')
const fs = require('fs');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        title: 'IELTS HELPER',
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

        event.sender.send('load-content', data);
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
