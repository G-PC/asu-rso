// js/storage.js

const DB = {
  // === Ключи хранилища ===
  KEYS: {
    USERS: 'asu_users',
    GRADES: 'asu_grades',
    HOMEWORK: 'asu_homework',
    SCHEDULE: 'asu_schedule',
    CLASSES: 'asu_classes',
    SESSION: 'asu_session',
    NEXT_ID: 'asu_next_id'
  },

  // === Инициализация ===
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

  nextId() {
    const id = parseInt(localStorage.getItem(this.KEYS.NEXT_ID) || '1000');
    localStorage.setItem(this.KEYS.NEXT_ID, String(id + 1));
    return id;
  },

  // === ПОЛЬЗОВАТЕЛИ ===
  getUsers() {
    return JSON.parse(localStorage.getItem(this.KEYS.USERS) || '[]');
  },
  saveUsers(users) {
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
  },
  findUserByLogin(login) {
    return this.getUsers().find(u => u.login.toLowerCase() === login.toLowerCase());
  },
  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  },
  addUser(user) {
    const users = this.getUsers();
    user.id = this.nextId();
    users.push(user);
    this.saveUsers(users);
    return user;
  },
  updateUser(id, patch) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...patch };
      this.saveUsers(users);
    }
  },
  deleteUser(id) {
    this.saveUsers(this.getUsers().filter(u => u.id !== id));
  },

  // === ОЦЕНКИ ===
  getGrades() {
    return JSON.parse(localStorage.getItem(this.KEYS.GRADES) || '[]');
  },
  saveGrades(grades) {
    localStorage.setItem(this.KEYS.GRADES, JSON.stringify(grades));
  },
  getGradesByStudent(studentId) {
    return this.getGrades().filter(g => g.studentId === studentId);
  },
  getGradesByClass(className, subject) {
    return this.getGrades().filter(g => 
      g.className === className && (!subject || g.subject === subject)
    );
  },
  addGrade(grade) {
    const grades = this.getGrades();
    grade.id = this.nextId();
    grade.createdAt = new Date().toISOString();
    grades.push(grade);
    this.saveGrades(grades);
    return grade;
  },
  deleteGrade(id) {
    this.saveGrades(this.getGrades().filter(g => g.id !== id));
  },

  // === ДОМАШКА ===
  getHomework() {
    return JSON.parse(localStorage.getItem(this.KEYS.HOMEWORK) || '[]');
  },
  saveHomework(hw) {
    localStorage.setItem(this.KEYS.HOMEWORK, JSON.stringify(hw));
  },
  getHomeworkByClass(className) {
    return this.getHomework().filter(h => h.className === className);
  },
  addHomework(hw) {
    const list = this.getHomework();
    hw.id = this.nextId();
    hw.createdAt = new Date().toISOString();
    list.push(hw);
    this.saveHomework(list);
    return hw;
  },
  deleteHomework(id) {
    this.saveHomework(this.getHomework().filter(h => h.id !== id));
  },

  // === РАСПИСАНИЕ ===
  getSchedule() {
    return JSON.parse(localStorage.getItem(this.KEYS.SCHEDULE) || '{}');
  },
  saveSchedule(sched) {
    localStorage.setItem(this.KEYS.SCHEDULE, JSON.stringify(sched));
  },
  getScheduleByClass(className) {
    return this.getSchedule()[className] || {};
  },
  setScheduleForClass(className, data) {
    const sched = this.getSchedule();
    sched[className] = data;
    this.saveSchedule(sched);
  },

  // === КЛАССЫ ===
  getClasses() {
    return JSON.parse(localStorage.getItem(this.KEYS.CLASSES) || '[]');
  },
  saveClasses(classes) {
    localStorage.setItem(this.KEYS.CLASSES, JSON.stringify(classes));
  },
  addClass(name) {
    const classes = this.getClasses();
    if (!classes.includes(name)) {
      classes.push(name);
      this.saveClasses(classes);
    }
  },
  deleteClass(name) {
    this.saveClasses(this.getClasses().filter(c => c !== name));
  },

  // === СЕССИЯ ===
  setSession(userId) {
    localStorage.setItem(this.KEYS.SESSION, String(userId));
  },
  getSession() {
    const id = localStorage.getItem(this.KEYS.SESSION);
    if (!id) return null;
    return this.getUserById(parseInt(id));
  },
  clearSession() {
    localStorage.removeItem(this.KEYS.SESSION);
  }
};

DB.init();
