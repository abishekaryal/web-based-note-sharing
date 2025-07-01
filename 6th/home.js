// DOM Elements
const elements = {
  notesContainer: document.getElementById('notesContainer'),
  searchInput: document.getElementById('searchInput'),
  addNoteBtn: document.getElementById('addNoteBtn'),
  emptyAddNoteBtn: document.getElementById('emptyAddNoteBtn'),
  addFolderBtn: document.getElementById('addFolderBtn'),
  noteModal: document.getElementById('noteModal'),
  folderModal: document.getElementById('folderModal'),
  closeNoteModal: document.getElementById('closeNoteModal'),
  closeFolderModal: document.getElementById('closeFolderModal'),
  cancelNoteBtn: document.getElementById('cancelNoteBtn'),
  cancelFolderBtn: document.getElementById('cancelFolderBtn'),
  noteForm: document.getElementById('noteForm'),
  folderForm: document.getElementById('folderForm'),
  noteTitle: document.getElementById('noteTitle'),
  noteContent: document.getElementById('noteContent'),
  noteFolder: document.getElementById('noteFolder'),
  folderName: document.getElementById('folderName'),
  fileUpload: document.getElementById('fileUpload'),
  folderList: document.getElementById('folderList')
};

// App State
const state = {
  notes: [],
  folders: [],
  activeFolder: "all",
  searchQuery: "",
  currentFile: null,
  editingNoteId: null,
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};

// Initialize the app
function initApp() {
  loadData();
  initEventListeners();
  render();
}

// Data Management
function loadData() {
  const savedNotes = localStorage.getItem('notes');
  const savedFolders = localStorage.getItem('folders');
  
  if (savedNotes) state.notes = JSON.parse(savedNotes);
  if (savedFolders) state.folders = JSON.parse(savedFolders);
  
  if (state.notes.length === 0) {
    addNote("Welcome to NotesFlow", "This is your first note. You can edit or delete it.", "General");
  }
}

function saveData() {
  localStorage.setItem('notes', JSON.stringify(state.notes));
  localStorage.setItem('folders', JSON.stringify(state.folders));
}

// Rendering Functions
function render() {
  renderNotes();
  renderFolders();
  renderFolderOptions();
}

function renderNotes() {
  const filteredNotes = getFilteredNotes();
  
  if (filteredNotes.length === 0) {
    elements.notesContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book"></i>
        <h3>No Notes Found</h3>
        <p>Try changing your search or add a new note</p>
        <button id="emptyAddNoteBtn" class="btn primary">
          <i class="fas fa-plus"></i>
          <span>Add Note</span>
        </button>
      </div>
    `;
    // Re-bind the empty state button
    document.getElementById('emptyAddNoteBtn')?.addEventListener('click', openNoteModal);
    return;
  }
  
  elements.notesContainer.innerHTML = filteredNotes.map(note => `
    <div class="note-card" data-id="${note.id}">
      <div class="note-header">
        <h3 class="note-title">${note.title}</h3>
      </div>
      ${note.content ? `<p class="note-content">${note.content}</p>` : ''}
      ${note.file ? renderFileAttachment(note.file) : ''}
      <div class="note-footer">
        <span class="note-date">${note.date}</span>
        <div class="note-actions">
          <button class="action-btn edit-btn" data-id="${note.id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" data-id="${note.id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderFileAttachment(file) {
  return `
    <a href="${file.url}" class="file-attachment" download="${file.name}">
      <i class="fas fa-file file-icon"></i>
      <div class="file-details">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
      </div>
      <span class="download-btn">Download</span>
    </a>
  `;
}

function renderFolders() {
  elements.folderList.innerHTML = `
    <li class="${state.activeFolder === 'all' ? 'active' : ''}" data-folder="all">
      <i class="fas fa-inbox"></i>
      <span>All Notes</span>
    </li>
    ${state.folders.map(folder => `
      <li class="${state.activeFolder === folder ? 'active' : ''}" data-folder="${folder}">
        <i class="fas fa-folder"></i>
        <span>${folder}</span>
        <button class="delete-folder-btn" data-folder="${folder}" title="Delete Folder">
          <i class="fas fa-trash-alt"></i>
        </button>
      </li>
    `).join('')}
  `;
}

function renderFolderOptions() {
  elements.noteFolder.innerHTML = state.folders.map(folder => `
    <option value="${folder}">${folder}</option>
  `).join('');
}

// Helper Functions
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

function getFilteredNotes() {
  return state.notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                        (note.content && note.content.toLowerCase().includes(state.searchQuery.toLowerCase()));
    const matchesFolder = state.activeFolder === "all" || note.folder === state.activeFolder;
    return matchesSearch && matchesFolder;
  });
}

// Core Functions
function addNote(title, content, folder, file = null) {
  if (!file) {
    alert('Please attach a file to your note');
    return false;
  }

  const newNote = {
    id: Date.now(),
    title,
    content,
    folder,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    file: createFileObject(file)
  };
  
  state.notes.unshift(newNote);
  saveData();
  render();
  return true;
}

function updateNote(id, updatedFields) {
  if (!updatedFields.file && !state.notes.find(n => n.id === id).file) {
    alert('Please attach a file to your note');
    return false;
  }

  state.notes = state.notes.map(note => 
    note.id === id ? { ...note, ...updatedFields } : note
  );
  saveData();
  render();
  return true;
}

function deleteNote(id) {
  state.notes = state.notes.filter(note => note.id !== id);
  saveData();
  render();
}

function addFolder(name) {
  const folderName = name.trim();
  if (folderName && !state.folders.includes(folderName)) {
    state.folders.push(folderName);
    saveData();
    renderFolders();
    renderFolderOptions();
    return true;
  }
  return false;
}

function deleteFolder(folderName) {
  state.folders = state.folders.filter(folder => folder !== folderName);
  state.notes = state.notes.filter(note => note.folder !== folderName);
  if (state.activeFolder === folderName) {
    state.activeFolder = "all";
  }
  saveData();
  render();
}

function handleFileUpload(file) {
  return new Promise((resolve, reject) => {
    if (file.size > state.MAX_FILE_SIZE) {
      reject("File size exceeds 5MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        data: e.target.result.split(',')[1]
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function createFileObject(fileData) {
  return {
    name: fileData.name,
    type: fileData.type,
    size: fileData.size,
    url: `data:${fileData.type};base64,${fileData.data}`
  };
}

// Modal Functions
function openNoteModal() {
  resetNoteForm();
  elements.noteModal.style.display = 'flex';
}

function openFolderModal() {
  elements.folderForm.reset();
  elements.folderModal.style.display = 'flex';
}

function closeModals() {
  elements.noteModal.style.display = 'none';
  elements.folderModal.style.display = 'none';
  resetNoteForm();
}

function resetNoteForm() {
  elements.noteForm.reset();
  elements.fileUpload.value = '';
  state.currentFile = null;
  state.editingNoteId = null;
  document.querySelector('.file-preview')?.remove();
}

function handleEditNote(noteId) {
  const note = state.notes.find(n => n.id === noteId);
  if (note) {
    elements.noteTitle.value = note.title;
    elements.noteContent.value = note.content || '';
    elements.noteFolder.value = note.folder || '';
    
    if (note.file) {
      state.currentFile = {
        name: note.file.name,
        type: note.file.type,
        size: note.file.size,
        data: note.file.url.split(',')[1]
      };
      showFilePreview(note.file);
    }
    
    state.editingNoteId = noteId;
    elements.noteModal.style.display = 'flex';
  }
}

function showFilePreview(file) {
  const filePreview = document.createElement('div');
  filePreview.className = 'file-preview';
  filePreview.innerHTML = `
    <div class="file-info">
      <i class="fas fa-file"></i>
      <span>${file.name}</span>
      <button class="remove-file" type="button">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  elements.fileUpload.parentNode.insertBefore(filePreview, elements.fileUpload.nextSibling);
  
  filePreview.querySelector('.remove-file').addEventListener('click', () => {
    state.currentFile = null;
    elements.fileUpload.value = '';
    filePreview.remove();
  });
}

// Event Handlers
function initEventListeners() {
  // Search functionality
  elements.searchInput.addEventListener('input', () => {
    state.searchQuery = elements.searchInput.value;
    renderNotes();
  });

  // Add note buttons
  elements.addNoteBtn.addEventListener('click', openNoteModal);
  elements.emptyAddNoteBtn?.addEventListener('click', openNoteModal);

  // Add folder button
  elements.addFolderBtn.addEventListener('click', openFolderModal);

  // Modal close buttons
  elements.closeNoteModal.addEventListener('click', closeModals);
  elements.closeFolderModal.addEventListener('click', closeModals);
  elements.cancelNoteBtn.addEventListener('click', closeModals);
  elements.cancelFolderBtn.addEventListener('click', closeModals);

  // File upload handling
  elements.fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    document.querySelector('.file-preview')?.remove();

    handleFileUpload(file)
      .then(fileData => {
        state.currentFile = fileData;
        showFilePreview({
          name: fileData.name,
          type: fileData.type,
          size: fileData.size
        });
      })
      .catch(error => {
        alert(error);
        elements.fileUpload.value = '';
      });
  });

  // Note form submission
  elements.noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = elements.noteTitle.value.trim();
    const content = elements.noteContent.value.trim();
    const folder = elements.noteFolder.value || null;
    
    if (!title) {
      alert('Please enter a title for your note');
      return;
    }

    if (!state.currentFile) {
      alert('Please attach a file to your note');
      return;
    }

    if (state.editingNoteId) {
      updateNote(state.editingNoteId, { 
        title, 
        content: content || null, 
        folder,
        file: state.currentFile 
      });
    } else {
      addNote(title, content || null, folder, state.currentFile);
    }
    
    closeModals();
  });

  // Folder form submission
  elements.folderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const folderName = elements.folderName.value.trim();
    
    if (!folderName) {
      alert('Please enter a folder name');
      return;
    }

    if (addFolder(folderName)) {
      closeModals();
    } else {
      alert('Folder already exists or is invalid!');
    }
  });

  // Note actions (event delegation)
  elements.notesContainer.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    
    if (editBtn) {
      const noteId = parseInt(editBtn.dataset.id);
      handleEditNote(noteId);
    }
    
    if (deleteBtn) {
      const noteId = parseInt(deleteBtn.dataset.id);
      if (confirm('Are you sure you want to delete this note?')) {
        deleteNote(noteId);
      }
    }
  });

  // Folder selection
  elements.folderList.addEventListener('click', (e) => {
    const folderItem = e.target.closest('li');
    const deleteBtn = e.target.closest('.delete-folder-btn');

    if (deleteBtn) {
      const folderName = deleteBtn.dataset.folder;
      if (confirm(`Are you sure you want to delete the "${folderName}" folder and all its notes?`)) {
        deleteFolder(folderName);
      }
    } else if (folderItem) {
      state.activeFolder = folderItem.dataset.folder;
      render();
    }
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === elements.noteModal || e.target === elements.folderModal) {
      closeModals();
    }
  });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp);
