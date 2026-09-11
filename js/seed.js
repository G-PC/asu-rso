// js/seed.js
// ============================================================
// Первичное заполнение базы аккаунтами и демо-данными.
// Запускается только один раз — если база ещё пуста.
// ============================================================

function seedIfEmpty() {
  const users = DB.getUsers();
  if (users.length > 0) {
    console.log('База уже заполнена, seed пропущен. Пользователей:', users.length);
    return;
  }

  console.log('Заполняем базу начальными аккаунтами...');

  // ============================================================
  // ПОЛЬЗОВАТЕЛИ
  // ============================================================

  // --- Администратор ---
  const admin = DB.addUser({
    login: 'lobahadm',
    password: '123',
    name: 'Админ',
    role: 'admin',
    email: ''
  });

  // --- Учителя ---
  const teacherGeneric = DB.addUser({
    login: 'teacher',
    password: '123',
    name: 'Учитель',
    role: 'teacher',
    email: '',
    subjects: ['Математика'],
    classes: ['8А']
  });

  const teacherGerman = DB.addUser({
    login: 'lobahg',
    password: '123',
    name: 'Лобах Герман Александрович',
    role: 'teacher',
    email: '',
    subjects: ['Алгебра', 'Геометрия', 'Информатика'],
    classes: ['8А', '8Б']
  });

  const teacherTaisia = DB.addUser({
    login: 'lobaht',
    password: '123',
    name: 'Лобах Таисия Александровна',
    role: 'teacher',
    email: '',
    subjects: ['Русский язык', 'Литература'],
    classes: ['8А', '8Б']
  });

  // --- Ученики ---
  const studentGeneric = DB.addUser({
    login: 'student',
    password: '123',
    name: 'Ученик',
    role: 'student',
    email: '',
    className: '8А'
  });

  const studentIvanov = DB.addUser({
    login: 'ivanovi',
    password: '123',
    name: 'Иванов Иван',
    role: 'student',
    email: '',
    className: '8А'
  });

  const studentPetrov = DB.addUser({
    login: 'petrovp',
    password: '123',
    name: 'Петров Петр',
    role: 'student',
    email: '',
    className: '8Б'
  });

  // ============================================================
  // НАЧАЛЬНЫЕ ОЦЕНКИ (немного для демонстрации)
  // ============================================================
  const gradesData = [
    { studentId: studentGeneric.id, className: '8А', subject: 'Алгебра',    grade: 5, date: '2026-09-02', comment: 'Ответ на уроке',      teacherId: teacherGerman.id },
    { studentId: studentGeneric.id, className: '8А', subject: 'Русский язык', grade: 4, date: '2026-09-03', comment: 'Работа в классе',     teacherId: teacherTaisia.id },
    { studentId: studentGeneric.id, className: '8А', subject: 'Литература', grade: 5, date: '2026-09-05', comment: 'Чтение наизусть',     teacherId: teacherTaisia.id },

    { studentId: studentIvanov.id, className: '8А', subject: 'Алгебра',    grade: 5, date: '2026-09-02', comment: 'Контрольная работа', teacherId: teacherGerman.id },
    { studentId: studentIvanov.id, className: '8А', subject: 'Алгебра',    grade: 4, date: '2026-09-06', comment: 'Ответ на уроке',      teacherId: teacherGerman.id },
    { studentId: studentIvanov.id, className: '8А', subject: 'Геометрия',  grade: 5, date: '2026-09-04', comment: 'Самостоятельная',     teacherId: teacherGerman.id },
    { studentId: studentIvanov.id, className: '8А', subject: 'Русский язык', grade: 4, date: '2026-09-03', comment: 'Диктант',            teacherId: teacherTaisia.id },
    { studentId: studentIvanov.id, className: '8А', subject: 'Литература', grade: 5, date: '2026-09-05', comment: 'Стихотворение',      teacherId: teacherTaisia.id },
    { studentId: studentIvanov.id, className: '8А', subject: 'Информатика', grade: 5, date: '2026-09-07', comment: 'Практическая',      teacherId: teacherGerman.id },

    { studentId: studentPetrov.id, className: '8Б', subject: 'Алгебра',    grade: 4, date: '2026-09-02', comment: 'Контрольная работа', teacherId: teacherGerman.id },
    { studentId: studentPetrov.id, className: '8Б', subject: 'Геометрия',  grade: 5, date: '2026-09-04', comment: 'Устный ответ',       teacherId: teacherGerman.id },
    { studentId: studentPetrov.id, className: '8Б', subject: 'Русский язык', grade: 5, date: '2026-09-03', comment: 'Диктант',           teacherId: teacherTaisia.id },
  ];
  gradesData.forEach(g => DB.addGrade(g));

  // ============================================================
  // НАЧАЛЬНАЯ ДОМАШКА
  // ============================================================
  const homeworkData = [
    { className: '8А', subject: 'Алгебра',      task: 'Параграф 12, № 345, 346',              due: '2026-09-15', teacherId: teacherGerman.id },
    { className: '8А', subject: 'Геометрия',    task: 'Параграф 8, задачи 1-3',               due: '2026-09-16', teacherId: teacherGerman.id },
    { className: '8А', subject: 'Русский язык', task: 'Упражнение 89, повторить правила',     due: '2026-09-15', teacherId: teacherTaisia.id },
    { className: '8А', subject: 'Литература',   task: 'Прочитать главы 1-3, ответить на вопросы', due: '2026-09-17', teacherId: teacherTaisia.id },
    { className: '8Б', subject: 'Алгебра',      task: 'Параграф 12, № 350',                   due: '2026-09-15', teacherId: teacherGerman.id },
    { className: '8Б', subject: 'Русский язык', task: 'Упражнение 90',                        due: '2026-09-15', teacherId: teacherTaisia.id },
  ];
  homeworkData.forEach(h => DB.addHomework(h));

  // ============================================================
  // РАСПИСАНИЕ 8А
  // ============================================================
  DB.setScheduleForClass('8А', {
    'Понедельник': [
      { subject: 'Алгебра',        room: '12',       teacher: 'Лобах Г.А.' },
      { subject: 'Русский язык',   room: '5',        teacher: 'Лобах Т.А.' },
      { subject: 'Литература',     room: '5',        teacher: 'Лобах Т.А.' },
      { subject: 'История',        room: '8',        teacher: '' },
      { subject: 'Физкультура',    room: 'Спортзал', teacher: '' }
    ],
    'Вторник': [
      { subject: 'Геометрия',      room: '12',       teacher: 'Лобах Г.А.' },
      { subject: 'Информатика',    room: '21',       teacher: 'Лобах Г.А.' },
      { subject: 'Биология',       room: '13',       teacher: '' },
      { subject: 'Английский язык', room: '20',      teacher: '' }
    ],
    'Среда': [
      { subject: 'Алгебра',        room: '12',       teacher: 'Лобах Г.А.' },
      { subject: 'Русский язык',   room: '5',        teacher: 'Лобах Т.А.' },
      { subject: 'Обществознание', room: '8',        teacher: '' },
      { subject: 'Химия',          room: '14',       teacher: '' },
      { subject: 'Информатика',    room: '21',       teacher: 'Лобах Г.А.' }
    ],
    'Четверг': [
      { subject: 'Физика',         room: '15',       teacher: '' },
      { subject: 'Геометрия',      room: '12',       teacher: 'Лобах Г.А.' },
      { subject: 'История',        room: '8',        teacher: '' },
      { subject: 'Физкультура',    room: 'Спортзал', teacher: '' }
    ],
    'Пятница': [
      { subject: 'Русский язык',   room: '5',        teacher: 'Лобах Т.А.' },
      { subject: 'Литература',     room: '5',        teacher: 'Лобах Т.А.' },
      { subject: 'Алгебра',        room: '12',       teacher: 'Лобах Г.А.' },
      { subject: 'Английский язык', room: '20',      teacher: '' },
      { subject: 'География',      room: '9',        teacher: '' }
    ],
    'Суббота': []
  });

  // ============================================================
  // РАСПИСАНИЕ 8Б
  // ============================================================
  DB.setScheduleForClass('8Б', {
    'Понедельник': [
      { subject: 'Геометрия',      room: '12',       teacher: 'Лобах Г.А.' },
      { subject: 'Русский язык',   room: '5',        teacher: 'Лобах Т.А.' },
      { subject: 'Биология',       room: '13',       teacher: '' },
      { subject: 'Физкультура',    room: 'Спортзал', teacher: '' }
    ],
    'Вторник': [
      { subject: 'Алгебра',        room: '12',       teacher: 'Лобах Г.А.' },
      { subject: 'Литература',     room: '5',        teacher: 'Лобах Т.А.' },
      { subject: 'История',        room: '8',        teacher: '' },
      { subject: 'Английский язык', room: '20',      teacher: '' }
    ],
    'Среда': [
      { subject: 'Информатика',    room: '21',       teacher: 'Лобах Г.А.' },
      { subject: 'Русский язык',   room: '5',        teacher: 'Лобах Т.А.' },
      { subject: 'Химия',          room: '14',       teacher: '' }
    ],
    'Четверг': [
      { subject: 'Алгебра',        room: '12',       teacher: 'Лобах Г.А.' },
      { subject: 'Геометрия',      room: '12',       teacher: 'Лобах Г.А.' },
      { subject: 'Обществознание', room: '8',        teacher: '' },
      { subject: 'Физкультура',    room: 'Спортзал', teacher: '' }
    ],
    'Пятница': [
      { subject: 'Русский язык',   room: '5',        teacher: 'Лобах Т.А.' },
      { subject: 'Литература',     room: '5',        teacher: 'Лобах Т.А.' },
      { subject: 'Физика',         room: '15',       teacher: '' }
    ],
    'Суббота': []
  });

  console.log('✅ База заполнена начальными данными');
  console.log('Аккаунты: lobahadm, teacher, lobahg, lobaht, student, ivanovi, petrovp — пароль у всех 123');
}

// Запускаем seed сразу
seedIfEmpty();
