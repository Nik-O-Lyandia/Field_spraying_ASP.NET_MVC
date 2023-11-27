
//********************************************
//        STATIC VARIABLES SECTION
//********************************************
let droneTypes = []

//********************************************
//        STATIC FUNCTIONS SECTION
//********************************************

function loadDroneTypes() {

}

function addObj(objName) {
    var formData = $("#add-" + objName + "-form").serializeArray();

    let dataObject = {};

    let postAllowed = true;

    $.each(formData, function (i, field) {
        if (field.value == "" || field.value == null) {
            alert("Some fields aren't filled. Please, fill all the requsted fields.");
            postAllowed = false;
            return false;
        }
        dataObject[field.name] = field.value;
    });

    let data = JSON.stringify(dataObject);

    if (postAllowed) {
        $.ajax({
            type: "POST",
            url: "/drones/add-" + objName,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: data,
            dataType: "json",
            success: function (response) {
                console.log(response);
                alert(response);
            },
            error: function (response) {
                console.log(response);
                alert("Add failed with response: " + response);
            }
        });
    }
}

function deleteObj(objName) {
    var formData = $("#delete-" + objName + "-form").serializeArray();

    let dataObject = {};

    let postAllowed = true;

    $.each(formData, function (i, field) {
        if (field.value == "" || field.value == null) {
            alert("Some fields aren't filled. Please, fill all the requsted fields.");
            postAllowed = false;
            return false;
        }
        dataObject[field.name] = field.value;
    });

    let data = JSON.stringify(dataObject);

    if (postAllowed) {
        $.ajax({
            type: "DELETE",
            url: "/drones/delete-" + objName,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: data,
            dataType: "json",
            success: function (response) {
                console.log(response);
                alert(response);
            },
            error: function (response) {
                console.log(response);
                alert("Delete failed with response: " + response);
            }
        });
    }
}

function updateObj(objName) {
    var formData = $("#update-" + objName + "-form").serializeArray();

    let dataObject = {};

    let postAllowed = true;

    $.each(formData, function (i, field) {
        if (field.value == "" || field.value == null) {
            alert("Some fields aren't filled. Please, fill all the requsted fields.");
            postAllowed = false;
            return false;
        }
        dataObject[field.name] = field.value;
    });

    let data = JSON.stringify(dataObject);

    if (postAllowed) {
        $.ajax({
            type: "PUT",
            url: "/drones/update-" + objName,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: data,
            dataType: "json",
            success: function (response) {
                console.log(response);
                alert(response);
            },
            error: function (response) {
                console.log(response);
                alert("Update failed with response: " + response);
            }
        });
    }
}

//********************************************
//          HANDLE CHANGE EVENTS
//********************************************
$(document).ready(function () {

    $("#nav-manage-drone-types-tab").on('shown.bs.tab', function (event) {
        $.get({
            url: "/drones/get-all-drone-types",
            success: function (data) {
                const selectDroneTypeElement = document.getElementById("manage-drone-type");
                droneTypes = [];
                selectDroneTypeElement.innerHTML = '<option value="None" hidden>None</option>';
                $.each(data.drones, function (i, elem) {
                    let opt = selectDroneTypeElement.appendChild(document.createElement("option"));
                    droneTypes.push(elem);
                    opt.text = elem.name;
                });
                console.log(droneTypes);
            },
            error: function (response) {
                console.log(response);
                alert("Drone type import failed");
            }
        });
    });

    $("#nav-add-drone-type-tab").on('shown.bs.tab', function (event) {

    });

    $("#nav-manage-drones-tab").on('shown.bs.tab', function (event) {

    });

    $("#update-drone-type-btn").click(function (event) {
        const typeSelectElem = document.getElementById("manage-drone-type");

        if (typeSelectElem.value != "None") {
            const deleteFromElem = document.getElementById("delete-drone-type-form");
            deleteFrom.style.display = "hidden";
            const updateFromElem = document.getElementById("update-drone-type-form");
            updateFrom.style.display = "block";

            var updateFromInnerElements = updateFromElem.getElementsByClassName("form-group");

            for (let i = 0; i < updateFromInnerElements.length; i++) {
                for (const child of updateFromInnerElements[i].children) {
                    if (child.id == "update-drone-type-name-old") {
                        child.value = typeSelectElem.value;
                    }
                }
            }
        } else {

        }

        event.preventDefault();
    });

    $("#back-drone-type-btn").click(function (event) {
        const typeSelectElem = document.getElementById("manage-drone-type");

        if (typeSelectElem.value != "None") {
            const updateFrom = document.getElementById("update-drone-type-form");
            updateFrom.style.display = "hidden";
            const deleteFrom = document.getElementById("delete-drone-type-form");
            deleteFrom.style.display = "block";

        } else {

        }

        event.preventDefault();
    });

    $("#nav-add-drone-tab").on('shown.bs.tab', function (event) {
        $.get({
            url: "/drones/get-all-drone-types",
            success: function (data) {
                const selectDroneTypeElement = document.getElementById("drone-type");
                $.each(data, function (i, elem) {
                    let opt = selectDroneTypeElement.appendChild(document.createElement("option"));
                    opt.text = elem;
                });
            }
        });
    });

    // ----- ADD DRONE TYPE -----
    $("#add-drone-type-form").submit(function (event) {
        addObj("drone-type");
        event.preventDefault();
    });

    // ----- DELETE DRONE TYPE -----
    $("#delete-drone-type-form").submit(function (event) {
        deleteObj("drone-type");
        event.preventDefault();
    });

    // ----- UPDATE DRONE TYPE -----
    $("#update-drone-type-form").submit(function (event) {
        updateObj("drone-type");
        event.preventDefault();
    });

    // ----- ADD DRONE -----
    $("#add-drone-form").submit(function (event) {

        var formData = $("#add-drone-form").serializeArray();

        let postAllowed = true;
        $.each(formData, function (i, field) {
            if ((field.value == "" || field.value == null) ||
                (field.name == "drone-type" && field.value == "None")) {

                alert("Some fields aren't filled. Please, fill all the requsted fields.");
                postAllowed = false;
                return false;
            }
        });

        if (postAllowed) {
            $.ajax({
                type: "POST",
                url: "/drones/add-drone",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: formData,
                dataType: "json",
                success: function (response) {
                    console.log(response);
                },
                error: function (response) {
                    console.log(response);
                    alert("Export failed");
                }
            });
        }

        event.preventDefault();
    });

    // ----- DELETE DRONE -----
    $("#delete-drone-form").submit(function (event) {
        deleteObj("drone");
        event.preventDefault();
    });

    // ----- UPDATE DRONE -----
    $("#update-drone-form").submit(function (event) {
        updateObj("drone");
        event.preventDefault();
    });

    $("#nav-manage-drone-types-tab").click(); 
});

