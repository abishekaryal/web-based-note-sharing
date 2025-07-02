// Get DOM elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupLink = document.getElementById('signupLink');
const signupModal = document.getElementById('signupModal');
const closeSignupModal = document.getElementById('closeSignupModal');
const signupForm = document.getElementById('signupForm');
const signupUsernameInput = document.getElementById('signupUsername');
const signupEmailInput = document.getElementById('signupEmail');
const signupPasswordInput = document.getElementById('signupPassword');
const googleBtn = document.querySelector('.google-btn');

// Event Listeners
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;
  
  // Simple validation
  if (!email.includes('@')) {
    alert('Please enter a valid email');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  // Simulate login (replace with real auth)
  localStorage.setItem('loggedIn', 'true');
  window.location.href = 'home.html';
});

signupLink.addEventListener('click', function(e) {
  e.preventDefault();
  signupModal.style.display = 'flex';
});

closeSignupModal.addEventListener('click', function() {
  signupModal.style.display = 'none';
});

window.addEventListener('click', function(e) {
  if (e.target == signupModal) {
    signupModal.style.display = 'none';
  }
});

signupForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = signupUsernameInput.value;
  const email = signupEmailInput.value;
  const password = signupPasswordInput.value;

  // Simple validation
  if (username.length < 3) {
    alert('Username must be at least 3 characters');
    return;
  }
  if (!email.includes('@')) {
    alert('Please enter a valid email');
    return;
  }
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  // Simulate account creation
  alert(`Account created for ${username} (${email})!`);
  signupModal.style.display = 'none';
  // Optionally, log them in or redirect to login
});

googleBtn.addEventListener('click', function() {
  alert('Simulating Google login...');
  // In a real app, this would initiate Google OAuth flow
  signupModal.style.display = 'none';
  localStorage.setItem('loggedIn', 'true');
  window.location.href = 'home.html';
});

// Toggle password visibility for all password fields
document.querySelectorAll('.toggle-password').forEach(toggle => {
  toggle.addEventListener('click', function() {
    const passwordField = this.previousElementSibling;
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      this.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      passwordField.type = 'password';
      this.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });
});