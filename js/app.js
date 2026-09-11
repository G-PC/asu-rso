// js/app.js

// === Проверка сессии ===
const currentUser = DB.getSession();
if (!currentUser) {
  window.location.href = 'login.html';
}

// === Заголовок ===
const roleNames = { student: 'Ученик', teacher: 'Учитель', admin: 'Администратор' };
document.getElementById('userName').textContent = currentUser.name;
document.getElementById('userRole').textContent = roleNames[currentUser.role];

// === Выход ===
document.getElementById('logoutBtn').addEventListener('click', () => {
  DB.clearSession();
  window.location.href = 'login.html';
});

// === Показ вкладок по ролям ===
document.querySelectorAll('#mainNav a[data-roles]').forEach(a => {
  const roles = a.dataset.roles.split(',');
  if (roles.includes(currentUser.role)) a.style.display = 'block';
});

// === Навигация ===
document.querySelectorAll('#mainNav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('#mainNav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + link.dataset.tab).classList.add('active');
    renderTab(link.dataset.tab);
  });
});

function renderTab(tab) {
  if (tab === 'diary') renderDiary();
  if (tab === 'grades') renderGrades();
  if (tab === 'schedule') renderSchedule();
  if (tab === 'homework') renderHomework();
  if (tab === 'gradebook') renderGradebook();
  if (tab === 'admin') renderAdmin();
}

// ============== ДНЕВНИК ==============
function renderDiary() {
  const el = document.getElementById('diaryContent');
  const title = document.getElementById('diaryTitle');

  if (currentUser.role === 'student') {
    title.textContent = 'Мой дневник';
    const grades = DB.getGradesByStudent(currentUser.id)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (grades.length === 0) {
      el.innerHTML = '<p class="empty">Оценок пока нет</p>';
      return;
    }

    el.innerHTML = `<table class="diary-table">
      <thead><tr><th>Дата</th><th>Предмет</th><th>Оценка</th><th>Комментарий</th><th>Учитель</th></tr></thead>
      <tbody>${grades.map(g => {
        const t = g.teacherId ? DB.getUserById(g.teacherId) : null;
        return `<tr>
          <td>${formatDate(g.date)}</td>
          <td>${g.subject}</td>
          <td><span class="grade g${g.grade}">${g.grade}</span></td>
          <td>${g.comment || '—'}</td>
          <td>${t ? t.name : '—'}</td>
        </tr>`;
      }).join('')}</tbody>
    </table>`;
    return;
  }

  // Учитель/админ
  title.textContent = 'Сводка';
  const stats = {
    students: DB.getUsers().filter(u => u.role === 'student').length,
    teachers: DB.getUsers().filter(u => u.role === 'teacher').length,
    grades: DB.getGrades().length,
    homework: DB.getHomework().length
  };
  el.innerHTML = `<div class="stat-grid">
    <div class="stat-card"><div class="num">${stats.students}</div><div>Учеников</div></div>
    <div class="stat-card"><div class="num">${stats.teachers}</div><div>Учителей</div></div>
    <div class="stat-card"><div class="num">${stats.grades}</div><div>Оценок</div></div>
    <div class="stat-card"><div class="num">${stats.homework}</div><div>Домашних заданий</div></div>
  </div>`;
}

// ============== ОЦЕНКИ ==============
function renderGrades() {
  const el = document.getElementById('gradesContent');

  if (currentUser.role === 'student') {
    const grades = DB.getGradesByStudent(currentUser.id);
    const subjects = [...new Set(grades.map(g => g.subject))];
    if (subjects.length === 0) {
      el.innerHTML = '<p class="empty">Оценок пока нет</p>';
      return;
    }

    el.innerHTML = `<table class="grades-table">
      <thead><tr><th>Предмет</th><th>Оценки</th><th>Средний</th></tr></thead>
      <tbody>${subjects.map(sub => {
        const list = grades.filter(g => g.subject === sub);
        const avg = (list.reduce((s, g) => s + g.grade, 0) / list.length).toFixed(2);
        return `<tr>
          <td>${sub}</td>
          <td>${list.map(g => `<span class="grade g${g.grade}">${g.grade}</span>`).join('')}</td>
          <td><b>${avg}</b></td>
        </tr>`;
      }).join('')}</tbody>
    </table>`;
    return;
  }

  // Учитель — видит сводку по своим классам
  const students = DB.getUsers().filter(u => u.role === 'student' && 
    (currentUser.role === 'admin' || (currentUser.classes || []).includes(u.className)));
  el.innerHTML = `<p>Всего учеников в вашей зоне: <b>${students.length}</b></p>
    <p>Всего оценок: <b>${DB.getGrades().length}</b></p>`;
}

// ============== РАСПИСАНИЕ ==============
function renderSchedule() {
  const el = document.getElementById('scheduleContent');
  let className;

  if (currentUser.role === 'student') {
    className = currentUser.className;
  } else {
    // Учитель/админ — по первому классу
    className = currentUser.role === 'teacher' 
      ? (currentUser.classes?.[0] || DB.getClasses()[0])
      : DB.getClasses()[0];
  }

  if (!className) {
    el.innerHTML = '<p class="empty">Нет
