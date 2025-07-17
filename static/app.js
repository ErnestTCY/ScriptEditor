const API_URL = '/api/scripts';

// Utility: get query parameter
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

let editingId = getQueryParam('id');

// Populate form if editing
async function loadScriptForEdit() {
  if (!editingId) return;
  const res = await fetch(`${API_URL}/${editingId}`);
  if (!res.ok) return;
  const script = await res.json();
  document.getElementById('title').value = script.title;
  document.getElementById('content').value = script.content;
  // Note: Images cannot be pre-filled in file input for security reasons
  // Optionally, show existing files somewhere
  const preview = document.createElement('div');
  preview.className = 'flex flex-wrap gap-2 my-2';
  preview.innerHTML = script.files.map(file => {
    if (file.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
      return `<img src="${file}" class="img-thumbnail me-2 mb-2" style="width: 128px; height: 128px; object-fit: cover;" />`;
    } else {
      return `<a href="${file}" download class="me-2 mb-2">${file.split('/').pop()}</a>`;
    }
  }).join('');
  document.getElementById('scriptForm').appendChild(preview);
}

// Handle form submission
const form = document.getElementById('scriptForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const files = document.getElementById('files').files;

  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  if (editingId) {
    await fetch(`${API_URL}/${editingId}`, {
      method: 'PUT',
      body: formData
    });
    // After update, redirect to home (clear edit mode)
    window.location.href = '/';
  } else {
    await fetch(API_URL, {
      method: 'POST',
      body: formData
    });
    form.reset();
    loadScripts();
  }
});

// Clear All button logic
const clearAllBtn = document.getElementById('clearAll');
clearAllBtn.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('content').value = '';
  document.getElementById('files').value = '';
});

// Delete script
async function deleteScript(id) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  loadScripts();
}

// Load and display script titles only
async function loadScripts() {
  const res = await fetch(API_URL);
  const scripts = await res.json();
  const scriptsDiv = document.getElementById('scripts');
  scriptsDiv.innerHTML = '';
  scripts.reverse().forEach(script => {
    const wrapper = document.createElement('div');
    wrapper.className = 'd-flex align-items-center gap-2 bg-white rounded shadow px-3 py-2';
    const titleBtn = document.createElement('button');
    titleBtn.className = 'flex-fill text-start btn btn-link text-primary p-0';
    titleBtn.textContent = script.title;
    titleBtn.onclick = () => {
      window.location.href = `/?id=${script.id}`;
    };
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger btn-sm';
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => deleteScript(script.id);
    wrapper.appendChild(titleBtn);
    wrapper.appendChild(delBtn);
    scriptsDiv.appendChild(wrapper);
  });
}

// Initial load
loadScripts();
loadScriptForEdit(); 