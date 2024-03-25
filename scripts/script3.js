document.getElementById("sort-button").addEventListener("click", function() {
    const previewItems = document.querySelectorAll('.preview');
    const sortedItems = Array.from(previewItems).sort((a, b) => {
        const dateA = new Date(a.getAttribute("data-date-added")); 
        const dateB = new Date(b.getAttribute("data-date-added")); 
        return dateA - dateB; 
    });

    const coursesPreview = document.querySelector('[data-courses-preview]');
    coursesPreview.innerHTML = "";

    sortedItems.forEach(item => {
        coursesPreview.appendChild(item);
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const coursesForm = document.getElementById("courses-form");
    const coursesPreview = document.querySelector('[data-courses-preview]');
    const updateModal = document.getElementById("update-modal");
    const closeModalButton = document.getElementById("close-modal");
    const updateForm = document.getElementById("update-form");
    let currentCourseToUpdate; 
    let coursesData = []; 

    coursesPreview.addEventListener("click", function(event) {
        if (event.target.classList.contains("update-button")) {
            const previewItem = event.target.closest(".preview");
            const title = previewItem.querySelector("h2").textContent;
            const content = previewItem.querySelector("p").textContent;
            const imageUrl = previewItem.querySelector("img").src;
            currentCourseToUpdate = previewItem; 
            openUpdateModal(title, content, imageUrl);
        }
    });

    function addCourseToPortfolio(title, content, imageDataUrl) {
        const previewItem = document.createElement("div");
        previewItem.classList.add("preview");
    
        const img = document.createElement('img');
        img.src = imageDataUrl;
        img.alt = title;
        img.height = 200;
        img.width = 200;
    
        const h2 = document.createElement('h2');
        h2.textContent = title;
    
        const p = document.createElement('p');
        p.textContent = content;
    
        const dateAdded = new Date().toISOString(); 
        const dateAddedFormatted = dateAdded.slice(0, 10); 
        previewItem.dataset.dateAdded = dateAddedFormatted; 
    
        previewItem.appendChild(img);
        previewItem.appendChild(h2);
        previewItem.appendChild(p);
    
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.textContent = 'Удалить';
        deleteButton.addEventListener('click', () => {
            const confirmation = confirm(`Вы уверены, что хотите удалить курс "${title}"?`);
            if (confirmation) {
                deleteCourse(title);
            }
        });
    
        const updateButton = document.createElement('button');
        updateButton.classList.add('update-button');
        updateButton.textContent = 'Обновить';
        updateButton.addEventListener('click', () => {
            currentCourseToUpdate = previewItem;
            openUpdateModal(title, content, imageDataUrl);
        });
    
        previewItem.appendChild(deleteButton);
        previewItem.appendChild(updateButton);
    
        coursesPreview.appendChild(previewItem);
    
        coursesData.push({
            title: title,
            content: content,
            image: imageDataUrl,
            dateAdded: dateAddedFormatted
        });
    }
    

    function deleteCourse(event) {
        const previewItem = event.target.closest(".preview");
        if (previewItem) {
            previewItem.remove();
            const title = previewItem.querySelector("h2").textContent;
            const dbPromise = idb.openDB('projects_database', 1);
            dbPromise.then(db => {
                const tx = db.transaction('courses', 'readwrite');
                const store = tx.objectStore('courses');
                const titleIndex = store.index('title');
                titleIndex.getKey(title).then(key => {
                    store.delete(key);
                });
                return tx.complete;
            }).then(() => {
                displayCoursesFromIndexedDB();
            });
        }
    }

    function openUpdateModal(title, content, imageUrl) {
        document.getElementById("update-title").value = title;
        document.getElementById("update-content").value = content;
        updateModal.style.display = "block";
    }
    function closeUpdateModal() {
        updateModal.style.display = "none";
    }
    
    function displayCoursesFromJSON(courses) {
        courses.forEach(course => {
            addCourseToPortfolio(course.title, course.content, course.image);
        });
    }
    
    function displayCoursesFromIndexedDB() {
        const dbPromise = idb.openDB('projects_database', 1);
        dbPromise.then(db => {
            const tx = db.transaction('courses', 'readonly');
            const store = tx.objectStore('courses');
            return store.getAll();
        }).then(courses => {
            coursesPreview.innerHTML = "";
            courses.forEach(course => {
                addCourseToPortfolio(course.title, course.content, course.image);
            });
        });
    }
    
    fetch('data/courses.json')
    .then(response => response.json())
    .then(data => {
        displayCoursesFromJSON(data);
    })
    .catch(error => console.error('Error loading courses:', error));
    
    coursesForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;
        const imageFile = document.getElementById("image").files[0];
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = function () {
                const imageDataUrl = reader.result;
                addCourseToPortfolio(title, content, imageDataUrl);
                saveCourseToIndexedDB(title, content, imageDataUrl);
                coursesForm.reset();
            };
        } else {
            alert("Пожалуйста, выберите изображение для загрузки.");
        }
    });
    
    function saveCourseToIndexedDB(title, content, image) {
        const dbPromise = idb.openDB('projects_database', 1);
        dbPromise.then(db => {
            const tx = db.transaction('courses', 'readwrite');
            const store = tx.objectStore('courses');
            store.put({title: title, content: content, image: image});
            return tx.complete;
        }).then(() => {
            displayCoursesFromIndexedDB();
        });
    }
    
    closeModalButton.addEventListener("click", closeUpdateModal);
});

function displayCoursesFromIndexedDB() {
    const dbPromise = idb.openDB('projects_database', 1);
    dbPromise.then(db => {
        const tx = db.transaction('courses', 'readonly');
        const store = tx.objectStore('courses');
        return store.getAll();
    }).then(courses => {
        // Сортируем курсы по дате добавления
        courses.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
        
        coursesPreview.innerHTML = "";
        courses.forEach(course => {
            addCourseToPortfolio(course.title, course.content, course.image);
        });
    });
}
