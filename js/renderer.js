const { ipcRenderer } = require('electron');
      
function changeTab(tabName) {
  // Remove the active class from all tabs.
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.classList.remove('tab-active');
  });

  // Add the active class to the selected tab.
  const selectedTab = document.getElementById(`tab-${tabName}`);
  selectedTab.classList.add('tab-active');

  // Send the 'change-tab' event to main process.
  ipcRenderer.send('change-tab', tabName);
}

ipcRenderer.on('load-content', (event, content) => {
  document.getElementById('content').innerHTML = content;
});

document.getElementById('user-avatar').addEventListener('click', () => {
  ipcRenderer.send('open-file-dialog');
});

ipcRenderer.on('selected-file', (event, base64Image) => {
  document.getElementById('user-avatar').src = base64Image;
});
