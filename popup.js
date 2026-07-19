document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const messageQueue = document.getElementById('messageQueue');
  const customDelay = document.getElementById('customDelay');
  const liveTicker = document.getElementById('liveTicker');
  const toastNotice = document.getElementById('toastNotice');
  const creditsBtn = document.getElementById('creditsBtn');
  const fileBtn = document.getElementById('fileBtn');
  const fileInput = document.getElementById('fileInput');

  let tickerInterval;

  // Human-styled status loop text
  const tickerPhrases = [
    "Waiting for your command",
    "Format: 1> Your text here",
    "Kabir Insta Ruler Engine online",
    "Ready to send messages..."
  ];
  let tickerIndex = 0;

  function startTickerLoop() {
    clearInterval(tickerInterval);
    tickerInterval = setInterval(() => {
      liveTicker.textContent = tickerPhrases[tickerIndex];
      tickerIndex = (tickerIndex + 1) % tickerPhrases.length;
    }, 3500);
  }
  startTickerLoop();

  function triggerToast(text, isAlert = false) {
    toastNotice.textContent = text;
    toastNotice.style.borderBottomColor = isAlert ? '#FF6464' : '#64FF64';
    toastNotice.style.color = isAlert ? '#FF6464' : '#64FF64';
    toastNotice.style.display = 'block';
    setTimeout(() => {
      toastNotice.style.display = 'none';
    }, 2500);
  }

  // Launches target URL in a new window tab
  creditsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.instagram.com/arjuniscoolll/' });
  });

  // Triggers hidden native browser file selector UI
  fileBtn.addEventListener('click', () => {
    fileInput.click();
  });

  // Handles text file input conversion
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      messageQueue.value = e.target.result;
      triggerToast("📁 File loaded");
    };
    reader.readAsText(file);
  });

  startBtn.addEventListener('click', async () => {
    const rawText = messageQueue.value.trim();
    if (!rawText) {
      triggerToast("❌ Type or upload messages first", true);
      return;
    }

    const parseRegex = /^\d+\s*>\s*(.+)$/mg;
    let parsedMessages = [];
    let match;

    while ((match = parseRegex.exec(rawText)) !== null) {
      if (match[1] && match[1].trim()) {
        parsedMessages.push(match[1].trim());
      }
    }

    if (parsedMessages.length === 0) {
      triggerToast("❌ Check your text format", true);
      return;
    }

    const delaySeconds = parseInt(customDelay.value, 10) || 600;

    startBtn.className = "action-btn btn-on";
    startBtn.innerHTML = "🟢 Running";
    clearInterval(tickerInterval);
    liveTicker.textContent = `Sending ${parsedMessages.length} messages...`;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url.includes("instagram.com")) {
      triggerToast("❌ Please open an Instagram chat page", true);
      resetUIState();
      return;
    }

    triggerToast("🚀 Starting now");

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: runInstagramAutomation,
      args: [parsedMessages, delaySeconds]
    });
  });

  stopBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: stopInstagramAutomation
      });
    }
    triggerToast("🛑 Stopped successfully", true);
    resetUIState();
  });

  function resetUIState() {
    startBtn.className = "action-btn btn-off";
    startBtn.innerHTML = "▶️ Start";
    startTickerLoop();
  }
});

function runInstagramAutomation(messages, delaySeconds) {
  if (window.vanguardTimerInstance) {
    clearInterval(window.vanguardTimerInstance);
  }
  
  window.vanguardIsActive = true;
  let currentPointer = 0;

  function dispatchPayload() {
    if (!window.vanguardIsActive) return;

    const textNode = document.querySelector('div[role="textbox"][contenteditable="true"]') || 
                     document.querySelector('textarea');
                     
    if (!textNode) {
      return;
    }

    const currentMsg = messages[currentPointer];
    
    textNode.focus();
    document.execCommand('insertText', false, currentMsg);
    
    textNode.dispatchEvent(new Event('change', { bubbles: true }));
    textNode.dispatchEvent(new Event('input', { bubbles: true }));

    setTimeout(() => {
      const actionButtons = Array.from(document.querySelectorAll('button, span[role="button"]'));
      const sendActionElement = actionButtons.find(btn => 
        btn.textContent.trim().toLowerCase() === 'send' || 
        btn.innerText.trim().toLowerCase() === 'send'
      );

      if (sendActionElement) {
        sendActionElement.click();
        currentPointer = (currentPointer + 1) % messages.length;
      } else {
        const enterKeyPress = new KeyboardEvent('keydown', {
          key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true
        });
        textNode.dispatchEvent(enterKeyPress);
        currentPointer = (currentPointer + 1) % messages.length;
      }
    }, 300);
  }

  dispatchPayload();
  window.vanguardTimerInstance = setInterval(dispatchPayload, delaySeconds * 1000);
}

function stopInstagramAutomation() {
  window.vanguardIsActive = false;
  if (window.vanguardTimerInstance) {
    clearInterval(window.vanguardTimerInstance);
    window.vanguardTimerInstance = null;
  }
}