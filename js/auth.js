document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const role = document.querySelector('input[name=role]:checked').value;

  if (username.length < 3 || password.length < 3) {
    showError('Логин и пароль должны содержать минимум 3 символа');
    return;
  }

  localStorage.setItem('asu_user', JSON.stringify({
    username,
    role,
    loginTime: Date.now()
  }));

  window.location.href = 'index.html';
});

function showError(msg) {
  const form = document.getElementById('loginForm');
  let err = form.querySelector('.error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'error';
    form.insertBefore(err, form.firstChild);
  }
  err.textContent = msg;
}
