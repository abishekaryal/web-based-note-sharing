// DOM Elements
const elements = {
  notesContainer: document.getElementById('notesContainer'),
  searchInput: document.getElementById('searchInput'),
  addNoteBtn: document.getElementById('addNoteBtn'),
  emptyAddNoteBtn: document.getElementById('emptyAddNoteBtn'),
  addCategoryBtn: document.getElementById('addCategoryBtn'),
  noteModal: document.getElementById('noteModal'),
  categoryModal: document.getElementById('categoryModal'),
  closeNoteModal: document.getElementById('closeNoteModal'),
  closeCategoryModal: document.getElementById('closeCategoryModal'),
  cancelNoteBtn: document.getElementById('cancelNoteBtn'),
  cancelCategoryBtn: document.getElementById('cancelCategoryBtn'),
  noteForm: document.getElementById('noteForm'),
  categoryForm: document.getElementById('categoryForm'),
  noteTitle: document.getElementById('noteTitle'),
  noteContent: document.getElementById('noteContent'),
  noteCategory: document.getElementById('noteCategory'),
  categoryName: document.getElementById('categoryName'),
  fileUpload: document.getElementById('fileUpload')
};

// App State
const state = {
  notes: [],
  categories: [],
  activeCategory: "all",
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
  const savedCategories = localStorage.getItem('categories');
  
  if (savedNotes) state.notes = JSON.parse(savedNotes);
  if (savedCategories) state.categories = JSON.parse(savedCategories);
  
  if (state.notes.length === 0) {
    addNote("Welcome to NotesFlow", "This is your first note. You can edit or delete it.", "general");
  }
}

function saveData() {
  localStorage.setItem('notes', JSON.stringify(state.notes));
  localStorage.setItem('categories', JSON.stringify(state.categories));
}

// Rendering Functions
function render() {
  renderNotes();
  renderCategoryOptions();
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
        ${note.category ? `<span class="note-category">${note.category}</span>` : ''}
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

function renderCategoryOptions() {
  elements.noteCategory.innerHTML = state.categories.map(category => `
    <option value="${category}">${category}</option>
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
    const matchesCategory = state.activeCategory === "all" || note.category === state.activeCategory;
    return matchesSearch && matchesCategory;
  });
}

// Core Functions
function addNote(title, content, category, file = null) {
  if (!file) {
    alert('Please attach a file to your note');
    return false;
  }

  const newNote = {
    id: Date.now(),
    title,
    content,
    category,
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

function addCategory(name) {
  const categoryName = name.trim();
  if (categoryName && !state.categories.includes(categoryName)) {
    state.categories.push(categoryName);
    saveData();
    renderCategoryOptions();
    return true;
  }
  return false;
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

function openCategoryModal() {
  elements.categoryForm.reset();
  elements.categoryModal.style.display = 'flex';
}

function closeModals() {
  elements.noteModal.style.display = 'none';
  elements.categoryModal.style.display = 'none';
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
    elements.noteCategory.value = note.category || '';
    
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

  // Add category button
  elements.addCategoryBtn.addEventListener('click', openCategoryModal);

  // Modal close buttons
  elements.closeNoteModal.addEventListener('click', closeModals);
  elements.closeCategoryModal.addEventListener('click', closeModals);
  elements.cancelNoteBtn.addEventListener('click', closeModals);
  elements.cancelCategoryBtn.addEventListener('click', closeModals);

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
    const category = elements.noteCategory.value || null;
    
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
        category,
        file: state.currentFile 
      });
    } else {
      addNote(title, content || null, category, state.currentFile);
    }
    
    closeModals();
  });

  // Category form submission
  elements.categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const categoryName = elements.categoryName.value.trim();
    
    if (!categoryName) {
      alert('Please enter a category name');
      return;
    }

    if (addCategory(categoryName)) {
      closeModals();
    } else {
      alert('Category already exists or is invalid!');
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

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === elements.noteModal || e.target === elements.categoryModal) {
      closeModals();
    }
  });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp);