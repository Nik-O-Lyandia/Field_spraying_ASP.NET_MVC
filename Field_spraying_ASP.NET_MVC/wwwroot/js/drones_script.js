
//********************************************
//        STATIC FUNCTIONS SECTION
//********************************************

function loadDroneTypes() {

}

//********************************************
//          HANDLE CHANGE EVENTS
//********************************************
$(document).ready(function () {

    $("#nav-add-drone-type-tab").on('showed.bs.tab', function (event) {

    });

    $("#nav-add-drone-tab").on('showed.bs.tab', function (event) {
        $.get({
            url: "/drones/get-drone-types",
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

        var formData = $("#add-drone-type-form").serializeArray();

        let dataObject = {};

        let postAllowed = true;
        //console.log(formData);
        $.each(formData, function (i, field) {
            if (field.value == "" || field.value == null) {
                alert("Some fields aren't filled. Please, fill all the requsted fields.");
                postAllowed = false;
                return false;
            }
            dataObject[field.name] = field.value;
        });

        let data = JSON.stringify(dataObject);

        console.log(data);

        if (postAllowed) {
            $.ajax({
                type: "POST",
                url: "/drones/add-drone-type",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: data,
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

    
    // ----- DELETE FEATURE FROM DB -----
    $("#delete_feature_button").click(function () {

        if (selectedFeatures != null) {

            let dataObject = {};

            let feature = selectedFeatures.item(0);
            let featureGeom = feature.getGeometry();

            dataObject.name = selectedFeatures.item(0).get("name");

            if (featureGeom instanceof Polygon) {
                dataObject.objType = "polygon";
            }

            if (featureGeom instanceof Point) {
                dataObject.objType = "point";
            }

            let data = JSON.stringify(dataObject);

            $.ajax({
                type: "POST",
                url: "/Map/delete-feature",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: data,
                dataType: "json",
                success: function (response) {
                    console.log(response);
                    source.removeFeature(feature);
                    removeSelectInteraction();
                },
                error: function (response) {
                    console.log(response);
                    alert("Feature is not in DB");
                },
            });

        } else {
            alert("Please select features to export.");
        }

    });

    //********************************************
    //           WORK START SECTION
    //********************************************


    // ----- CALCULATE COVERAGE TRAJECTORY -----
    $("#build_trajectory_button").click(function () {

        if (selectedFeature != null) {
            let selectedFeatureName = selectedFeature.get("name");

            //console.log(selectedFeature);

            turnOverlayOn();
            if (selectedFeatureName != none) {
                $.get("/Map/build-trajectory", { area_name: selectedFeatureName, spraying_radius: 15 })
                    .done(function (coords) {

                        //console.log(coords);
                        const feature = new Feature({
                            geometry: new LineString(coords),
                        });

                        source.addFeature(feature);
                        featuresAddedThisSession.push(feature);

                        turnOverlayOff();

                    });
            } else {
                alert("Feature has no name. Please export new added features first.");
            }

        } else {
            alert("Please, select area first.")
        }
    });
});

