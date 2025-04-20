function initAutocomplete() {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        const addressInput = document.getElementById('booking-form-address');
        const autocomplete = new google.maps.places.Autocomplete(addressInput);

        autocomplete.setFields(['address_component', 'geometry', 'name']);

        autocomplete.addListener('place_changed', function () {
            const place = autocomplete.getPlace();
            console.log(place);
            let streetNumber = '';
            for (const component of place.address_components) {
                if (component.types.includes('street_number')) {
                    streetNumber = component.long_name;
                    break;
                }
            }
            console.log(streetNumber);
        });
    } else {
        console.error("Google Maps API not loaded.");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initAutocomplete();
		
    const passwordInput = document.getElementById('booking-form-password');
    const confirmPasswordInput = document.getElementById('booking-form-confirm-password');
    const form = document.querySelector('.booking-form');
    const passwordError = document.getElementById('password-error');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (passwordInput.value !== confirmPasswordInput.value) {
            passwordError.style.display = 'block';
            confirmPasswordInput.value = '';
            return;
        } else {
            passwordError.style.display = 'none';
        }

        const usersData = {
            name: document.getElementById('booking-form-name').value,
            address: document.getElementById('booking-form-address').value,
            email: document.getElementById('booking-form-email').value,
            phone: document.querySelector('[name="booking-form-phone"]').value,
            age: document.getElementById('booking-form-number').value,
            password: passwordInput.value,
        };

        let usersObject = JSON.parse(localStorage.getItem('usersData')) || { users: [] };
        usersObject.users.push(usersData);
        localStorage.setItem('usersData', JSON.stringify(usersObject));

        const storedUsersObject = JSON.parse(localStorage.getItem('usersData')) || { users: [] };
        console.log(storedUsersObject);

        alert('Account created successfully!');
        form.reset();
    });
});

