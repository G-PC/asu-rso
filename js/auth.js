// js/auth.js

// === Переключение вкладок ===
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab + 'Form').classList.add('active');
  });
});

// === Динамические поля регистрации ===
const regRole = document.getElementById('regRole');
regRole.addEventListener('change', updateRegFields);

function updateRegFields() {
  const role = regRole.value;
  const classField = document.getElementById('classField');
  const subjectsField = document.getElementById('subjectsField');
  const classSelect = document.getElementById('regClass');

  // Класс — только для ученика
  if (role === 'student') {
    classField.style.display = 'block';
    classSelect.innerHTML = DB.getClasses()
      .map(c => `<option value="${c}">${c}</option>`).join('');
  } else {
    classField.style.display = 'none';
  }

  // Предметы — только для учителя
  if (role === 'teacher') {
    subjectsField.style.display = 'block';
  } else {
    subjectsField.style.display = 'none';
  }
}
updateRegFields();

// === ВХОД ===
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const login = document.getElementById('loginLogin').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';

  const user = DB.findUserByLogin(login);
  if (!user) {
    errEl.textContent = 'Пользователь не найден';
    return;
  }
  if (user.password !== password) {
    errEl.textContent = 'Неверный пароль';
    return;
  }

  DB.setSession(user.id);
  window.location.href = 'app.html';
});

// === РЕГИСТРАЦИЯ ===
document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const errEl = document.getElementById('regError');
  errEl.textContent = '';

  const name = document.getElementById('regName').value.trim();
  const login = document.getElementById('regLogin').value.trim();
  const password = document.getElementById('regPassword').value;
  const role = regRole.value;

  // Валидация
  if (!/^[a-zA-Z0-9_]{3,}$/.test(login)) {
    errEl.textContent = 'Логин: латиница/цифры, минимум 3 символа';
    return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Пароль минимум 6 символов';
    return;
  }
  if (DB.findUserByLogin(login)) {
    errEl.textContent = 'Такой логин уже занят';
    return;
  }

  // Формируем пользователя
  const newUser = { login, password, name, role, createdAt: Date.now() };

  if (role === 'student') {
    newUser.className = document.getElementById('regClass').value;
  }
  if (role === 'teacher') {
    const subs = document.getElementById('regSubjects').value
      .split(',').map(s => s.trim()).filter(Boolean);
    newUser.subjects = subs;
    newUser.classes = [];
  }

  const created = DB.addUser(newUser);
  DB.setSession(created.id);
  window.location.href = 'app.html';
});
