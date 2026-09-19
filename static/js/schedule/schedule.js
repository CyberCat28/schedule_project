// глобальные переменные для хранения данных
let allLessons = [];
let allTeachers = [];
let allSubjects = [];
let allGroups = [];
let editingLessonId = null;

const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const lessonTimes = [
    { pair: 1, time: '9:00 - 10:35' },
    { pair: 2, time: '10:45 - 12:20' },
    { pair: 3, time: '13:05 - 14:40' },
    { pair: 4, time: '14:50 - 16:25' }
];

// инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    // обработчики модального окна и формы вешаются сразу, чтобы кнопки
    // работали даже если загрузка/отрисовка данных ниже упадёт
    bindModalHandlers();

    // загрузка всех данных
    await Promise.all([
        loadLessons(),
        loadTeachers(),
        loadSubjects(),
        loadGroups()
    ]);

    // создание таблицы и отображение данных
    buildScheduleTable();
    renderSchedule();
    renderTeachersPanel();
    populateGroupSelect();

    // инициализация drag & drop
    initDragAndDrop();
});

// привязка обработчиков модального окна и формы занятия
function bindModalHandlers() {
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const lessonForm = document.getElementById('lessonForm');
    const lessonTeacher = document.getElementById('lessonTeacher');

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModalHandler);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModalHandler);
    if (deleteBtn) deleteBtn.addEventListener('click', deleteLesson);

    if (lessonForm) lessonForm.addEventListener('submit', handleFormSubmit);
    if (lessonTeacher) lessonTeacher.addEventListener('change', updateSubjectsSelect);
}

// Обработчик кнопки экспорта
const exportBtn = document.getElementById('exportBtn');
if (exportBtn) exportBtn.addEventListener('click', async function() {
    try {
        showNotification('Формирование файла Excel...', 'info');
        
        const response = await fetch('/export/excel');
        
        if (!response.ok) {
            throw new Error('Ошибка при экспорте');
        }
        
        // Получение blob-данных
        const blob = await response.blob();
        
        // Создание ссылки для скачивания
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'расписание.xlsx';
        document.body.appendChild(a);
        a.click();
        
        // Очистка
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification('Расписание успешно экспортировано!', 'success');
    } catch (error) {
        console.error('Ошибка экспорта:', error);
        showNotification('Не удалось экспортировать расписание', 'error');
    }
});