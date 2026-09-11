// js/storage.js
// ============================================================
// "База данных" на localStorage для АСУ РСО
// Все операции чтения/записи данных приложения — через этот объект.
// ============================================================

const DB = {
  // === Ключи хранилища ===
  KEYS: {
    USERS: 'asu_users',
    GRADES: 'asu_grades',
    HOMEWORK: 'asu_homework',
    SCHEDULE: 'asu_schedule',
    CLASSES: 'asu_classes',
    SESSION: 'asu_session',
    NEXT_ID: 'asu_next_id',
    SEEDED: 'asu_seeded'
  },

  // === Инициализация (создаёт пустые структуры, если их нет) ===
  init() {
    if (!localStorage.getItem(this.KEYS.USERS)) {
      localStorage.setItem(this.KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.GRADES)) {
      localStorage.setItem(this.KEYS.GRADES, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.HOMEWORK)) {
      localStorage.setItem(this.KEYS.HOMEWORK, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.SCHEDULE)) {
      localStorage.setItem(this.KEYS.SCHEDULE, JSON.stringify({}));
    }
    if (!localStorage.getItem(this.KEYS.CLASSES)) {
      localStorage.setItem(this.KEYS.CLASSES, JSON.stringify(['8А', '8Б', '9А']));
    }
    if (!localStorage.getItem(this.KEYS.NEXT_ID)) {
      localStorage.setItem(this.KEYS.NEXT_ID, '1000');
    }
  },

  // === Автогенерация ID ===
  nextId() {
    const id = parseInt(localStorage.getItem(this.KEYS.NEXT_ID) || '1000', 10);
    localStorage.setItem(this.KEYS.NEXT_ID, String(id + 1));
    return id;
  },

  // === Общий безопасный парсер JSON ===
  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (e) {
      console.warn('Ошибка чтения localStorage[' + key + ']:', e);
      return fallback;
    }
  },

  // ============================================================
  // ПОЛЬЗОВАТЕЛИ
  // ============================================================
  getUsers() {
    const users = this._read(this.KEYS.USERS, []);
    return Array.isArray(users) ? users : [];
  },

  saveUsers(users) {
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users || []));
  },

  findUserByLogin(login) {
    if (!login) return null;
    const target = String(login).trim().toLowerCase();
    return this.getUsers().find(u =>
      u && u.login && String(u.login).toLowerCase() === target
    ) || null;
  },

  getUserById(id) {
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return null;
    return this.getUsers().find(u => u.id === numId) || null;
  },

  addUser(user) {
    const users = this.getUsers();
    const newUser = Object.assign({}, user);
    newUser.id = this.nextId();
    newUser.createdAt = newUser.createdAt || Date.now();
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },

  updateUser(id, patch) {
    const numId = parseInt(id, 10);
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === numId);
    if (idx >= 0) {
      users[idx] = Object.assign({}, users[idx], patch);
      this.saveUsers(users);
      return users[idx];
    }
    return null;
  },

  deleteUser(id) {
    const numId = parseInt(id, 10);
    const filtered = this.getUsers().filter(u => u.id !== numId);
    this.saveUsers(filtered);
    // Заодно чистим оценки этого ученика
    const grades = this.getGrades().filter(g => g.studentId !== numId);
    this.saveGrades(grades);
    // И домашки, которые он задавал (если был учителем)
    const hw = this.getHomework().filter(h => h.teacherId !== numId);
    this.saveHomework(hw);
  },

  // ============================================================
  // ОЦЕНКИ
  // ============================================================
  getGrades() {
    const grades = this._read(this.KEYS.GRADES, []);
    return Array.isArray(grades) ? grades : [];
  },

  saveGrades(grades) {
    localStorage.setItem(this.KEYS.GRADES, JSON.stringify(grades || []));
  },

  getGradesByStudent(studentId) {
    const numId = parseInt(studentId, 10);
    return this.getGrades().filter(g => g.studentId === numId);
  },

  getGradesByClass(className, subject) {
    return this.getGrades().filter(g =>
      g.className === className &&
      (!subject || g.subject === subject)
    );
  },

  addGrade(grade) {
    const grades = this.getGrades();
    const newGrade = Object.assign({}, grade);
    newGrade.id = this.nextId();
    newGrade.createdAt = new Date().toISOString();
    grades.push(newGrade);
    this.saveGrades(grades);
    return newGrade;
  },

  deleteGrade(id) {
    const numId = parseInt(id, 10);
    this.saveGrades(this.getGrades().filter(g => g.id !== numId));
  },

  // ============================================================
  // ДОМАШНИЕ ЗАДАНИЯ
  // ============================================================
  getHomework() {
    const hw = this._read(this.KEYS.HOMEWORK, []);
    return Array.isArray(hw) ? hw : [];
  },

  saveHomework(hw) {
    localStorage.setItem(this.KEYS.HOMEWORK, JSON.stringify(hw || []));
  },

  getHomeworkByClass(className) {
    return this.getHomework().filter(h => h.className === className);
  },

  addHomework(hw) {
    const list = this.getHomework();
    const newHw = Object.assign({}, hw);
    newHw.id = this.nextId();
    newHw.createdAt = new Date().toISOString();
    list.push(newHw);
    this.saveHomework(list);
    return newHw;
  },

  updateHomework(id, patch) {
    const numId = parseInt(id, 10);
    const list = this.getHomework();
    const idx = list.findIndex(h => h.id === numId);
    if (idx >= 0) {
      list[idx] = Object.assign({}, list[idx], patch);
      this.saveHomework(list);
      return list[idx];
    }
    return null;
  },

  deleteHomework(id) {
    const numId = parseInt(id, 10);
    this.saveHomework(this.getHomework().filter(h => h.id !== numId));
  },

  // ============================================================
  // РАСПИСАНИЕ
  // Формат: { "8А": { "Понедельник": [{subject, room, teacher}, ...] } }
  // ============================================================
  getSchedule() {
    const sched = this._read(this.KEYS.SCHEDULE, {});
    return (sched && typeof sched === 'object' && !Array.isArray(sched)) ? sched : {};
  },

  saveSchedule(sched) {
    localStorage.setItem(this.KEYS.SCHEDULE, JSON.stringify(sched || {}));
  },

  getScheduleByClass(className) {
    const all = this.getSchedule();
    return all[className] || {};
  },

  setScheduleForClass(className, data) {
    const sched = this.getSchedule();
    sched[className] = data || {};
    this.saveSchedule(sched);
  },

  deleteScheduleForClass(className) {
    const sched = this.getSchedule();
    delete sched[className];
    this.saveSchedule(sched);
  },

  // ============================================================
  // КЛАССЫ
  // ============================================================
  getClasses() {
    const classes = this._read(this.KEYS.CLASSES, []);
    return Array.isArray(classes) ? classes : [];
  },

  saveClasses(classes) {
    localStorage.setItem(this.KEYS.CLASSES, JSON.stringify(classes || []));
  },

  addClass(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) return false;
    const classes = this.getClasses();
    if (classes.includes(trimmed)) return false;
    classes.push(trimmed);
    this.saveClasses(classes);
    return true;
  },

  deleteClass(name) {
    const filtered = this.getClasses().filter(c => c !== name);
    this.saveClasses(filtered);
    // Заодно удаляем расписание этого класса
    this.deleteScheduleForClass(name);
  },

  // ============================================================
  // СЕССИЯ
  // ============================================================
  setSession(userId) {
    localStorage.setItem(this.KEYS.SESSION, String(userId));
  },

  getSession() {
    const id = localStorage.getItem(this.KEYS.SESSION);
    if (!id) return null;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      this.clearSession();
      return null;
    }
    const user = this.getUserById(numId);
    if (!user) {
      // Сессия битая (пользователь удалён) — чистим
      this.clearSession();
      return null;
    }
    return user;
  },

  clearSession() {
    localStorage.removeItem(this.KEYS.SESSION);
  },

  // ============================================================
  // СБРОС ВСЕЙ БАЗЫ (для отладки, вызывается вручную из консоли)
  // ============================================================
  resetAll() {
    Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
    console.log('База данных полностью очищена');
  }
};

// === Автоматическая инициализация при загрузке скрипта ===
DB.init();

console.log('✅ storage.js загружен. Пользователей в базе:', DB.getUsers().length);
