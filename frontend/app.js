/* ============================================================
   AI Knowledge Assistant — Application Logic
   ============================================================ */

// ╔══════════════════════════════════════════════════════════════╗
// ║  🔗  WEBHOOK URLs — Change these to your n8n endpoints      ║
// ╚══════════════════════════════════════════════════════════════╝

const UPLOAD_WEBHOOK_URL = "https://yash200006.app.n8n.cloud/webhook/upload";
const CHAT_WEBHOOK_URL   = "https://yash200006.app.n8n.cloud/webhook/chat"

// ============================================================

// ── Session ID (persists for the browser tab lifetime) ──
const SESSION_ID = crypto.randomUUID();

// ── State ──
let selectedFile = null;
let isUploading  = false;
let isSending    = false;
let chatHistory  = []; // { role: 'user'|'assistant', text: string, time: string }

// ── DOM References ──
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const sectionUpload   = $('#section-upload');
const sectionChat     = $('#section-chat');
const dropZone        = $('#drop-zone');
const fileInput       = $('#file-input');
const browseTrigger   = $('#browse-trigger');
const filePreview     = $('#file-preview');
const fileName        = $('#file-name');
const fileSize        = $('#file-size');
const fileRemove      = $('#file-remove');
const uploadProgress  = $('#upload-progress');
const progressFill    = $('#progress-fill');
const progressText    = $('#progress-text');
const uploadBtn       = $('#upload-btn');
const uploadStatus    = $('#upload-status');
const chatMessages    = $('#chat-messages');
const welcomeMsg      = $('#welcome-msg');
const typingIndicator = $('#typing-indicator');
const chatInput       = $('#chat-input');
const sendBtn         = $('#send-btn');
const clearChat       = $('#clear-chat');
const sessionLabel    = $('#session-label');
const toastContainer  = $('#toast-container');

// ============================================================
//  NAVIGATION — Tab Switching
// ============================================================

function switchSection(sectionName) {
  // Update sidebar nav
  $$('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionName);
  });

  // Update mobile nav
  $$('.mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionName);
  });

  // Show / hide sections
  sectionUpload.classList.toggle('active', sectionName === 'upload');
  sectionChat.classList.toggle('active', sectionName === 'chat');

  // Auto-focus chat input when switching to chat
  if (sectionName === 'chat') {
    setTimeout(() => chatInput.focus(), 100);
  }
}

// Sidebar nav clicks
$$('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchSection(btn.dataset.section));
});

// Mobile nav clicks
$$('.mobile-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchSection(btn.dataset.section));
});

// ============================================================
//  UPLOAD — Drag & Drop + File Picker
// ============================================================

// Click to browse
browseTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});

dropZone.addEventListener('click', () => fileInput.click());

// Drag events
['dragenter', 'dragover'].forEach(evt => {
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
});

['dragleave', 'drop'].forEach(evt => {
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
  });
});

dropZone.addEventListener('drop', (e) => {
  const files = e.dataTransfer.files;
  if (files.length > 0) handleFileSelect(files[0]);
});

// File input change
fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) handleFileSelect(fileInput.files[0]);
});

function handleFileSelect(file) {
  // Validate PDF
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    showToast('Only PDF files are accepted.', 'error');
    return;
  }

  selectedFile = file;

  // Show preview
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  filePreview.classList.remove('hidden');
  dropZone.classList.add('hidden');
  uploadBtn.disabled = false;

  // Clear previous status
  uploadStatus.classList.add('hidden');
}

// Remove file
fileRemove.addEventListener('click', () => {
  resetFileSelection();
});

function resetFileSelection() {
  selectedFile = null;
  fileInput.value = '';
  filePreview.classList.add('hidden');
  dropZone.classList.remove('hidden');
  uploadBtn.disabled = true;
  uploadProgress.classList.add('hidden');
  progressFill.style.width = '0%';
  uploadStatus.classList.add('hidden');
}

// ============================================================
//  UPLOAD — Send to n8n
// ============================================================

uploadBtn.addEventListener('click', uploadFile);

async function uploadFile() {
  if (!selectedFile || isUploading) return;

  isUploading = true;
  uploadBtn.disabled = true;
  uploadStatus.classList.add('hidden');
  uploadProgress.classList.remove('hidden');
  progressFill.style.width = '0%';
  progressText.textContent = 'Uploading…';

  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    // Simulate progress since fetch doesn't provide upload progress natively
    const progressInterval = simulateProgress();

    const response = await fetch(UPLOAD_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    clearInterval(progressInterval);
    progressFill.style.width = '100%';
    progressText.textContent = 'Processing…';

    if (response.ok) {
      // Short delay to show 100% before success message
      await delay(500);
      progressText.textContent = 'Complete!';
      showUploadStatus('success', '✓ PDF uploaded and indexed successfully! You can now ask questions in the Chat tab.');
      showToast('Document indexed successfully!', 'success');
    } else {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || `Server responded with status ${response.status}`);
    }
  } catch (err) {
    console.error('Upload error:', err);
    progressFill.style.width = '0%';
    uploadProgress.classList.add('hidden');

    const message = err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
      ? 'Could not connect to the server. Please check if the n8n workflow is active and try again.'
      : `Upload failed: ${err.message}`;

    showUploadStatus('error', message);
    showToast('Upload failed. Please try again.', 'error');
  } finally {
    isUploading = false;
    uploadBtn.disabled = !selectedFile;
  }
}

function simulateProgress() {
  let progress = 0;
  return setInterval(() => {
    progress += Math.random() * 12;
    if (progress > 90) progress = 90;
    progressFill.style.width = progress + '%';
    progressText.textContent = `Uploading… ${Math.round(progress)}%`;
  }, 300);
}

function showUploadStatus(type, message) {
  uploadStatus.className = `status-message ${type}`;
  uploadStatus.textContent = message;
  uploadStatus.classList.remove('hidden');
}

// ============================================================
//  CHAT — Message Handling
// ============================================================

// Auto-resize textarea
chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  sendBtn.disabled = chatInput.value.trim().length === 0;
});

// Send on Enter (Shift+Enter for newline)
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);
clearChat.addEventListener('click', clearChatHistory);

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isSending) return;

  // Hide welcome message
  if (welcomeMsg) welcomeMsg.classList.add('hidden');

  // Add user message
  addMessage('user', text);
  chatInput.value = '';
  chatInput.style.height = 'auto';
  sendBtn.disabled = true;

  // Show typing indicator
  isSending = true;
  typingIndicator.classList.remove('hidden');
  scrollToBottom();

  try {
    const response = await fetch(CHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: text,
        sessionId: SESSION_ID,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error (${response.status})`);
    }

    const data = await response.json();

    // Handle different possible response shapes from n8n
    const reply = data.output
      || data.response
      || data.text
      || data.message
      || data.answer
      || (typeof data === 'string' ? data : null)
      || 'Received a response, but could not extract the reply text.';

    addMessage('assistant', reply);

  } catch (err) {
    console.error('Chat error:', err);

    const errorMsg = err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
      ? 'Could not reach the AI server. Please make sure the n8n workflow is active.'
      : `Something went wrong: ${err.message}`;

    addMessage('assistant', errorMsg, true);
  } finally {
    isSending = false;
    typingIndicator.classList.add('hidden');
    scrollToBottom();
  }
}

function addMessage(role, text, isError = false) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  chatHistory.push({ role, text, time });

  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role}`;

  const avatarHTML = role === 'user'
    ? `<div class="avatar avatar-user">You</div>`
    : `<div class="avatar avatar-ai small">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
       </div>`;

  const bubbleClass = isError ? 'bubble error' : 'bubble';

  msgDiv.innerHTML = `
    ${avatarHTML}
    <div>
      <div class="${bubbleClass}">${escapeHTML(text)}</div>
      <div class="timestamp">${time}</div>
    </div>
  `;

  chatMessages.appendChild(msgDiv);
  scrollToBottom();
}

function clearChatHistory() {
  chatHistory = [];
  chatMessages.innerHTML = '';

  // Re-add welcome message
  const welcome = document.createElement('div');
  welcome.className = 'welcome-message';
  welcome.id = 'welcome-msg';
  welcome.innerHTML = `
    <div class="welcome-icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#grad2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#818cf8"/><stop offset="100%" style="stop-color:#c084fc"/></linearGradient></defs>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    </div>
    <h3>Welcome to AI Knowledge Assistant</h3>
    <p>Upload a PDF document first, then ask me anything about it. I'll answer based on the content of your uploaded document.</p>
  `;
  chatMessages.appendChild(welcome);

  showToast('Chat history cleared.', 'success');
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// ============================================================
//  UTILITIES
// ============================================================

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Toast notifications ──
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success'
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

  toast.innerHTML = icon + `<span>${escapeHTML(message)}</span>`;
  toastContainer.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── Session label ──
sessionLabel.textContent = `Session: ${SESSION_ID.slice(0, 8)}`;

// ── Prevent default drag behaviour on the whole page ──
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());
