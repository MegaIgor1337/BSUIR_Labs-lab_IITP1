let modal = null;
let body = null;
let form = null;
let button = null;
let button_submit = null;
let file = null;
let file_input = null;
document.addEventListener('click', (e) => {
   const modalContent = document.querySelector('.modal-content')
   if (!modalContent.contains(e.target) && e.target !== button) {
      closeModal();
   }
})
document.addEventListener('DOMContentLoaded', () => {
   modal = document.getElementById("myModal");
   button = document.querySelector('.add-button');
   button_submit = document.querySelector('.btn-submit');
   form = document.getElementById("form");
   body = document.getElementsByTagName('body')[0];
   button.addEventListener('click', () => {
      openModal();
   })
   button_submit.addEventListener('click', (e) => {
      e.preventDefault();
      addRow();
   })
})


function openModal() {
   modal.classList.add("blur");
   modal.style.display = "block";
}

function closeModal() {
   modal.style.display = "none";
   modal.classList.remove("blur");
   form.reset();
}

function addRow() {
   const name = document.getElementById("name").value;
   const description = document.getElementById("description").value;
   const date = document.getElementById("date").value;
   if (!name || !date || !description) {
      alert('Заполните все поля')
      return
   }
   const table = document.getElementById("table");
   const insertIndex = table.rows.length;
   const row = table.insertRow(insertIndex);
   const cell1 = row.insertCell(0);
   const cell2 = row.insertCell(1);
   const cell3 = row.insertCell(2);
   const a = `<a href="project.html">${name}</a>`
   cell1.innerHTML = a;
   cell2.innerHTML = description;
   cell3.innerHTML = date;
   closeModal();
}