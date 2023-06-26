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

ipcRenderer.on('load-content', (event, tabName, content) => {
  document.getElementById('content').innerHTML = content;

  // 如果切换到了 'home'，则绑定事件监听器
  if (tabName === 'home') {
    console.log("123");
    let queryButton = document.getElementById('query-btn');
    if (queryButton) {
      console.log("ok");
      queryButton.addEventListener('click', queryOpenAI);
    }
  }
});

document.getElementById('user-avatar').addEventListener('click', () => {
  ipcRenderer.send('open-file-dialog');
});

ipcRenderer.on('selected-file', (event, base64Image) => {
  document.getElementById('user-avatar').src = base64Image;
});

function queryOpenAI() {
  // 显示加载动画
  let waitProgress = document.getElementById('wait-progress');
  waitProgress.style.display = 'flex';

  // 从文本区域获取错误和描述
  let error = document.getElementById('error-details').value;
  let description = document.getElementById('description').value;
  // 将问题发送到主进程
  ipcRenderer.send('query', { error, description });
}


ipcRenderer.on('query-reply', (event, answer) => {
  // 隐藏加载动画
  let waitProgress = document.getElementById('wait-progress');
  waitProgress.style.display = 'none';

  document.getElementById('api-response').value = answer;
});

