// Функция для открытия базы данных
async function openDatabase() {
    const db = await idb.openDB('projects_database', 1, {
        upgrade(db) {
            const store = db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
            store.createIndex('title', 'title');
            store.createIndex('date', 'date');
        }
    });
    console.log('Database opened successfully');
    return db;
}

// Функция для заполнения базы данных из файла JSON
async function populateDatabase(db) {
    try {
        const response = await fetch('data/projects.json');
        const data = await response.json();

        const tx = db.transaction('projects', 'readwrite');
        const store = tx.objectStore('projects');

        for (const project of data) {
            await store.add(project);
        }

        await tx.done;
        console.log('Data added to database successfully');

        await displayData();
    } catch (error) {
        console.error('Error loading data:', error);
        throw new Error('Error loading data');
    }
}


async function displayData(startDate, endDate) {
    const db = await openDatabase();
    const tx = db.transaction('projects', 'readonly');
    const store = tx.objectStore('projects');
    const projectsList = document.getElementById('projects-list');

    projectsList.innerHTML = ''; 

    const projects = await store.getAll();

    projects.forEach(project => {
        // Проверяем, если дата проекта попадает в интервал между startDate и endDate
        if ((!startDate || new Date(project.date) >= startDate) &&
            (!endDate || new Date(project.date) <= endDate)) {
            const row = `
                <tr>
                    <td><a href="project.html?id=${project.id}">${project.title}</a></td>
                    <td>${project.description}</td>
                    <td>${project.date}</td>
                    <td><button class="delete-button" data-id="${project.id}">Удалить</button></td>
                </tr>
            `;
            projectsList.insertAdjacentHTML('beforeend', row);
        }
    });

    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const projectId = parseInt(button.getAttribute('data-id'), 10);
            await deleteProjectFromDatabase(projectId);
        });
    });
}
// Функция для обработки события отправки формы поиска проектов по датам
async function setupSearchFormHandler() {
    const searchForm = document.getElementById('date-form');

    searchForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 

        const startDateStr = document.getElementById('start-date').value;
        const endDateStr = document.getElementById('end-date').value;

        // Преобразуем строки с датами в формат YYYY-MM-DD в объекты Date
        const startDate = startDateStr ? new Date(startDateStr) : null;
        const endDate = endDateStr ? new Date(endDateStr) : null;

        await displayData(startDate, endDate);
    });
}


// Обработчик события загрузки DOM
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const db = await openDatabase();
        await displayData(null, null); // Отображаем все данные при загрузке страницы
        setupSearchFormHandler(); // Устанавливаем обработчик отправки формы для поиска проектов по датам
    } catch (error) {
        console.error(error);
    }
});

