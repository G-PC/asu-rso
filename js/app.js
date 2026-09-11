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
    el.innerHTML = '<p class="empty">Нет классов</p>';
    return;
  }

  const sched = DB.getScheduleByClass(className);
  const days = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];

  el.innerHTML = `<p class="muted">Класс: <b>${className}</b></p>` + days.map(day => {
    const lessons = sched[day] || [];
    if (lessons.length === 0) {
      return `<div class="schedule-day"><h3>${day}</h3><p class="muted">Нет уроков</p></div>`;
    }
    return `<div class="schedule-day">
      <h3>${day}</h3>
      ${lessons.map((l, i) => `
        <div class="lesson-row">
          <span class="num">${i + 1}.</span>
          <span>${l.subject}</span>
          <span class="room">${l.room} • ${l.teacher || ''}</span>
        </div>`).join('')}
    </div>`;
  }).join('');
}

// ============== ДОМАШКА ==============
function renderHomework() {
  const el = document.getElementById('homeworkContent');
  let list;

  if (currentUser.role === 'student') {
    list = DB.getHomeworkByClass(currentUser.className);
  } else if (currentUser.role === 'teacher') {
    list = DB.getHomework().filter(h => (currentUser.classes || []).includes(h.className));
  } else {
    list = DB.getHomework();
  }

  if (list.length === 0) {
    el.innerHTML = '<p class="empty">Домашних заданий нет</p>';
    return;
  }

  el.innerHTML = list.map(hw => {
    const teacher = hw.teacherId ? DB.getUserById(hw.teacherId) : null;
    return `<div class="hw-item">
      <div class="subject">${hw.subject} <span class="muted">(${hw.className})</span></div>
      <div class="task">${hw.task}</div>
      <div class="due">Сдать до: ${formatDate(hw.due)}${teacher ? ' • ' + teacher.name : ''}</div>
    </div>`;
  }).join('');
}

// ============== ЖУРНАЛ УЧИТЕЛЯ ==============
function renderGradebook() {
  const classSelect = document.getElementById('gbClass');
  const subjectSelect = document.getElementById('gbSubject');
  const dateInput = document.getElementById('gbDate');

  // Классы учителя
  const myClasses = currentUser.role === 'admin' 
    ? DB.getClasses() 
    : (currentUser.classes || []);

  if (classSelect.options.length === 0) {
    classSelect.innerHTML = myClasses.map(c => `<option>${c}</option>`).join('');
    subjectSelect.innerHTML = (currentUser.subjects || ['Алгебра', 'Геометрия', 'Русский язык'])
      .map(s => `<option>${s}</option>`).join('');
    dateInput.value = new Date().toISOString().slice(0, 10);

    classSelect.addEventListener('change', renderGradebookTable);
    subjectSelect.addEventListener('change', renderGradebookTable);
  }

  renderGradebookTable();
}

function renderGradebookTable() {
  const className = document.getElementById('gbClass').value;
  const subject = document.getElementById('gbSubject').value;
  const el = document.getElementById('gradebookContent');

  const students = DB.getUsers().filter(u => u.role === 'student' && u.className === className);
  if (students.length === 0) {
    el.innerHTML = '<p class="empty">В классе нет учеников</p>';
    return;
  }

  const grades = DB.getGradesByClass(className, subject);

  el.innerHTML = `<table class="journal-table">
    <thead><tr><th>Ученик</th><th>Оценки</th><th>Средний</th><th>Действие</th></tr></thead>
    <tbody>${students.map(s => {
      const sGrades = grades.filter(g => g.studentId === s.id);
      const avg = sGrades.length 
        ? (sGrades.reduce((sum, g) => sum + g.grade, 0) / sGrades.length).toFixed(2)
        : '—';
      return `<tr>
        <td>${s.name}</td>
        <td>${sGrades.map(g => `<span class="grade g${g.grade}" data-grade-id="${g.id}" title="${g.comment || ''}">${g.grade}</span>`).join('')}</td>
        <td><b>${avg}</b></td>
        <td>
          <select class="grade-select" data-student-id="${s.id}">
            <option value="">—</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
          </select>
        </td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;

  // Обработка выставления оценки
  el.querySelectorAll('.grade-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const val = parseInt(sel.value);
      if (!val) return;
      const studentId = parseInt(sel.dataset.studentId);
      const date = document.getElementById('gbDate').value;
      const comment = prompt('Комментарий к оценке:', 'Работа на уроке') || '';
      DB.addGrade({
        studentId,
        className,
        subject,
        grade: val,
        date,
        comment,
        teacherId: currentUser.id
      });
      sel.value = '';
      renderGradebookTable();
    });
  });
}

// ============== АДМИН-ПАНЕЛЬ ==============
function renderAdmin() {
  renderUsersTable();
  renderClassesList();
  renderSchedClassSelect();
  renderSchedPreview();
}

function renderUsersTable() {
  const tbody = document.querySelector('#usersTable tbody');
  const users = DB.getUsers();
  tbody.innerHTML = users.map(u => {
    let extra = '';
    if (u.role === 'student') extra = u.className || '—';
    if (u.role === 'teacher') extra = (u.subjects || []).join(', ') || '—';
    return `<tr>
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.login}</td>
      <td><span class="role-tag role-${u.role}">${roleNames[u.role]}</span></td>
      <td>${extra}</td>
      <td><button class="btn-danger" data-del-user="${u.id}">Удалить</button></td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-del-user]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.delUser);
      if (id === currentUser.id) {
        alert('Нельзя удалить себя');
        return;
      }
      if (confirm('Удалить пользователя?')) {
        DB.deleteUser(id);
        renderUsersTable();
      }
    });
  });
}

document.getElementById('showAddUser').addEventListener('click', () => {
  const f = document.getElementById('addUserForm');
  f.style.display = f.style.display === 'none' ? 'flex' : 'none';
});

document.getElementById('createUserBtn').addEventListener('click', () => {
  const name = document.getElementById('newName').value.trim();
  const login = document.getElementById('newLogin').value.trim();
  const password = document.getElementById('newPassword').value;
  const role = document.getElementById('newRole').value;
  const className = document.getElementById('newClass').value.trim();
  const subjectsStr = document.getElementById('newSubjects').value.trim();

  if (!name || !login || password.length < 6) {
    alert('Заполните все поля, пароль минимум 6 символов');
    return;
  }
  if (DB.findUserByLogin(login)) {
    alert('Логин занят');
    return;
  }

  const u = { name, login, password, role };
  if (role === 'student') u.className = className || DB.getClasses()[0];
  if (role === 'teacher') u.subjects = subjectsStr.split(',').map(s => s.trim()).filter(Boolean);

  DB.addUser(u);
  document.getElementById('addUserForm').style.display = 'none';
  ['newName','newLogin','newPassword','newClass','newSubjects'].forEach(id => document.getElementById(id).value = '');
  renderUsersTable();
});

function renderClassesList() {
  const el = document.getElementById('classesList');
  el.innerHTML = DB.getClasses().map(c => 
    `<span class="class-tag">${c} <button data-del-class="${c}">×</button></span>`
  ).join('');
  el.querySelectorAll('[data-del-class]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Удалить класс?')) {
        DB.deleteClass(btn.dataset.delClass);
        renderClassesList();
        renderSchedClassSelect();
      }
    });
  });
}

document.getElementById('addClassBtn').addEventListener('click', () => {
  const name = document.getElementById('newClassName').value.trim();
  if (!name) return;
  DB.addClass(name);
  document.getElementById('newClassName').value = '';
  renderClassesList();
  renderSchedClassSelect();
});

function renderSchedClassSelect() {
  const sel = document.getElementById('schedClass');
  sel.innerHTML = DB.getClasses().map(c => `<option>${c}</option>`).join('');
  sel.onchange = renderSchedPreview;
}

document.getElementById('addLessonBtn').addEventListener('click', () => {
  const className = document.getElementById('schedClass').value;
  const day = document.getElementById('schedDay').value;
  const subject = document.getElementById('schedSubject').value.trim();
  const room = document.getElementById('schedRoom').value.trim();
  const teacher = document.getElementById('schedTeacher').value.trim();

  if (!subject) { alert('Введите предмет'); return; }

  const sched = DB.getScheduleByClass(className);
  if (!sched[day]) sched[day] = [];
  sched[day].push({ subject, room, teacher });
  DB.setScheduleForClass(className, sched);

  document.getElementById('schedSubject').value = '';
  document.getElementById('schedRoom').value = '';
  document.getElementById('schedTeacher').value = '';
  renderSchedPreview();
});

function renderSchedPreview() {
  const className = document.getElementById('schedClass').value;
  const sched = DB.getScheduleByClass(className);
  const days = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
  const el = document.getElementById('schedPreview');

  el.innerHTML = days.map(day => {
    const lessons = sched[day] || [];
    return `<div class="sched-preview-day">
      <b>${day}:</b>
      ${lessons.length ? lessons.map((l, i) => 
        `<span class="lesson-tag">${i+1}. ${l.subject} (${l.room}) <button data-rm-lesson="${day}|${i}">×</button></span>`
      ).join('') : '<span class="muted">—</span>'}
    </div>`;
  }).join('');

  el.querySelectorAll('[data-rm-lesson]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [day, idx] = btn.dataset.rmLesson.split('|');
      const sched = DB.getScheduleByClass(className);
      sched[day].splice(parseInt(idx), 1);
      DB.setScheduleForClass(className, sched);
      renderSchedPreview();
    });
  });
}

// ============== УТИЛИТЫ ==============
function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

// ============== СТАРТ ==============
renderDiary();
