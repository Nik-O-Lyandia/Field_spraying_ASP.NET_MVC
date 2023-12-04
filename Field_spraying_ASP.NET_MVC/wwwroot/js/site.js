function turnOverlayOn() {
    document.getElementById('waiting_overlay').style.display = 'flex';
}

function turnOverlayOff() {
    document.getElementById('waiting_overlay').style.display = 'none';
}

function logOut() {
    $.ajax({
        url: '/authorization/Logout',
        type: 'POST',
        contentType: 'application/json',
        success: function (result) {
            window.location.href = result.redirectToUrl;
        },
        error: function () {
            alert('Error during authentication');
        }
    });
}

function throwErrorAlert(alertMessage) {

    var errorAlert = document.getElementById("error-alert");

    if ($("#error-alert").is(":visible") == false) {
        var alertText = document.createElement("span");
        alertText.innerHTML = alertMessage;
        errorAlert.appendChild(alertText);

        $("#error-alert").slideDown(400);

        setTimeout(() => {
            $("#error-alert").slideUp(400);
            errorAlert.removeChild(alertText);
        }, 2000);
    }
}

function throwSuccessAlert(alertMessage) {

    var errorAlert = document.getElementById("success-alert");

    if ($("#success-alert").is(":visible") == false) {
        var alertText = document.createElement("span");
        alertText.innerHTML = alertMessage;
        errorAlert.appendChild(alertText);

        $("#success-alert").slideDown(400);

        setTimeout(() => {
            $("#success-alert").slideUp(400);
            errorAlert.removeChild(alertText);
        }, 2000);
    }
}

function throwWarningAlert(alertMessage) {

    var errorAlert = document.getElementById("warning-alert");

    if ($("#warning-alert").is(":visible") == false) {
        var alertText = document.createElement("span");
        alertText.innerHTML = alertMessage;
        errorAlert.appendChild(alertText);

        $("#warning-alert").slideDown(400);

        setTimeout(() => {
            $("#warning-alert").slideUp(400);
            errorAlert.removeChild(alertText);
        }, 2000);
    }
}