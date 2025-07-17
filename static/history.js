const API_URL = '/api/scripts';

async function deleteScript(id) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  loadHistory();
}

async function loadHistory(filter = '') {
  const res = await fetch(API_URL);
  const scripts = await res.json();
  const scriptsDiv = document.getElementById('scripts');
  scriptsDiv.innerHTML = '';
  scripts.reverse().forEach(script => {
    // Prepare brief content (max 10 words)
    const words = script.content.split(/\s+/).filter(Boolean);
    const briefContent = words.slice(0, 10).join(' ') + (words.length > 10 ? '...' : '');
    // Prepare up to 2 file names
    const fileNames = (script.files || []).slice(0, 2).map(f => f.split('/').pop());
    // Prepare search string
    const searchString = [script.title, script.content, ...(script.files || []).map(f => f.split('/').pop())].join(' ').toLowerCase();
    if (filter && !searchString.includes(filter.toLowerCase())) return;
    // Card layout
    const card = document.createElement('div');
    card.className = 'card shadow-sm p-3 mb-3';
    card.style.minHeight = '120px';
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="mb-0 text-primary">${script.title}</h5>
        <button class="btn btn-danger btn-sm" data-id="${script.id}">Delete</button>
      </div>
      <div class="mb-2 text-muted" style="font-size: 0.95em;">${briefContent}</div>
      <div class="mb-2">
        ${fileNames.map(name => `<span class='badge bg-secondary me-1'>${name}</span>`).join('')}
      </div>
      <button class="btn btn-outline-primary btn-sm mt-1" data-view="${script.id}">View/Edit</button>
    `;
    // Delete button
    card.querySelector('[data-id]').onclick = () => deleteScript(script.id);
    // View/Edit button
    card.querySelector('[data-view]').onclick = () => {
      window.location.href = `/?id=${script.id}`;
    };
    scriptsDiv.appendChild(card);
  });
}

// Search bar event
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    loadHistory(e.target.value);
  });
}

loadHistory(); 