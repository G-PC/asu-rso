// js/seed.js

function seedIfEmpty() {
  const users = DB.getUsers();
  if (users.length > 0) return; // уже есть данные

  // === Аккаунты по умолчанию ===
  const admin = DB.addUser({
    login: 'admin',
    password: 'admin123',
    name: 'Петрова Анна Сергеевна',
    role: 'admin',
    email: 'admin@school.ru'
  });

  const teacher1 = DB.addUser({
    login: 'teacher',
    password: 'teacher123',
    name: 'Смирнов Пётр Иванович',
    role: 'teacher',
    email: 'smirnov@school.ru',
    subjects: ['Алгебра', 'Геометрия'],
    classes: ['8А', '8Б']
  });

  const teacher2 = DB.addUser({
    login: 'teacher2',
    password: 'teacher123',
    name: 'Кузнецова Ольга Петровна',
    role: 'teacher',
    email: 'kuznetsova@school.ru',
    subjects: ['Русский язык', 'Литература'],
    classes: ['8А']
  });

  const student1 = DB.addUser({
    login: 'student',
    password: 'student123',
    name: 'Иванов Иван Иванович',
    role: 'student',
    email: 'ivanov@school.ru',
    className: '8А'
  });

  const student2 = DB.addUser({
    login: 'student2',
    password: 'student123',
    name: 'Сидорова Мария Алексеевна',
    role: 'student',
    email: 'sidorova@school.ru',
    className: '8А'
  });

  const student3 = DB.addUser({
    login: 'student3',
    password: 'student123',
    name: 'Петров Николай Дмитриевич',
    role: 'student',
    email: 'petrov@school.ru',
    className: '8Б'
  });

  // === Начальные оценки ===
  const gradesData = [
    { studentId: student1.id, className: '8А', subject: 'Алгебра', grade: 5, date: '2026-09-01', comment: 'Контрольная работа', teacherId: teacher1.id },
    { studentId: student1.id, className: '8А', subject: 'Алгебра', grade: 4, date: '2026-09-05', comment: 'Ответ на уроке', teacherId: teacher1.id },
    { studentId: student1.id, className: '8А', subject: 'Геометрия', grade: 5, date: '2026-09-03', comment: 'Самостоятельная', teacherId: teacher1.id },
    { studentId: student1.id, className: '8А', subject: 'Русский язык', grade: 4, date: '2026-09-04', comment: 'Диктант', teacherId: teacher2.id },
    { studentId: student1.id, className: '8А', subject: 'Литература', grade: 5, date: '2026-09-06', comment: 'Стихотворение', teacherId: teacher2.id },
    { studentId: student2.id, className: '8А', subject: 'Алгебра', grade: 4, date: '2026-09-01', comment: 'Контрольная работа', teacherId: teacher1.id },
    { studentId: student2.id, className: '8А', subject: 'Алгебра', grade: 5, date: '2026-09-05', comment: 'Ответ на уроке', teacherId: teacher1.id },
    { studentId: student2.id, className: '8А', subject: 'Русский язык', grade: 5, date: '2026-09-04', comment: 'Диктант', teacherId: teacher2.id },
  ];
  gradesData.forEach(g => DB.addGrade(g));

  // === Начальная домашка ===
  const hwData = [
    { className: '8А', subject: 'Алгебра', task: 'Параграф 12, № 345, 346', due: '2026-09-15', teacherId: teacher1.id },
    { className: '8А', subject: 'Русский язык', task: 'Упражнение 89, повторить правила', due: '2026-09-15', teacherId: teacher2.id },
    { className: '8А', subject: 'Литература', task: 'Прочитать главы 1-3', due: '2026-09-16', teacherId: teacher2.id },
    { className: '8Б', subject: 'Алгебра', task: 'Параграф 12, № 350', due: '2026-09-15', teacherId: teacher1.id },
  ];
  hwData.forEach(h => DB.addHomework(h));

  // === Расписание для 8А ===
  DB.setScheduleForClass('8А', {
    'Понедельник': [
      { subject: 'Алгебра', room: '12', teacher: 'Смирнов П.И.' },
      { subject: 'Русский язык', room: '5', teacher: 'Кузнецова О.П.' },
      { subject: 'Литература', room: '5', teacher: 'Кузнецова О.П.' },
      { subject: 'История', room: '8', teacher: '—' },
      { subject: 'Физкультура', room: 'Спортзал', teacher: '—' }
    ],
    'Вторник': [
      { subject: 'Геометрия', room: '12', teacher: 'Смирнов П.И.' },
      { subject: 'Физика', room: '15', teacher: '—' },
      { subject: 'Биология', room: '13', teacher: '—' },
      { subject: 'Английский язык', room: '20', teacher: '—' }
    ],
    'Среда': [
      { subject: 'Алгебра', room: '12', teacher: 'Смирнов П.И.' },
      { subject: 'Русский язык', room: '5', teacher: 'Кузнецова О.П.' },
      { subject: 'Обществознание', room: '8', teacher: '—' },
      { subject: 'Химия', room: '14', teacher: '—' },
      { subject: 'Информатика', room: '21', teacher: '—' }
    ],
    'Четверг': [
      { subject: 'Физика', room: '15', teacher: '—' },
      { subject: 'Геометрия', room: '12', teacher: 'Смирнов П.И.' },
      { subject: 'История', room: '8', teacher: '—' },
      { subject: 'Физкультура', room: 'Спортзал', teacher: '—' }
    ],
    'Пятница': [
      { subject: 'Русский язык', room: '5', teacher: 'Кузнецова О.П.' },
      { subject: 'Литература', room: '5', teacher: 'Кузнецова О.П.' },
      { subject: 'Алгебра', room: '12', teacher: 'Смирнов П.И.' },
      { subject: 'Английский язык', room: '20', teacher: '—' },
      { subject: 'География', room: '9', teacher: '—' }
    ],
    'Суббота': []
  });

  console.log('✅ База заполнена начальными данными');
  console.log('Аккаунты: admin/admin123, teacher/teacher123, student/student123');
}

seedIfEmpty();
