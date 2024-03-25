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

    function addCourseToPortfolio(title, content, imageDataUrl, date) {
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
    
        const dateAdded = new Date(date).toISOString(); 
        const dateAddedFormatted = dateAdded.slice(0, 10); 
        previewItem.dataset.dateAdded = dateAddedFormatted;
    
        previewItem.appendChild(img);
        previewItem.appendChild(h2);
        previewItem.appendChild(p);
    
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', deleteCourse);
    
        const updateButton = document.createElement('button');
        updateButton.classList.add('update-button');
        updateButton.textContent = 'Update';
        updateButton.addEventListener('click', () => {
            currentCourseToUpdate = previewItem;
            const updatedTitle = previewItem.querySelector("h2").textContent;
            const updatedContent = previewItem.querySelector("p").textContent;
            const updatedImageUrl = previewItem.querySelector("img").src;
            openUpdateModal(updatedTitle, updatedContent, updatedImageUrl);
        });
    
    
        previewItem.appendChild(deleteButton);
        previewItem.appendChild(updateButton);
    
        coursesPreview.appendChild(previewItem);
    
        // Save course data to localStorage
        const courseData = {
            title: title,
            content: content,
            image: imageDataUrl,
            date: date
        };
    
        coursesData.push(courseData); // Add to local array
        localStorage.setItem('coursesData', JSON.stringify(coursesData)); // Save to localStorage
    }
    

    function deleteCourse(event) {
        const previewItem = event.target.closest(".preview");
        if (previewItem) {
            previewItem.remove();
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
            addCourseToPortfolio(course.title, course.content, course.image, course.date);
        });
    }

    fetch('data/courses.json')
    .then(response => response.json())
    .then(data => {
        displayCoursesFromJSON(data);
    })
    .catch(error => console.error('Error loading courses:', error));

    updateForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const updatedTitle = document.getElementById("update-title").value;
        const updatedContent = document.getElementById("update-content").value;
        const updatedImageFile = document.getElementById("update-image").files[0];
        if (updatedImageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(updatedImageFile);
            reader.onload = function () {
                const updatedImageDataUrl = reader.result;
                currentCourseToUpdate.querySelector("h2").textContent = updatedTitle;
                currentCourseToUpdate.querySelector("p").textContent = updatedContent;
                currentCourseToUpdate.querySelector("img").src = updatedImageDataUrl;

                console.log("Информация о курсе обновлена.");
                closeUpdateModal(); 
            };
        } else {
            currentCourseToUpdate.querySelector("h2").textContent = updatedTitle;
            currentCourseToUpdate.querySelector("p").textContent = updatedContent;
            closeUpdateModal();
        }
    });

    closeModalButton.addEventListener("click", closeUpdateModal);

    document.getElementById("sort-button").addEventListener("click", function() {
        const previewItems = document.querySelectorAll('.preview');
        const sortedItems = Array.from(previewItems).sort((a, b) => {
            const dateA = new Date(a.getAttribute("data-date-added")).getTime(); 
            const dateB = new Date(b.getAttribute("data-date-added")).getTime();
            return dateB - dateA; 
        });

        coursesPreview.innerHTML = "";

        sortedItems.forEach(item => {
            coursesPreview.appendChild(item);
        });
    });

    coursesForm.addEventListener("submit", function (event) {
        event.preventDefault(); 
        const title = document.getElementById("course-title").value;
        const content = document.getElementById("content").value;
        const imageFile = document.getElementById("image").files[0];
    
        if (imageFile) {
            const reader = new FileReader();
    
            reader.onload = function () {
                const imageDataUrl = reader.result;
    
                addCourseToPortfolio(title, content, imageDataUrl, new Date()); 
                document.getElementById("course-title").value = "";
                document.getElementById("content").value = "";
                document.getElementById("image").value = "";
            };
    
            reader.readAsDataURL(imageFile);
        } else {
            console.error("Файл изображения не выбран");
        }
    });
});
