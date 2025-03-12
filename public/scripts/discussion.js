//theme
document.addEventListener("DOMContentLoaded", () => {
    const themeStylesheet1 = document.getElementById("themeStylesheet1");
    const themeStylesheet2 = document.getElementById("themeStylesheet2");

    const currentTheme = localStorage.getItem("theme") || "light";
    themeStylesheet1.href = currentTheme === "dark" ? "/styles/discussion-dark.css" : "/styles/discussion.css";
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

//page control

if(sessionStorage.getItem("page") == undefined) {
	sessionStorage.setItem("page", "1");
} 
let page = sessionStorage.getItem("page");

document.querySelector(".current-page").textContent = page;

const previousButton = document.querySelector("#previous")
const nextButton = document.querySelector("#next") 

previousButton.addEventListener("click", (event) => {
	event.preventDefault();
	if (page != 1) sessionStorage.setItem("page", Number(--page));
	// Reload the current page
	location.reload();

})

nextButton.addEventListener("click", (event) => {
	event.preventDefault();
	sessionStorage.setItem("page", Number(++page));
	// Reload the current page
	location.reload();

})

//blocks code used later
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

const block2 = async function () {
	const buttons = document.querySelectorAll(".add-answer");
	const addMenu = document.querySelector(".add-menu");
	
	Promise.resolve()
	.then( () => {
	buttons.forEach((button) => {
		button.addEventListener('click', function (event) {
			event.preventDefault();
			sessionStorage.setItem("questionID", this.id);
			addMenu.classList.toggle("active");
			event.stopPropagation();
		});
	});
	})
	
	.then( () => {
		addMenu.addEventListener('submit', function (event) {
			event.preventDefault();
			const value = document.querySelector('.add-value').value;
			const questionID = sessionStorage.getItem("questionID") 
			const data = {
				questionID: questionID,
				value: value
			};
		
			axios.post('/discussion/add-answer', data)
				.then(response => {
					console.log('Successfully added answer:', response);
					document.querySelector(".add-message").textContent = 'Answer added successfully';
					document.querySelector(".add-value").value = '';
				})
				.catch(error => {
					console.error('Error:', error);
				});
			
			event.stopPropagation(); 
		});
	})
	
	document.addEventListener("click", (event) => {
		if (!addMenu.contains(event.target) && event.target !== user) {
			document.querySelector(".add-message").textContent = ' ';
			sessionStorage.removeItem("questionID");
			addMenu.classList.remove("active");
		}
	});
}

//load questions to the page

const contentSection = document.querySelector(".main-section-2");

axios.get(`/discussion/get-questions/?page=${page}`)
.then((res) => {
	contentSection.innerHTML = `<p class="your-questions">Latest Questions</p>`;
	contentSection.innerHTML += res.data.map(question => `
		<div class="question-block">
			<p><span class="question-title">${question.title}</span> 
			<p class="question-detail">Added by <span class="question-poster">${question.poster}</span> on <span class="question-date">${question.created.split('T')[0]}</span></p>
			</p>
			<p>${question.value}</p>
			<button class="add-answer" id="${question.id}">Add Answer</button>
			<p class="show-answers" id=${question.id}>Show Answers <i class="fas fa-angle-down"></i></p>
			<p class="hide-answers" id=${question.id}>Hide Answers <i class="fas fa-angle-up"></i></p>
		</div>
		`).join('');

	block1();
})
.then((res) => {
	block2();
})
.catch((error) => console.error("Error fetching questions:", error));

//search
document.querySelector('.main-section-1').addEventListener('submit', async function (event) {
    event.preventDefault();  
    const query = document.querySelector(".search-bar").value;
    if (query.trim()) {
		await axios.get('/discussion/search', {
			params: { 
				item: query, 
				page: sessionStorage.getItem("page")
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
					<p class="question-detail">Added by <span class="question-poster">${question.poster}</span> on <span class="question-date">${question.created.split('T')[0]}</span></p>
					</p>
					<p>${question.value}</p>
					<button class="add-answer" id="${question.id}">Add Answer</button>
					<p class="show-answers" id=${question.id}>Show Answers <i class="fas fa-angle-down"></i></p>
					<p class="hide-answers" id=${question.id}>Hide Answers <i class="fas fa-angle-up"></i></p>
				</div>
				`).join('');

			block1();
		})
		.then((res) => {
			const buttons = document.querySelectorAll(".add-answer");
			const addMenu = document.querySelector(".add-menu");

			buttons.forEach((button) => {
				button.addEventListener('click', function (event) {
					event.preventDefault();
					sessionStorage.setItem("questionID", this.id);
					addMenu.classList.toggle("active");
					event.stopPropagation();
				});
			});
		})
		.catch ((error) => console.error('Error fetching search results:', error))
	}
});
