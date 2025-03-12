//theme
document.addEventListener("DOMContentLoaded", () => {
    const themeStylesheet1 = document.getElementById("themeStylesheet1");
    const themeStylesheet2 = document.getElementById("themeStylesheet2");

    const currentTheme = localStorage.getItem("theme") || "light";
    themeStylesheet1.href = currentTheme === "dark" ? "/styles/ask-dark.css" : "/styles/ask.css";
    themeStylesheet2.href = currentTheme === "dark" ? "/styles/common-dark.css" : "/styles/common.css"
});

//answer page
const answer = document.querySelector("#answer")
const answerSb = document.querySelector("#sb-answer")
answer.addEventListener("click", (event) => {
event.preventDefault();
try { window.location.href = '/discussion/answer'}
catch(error) { console.error("There was an error with the request:", error)}
})
answerSb.addEventListener("click", (event) => {
event.preventDefault();
try { window.location.href = '/discussion/answer'}
catch(error) { console.error("There was an error with the request:", error)}
})

//ask page
const ask = document.querySelector("#ask")
const askSb = document.querySelector("#sb-ask")
ask.addEventListener("click", (event) => {
  event.preventDefault();
  try { window.location.href = '/discussion/ask' }
  catch(error) { console.error("There was an error with the request:", error) }
})
askSb.addEventListener("click", (event) => {
    event.preventDefault();
    try { window.location.href = '/discussion/ask' }
    catch(error) { console.error("There was an error with the request:", error) }
})

//menu icon
const user = document.querySelector(".user");
user.addEventListener("click", (event) => {
    document.querySelector(".nav-menu").classList.toggle("active");
    event.stopPropagation(); 
});

const navMenu = document.querySelector(".nav-menu");
document.addEventListener("click", (event) => {
    if (!navMenu.contains(event.target) && event.target !== user) {
        navMenu.classList.remove("active");
    }
});

//add question
const add = document.querySelector(".add-question");
add.addEventListener("click", (event) => {
    document.querySelector(".add-menu").classList.toggle("active");
    event.stopPropagation(); 
});

const addMenu = document.querySelector(".add-menu");
document.addEventListener("click", (event) => {
    if (!addMenu.contains(event.target) && event.target !== user) {
		document.querySelector(".add-message").textContent = ' ';
        addMenu.classList.remove("active");
    }
});

//add question form submission
const form = document.querySelector('.add-menu');
    
form.addEventListener('submit', function (event) {
	event.preventDefault(); 
	const title = document.querySelector('.add-title').value;
	const value = document.querySelector('.add-value').value;

	const data = {
		title: title,
		value: value
	};

	axios.post('/discussion/add-question', data)
		.then(response => {
			console.log('Successfully added question:', response);
			document.querySelector(".add-message").textContent = 'Question added successfully';
			document.querySelector(".add-title").value = '';
			document.querySelector(".add-value").value = '';
		})
		.catch(error => {
			console.error('Error:', error);
		});
});

//page control
if(sessionStorage.getItem("pageQ") == undefined) {
	sessionStorage.setItem("pageQ", "1");
} 
let page = sessionStorage.getItem("pageQ");

document.querySelector(".current-page").textContent = page;

const previousButton = document.querySelector("#previous")
const nextButton = document.querySelector("#next") 

previousButton.addEventListener("click", (event) => {
	event.preventDefault();
	if (page != 1) sessionStorage.setItem("pageQ", Number(--page));
	// Reload the current page
	location.reload();
})

nextButton.addEventListener("click", (event) => {
	event.preventDefault();
	sessionStorage.setItem("pageQ", Number(++page));
	// Reload the current page
	location.reload();
})

//blocks of code used later
const block1 = async function () {
	const buttons = document.querySelectorAll(".show-answers");
	const buttonsH = document.querySelectorAll(".hide-answers");
	buttons.forEach(function (button) {button.classList.toggle("active")} )

	buttons.forEach(function (button) {
		button.addEventListener('click', function (event) {
			event.preventDefault();
			const questionID = this.id;

			axios.get(`/discussion/get-a-for-q?questionID=${questionID}`)
			.then((res) => {
				const block = button.parentElement;

				block.insertAdjacentHTML('beforeend', res.data.map(answer => `
					<div class="answer-block">
						<p class="answer-detail">Answered by <span class="answer-poster">${answer.poster}</span> on <span class="answer-date">${answer.created.split('T')[0]}</span></p>
						<p>${answer.value}</p>
					</div>
				`).join(''));
			})
			.catch((err) => console.error("Error fetching answers:", err)); 

			button.classList.remove("active");
			button.parentElement.querySelector(".hide-answers").classList.toggle("active");
		}); 
	});

	buttonsH.forEach(function (buttonH) {
		buttonH.addEventListener('click', function (event) {
			event.preventDefault();
			buttonH.parentElement.querySelectorAll('.answer-block').forEach(answer => answer.remove());

			buttonH.classList.remove("active");
			buttonH.parentElement.querySelector(".show-answers").classList.toggle("active");
		}); 
	});
}

const block2 = function () {
	//delete question
	const deleteButtons = document.querySelectorAll(".question-delete");
	const deleteContainer = document.querySelector(".delete-container");
	const cancelButton = document.querySelector(".cancel-button");
	const deleteButton = document.querySelector(".delete-button");

	document.addEventListener("click", (event) => {
		if (!deleteContainer.contains(event.target) && event.target !== deleteButton) {
			deleteContainer.classList.remove("active");
			sessionStorage.removeItem("delete")
			document.querySelector(".delete-message").textContent = ""
		}
	});

	deleteButtons.forEach((button) => {
		button.addEventListener("click", (event) => {
			event.stopPropagation();
			deleteContainer.classList.toggle("active");
			sessionStorage.setItem("delete", button.id)
		});
	});

	cancelButton.addEventListener("click", (event) => {
		deleteContainer.classList.remove("active");
		sessionStorage.removeItem("delete")
		document.querySelector(".delete-message").textContent = ""
	})

	deleteButton.addEventListener("click", (event) => {
		const questionID = sessionStorage.getItem("delete");
		axios.delete(`/discussion/delete-question?questionID=${questionID}`)
			.then((res) => {
				if(res.data.notFound) {
					console.log("Question could not be deleted: ", res.data)
					document.querySelector(".delete-message").textContent = "Question already deleted"
				}
				else {
					console.log("Deleted question successfully: ", res.data)
					document.querySelector(".delete-message").textContent = "Question deleted successfully"
				}
			})
			.catch((error) => {console.error("Error deleting question: ",error)});
	})
}

//load questions to the page

const contentSection = document.querySelector(".main-section-2");

axios.get(`/discussion/get-your-questions/?page=${page}`)
.then((res) => {
	contentSection.innerHTML = `<p class="your-questions">Your Questions</p>`;
	contentSection.innerHTML += res.data.map(question => `
		<div class="question-block">
			<p><span class="question-title">${question.title}</span> 
			<p class="question-detail">Added on <span class="question-date">${question.created.split('T')[0]}</span></p>
			</p>
			<button class="question-delete" id=${question.id}><i class="fas fa-trash-alt"></i></button>
			<p>${question.value}</p>
			<p class="show-answers" id=${question.id}>Show Answers <i class="fas fa-angle-down"></i></p>
			<p class="hide-answers" id=${question.id}>Hide Answers <i class="fas fa-angle-up"></i></p>
		</div>
		`).join('');

	block1();
})
.then((res) => {
	block2();
})
.catch((err) => console.error("Error fetching questions:", err));

//search
document.querySelector('.main-section-1').addEventListener('submit', async function (event) {
    event.preventDefault();  
    const query = document.querySelector(".search-bar").value;
    if (query.trim()) {
		await axios.get('/discussion/search', {
			params: { 
				item: query, 
				page: sessionStorage.getItem("pageQ")
			}
		})
		
		.then((res) => {
			console.log('Search Results:', res.data);

			document.querySelector(".navigation").style.display = 'none';

			const contentSection = document.querySelector(".main-section-2");
			contentSection.innerHTML = `<p class="your-questions">Search Results</p>`;
			contentSection.innerHTML += res.data.map(question => `
				<div class="question-block">
					<p><span class="question-title">${question.title}</span> 
					<p class="question-detail">Added on <span class="question-date">${question.created.split('T')[0]}</span></p>
					</p>
					<button class="question-delete" id=${question.id}><i class="fas fa-trash-alt"></i></button>
					<p>${question.value}</p>
					<p class="show-answers" id=${question.id}>Show Answers <i class="fas fa-angle-down"></i></p>
					<p class="hide-answers" id=${question.id}>Hide Answers <i class="fas fa-angle-up"></i></p>
				</div>
				`).join('');

			block1();
		})
		.then((res) => {
			//delete question
			const deleteButtons = document.querySelectorAll(".question-delete");
			const deleteContainer = document.querySelector(".delete-container");
			const cancelButton = document.querySelector(".cancel-button");
			const deleteButton = document.querySelector(".delete-button");

			document.addEventListener("click", (event) => {
				if (!deleteContainer.contains(event.target) && event.target !== deleteButton) {
					deleteContainer.classList.remove("active");
					sessionStorage.removeItem("delete")
					document.querySelector(".delete-message").textContent = ""
				}
			});

			deleteButtons.forEach((button) => {
				button.addEventListener("click", (event) => {
					event.stopPropagation();
					deleteContainer.classList.toggle("active");
					sessionStorage.setItem("delete", button.id)
				});
			});

			cancelButton.addEventListener("click", (event) => {
				deleteContainer.classList.remove("active");
				sessionStorage.removeItem("delete")
				document.querySelector(".delete-message").textContent = ""
			})
		})
		.catch ((error) => console.error('Error fetching search results:', error))
    }
});

