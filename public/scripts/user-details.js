//theme
document.addEventListener("DOMContentLoaded", () => {
    const themeStylesheet1 = document.getElementById("themeStylesheet1");
    const themeStylesheet2 = document.getElementById("themeStylesheet2");

    const currentTheme = localStorage.getItem("theme") || "light";
    themeStylesheet1.href = currentTheme === "dark" ? "/styles/user-details-dark.css" : "/styles/user-details.css";
    themeStylesheet2.href = currentTheme === "dark" ? "/styles/common-dark.css" : "/styles/common.css"
});


//form
const form = document.querySelector("#form")

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = {
        fname: formData.get('fname'),
        lname: formData.get('lname'),
        course: formData.get('course'),
        batch: formData.get('batch')
    };

    axios.post('/home/personal-details', data)
    .then((res) => console.log("User data updated successfully:", res.data))
    .then(() => location.reload)
    .then(() => document.querySelector(".submit-message").textContent = "User data updated successfully")
    .catch((err) => console.error('There was an error during submission:', err))
})
//on each refresh
axios.get('/home/user-data')
.then((res) => {
    if(res.data.fname) document.querySelector('input[name="fname"]').value = res.data.fname
    if(res.data.lname) document.querySelector('input[name="lname"]').value = res.data.lname
    if(res.data.course) document.querySelector('input[name="course"]').value = res.data.course
    if(res.data.batch) document.querySelector('input[name="batch"]').value = res.data.batch
})
.catch(err => console.log(err))