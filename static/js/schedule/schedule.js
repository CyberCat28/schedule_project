// глобальные переменные для хранения данных
let allLessons = [];
let allTeachers = [];
let allSubjects = [];
let allGroups = [];
let editingLessonId = null;

// константы
const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

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