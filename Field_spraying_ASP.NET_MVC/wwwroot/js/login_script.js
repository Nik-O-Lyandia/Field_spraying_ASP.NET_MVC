
function logIn() {
    var username = $('#username').val();
    var password = $('#password').val();

    var notEmpty = true;
    var form = document.getElementById("loginForm");
    var fromElemsList = form.getElementsByTagName("input");

    for (let elem of fromElemsList) {
        if ($.trim(elem.value) == "") {
            notEmpty = false;
            break;
        }
    };

    if (notEmpty) {
        var user = { Username: username, Password: password };

        $.ajax({
            url: '/Authorization/Login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(user),
            success: function (result) {
                var profileDropdown = document.getElementById("profile-dropdown-menu");
                profileDropdown.innerHTML = "";
                var option = document.createElement("a");
                option.href = "Login/LogOut";
                option.classList.add("dropdown-item");
                option.text = "LogOut";
                profileDropdown.appendChild(option);
                window.location.href = result.redirectToUrl;
            },
            error: function (result) {
                throwErrorAlert(result.responseJSON.message);
            }
        });
    } else {
        throwErrorAlert("Деякі поля не заповнені.");
    }

}

function goToRegistration() {
    window.location.href = '/Authorization/register';
}
