﻿import Feature from '/node_modules/ol/Feature.js';
import Map from '/node_modules/ol/Map.js';
import View from '/node_modules/ol/View.js';
import { fromLonLat } from '/node_modules/ol/proj.js';
import { Draw, Modify, Snap, DragBox, Select } from '/node_modules/ol/interaction.js';
import { BingMaps, Vector as VectorSource } from '/node_modules/ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from '/node_modules/ol/layer.js';
//import Select from '/node_modules/ol/interaction/Select.js';
import { pointerMove } from '/node_modules/ol/events/condition.js';
import { Fill, Stroke, Circle, Style, Icon } from '/node_modules/ol/style.js';
import { LineString, Polygon, Point } from '/node_modules/ol/geom.js';
import { none } from 'ol/centerconstraint';
import { platformModifierKeyOnly } from 'ol/events/condition.js';
import { getWidth } from 'ol/extent.js';


const styleFunction = function (feature) {

    const geometry = feature.getGeometry();
    const styles = [
        new Style({
            stroke: new Stroke({
                color: 'rgba(220, 220, 220, 0.8)',
                width: 2,
            }),
            fill: new Fill({
                color: 'rgba(220, 220, 220, 0.2)',
            }),
            image: new Circle({
                radius: 5,
                fill: new Fill({
                    color: 'rgba(220, 220, 220, 0.8)',
                }),
            }),
        }),
    ];

    if (geometry instanceof LineString) {

        //console.log(geometry);

        geometry.forEachSegment(function (start, end) {
            const dx = end[0] - start[0];
            const dy = end[1] - start[1];
            const rotation = Math.atan2(dy, dx);
            // arrows
            styles.push(
                new Style({
                    geometry: new Point(end),
                    image: new Icon({
                        src: '/data/arrow.png',
                        anchor: [0.75, 0.5],
                        width: 16,
                        height: 16,
                        rotateWithView: true,
                        rotation: -rotation,
                    }),
                })
            );
        });
    }

    return styles;
};

//********************************************
//    VARIABLES INITIALIZATION SECTION
//********************************************

let workPlans = [];
let drones = [];
let droneTypes = [];

const source = new VectorSource();
const vector = new VectorLayer({
    source: source,
    style: styleFunction,
});

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new BingMaps({
                key: 'AqhyxnSQ0bUbehdW0c2bRpwMrUWQsqagpK1icErRHM9J1s0NsX-ubpej_rgamrqC', //AqhyxnSQ0bUbehdW0c2bRpwMrUWQsqagpK1icErRHM9J1s0NsX-ubpej_rgamrqC
                imagerySet: 'Aerial',
            }),
        }),
        vector,
    ],
    view: new View({
        center: fromLonLat([33.784976, 51.915775]),
        zoom: 16,
    }),
});

let draw;
const modify = new Modify({ source: source });
let snap = new Snap({ source: source });


//********************************************
//          SELECTING AREA VARIABLES
//********************************************
let exportSelectActivated = false; // was select activated in Management section or not

const selected = new Style({
    fill: new Fill({
        color: 'rgba(0, 0, 255, 0.2)',
    }),
    stroke: new Stroke({
        color: 'rgba(0, 0, 255, 0.8)',
        width: 2,
    }),
    image: new Circle({
        radius: 7,
        fill: new Fill({
            color: 'rgba(0, 0, 255, 0.8)',
        }),
    }),
});

const hovered = new Style({
    fill: new Fill({
        color: 'rgba(0, 100, 255, 0.2)',
    }),
    stroke: new Stroke({
        color: 'rgba(0, 100, 255, 0.6)',
        width: 2,
    }),
    image: new Circle({
        radius: 9,
        fill: new Fill({
            color: 'rgba(0, 100, 255, 0.6)',
        }),
    }),
});

// select interaction working on "singleclick"
const management_select = new Select({ style: selected });
const work_plan_select_polygon = new Select({ style: selected });
const work_plan_select_point = new Select({ style: selected });

// select interaction working on "pointermove"
const selectPointerMove = new Select({
    condition: pointerMove,
    style: hovered,
});

let selectedFeatures = null;
let featuresAddedThisSession = [];

const exportFormElement = document.getElementById("export-form");
const createWorkPlanForm = document.getElementById("create-work-plan-form");
const updateWorkPlanForm = document.getElementById("update-work-plan-form");
const deleteWorkPlanForm = document.getElementById("delete-work-plan-form");
const deleteButton = document.getElementById("delete-feature-btn");


//********************************************
//        STATIC FUNCTIONS SECTION
//********************************************

function addDrawInteraction(drawType) {
    draw = new Draw({
        source: source,
        type: drawType,
    });

    draw.on("drawend", function (event) {
        featuresAddedThisSession.push(event.feature);
        //console.log(featuresAddedThisSession);
    });

    map.addInteraction(draw);
}

function removeDrawInteractions() {
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    map.removeInteraction(modify);
}

function removeSelectInteraction() {
    selectedFeatures = null;
    map.removeInteraction(management_select);
    map.removeInteraction(work_plan_select_polygon);
    map.removeInteraction(work_plan_select_point);
    exportFormElement.style.display = "none";
    deleteButton.style.display = "none";
}

function importMap(data) {
    const areas = data.areas;
    const points = data.points;

    const features = source.getFeatures();

    let feature = null;

    for (let i = 0; i < areas.length; i++) {
        feature = new Feature({
            geometry: new Polygon([areas[i].coords]),
            name: areas[i].name,
        });

        let addFeaturePermission = true;
        for (let j = 0; j < features.length; j++) {
            if (feature.get('name') == features[j].get('name')) {
                addFeaturePermission = false
            }
        }
        if (addFeaturePermission) {
            source.addFeature(feature);
        }
    }

    for (let i = 0; i < points.length; i++) {
        feature = new Feature({
            geometry: new Point(points[i].coords),
            name: points[i].name,
        });

        let addFeaturePermission = true;
        for (let j = 0; j < features.length; j++) {
            if (feature.get('name') == features[j].get('name')) {
                addFeaturePermission = false
            }
        }
        if (addFeaturePermission) {
            source.addFeature(feature);
        }
    }
}

function loadWorkPlans() {
    return new Promise(function (resolve, reject) {
        $.get({
            url: "/map/get-all-work-plans",
            success: function (data) {
                workPlans = [];
                $.each(data.workPlans, function (i, elem) {
                    workPlans.push(elem);
                });

                workPlans.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                resolve(workPlans);
            },
            error: function (response) {
                console.log(response);
                reject(response);
                //alert("Drones import failed");
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
                //drones.sort((a, b) => a.name - b.name); // numeric
                drones.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)); //string

                resolve(drones);
            },
            error: function (response) {
                console.log(response);
                reject(response);
                //alert("Drones import failed");
            }
        });
    });
}

function loadDroneType(droneType) {
    return new Promise(function (resolve, reject) {
        $.get({
            url: "/drones/get-drone-type/" + droneType,
            success: function (type) {
                droneTypes.push(type);
                resolve(type);
            },
            error: function (response) {
                console.log(response);
                reject(response);
                //alert("Drones import failed");
            }
        });
    });
}

//********************************************
//        HANDLE FUNCTIONS SECTION
//********************************************

management_select.on("select", function (e) {
    map.removeInteraction(selectPointerMove);
    selectedFeatures = e.target.getFeatures();

    //console.log(e.selected);
    //console.log(e);

    let geoms = [];
    for (let i = 0; i < selectedFeatures.getLength(); i++) {
        geoms.push(selectedFeatures.item(i).getGeometry());
    }

    if (selectedFeatures.getLength() <= 2) {
        exportFormElement.style.display = "block";
        var exportFormInnerElements = exportFormElement.getElementsByClassName("form-group");

        for (let i = 0; i < exportFormInnerElements.length; i++) {
            if (selectedFeatures.getLength() == 1) {
                if ((exportFormInnerElements[i].id == "area-name-group" && geoms[0] instanceof Polygon) ||
                    (exportFormInnerElements[i].id == "point-name-group" && geoms[0] instanceof Point)) {
                    exportFormInnerElements[i].style.display = "block";
                    deleteButton.style.display = "block";
                } else {
                    exportFormInnerElements[i].style.display = "none";
                }
            } else {
                deleteButton.style.display = "none";
            }

            if (selectedFeatures.getLength() == 2) {
                if ((geoms[0] instanceof Polygon || geoms[1] instanceof Polygon) && (geoms[0] instanceof Point || geoms[1] instanceof Point)) {
                    if ((exportFormInnerElements[i].id == "area-name-group" && (geoms[0] instanceof Polygon || geoms[1] instanceof Polygon)) ||
                        (exportFormInnerElements[i].id == "point-name-group" && (geoms[0] instanceof Point || geoms[1] instanceof Point))) {
                        exportFormInnerElements[i].style.display = "block";
                    } else {
                        exportFormInnerElements[i].style.display = "none";
                    }
                } else {
                    alert("Selected features must not be the same type.");
                    removeSelectInteraction();
                    break;
                }
            }
        }
    } else {
        exportFormElement.style.display = "none";
        deleteButton.style.display = "none";
        let featuresNum = exportSelectActivated ? "1" : "2";
        alert("Select no more than " + featuresNum + " features.");
        removeSelectInteraction();
    }

    if (e.deselected.length > 0 && e.selected.length == 0 && selectedFeatures.getLength() == 0) {
        removeSelectInteraction();
    }

});

work_plan_select_polygon.on("select", function (e) {
    map.removeInteraction(selectPointerMove);
    selectedFeatures = e.target.getFeatures();

    if (selectedFeatures.getLength() > 0) {
        let geoms = [];
        for (let i = 0; i < selectedFeatures.getLength(); i++) {
            geoms.push(selectedFeatures.item(i).getGeometry());
        }

        if (geoms[0] instanceof Polygon) {
            document.getElementById("area-name-create-work-plan").value = selectedFeatures.item(0).get("name");
        } else {
            alert("Selected features must be Area.");
        }
    }

    if (e.deselected.length > 0 && e.selected.length == 0 && selectedFeatures.getLength() == 0) {
        removeSelectInteraction();
    }

    removeSelectInteraction();
});

work_plan_select_point.on("select", function (e) {
    map.removeInteraction(selectPointerMove);
    selectedFeatures = e.target.getFeatures();

    if (selectedFeatures.getLength() > 0) {
        let geoms = [];
        for (let i = 0; i < selectedFeatures.getLength(); i++) {
            geoms.push(selectedFeatures.item(i).getGeometry());
        }

        if (geoms[0] instanceof Point) {
            document.getElementById("point-name-create-work-plan").value = selectedFeatures.item(0).get("name");
        } else {
            alert("Selected features must be Point.");
        }
    }

    if (e.deselected.length > 0 && e.selected.length == 0 && selectedFeatures.getLength() == 0) {
        removeSelectInteraction();
    }

    removeSelectInteraction();
});

// ----- MAP AUTOUPDATE -----
$.get("/Map/Import")
    .done(function (data) {
        importMap(data)
    });

const importInterval = setInterval(function () {
    $.get("/Map/Import")
        .done(function (data) {
            importMap(data)
        });
}, 5000);

//********************************************
//          HANDLE CHANGE EVENTS
//********************************************
$(document).ready(function () {

    $("#nav-draw-tab").on('hidden.bs.tab', function (event) {
        //event.target // newly activated tab
        //event.relatedTarget // previous active tab
        removeDrawInteractions();
    });

    $("#nav-management-tab").on('hidden.bs.tab', function (event) {
        removeSelectInteraction();
    });

    //********************************************
    //          DRAWING SECTION
    //********************************************

    // ----- DRAW POLYGON -----
    $("#draw-polygon-btn").click(function () {
        removeDrawInteractions();
        addDrawInteraction('Polygon');
        map.addInteraction(snap);
        map.addInteraction(modify);
    });

    // ----- DRAW LOADING POINT -----
    $("#draw-point-btn").click(function () {
        removeDrawInteractions();
        addDrawInteraction('Point');
        map.addInteraction(modify);
    });

    // ----- UNDO LAST ACTION -----
    $("#undo-btn").click(function () {
        draw.removeLastPoint();
    });

    // ----- CANCEL DRAW -----
    $("#cancel-draw-btn").click(function () {
        removeDrawInteractions();
    });


    // ----- CLEAR LAST ADDED FEATURE -----
    $("#clear-last-feature-btn").click(function () {
        source.removeFeature(featuresAddedThisSession.pop());
    });

    // ----- CLEAR ALL NEW FEATURES -----
    $("#clear-all-new-btn").click(function () {
        for (let i = 0; i < featuresAddedThisSession.length; i++) {
            source.removeFeature(featuresAddedThisSession[i]);
        }
        featuresAddedThisSession = [];
    });

    //********************************************
    //          MANAGMENT SECTION
    //********************************************

    // ----- IMPORT AREA ACTION -----
    $("#import-btn").click(function () {

        $.get("/Map/Import")
            .done(function (data) {
                importMap(data);
            });
    });

    // ----- AREA SELECTION -----
    $("#management-select-btn").click(function () {
        exportSelectActivated = true;
        map.addInteraction(selectPointerMove);
        map.addInteraction(management_select);

    });

    // ----- EXPORT AREA ACTION -----
    $("#export-form").submit(function (event) {

        var formDataObject = {};

        if (selectedFeatures != null) {
            let geoms = [];
            for (let i = 0; i < selectedFeatures.getLength(); i++) {
                geoms.push(selectedFeatures.item(i).getGeometry());
            }

            let areaName = '';
            let pointName = '';

            if ((geoms.length == 2 && geoms[0] instanceof Polygon && geoms[1] instanceof Point) ||
                (geoms.length == 2 && geoms[0] instanceof Point && geoms[1] instanceof Polygon) ||
                (geoms.length == 1 && geoms[0] instanceof Point) ||
                (geoms.length == 1 && geoms[0] instanceof Polygon)) {

                for (let i = 0; i < geoms.length; i++) {
                    if (geoms[i] instanceof Polygon) {
                        let areaObj = {};
                        areaName = $("#area-name").val() != null ? $("#area-name").val() : null;
                        areaObj.name = areaName;
                        areaObj.coords = geoms[i].getCoordinates()[0];
                        formDataObject.area = areaObj;
                    }
                    if (geoms[i] instanceof Point) {
                        let pointObj = {};
                        pointName = $("#point-name").val() != null ? $("#point-name").val() : null
                        pointObj.name = pointName;
                        pointObj.coords = geoms[i].getCoordinates();
                        formDataObject.point = pointObj;
                    }
                }

            } else {
                alert("Select only 1 polygon or 1 loading point or both of them at the same time.");
            }

            //console.log(coords[0]);

            let formData = JSON.stringify(formDataObject);

            $.ajax({
                type: "POST",
                url: "/Map/Export",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: formData,
                dataType: "json",
                success: function (response) {
                    console.log(response);
                    for (let i = 0; i < geoms.length; i++) {
                        if (geoms[i] instanceof Polygon) {
                            selectedFeatures.item(i).set('name', areaName);
                        }
                        if (geoms[i] instanceof Point) {
                            selectedFeatures.item(i).set('name', pointName);
                        }
                    }
                    removeSelectInteraction();
                },
                error: function (response) {
                    console.log(response);
                    alert("Export failed");
                }
            });
        } else {
            alert("Please select features to export.");
        }
        event.preventDefault();
    });

    // ----- DELETE FEATURE FROM DB -----
    $("#delete-feature-btn").click(function () {

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

    // ----- REMOVE SELECTING WHEN TAB IS HIDDEN -----
    $("#nav-work-start-tab").on('hidden.bs.tab', function () {
        removeSelectInteraction();
    });

    // ----- OPEN WORK PLANING TAB -----
    $("#nav-work-start-tab").on('shown.bs.tab', function () {
        createWorkPlanForm.style.display = "none";
        updateWorkPlanForm.style.display = "none";
        deleteWorkPlanForm.style.display = "block";

        loadWorkPlans().then(function (data) {
            const selectWorkPlanElement = document.getElementById("select-work-plan");
            selectWorkPlanElement.innerHTML = '<option value="None" hidden>None</option>';

            workPlans.forEach((elem) => {
                let opt = selectWorkPlanElement.appendChild(document.createElement("option"));
                opt.value = elem.name;
                opt.text = elem.name;
            });
        }).catch(function (err) {
            console.log(err);
        });
    });

    // ----- DELETE WORK PLAN -----
    $("#delete-work-plan-form").submit(function (event) {
        deleteObj("work-plan");
        event.preventDefault();
    });

    // ----- OPEN WORK PLAN ADDING FORM -----
    $("#create-work-plan-btn").click(function (event) {
        createWorkPlanForm.style.display = "block";
        updateWorkPlanForm.style.display = "none";
        deleteWorkPlanForm.style.display = "none";

        document.getElementById("spraying-swath-width-create-work-plan-group").style.display = "none";
        document.getElementById("flow-rate-create-work-plan-group").style.display = "none";
        document.getElementById("drone-speed-create-work-plan-group").style.display = "none";

        loadDrones().then(function (data) {
            const selectElem = document.getElementById("select-drone-create-work-plan");
            selectElem.innerHTML = '<option value="None" hidden>None</option>';
            drones.forEach((elem) => {
                let opt = selectElem.appendChild(document.createElement("option"));
                opt.value = elem.name;
                opt.text = elem.name;
            });
        }).catch(function (err) {
            console.log(err);
        });
    });

    // ----- SET INPUT LIMITS WHEN DRONE IS SELECTED -----
    $("#select-drone-create-work-plan").on("change", function (event) {

        let drone = drones.find((drone) => {
            return drone.name === event.target.value;
        });

        let droneType = droneTypes.find((type) => {
            return type.name === drone.droneType;
        });

        const spraySwathWidthElem = document.getElementById("spraying-swath-width-create-work-plan");
        const flowRateElem = document.getElementById("flow-rate-create-work-plan");
        const speedElem = document.getElementById("drone-speed-create-work-plan");

        document.getElementById("spraying-swath-width-create-work-plan-group").style.display = "block";
        document.getElementById("flow-rate-create-work-plan-group").style.display = "block";
        document.getElementById("drone-speed-create-work-plan-group").style.display = "block";

        if (droneType == undefined) {
            droneType = loadDroneType(drone.droneType).then(function (type) {
                spraySwathWidthElem.setAttribute("min", type.spraySwathWidthMin);
                spraySwathWidthElem.setAttribute("max", type.spraySwathWidthMax);
                spraySwathWidthElem.setAttribute("value", type.spraySwathWidthMin);

                flowRateElem.setAttribute("min", type.flowRateMin);
                flowRateElem.setAttribute("max", type.flowRateMax);
                flowRateElem.setAttribute("value", type.flowRateMin);

                speedElem.setAttribute("min", 0.1);
                speedElem.setAttribute("max", type.maxSpeed);
                speedElem.setAttribute("value", 0.1);

                $("#spraying-swath-width-create-work-plan-value-span").text(type.spraySwathWidthMin);
                $("#flow-rate-create-work-plan-value-span").text(type.flowRateMin);
                $("#drone-speed-create-work-plan-value-span").text(0.1);
            }).catch(function (err) {
                console.log(err);
            });
        } else {
            spraySwathWidthElem.setAttribute("min", droneType.spraySwathWidthMin);
            spraySwathWidthElem.setAttribute("max", droneType.spraySwathWidthMax);
            spraySwathWidthElem.setAttribute("value", droneType.spraySwathWidthMin);

            flowRateElem.setAttribute("min", droneType.flowRateMin);
            flowRateElem.setAttribute("max", droneType.flowRateMax);
            flowRateElem.setAttribute("value", droneType.flowRateMin);

            speedElem.setAttribute("min", 0.1);
            speedElem.setAttribute("max", droneType.maxSpeed);
            speedElem.setAttribute("value", 0.1);

            $("#spraying-swath-width-create-work-plan-value-span").text(droneType.spraySwathWidthMin);
            $("#flow-rate-create-work-plan-value-span").text(droneType.flowRateMin);
            $("#drone-speed-create-work-plan-value-span").text(0.1);
        }
    });

    // ----- SHOW SLIDERS VALUES -----
    $("#spraying-swath-width-create-work-plan").on("input", function (slideEvt) {
        $("#spraying-swath-width-create-work-plan-value-span").text(slideEvt.target.value);
    });
    $("#flow-rate-create-work-plan").on("input", function (slideEvt) {
        $("#flow-rate-create-work-plan-value-span").text(slideEvt.target.value);
    });
    $("#drone-speed-create-work-plan").on("input", function (slideEvt) {
        $("#drone-speed-create-work-plan-value-span").text(slideEvt.target.value);
    });

    // ----- AREA SELECTION -----
    $("#select-area-create-work-plan-btn").click(function () {
        map.addInteraction(selectPointerMove);
        map.addInteraction(work_plan_select_polygon);
    });

    // ----- POINT SELECTION -----
    $("#select-point-create-work-plan-btn").click(function () {
        map.addInteraction(selectPointerMove);
        map.addInteraction(work_plan_select_point);
    });

    // ----- ADD WORK PLAN -----
    $("#create-work-plan-form").submit(function (event) {
        var formData = $("#create-work-plan-form").serializeArray();

        let dataObject = {};

        let postAllowed = true;
        let addTrajectoryFeatureAllowed = true;

        $.each(formData, function (i, field) {
            if ((field.value == "" || field.value == null) ||
                (field.name == "drone-name" && field.value == "None") ||
                (field.name == "spraying-swath-width" && field.value == 0) ||
                (field.name == "flow-rate" && field.value == 0) ||
                (field.name == "drone-speed" && field.value == 0)) {

                postAllowed = false;
            }

            dataObject[field.name] = field.value;
        });

        if (postAllowed) {
            const features = source.getFeatures();

            for (let j = 0; j < features.length; j++) {
                if (dataObject["area-name"] == features[j].get('trajectory_area_name') &&
                    dataObject["point-name"] == features[j].get('trajectory_point_name')) {
                    addTrajectoryFeatureAllowed = false
                }
            }

            let data = JSON.stringify(dataObject);
            turnOverlayOn();

            $.ajax({
                type: "POST",
                url: "/map/add-work-plan",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                data: data,
                dataType: "json",
                success: function (response) {
                    //console.log(coords);

                    if (addTrajectoryFeatureAllowed) {
                        const feature = new Feature({
                            geometry: new LineString(response.coords),
                            trajectory_area_name: response.areaName,
                            trajectory_point_name: response.pointName,
                        });
                        source.addFeature(feature);
                        featuresAddedThisSession.push(feature);
                    } else {
                        alert("Such trajectory is already added");
                    }

                    removeSelectInteraction();
                },
                error: function (response) {
                    console.log(response);
                    alert("Add failed with response: " + response);
                }
            })
                .done(function (data) {
                    turnOverlayOff();
                });;
        } else {
            alert("Some fields aren't filled. Please, fill all the requsted fields.");
        }

        event.preventDefault();
    });

    // ----- UPDATE WORK PLAN -----
    $("#update-work-plan-form").submit(function (event) {
        updateObj("work-plan");
        event.preventDefault();
    });

    // ----- GO BACK TO DELETE WORK PLAN FORM -----
    $("#back-from-create-work-plan-btn").click(function (event) {
        createWorkPlanForm.style.display = "none";
        updateWorkPlanForm.style.display = "none";
        deleteWorkPlanForm.style.display = "block";
    });

    // ----- CALCULATE COVERAGE TRAJECTORY -----
    $("#build-trajectory-btn").click(function () {

        var formDataObject = {};

        if (selectedFeatures != null) {
            let geoms = [];
            for (let i = 0; i < selectedFeatures.getLength(); i++) {
                geoms.push(selectedFeatures.item(i).getGeometry());
            }

            if (selectedFeatures.getLength() == 2) {
                if ((geoms[0] instanceof Polygon && geoms[1] instanceof Point) ||
                    (geoms[1] instanceof Polygon && geoms[0] instanceof Point)) {

                    const features = source.getFeatures();

                    let addFeaturePermission = true;
                    for (let j = 0; j < features.length; j++) {
                        if (formDataObject.area_name == features[j].get('trajectory_area_name') &&
                            formDataObject.point_name == features[j].get('trajectory_point_name')) {
                            addFeaturePermission = false
                        }
                    }

                    if (addFeaturePermission) {
                        turnOverlayOn();

                        $.ajax({
                            type: "GET",
                            url: "/Map/build-trajectory",
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            data: formDataObject,
                            dataType: "json",
                            success: function (coords) {
                                //console.log(coords);

                                const feature = new Feature({
                                    geometry: new LineString(coords),
                                    trajectory_area_name: formDataObject.area_name,
                                    trajectory_point_name: formDataObject.point_name,
                                });
                                source.addFeature(feature);
                                featuresAddedThisSession.push(feature);

                                removeSelectInteraction();
                            },
                            error: function (response) {
                                console.log(response);
                                alert("Export failed");
                            }
                        })
                            .done(function (data) {
                                turnOverlayOff();
                            });
                    } else {
                        alert("Such trajectory is already added");
                    }
                } else {
                    alert("Select only 1 polygon or 1 loading point or both of them at the same time.");
                }
            }
        }
    });
});

