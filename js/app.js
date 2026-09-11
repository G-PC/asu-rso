// === Проверка авторизации ===
const user = JSON.parse(localStorage.getItem('asu_user') || 'null');
if (!user) {
  window.location.href = 'login.html';
}

// === Инициализация шапки ===
const roleNames = { student: 'Ученик', parent: 'Родитель', teacher: 'Учитель' };
document.getElementById('userName').textContent = user.username;
document.getElementById('userRole').textContent = roleNames[user.role] || user.role;

// === Выход ===
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('asu_user');
  window.location.href = 'login.html';
});

// === Навигация по вкладкам ===
document.querySelectorAll('.sidebar nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tab = link.dataset.tab;
    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
  });
});

// === Дневник ===
let currentWeekOffset = 0;

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function getWeekRange(offset) {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1 + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

function renderDiary() {
  const { monday, sunday } = getWeekRange(currentWeekOffset);
  document.getElementById('weekRange').textContent =
    `${formatDate(monday)} — ${formatDate(sunday)}`;

  const days = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
  const tbody = [];

  // Заголовок таблицы
  let html = '<table class="diary-table"><thead><tr><th>Дата</th><th>Предмет</th><th>Оценка</th><th>Комментарий</th></tr></thead><tbody>';

  const weekDates = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push({ date: formatDate(d), dayName: days[i] });
  }

  // Собираем оценки за неделю
  let rows = [];
  weekDates.forEach(wd => {
    const dayGrades = DATA.dailyGrades.filter(g => g.date === wd.date);
    if (dayGrades.length === 0) {
      rows.push(`<tr><td><b>${wd.date}</b><br><small>${wd.dayName}</small></td>
                 <td colspan="3" style="color:#aaa;font-style:italic;">Нет оценок</td></tr>`);
    } else {
      dayGrades.forEach((g, idx) => {
        rows.push(`<tr>
          ${idx === 0 ? `<td rowspan="${dayGrades.length}"><b>${wd.date}</b><br><small>${wd.dayName}</small></td>` : ''}
          <td>${g.subject}</td>
          <td><span class="grade g${g.grade}">${g.grade}</span></td>
          <td>${g.comment}</td>
        </tr>`);
      });
    }
  });

  html += rows.join('');
  html += '</tbody></table>';
  document.getElementById('diaryContent').innerHTML = html;
}

document.getElementById('prevWeek').addEventListener('click', () => {
  currentWeekOffset--;
  renderDiary();
});
document.getElementById('nextWeek').addEventListener('click', () => {
  currentWeekOffset++;
  renderDiary();
});

// === Оценки ===
function renderGrades() {
  const tbody = document.querySelector('#gradesTable tbody');
  tbody.innerHTML = Object.entries(DATA.grades).map(([subject, marks]) => {
    const cells = marks.map(m =>
      `<td>${m ? `<span class="grade g${m}">${m}</span>` : '—'}</td>`
    ).join('');
    return `<tr><td>${subject}</td>${cells}</tr>`;
  }).join('');
}

// === Расписание ===
function renderSchedule() {
  const container = document.getElementById('scheduleContent');
  container.innerHTML = Object.entries(DATA.schedule).map(([day, lessons]) => {
    if (lessons.length === 0) {
      return `<div class="schedule-day"><h3>${day}</h3>
              <p style="color:#aaa;font-size:13px;">Выходной</p></div>`;
    }
    const rows = lessons.map((l, i) =>
      `<div class="lesson-row">
        <span class="num">${i + 1}.</span>
        <span>${l[0]}</span>
        <span class="room">${l[1]}</span>
      </div>`
    ).join('');
    return `<div class="schedule-day"><h3>${day}</h3>${rows}</div>`;
  }).join('');
}

// === Домашка ===
function renderHomework() {
  const container = document.getElementById('homeworkContent');
  container.innerHTML = DATA.homework.map(hw =>
    `<div class="hw-item">
      <div class="subject">${hw.subject}</div>
      <div class="task">${hw.task}</div>
      <div class="due">Сдать до: ${hw.due}</div>
    </div>`
  ).join('');
}

// === Сообщения ===
function renderMessages() {
  const list = document.getElementById('msgList');
  list.innerHTML = DATA.messages.map(m =>
    `<div class="msg-item" data-id="${m.id}">
      <div class="from">${m.from}</div>
      <div class="subject">${m.subject}</div>
      <div class="preview">${m.body.slice(0, 50)}...</div>
    </div>`
  ).join('');

  list.querySelectorAll('.msg-item').forEach(item => {
    item.addEventListener('click', () => {
      list.querySelectorAll('.msg-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const msg = DATA.messages.find(m => m.id == item.dataset.id);
      document.getElementById('msgView').innerHTML = `
        <h3>${msg.subject}</h3>
        <div class="meta">От: ${msg.from} • ${msg.date}</div>
        <div class="body">${msg.body}</div>
      `;
    });
  });
}

// === Профиль ===
function renderProfile() {
  const s = DATA.student;
  document.getElementById('profileCard').innerHTML = `
    <div class="row"><div class="label">ФИО</div><div class="value">${s.name}</div></div>
    <div class="row"><div class="label">Класс</div><div class="value">${s.class}</div></div>
    <div class="row"><div class="label">Школа</div><div class="value">${s.school}</div></div>
    <div class="row"><div class="label">Дата рождения</div><div class="value">${s.birthDate}</div></div>
    <div class="row"><div class="label">СНИЛС</div><div class="value">${s.snils}</div></div>
    <div class="row"><div class="label">Законный представитель</div><div class="value">${s.parent}</div></div>
    <div class="row"><div class="label">Логин</div><div class="value">${s.login}</div></div>
  `;
}

// === Запуск ===
renderDiary();
renderGrades();
renderSchedule();
renderHomework();
renderMessages();
renderProfile();
