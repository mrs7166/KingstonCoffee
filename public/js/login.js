document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const storedUsersObject = JSON.parse(localStorage.getItem('usersData')) || { users: [] };
        const users = storedUsersObject.users;

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            alert('Login successful!');
            // Store the logged-in user's email
            localStorage.setItem('loggedInUserEmail', user.email);
            // Redirect to the profile page
            window.location.href = 'profile.html';
        } else {
            alert('Invalid email or password.');
        }
    });
});