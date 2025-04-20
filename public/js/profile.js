document.addEventListener('DOMContentLoaded', function () {
    const profileForm = document.getElementById('profile-form');
    const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');

    if (!loggedInUserEmail) {
        // Redirect to login if user is not logged in
        window.location.href = 'login.html';
        return;
    }

    const storedUsersObject = JSON.parse(localStorage.getItem('usersData')) || { users: [] };
    const users = storedUsersObject.users;
    const user = users.find(u => u.email === loggedInUserEmail);

    if (user) {
        // Populate form fields
        document.getElementById('profile-name').value = user.name;
        document.getElementById('profile-address').value = user.address;
        document.getElementById('profile-email').value = user.email;
        document.getElementById('profile-phone').value = user.phone || '';
        document.getElementById('profile-age').value = user.age || '';
    }

    profileForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const updatedUser = {
            name: document.getElementById('profile-name').value,
            address: document.getElementById('profile-address').value,
            email: loggedInUserEmail,
            phone: document.getElementById('profile-phone').value,
            age: document.getElementById('profile-age').value,
            password: user.password, // Keep the original password
        };

        // Update the user in the users array
        const userIndex = users.findIndex(u => u.email === loggedInUserEmail);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
        }

        // Update localStorage
        localStorage.setItem('usersData', JSON.stringify({ users: users }));
        alert('Profile updated successfully!');
    });
});