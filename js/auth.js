// js/auth.js

// === Убеждаемся, что база инициализирована и заполнена ===
console.log('=== auth.js запущен ===');
console.log('Пользователей в базе:', DB.getUsers().length);

// Если сессия уже есть — сразу в приложение (но не зацикливаемся)
if (DB.getSession()) {
  console.log('Сессия уже есть, редирект в app.html');
  window.location.href = 'app.html';
}

// === Переключение вкладок ===
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab + 'Form').classList.add('active');
  });
});

// === Поля регистрации в зависимости от роли ===
const regRole = document.getElementById('regRole');

function updateRegFields() {
  const role = regRole.value;
  const classField = document.getElementById('classField');
  const subjectsField = document.getElementById('subjectsField');
  const classSelect = document.getElementById('regClass');

  if (role === 'student') {
    classField.style.display = 'block';
    classSelect.innerHTML = DB.getClasses()
      .map(c => `<option value="${c}">${c}</option>`).join('');
  } else {
    classField.style.display = 'none';
  }

  if (role === 'teacher') {
    subjectsField.style.display = 'block';
  } else {
    subjectsField.style.display = 'none';
  }
}

regRole.addEventListener('change', updateRegFields);
updateRegFields();

// === ВХОД ===
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();          // <-- САМОЕ ВАЖНОЕ
  e.stopPropagation();

  const login = document.getElementById('loginLogin').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';

  console.log('Попытка входа:', { login, password });

  // Проверка на пустые
  if (!login || !password) {
    errEl.textContent = 'Введите логин и пароль';
    return false;
  }

  const user = DB.findUserByLogin(login);
  console.log('Найденный пользователь:', user);

  if (!user) {
    errEl.textContent = 'Пользователь не найден. Проверьте логин.';
    return false;
  }
  if (user.password !== password) {
    errEl.textContent = 'Неверный пароль';
    return false;
  }

  // Успех!
  DB.setSession(user.id);
  console.log('Сессия установлена для userId =', user.id);
  console.log('Проверка сессии:', DB.getSession());

  window.location.href = 'app.html';
  return false;
});

// === РЕГИСТРАЦИЯ ===
document.getElementById('registerForm').addEventListener('submit', function (e) {
  e.preventDefault();
  e.stopPropagation();

  const errEl = document.getElementById('regError');
  errEl.textContent = '';

  const name = document.getElementById('regName').value.trim();
  const login = document.getElementById('regLogin').value.trim();
  const password = document.getElementById('regPassword').value;
  const role = regRole.value;

  if (!name) { errEl.textContent = 'Введите ФИО'; return false; }
  if (!/^[a-zA-Z0-9_]{3,}$/.test(login)) {
    errEl.textContent = 'Логин: латиница/цифры, минимум 3 символа';
    return false;
  }
  if (password.length < 6) {
    errEl.textContent = 'Пароль минимум 6 символов';
    return false;
  }
  if (DB.findUserByLogin(login)) {
    errEl.textContent = 'Такой логин уже занят';
    return false;
  }

  const newUser = { login, password, name, role, createdAt: Date.now() };

  if (role === 'student') {
    newUser.className = document.getElementById('regClass').value;
  }
  if (role === 'teacher') {
    newUser.subjects = document.getElementById('regSubjects').value
      .split(',').map(s => s.trim()).filter(Boolean);
    newUser.classes = [];
  }

  const created = DB.addUser(newUser);
  console.log('Создан пользователь:', created);
  DB.setSession(created.id);
  window.location.href = 'app.html';
  return false;
});
