const { ipcRenderer } = require('electron');
const { marked } = require('marked');

// 设置 marked 的选项（可选）
marked.setOptions({
  sanitize: true, // 如果设置为 true，将忽略 HTML 标签，以防止 XSS 攻击
  gfm: true, // 如果设置为 true，启用 GitHub 风格的 Markdown
  breaks: true, // 如果设置为 true，将 GFM 中的换行符转换为 <br> 标签
});

let isMarkdownPreview = false;


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

  // 如果切换到了 'home'，则绑定事件监听器.
  if (tabName === 'home') {
    // 绑定一个 queryOpenAI 函数到 'query-btn' 按钮.
    let queryButton = document.getElementById('query-btn');
    if (queryButton) {
      console.log("ok");
      queryButton.addEventListener('click', queryOpenAI);
    }

    // 绑定一个复制功能到 'copy-btn' 按钮.
    let copyButton = document.getElementById('copy-btn');
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        let answer = document.getElementById('api-response').value;
        navigator.clipboard.writeText(answer);
        // 显示消息提示已复制
        alert("已复制到剪贴板！");
      });
    }

    // 绑定一个 AcceptAndSave 函数到 'accept-btn' 按钮.
    let acceptButton = document.getElementById('accept-btn');
    if (acceptButton) {
      acceptButton.addEventListener('click', AcceptAndSave);
    }
  }

  // 如果切换到了 'markdownIt'，则绑定事件监听器.
  if (tabName === 'markdownIt') {
    // 绑定一个 markdownIt_openAI 函数到 'markdown-it-btn' 按钮.
    let markdownButton = document.getElementById('markdown-it-btn');
    if (markdownButton) {
      console.log("ok");
      markdownButton.addEventListener('click', markdownIt_openAI);
    }

    // 绑定一个复制功能到 'copy-btn' 按钮.
    let copyButton = document.getElementById('copy-btn');
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        let answer = document.getElementById('markdown-response').value;
        navigator.clipboard.writeText(answer);
        // 显示消息提示已复制
        alert("已复制到剪贴板！");
      });
    }

    // 绑定一个预览功能到 'preview-btn' 按钮.
    let previewButton = document.getElementById('preview-btn');
    if (previewButton) {
      previewButton.addEventListener('click', () => {
        let answer = document.getElementById('markdown-response').value;
        // 获取 markdown-preview 元素
        let markdownPreview = document.getElementById('markdown-preview');
        let markdownResponse = document.getElementById('markdown-response');
        if (!isMarkdownPreview){
          // 使用 marked 将 Markdown 文本转换为 HTML
          const htmlText = marked(answer);
          // 隐藏 markdown-response 元素
          markdownResponse.style.display = 'none';
          // 显示 markdown-preview 元素
          markdownPreview.style.display = 'block';

          // 将渲染后的 HTML 插入到 markdown-preview 元素中
          markdownPreview.innerHTML = htmlText;
          // 修改 previewButton 的文本
          previewButton.innerText = 'Back';
          previewButton.classList.remove('btn-success');
          previewButton.classList.add('btn-danger');
          // 设置 isMarkdownPreview 为 true
          isMarkdownPreview = true;
        }else {
          // 隐藏 markdown-preview 元素
          markdownPreview.style.display = 'none';
          // 显示 markdown-response 元素
          markdownResponse.style.display = 'block';
          // 修改 previewButton 的文本
          previewButton.innerText = 'Preview';
          previewButton.classList.remove('btn-danger');
          previewButton.classList.add('btn-success');
          // 设置 isMarkdownPreview 为 false
          isMarkdownPreview = false;
        }
        // ipcRenderer.send('preview', answer);
      });
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

// 用来把原始文件转化为 markdown 的函数 by OpenAI.
function markdownIt_openAI() {
  // 显示加载动画
  let waitProgress = document.getElementById('wait-progress');
  waitProgress.style.display = 'flex';

  // 从文本区域获取错误和描述
  let original = document.getElementById('original-text').value;
  // 将问题发送到主进程
  ipcRenderer.send('markdownIt', { original });
}

ipcRenderer.on('query-reply', (event, answer) => {
  // 隐藏加载动画
  let waitProgress = document.getElementById('wait-progress');
  waitProgress.style.display = 'none';

  document.getElementById('api-response').value = answer;
});

// 收到 markdownIt-reply 事件后，显示结果.
ipcRenderer.on('markdownIt-reply', (event, answer) => {
  // 隐藏加载动画
  let waitProgress = document.getElementById('wait-progress');
  waitProgress.style.display = 'none';

  document.getElementById('markdown-response').value = answer;
});

// 用来 Accept Response 的函数.
function AcceptAndSave() {
  let answer = document.getElementById('api-response').value;
  let error = document.getElementById('error-details').value;
  let description = document.getElementById('description').value;
  let data = { error, description, answer };
  ipcRenderer.send('accept-and-save', data);
}