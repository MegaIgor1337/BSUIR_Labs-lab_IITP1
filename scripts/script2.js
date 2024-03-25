document.getElementById("search-button").addEventListener("click", function() {
    const searchText = document.getElementById("search").value.trim().toLowerCase(); 
    const previewItems = document.querySelectorAll('.preview');

    previewItems.forEach(previewItem => {
        const title = previewItem.querySelector("h2").textContent.toLowerCase(); 
        if (searchText === "" || title.includes(searchText)) {
            previewItem.style.display = "block"; 
        } else {
            previewItem.style.display = "none"; 
        }
    });
});
