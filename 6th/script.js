document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
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

// Toggle password visibility
document.querySelector('.toggle-password').addEventListener('click', function() {
  const password = document.getElementById('password');
  if (password.type === 'password') {
    password.type = 'text';
    this.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    password.type = 'password';
    this.classList.replace('fa-eye-slash', 'fa-eye');
  }
});