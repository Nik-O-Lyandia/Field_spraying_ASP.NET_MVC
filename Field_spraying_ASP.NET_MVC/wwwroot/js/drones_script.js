
//********************************************
//        STATIC VARIABLES SECTION
//********************************************
let droneTypes = []
let drones = [];

//********************************************
//        STATIC FUNCTIONS SECTION
//********************************************

function addObj(objName) {
    var formData = $("#add-" + objName + "-form").serializeArray();

    let dataObject = {};

    let postAllowed = true;

    $.each(formData, function (i, field) {
        if (field.value == "" || field.value == null) {
            throwErrorAlert("Деякі поля не заповнені.");
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
                throwSuccessAlert("Додавання вдалося.");
            },
            error: function (response) {
                console.log(response);
                throwErrorAlert("Додавання не вдалося з повідомленням: " + response);
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
            throwErrorAlert("Деякі поля не заповнені.");
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
                throwSuccessAlert("Видалення вдалося.");
            },
            error: function (response) {
                console.log(response);
                throwErrorAlert("Видалення не вдалося з повідомленням: " + response);
            }
        });
    }
}

function updateObj(objName) {
    var formData = $("#update-" + objName + "-form").serializeArray();

    let dataObject = {};

    $.each(formData, function (i, field) {
        dataObject[field.name] = field.value;
    });

    let data = JSON.stringify(dataObject);

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
            throwSuccessAlert("Редагування вдалося.");
        },
        error: function (response) {
            console.log(response);
            throwErrorAlert("Редагування не вдалося з повідомленням: " + response);
        }
    });
}

function loadDroneTypes() {
    return new Promise(function (resolve, reject) {
        $.get({
            url: "/drones/get-all-drone-types",
            success: function (data) {
                droneTypes = [];
                $.each(data.drone_types, function (i, elem) {
                    droneTypes.push(elem);
                });
                droneTypes.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                resolve(droneTypes);
            },
            error: function (response) {
                console.log(response);
                reject(response);
            }
        });
    });
}

function loadDrones() {
    return new Promise(function (resolve, reject) {
        $.get({
            url: "/drones/get-all-drones",
            success: function (data) {
                drones = [];
                $.each(data.drones, function (i, elem) {
                    drones.push(elem);
                });
                drones.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                resolve(drones);
            },
            error: function (response) {
                console.log(response);
                reject(response);
            }
        });
    });
}

function createDroneTypeTable(typeName) {

    let type = droneTypes.find((type) => {
        return type.name === typeName;
    });

    let table = document.createElement("table");
    table.classList.add('table', 'table-dark', 'table-striped');

    let tbody = document.createElement("tbody");

    // ROW 1
    let row = document.createElement("tr");

    let col1 = document.createElement("th");
    col1.setAttribute("scope", 'row');
    col1.innerText = 'Тип дрона:';
    let col2 = document.createElement("th");
    col2.innerText = type.name;

    row.appendChild(col1);
    row.appendChild(col2);
    tbody.appendChild(row);

    // ROW 2
    row = document.createElement("tr");

    col1 = document.createElement("th");
    col1.setAttribute("scope", 'row');
    col1.innerText = "Об'єм бака [л]:";
    col2 = document.createElement("th");
    col2.innerText = type.tankVolume;

    row.appendChild(col1);
    row.appendChild(col2);
    tbody.appendChild(row);

    // ROW 3
    row = document.createElement("tr");

    col1 = document.createElement("th");
    col1.setAttribute("scope", 'row');
    col1.innerText = 'Ширина смуги обприскування [м]:';
    col2 = document.createElement("th");
    col2.innerText = type.spraySwathWidthMin.toString() + ' – ' + type.spraySwathWidthMax.toString();

    row.appendChild(col1);
    row.appendChild(col2);
    tbody.appendChild(row);

    // ROW 4
    row = document.createElement("tr");

    col1 = document.createElement("th");
    col1.setAttribute("scope", 'row');
    col1.innerText = "Об'ємна витрата [л/хв]:";
    col2 = document.createElement("th");
    col2.innerText = type.flowRateMin.toString() + ' – ' + type.flowRateMax.toString();

    row.appendChild(col1);
    row.appendChild(col2);
    tbody.appendChild(row);

    // ROW 5
    row = document.createElement("tr");

    col1 = document.createElement("th");
    col1.setAttribute("scope", 'row');
    col1.innerText = 'Максимальна швидкість [м/с]:';
    col2 = document.createElement("th");
    col2.innerText = type.maxSpeed.toString();

    row.appendChild(col1);
    row.appendChild(col2);
    tbody.appendChild(row);

    table.appendChild(tbody);

    let infoBoardHeaderElem = document.createElement("h2");
    infoBoardHeaderElem.innerText = 'ІНФОРМАЦІЯ ПРО ТИП ДРОНА';
    infoBoardHeaderElem.setAttribute('style', 'text-align: center;');

    let infoBoard = document.getElementById("info-board");
    infoBoard.innerHTML = "";
    infoBoard.appendChild(infoBoardHeaderElem);
    infoBoard.appendChild(table);
}

//********************************************
//          HANDLE CHANGE EVENTS
//********************************************
$(document).ready(function () {

    //********************************************
    //     DRONE TYPES MANAGEMENT SECTION
    //********************************************

    // ----- OPEN DRONE TYPES MANAGEMENT TAB -----
    $("#nav-manage-drone-types-tab").on('shown.bs.tab', function (event) {
        document.getElementById("info-board").innerHTML = "";

        const updateForm = document.getElementById("update-drone-type-form");
        updateForm.style.display = "none";
        const deleteForm = document.getElementById("delete-drone-type-form");
        deleteForm.style.display = "block";

        loadDroneTypes().then(function (data) {
            const selectDroneTypeElement = document.getElementById("manage-drone-type");
            selectDroneTypeElement.innerHTML = '<option value="None" hidden>None</option>';

            droneTypes.forEach((elem) => {
                let opt = selectDroneTypeElement.appendChild(document.createElement("option"));
                opt.value = elem.name;
                opt.text = elem.name;
            });
        }).catch(function (err) {
            console.log(err);
        });

    });
    
    $("#manage-drone-type").on("change", function (event) {
        createDroneTypeTable(event.target.value);
    });
    
    // ----- OPEN DRONE TYPE UPDATE FORM -----
    $("#update-drone-type-btn").click(function (event) {
        const typeSelectElem = document.getElementById("manage-drone-type");

        if (typeSelectElem.value != "None") {
            const deleteFormElem = document.getElementById("delete-drone-type-form");
            deleteFormElem.style.display = "none";
            const updateFormElem = document.getElementById("update-drone-type-form");
            updateFormElem.style.display = "block";

            var updateFormInnerElements = updateFormElem.getElementsByClassName("form-group");

            for (let i = 0; i < updateFormInnerElements.length; i++) {
                for (const child of updateFormInnerElements[i].children) {
                    if (child.id == "update-drone-type-name-old") {
                        child.value = typeSelectElem.value;
                    }
                    if (child.id == "update-drone-type-name") {
                        child.value = droneTypes.find(obj => {
                            return obj.name === typeSelectElem.value
                        }).name;
                    }
                    if (child.id == "update-drone-tank-volume") {
                        child.value = droneTypes.find(obj => {
                            return obj.name === typeSelectElem.value
                        }).tankVolume;
                    }
                    if (child.id == "update-drone-spray-swath-width-min") {
                        child.value = droneTypes.find(obj => {
                            return obj.name === typeSelectElem.value
                        }).spraySwathWidthMin;
                    }
                    if (child.id == "update-drone-spray-swath-width-max") {
                        child.value = droneTypes.find(obj => {
                            return obj.name === typeSelectElem.value
                        }).spraySwathWidthMax;
                    }
                    if (child.id == "update-drone-flow-rate-min") {
                        child.value = droneTypes.find(obj => {
                            return obj.name === typeSelectElem.value
                        }).flowRateMin;
                    }
                    if (child.id == "update-drone-flow-rate-max") {
                        child.value = droneTypes.find(obj => {
                            return obj.name === typeSelectElem.value
                        }).flowRateMax;
                    }
                    if (child.id == "update-drone-speed-max") {
                        child.value = droneTypes.find(obj => {
                            return obj.name === typeSelectElem.value
                        }).maxSpeed;
                    }
                }
            }
        } else {
            throwErrorAlert("Тип дрона не вибрано.");
        }

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

    // ----- GO BACK TO DELETE -----
    $("#back-drone-type-btn").click(function (event) {

        const updateForm = document.getElementById("update-drone-type-form");
        updateForm.style.display = "none";
        const deleteForm = document.getElementById("delete-drone-type-form");
        deleteForm.style.display = "block";

        event.preventDefault();
    });

    //********************************************
    //        DRONE TYPES ADDING SECTION
    //********************************************
    $("#nav-add-drone-type-tab").on('shown.bs.tab', function (event) {
        document.getElementById("info-board").innerHTML = "";
    });

    // ----- ADD DRONE TYPE -----
    $("#add-drone-type-form").submit(function (event) {
        addObj("drone-type");
        event.preventDefault();
    });

    //********************************************
    //         DRONES MANAGEMENT SECTION
    //********************************************

    // ----- OPEN DRONES MANAGEMENT TAB -----
    $("#nav-manage-drones-tab").on('shown.bs.tab', function (event) {
        document.getElementById("info-board").innerHTML = "";

        const updateForm = document.getElementById("update-drone-form");
        updateForm.style.display = "none";
        const deleteForm = document.getElementById("delete-drone-form");
        deleteForm.style.display = "block";

        loadDrones().then(function (data) {
            const selectDroneElement = document.getElementById("manage-drone-name");
            selectDroneElement.innerHTML = '<option value="None" hidden>None</option>';

            drones.forEach((elem) => {
                let opt = selectDroneElement.appendChild(document.createElement("option"));
                opt.value = elem.name;
                opt.text = elem.name;
            });
        }).catch(function (err) {
            console.log(err);
        });

    });

    $("#manage-drone-name").on("change", function (event) {

        let drone = drones.find((drone) => {
            return drone.name === event.target.value;
        });

        createDroneTypeTable(drone.droneType);

    });

    // ----- OPEN DRONES UPDATE FORM -----
    $("#update-drone-btn").click(function (event) {
        const droneSelectElem = document.getElementById("manage-drone-name");

        if (droneSelectElem.value != "None") {
            const deleteFormElem = document.getElementById("delete-drone-form");
            deleteFormElem.style.display = "none";
            const updateFormElem = document.getElementById("update-drone-form");
            updateFormElem.style.display = "block";

            var updateFormInnerElements = updateFormElem.getElementsByClassName("form-group");

            for (let i = 0; i < updateFormInnerElements.length; i++) {
                for (const child of updateFormInnerElements[i].children) {
                    if (child.id == "update-drone-name-old") {
                        child.value = droneSelectElem.value;
                    }
                    if (child.id == "update-drone-name") {
                        child.value = drones.find(obj => {
                            return obj.name === droneSelectElem.value
                        }).name;
                    }
                    if (child.id == "update-drone-type-name") {
                        loadDroneTypes().then(function (data) {
                            child.innerHTML = '';
                            droneTypes.forEach((elem) => {
                                let opt = child.appendChild(document.createElement("option"));
                                opt.value = elem.name;
                                opt.text = elem.name;
                            });

                            child.value = drones.find(obj => {
                                return obj.name === droneSelectElem.value
                            }).droneType;
                        }).catch(function (err) {
                            console.log(err);
                        });

                    }
                }
            }
        } else {
            throwErrorAlert("Дрон не вибрано.");
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

    // ----- GO BACK TO DELETE -----
    $("#back-drone-btn").click(function (event) {

        const updateForm = document.getElementById("update-drone-form");
        updateForm.style.display = "none";
        const deleteForm = document.getElementById("delete-drone-form");
        deleteForm.style.display = "block";

        event.preventDefault();
    });

    //********************************************
    //           DRONES ADDING SECTION
    //********************************************
    $("#nav-add-drone-tab").on('shown.bs.tab', function (event) {
        document.getElementById("info-board").innerHTML = "";

        loadDroneTypes().then(function (data) {
            const selectDroneTypeElement = document.getElementById("drone-type");
            selectDroneTypeElement.innerHTML = '<option value="None" hidden>None</option>';

            droneTypes.forEach((elem) => {
                let opt = selectDroneTypeElement.appendChild(document.createElement("option"));
                opt.value = elem.name;
                opt.text = elem.name;
            });
        }).catch(function (err) {
            console.log(err);
        });
    });

    $("#drone-type").on("change", function (event) {
        createDroneTypeTable(event.target.value);
    });

    // ----- ADD DRONE -----
    $("#add-drone-form").submit(function (event) {
        addObj("drone");
        event.preventDefault();
    });

    // Triggering first tab
    $("#nav-manage-drone-types-tab").click();
});

