document.addEventListener('DOMContentLoaded', async function () {
    async function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('projects_database', 1);

            request.onerror = function () {
                reject('Unable to open the database');
            };

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('projects')) {
                    db.createObjectStore('projects', { keyPath: 'id' });
                }
            };
        });
    }

    async function getProjectDetails(projectId) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('projects_database', 1);
    
            request.onerror = function () {
                reject('Unable to open the database');
            };
    
            request.onsuccess = function () {
                const db = request.result;
                const tx = db.transaction('projects', 'readonly');
                const store = tx.objectStore('projects');
                
                const getRequest = store.get(+projectId);
                getRequest.onsuccess = function () {
                    if (getRequest.result) {
                        resolve(getRequest.result);
                    } else {
                        reject('Project with the specified ID not found');
                    }
                };
    
                getRequest.onerror = function () {
                    reject('Unable to get project data');
                };
            };
        });
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('id');

    if (!lessonId || isNaN(lessonId)) {
        console.error('Invalid lesson identifier');
        return;
    }

    try {
        const projectDetails = await getProjectDetails(lessonId);

        const projectDetailsContainer = document.getElementById('project-details');
        projectDetailsContainer.innerHTML = `
            <h1>${projectDetails.title}</h1>
            <p>${projectDetails.description}</p>
            <!-- Additional project details -->
        `;
    } catch (error) {
        console.error(error);
    }

    function getCommentsFromLocalStorage() {
        const commentsString = localStorage.getItem('comments');
        return commentsString ? JSON.parse(commentsString) : [];
    }

    function displayComments(comments) {
        const commentsContainer = document.getElementById('comments-container');
        if (!commentsContainer) {
            console.error('Element with id "comments-container" not found');
            return;
        }

        commentsContainer.innerHTML = '';

        comments.forEach((comment, index) => {
            if (comment.lessonId === lessonId) {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment');

                const nameElement = document.createElement('h3');
                nameElement.textContent = comment.name;

                const textElement = document.createElement('p');
                textElement.textContent = comment.text;

                const dateElement = document.createElement('p');
                dateElement.textContent = 'Date: ' + new Date(comment.date).toLocaleString();

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', function () {
                    if (confirm('Are you sure you want to delete this comment?')) {
                        deleteComment(index);
                    }
                });

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', function () {
                    const newText = prompt('Enter the new comment text:', comment.text);
                    if (newText !== null) {
                        editComment(index, newText);
                    }
                });

                commentElement.appendChild(nameElement);
                commentElement.appendChild(textElement);
                commentElement.appendChild(dateElement);
                commentElement.appendChild(deleteButton);
                commentElement.appendChild(editButton);

                commentsContainer.appendChild(commentElement);
            }
        });
    }

    async function addComment(name, text, lessonId) {
        const comments = getCommentsFromLocalStorage();
        const currentDate = new Date().toISOString();
        comments.push({ name, text, date: currentDate, lessonId });
        localStorage.setItem('comments', JSON.stringify(comments));
        displayComments(comments);
    }

    async function deleteComment(index) {
        const comments = getCommentsFromLocalStorage();
        comments.splice(index, 1);
        localStorage.setItem('comments', JSON.stringify(comments));
        displayComments(comments);
    }

    async function editComment(index, newText) {
        const comments = getCommentsFromLocalStorage();
        comments[index].text = newText;
        localStorage.setItem('comments', JSON.stringify(comments));
        displayComments(comments);
    }

    const commentForm = document.getElementById('comment-form');
    commentForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const nameInput = document.getElementById('name');
        const textArea = document.getElementById('comment-text');
        const name = nameInput.value.trim();
        const text = textArea.value.trim();
        if (name && text && lessonId) {
            addComment(name, text, lessonId);
            nameInput.value = '';
            textArea.value = '';
        } else {
            alert('Please fill in all form fields and ensure the lesson is defined in the URL.');
        }
    });

    async function loadComments() {
        try {
            const response = await fetch('data/comments.json');
            const newComments = await response.json();
            const currentDate = new Date().toISOString();
            newComments.forEach(comment => {
                comment.date = currentDate;
            });
    
            // Получаем существующие комментарии из localStorage
            const existingComments = getCommentsFromLocalStorage();
            
            // Объединяем новые комментарии с существующими
            const allComments = existingComments.concat(newComments);
            
            // Сохраняем все комментарии в localStorage
            localStorage.setItem('comments', JSON.stringify(allComments));
            
            // Возвращаем объединенный список комментариев
            return allComments;
        } catch (error) {
            console.error('Ошибка загрузки комментариев:', error);
            return [];
        }
    }
    

    const comments = await loadComments();
    displayComments(comments);

    function sortCommentsByDateDescending(comments) {
        return comments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const sortButton = document.getElementById('sort-comments-button');
    sortButton.addEventListener('click', function () {
        const comments = getCommentsFromLocalStorage();
        const sortedComments = sortCommentsByDateDescending(comments);
        displayComments(sortedComments);
    });
});
