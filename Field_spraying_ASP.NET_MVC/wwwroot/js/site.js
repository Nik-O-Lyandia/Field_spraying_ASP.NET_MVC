import Feature from '/node_modules/ol/Feature.js';
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


//********************************************
//        STATIC FUNCTIONS SECTION
//********************************************

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

function turnOverlayOn() {
    document.getElementById('waiting_overlay').style.display = 'flex';
}

function turnOverlayOff() {
    document.getElementById('waiting_overlay').style.display = 'none';
}

function removeDrawInteractions() {
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    map.removeInteraction(modify);
}

function removeSelectInteraction() {
    selectedFeatures = null;
    map.removeInteraction(select);
    formElement.style.display = "none";
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

//********************************************
//    VARIABLES INITIALIZATION SECTION
//********************************************

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
                key: 'AqhyxnSQ0bUbehdW0c2bRpwMrUWQsqagpK1icErRHM9J1s0NsX-ubpej_rgamrqC',
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
//          SELECTING AREA
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
const select = new Select({ style: selected });

// select interaction working on "pointermove"
const selectPointerMove = new Select({
    condition: pointerMove,
    style: hovered,
});

let selectedFeatures = null;
let featuresAddedThisSession = [];



const formElement = document.getElementById("export_form");


//********************************************
//        HANDLE FUNCTIONS SECTION
//********************************************

select.on("select", function (e) {
    map.removeInteraction(selectPointerMove);
    selectedFeatures = e.target.getFeatures();

    //console.log(e.selected);
    //console.log(e);

    let geoms = [];
    for (let i = 0; i < selectedFeatures.getLength(); i++) {
        geoms.push(selectedFeatures.item(i).getGeometry());
    }

    if ((selectedFeatures.getLength() <= 2 && !exportSelectActivated) ||
        (selectedFeatures.getLength() <= 1 && exportSelectActivated)) {
        formElement.style.display = "block";
        var formInnerElements = formElement.getElementsByClassName("form-group");

        for (let i = 0; i < formInnerElements.length; i++) {
            if (selectedFeatures.getLength() == 1) {
                if ((formInnerElements[i].id == "area_name-group" && geoms[0] instanceof Polygon) ||
                    (formInnerElements[i].id == "point_name-group" && geoms[0] instanceof Point)) {
                    formInnerElements[i].style.display = "block";
                } else {
                    formInnerElements[i].style.display = "none";
                }
            }

            if (selectedFeatures.getLength() == 2) {
                if ((geoms[0] instanceof Polygon || geoms[1] instanceof Polygon) && (geoms[0] instanceof Point || geoms[1] instanceof Point)) {
                    if ((formInnerElements[i].id == "area_name-group" && (geoms[0] instanceof Polygon || geoms[1] instanceof Polygon)) ||
                        (formInnerElements[i].id == "point_name-group" && (geoms[0] instanceof Point || geoms[1] instanceof Point))) {
                        formInnerElements[i].style.display = "block";
                    } else {
                        formInnerElements[i].style.display = "none";
                    }
                } else {
                    alert("Selected features must not be the same type.");
                    removeSelectInteraction();
                    break;
                }
            }
        }
    } else {
        let featuresNum = exportSelectActivated ? "1" : "2";
        alert("Select no more than " + featuresNum + " features.");
        removeSelectInteraction();
    }

    if (e.deselected.length > 0 && e.selected.length == 0 && selectedFeatures.getLength() == 0) {
        removeSelectInteraction();
    }

});

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

    $("#nav-work-start-tab").on('hidden.bs.tab', function () {
        removeSelectInteraction();
    });

    //********************************************
    //          DRAWING SECTION
    //********************************************

    // ----- DRAW POLYGON -----
    $("#draw_polygon_button").click(function () {
        removeDrawInteractions();
        addDrawInteraction('Polygon');
        map.addInteraction(snap);
        map.addInteraction(modify);
    });

    // ----- DRAW LOADING POINT -----
    $("#draw_point_button").click(function () {
        removeDrawInteractions();
        addDrawInteraction('Point');
        map.addInteraction(modify);
    });

    // ----- UNDO LAST ACTION -----
    $("#undo_button").click(function () {
        draw.removeLastPoint();
    });

    // ----- CANCEL DRAW -----
    $("#cancel_draw_button").click(function () {
        removeDrawInteractions();
    });


    // ----- CLEAR LAST ADDED FEATURE -----
    $("#clear_last_feature_button").click(function () {
        source.removeFeature(featuresAddedThisSession.pop());
    });

    // ----- CLEAR ALL NEW FEATURES -----
    $("#clear_all_new_button").click(function () {
        for (let i = 0; i < featuresAddedThisSession.length; i++) {
            source.removeFeature(featuresAddedThisSession[i]);
        }
        featuresAddedThisSession = [];
    });

    //********************************************
    //          MANAGMENT SECTION
    //********************************************

    // ----- AREA SELECTION -----
    $("#export_select_button").click(function () {
        exportSelectActivated = true;
        map.addInteraction(selectPointerMove);
        map.addInteraction(select);

    });

    // ----- EXPORT AREA ACTION -----
    $("form").submit(function (event) {

        var formDataObject = {};

        if (selectedFeatures != null) {
            let geoms = [];
            for (let i = 0; i < selectedFeatures.getLength(); i++) {
                geoms.push(selectedFeatures.item(i).getGeometry());
            }

            if ((geoms.length == 2 && geoms[0] instanceof Polygon && geoms[1] instanceof Point) ||
                (geoms.length == 2 && geoms[0] instanceof Point && geoms[1] instanceof Polygon) ||
                (geoms.length == 1 && geoms[0] instanceof Point) ||
                (geoms.length == 1 && geoms[0] instanceof Polygon)) {

                for (let i = 0; i < geoms.length; i++) {
                    if (geoms[i] instanceof Polygon) {
                        let areaObj = {};
                        areaObj.name = $("#area_name").val() != null ? $("#area_name").val() : null;
                        areaObj.coords = geoms[i].getCoordinates()[0];
                        formDataObject.area = areaObj;
                    }
                    if (geoms[i] instanceof Point) {
                        let pointObj = {};
                        pointObj.name = $("#point_name").val() != null ? $("#point_name").val() : null;
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
                success: function (data) {
                    //alert(data);
                }
            }).done(function (data) {
                //console.log(data);
            });
        } else {
            alert("Please select features to export.");
        }
        event.preventDefault();
    });

    // ----- IMPORT AREA ACTION -----
    $("#import_button").click(function () {

        $.get("/Map/Import")
            .done(function (data) {
                importMap(data);
            });
    });

    //********************************************
    //           WORK START SECTION
    //********************************************

    // ----- AREA SELECTION -----
    $("#select_area_button").click(function () {

        map.addInteraction(selectPointerMove);
        map.addInteraction(select);

    });

    // ----- CALCULATE COVERAGE TRAJECTORY -----
    $("#build_trajectory_button").click(function () {

        if (selectedFeature != null) {
            let selectedFeatureName = selectedFeature.get("name");

            //console.log(selectedFeature);

            turnOverlayOn();
            if (selectedFeatureName != none) {
                $.get("/Map/Build_trajectory", { area_name: selectedFeatureName, spraying_radius: 15 })
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

