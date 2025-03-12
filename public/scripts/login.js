window.onload = function () {
    document.querySelector(".login-message").textContent = "";

    const URLParams = new URLSearchParams(window.location.search);
    const verification = URLParams.get('verification')
    if(verification === 'fail') {
        document.querySelector(".login-message").textContent = "Incorrect OTP. Verification failed"
    }
}

document.querySelector(".login-form").addEventListener("submit", function (event) 
{
    event.preventDefault();
    document.querySelector(".login-message").textContent = "";
    
    const email = document.querySelector(".login-input").value;
    if (!(validateEmail(email))) {
        document.querySelector(".login-message").textContent = "Please enter a valid KU email."
    }
    else {
        event.target.submit();
    }
})

function validateEmail(email) {
    return (/^[a-z]+[0-9]+@student.ku.edu.np$/.test(email));
}

