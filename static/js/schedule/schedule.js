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
    
    // обработчики модального окна
    document.getElementById('closeModal').addEventListener('click', closeModalHandler);
    document.getElementById('cancelBtn').addEventListener('click', closeModalHandler);
    document.getElementById('deleteBtn').addEventListener('click', deleteLesson);
    
    // обработчики формы
    document.getElementById('lessonForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('lessonTeacher').addEventListener('change', updateSubjectsSelect);
});

// Обработчик кнопки экспорта
document.getElementById('exportBtn').addEventListener('click', async function() {
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