const { app, BrowserWindow } = require('electron');
const path = require('path');
const { dialog, ipcMain } = require('electron')
const child_process = require('child_process');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
var mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

ipcMain.on('select-dirs', async (event, arg) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  var folder_path = result.filePaths[0];
  var { rpath, provider,gameName } = arg;
  console.log(folder_path, { rpath, provider });
  if (!(0 in result.filePaths)) {
    dialog.showErrorBox("Error", "A path should be selected.");
    return;
  }

  // var res = await rcloneLs(`${provider}:${rpath}`);
  // console.log(res);

  var src = `${provider}:${rpath}`;
  var config = path.join(__dirname, 'rclone.conf');

  var cmd = `${path.join(__dirname, 'rclone.exe')} copy -P "${src}" "${folder_path}\\${gameName}" --transfers 16 --config "${config}"`;
  console.log(cmd);
  run_script(path.join(__dirname, 'rclone.exe'), [ `copy -P "${src}" "${folder_path}\\${gameName}" --transfers 16 --config "${config}"`]);

})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


function run_script(command, args, callback) {
  var child = child_process.spawn(command, args, {
    encoding: 'utf8',
    shell: true,
    windowsHide:false,
    detached:true,

  });
  // You can also use a variable to save the output for when the script closes later
  child.on('error', (error) => {
    dialog.showMessageBox({
      title: 'Error',
      type: 'warning',
      message: 'Error occured.\r\n' + error
    });
  });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (data) => {
    //Here is the output
    data = data.toString();
    console.log(data);
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (data) => {
    // Return some data to the renderer process with the mainprocess-response ID
    mainWindow.webContents.send('mainprocess-response', data);
    //Here is the output from the command
    console.log(data);
  });

  child.on('close', (code) => {
    //Here you can get the exit code of the script  
    switch (code) {
      case 0:
        dialog.showMessageBox({
          title: 'Finished',
          type: 'info',
          message: 'Transfer Completed.\r\n'
        });
        break;
    }

  });
  if (typeof callback === 'function')
    callback();
}


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
