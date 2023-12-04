
function registerUser() {
    var username = $('#username').val();
    var password = $('#password').val();
    var verificationPassword = $('#verification-password').val();

    var notEmpty = true;
    var form = document.getElementById("registrationForm");
    var fromElemsList = form.getElementsByTagName("input");

    for (let elem of fromElemsList) {
        if ($.trim(elem.value) == "") {
            notEmpty = false;
            break;
        }
    };

    if (notEmpty) {
        if (verificationPassword == password) {
            var user = { Username: username, Password: password };

            $.ajax({
                url: '/authorization/Register',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(user),
                success: function (result) {
                    throwSuccessAlert("Реєстрація успішна.");
                    window.location.href = result.redirectToUrl;
                },
                error: function (result) {
                    throwErrorAlert(result.responseJSON.message);
                }
            });
        } else {
            throwErrorAlert("Пароль не співпадає.");
        }
    } else {
        throwErrorAlert("Деякі поля не заповнені.");
    }
}

function goToLogin() {
    window.location.href = '/';
}