const menusHome = document.querySelector("#menus-home");
const menusFaculties = document.querySelector("#menus-faculties");
const menusContact = document.querySelector("#menus-contact");

menusHome.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = '/dashboard'; 
})

menusFaculties.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = '/home/faculties'; 
})

menusContact.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = '/home/contact'; 
})