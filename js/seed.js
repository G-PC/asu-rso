// js/seed.js
// ============================================================
// Гарантирует наличие базовых аккаунтов.
// Не удаляет старые данные, но добавляет недостающие аккаунты.
// ============================================================

const SEED_ACCOUNTS = [
  // --- Админ ---
  {
    login: 'lobahadm',
    password: '123',
    name: 'Админ',
    role: 'admin'
  },
  // --- Учителя ---
  {
    login: 'teacher',
    password: '123',
    name: 'Учитель',
    role: 'teacher',
    subjects: ['Математика'],
    classes: ['8А']
  },
  {
    login: 'lobahg',
    password: '123',
    name: 'Лобах Герман Александрович',
    role: 'teacher',
    subjects: ['Алгебра', 'Геометрия', 'Информатика'],
    classes: ['8А', '8Б']
  },
  {
    login: 'lobaht',
    password: '123',
    name: 'Лобах Таисия Александровна',
    role: 'teacher',
    subjects: ['Русский язык', 'Литература'],
    classes: ['8А', '8Б']
  },
  // --- Ученики ---
  {
    login: 'student',
    password: '123',
    name: 'Ученик',
    role: 'student',
    className: '8А'
  },
  {
    login: 'ivanovi',
    password: '123',
    name: 'Иванов Иван',
    role: 'student',
    className: '8А'
  },
  {
    login: 'petrovp',
    password: '123',
    name: 'Петров Петр',
    role: 'student',
    className: '8Б'
  }
];

function seedAccounts() {
  const created = [];
  SEED_ACCOUNTS.forEach(acc => {
    const exists = DB.findUserByLogin(acc.login);
    if (exists) {
      // Если логин уже есть — пропускаем (не трогаем пароль и роль)
      return;
    }
    const user = DB.addUser(Object.assign({}, acc));
    created.push(user.login);
  });

  if (created.length > 0) {
    console.log('✅ Добавлены аккаунты:', created.join(', '));
  } else {
    console.log('Все базовые аккаунты уже есть в базе');
  }
}

// Запуск
seedAccounts();
