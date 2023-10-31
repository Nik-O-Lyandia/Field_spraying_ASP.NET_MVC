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

function addDrawInteraction(draw_type) {
    draw = new Draw({
        source: source,
        type: draw_type,
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

function removeInteractions() {
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    map.removeInteraction(modify);
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

const modify = new Modify({ source: source });

//let draw, snap; // global so we can remove them later
let draw;

let snap = new Snap({ source: source });


//********************************************
//          SELECTING AREA
//********************************************
//let select = null; // ref to currently selected interaction

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







//const selectedFeatures = select.getFeatures();

//// a DragBox interaction used to select features by drawing boxes
//const dragBox = new DragBox({
//    condition: platformModifierKeyOnly,
//});

//dragBox.on('boxend', function () {
//    const boxExtent = dragBox.getGeometry().getExtent();

//    // if the extent crosses the antimeridian process each world separately
//    const worldExtent = map.getView().getProjection().getExtent();
//    const worldWidth = getWidth(worldExtent);
//    const startWorld = Math.floor((boxExtent[0] - worldExtent[0]) / worldWidth);
//    const endWorld = Math.floor((boxExtent[2] - worldExtent[0]) / worldWidth);

//    for (let world = startWorld; world <= endWorld; ++world) {
//        const left = Math.max(boxExtent[0] - world * worldWidth, worldExtent[0]);
//        const right = Math.min(boxExtent[2] - world * worldWidth, worldExtent[2]);
//        const extent = [left, boxExtent[1], right, boxExtent[3]];

//        const boxFeatures = source
//            .getFeaturesInExtent(extent)
//            .filter(
//                (feature) =>
//                    !selectedFeatures.getArray().includes(feature) &&
//                    feature.getGeometry().intersectsExtent(extent)
//            );

//        // features that intersect the box geometry are added to the
//        // collection of selected features

//        // if the view is not obliquely rotated the box geometry and
//        // its extent are equalivalent so intersecting features can
//        // be added directly to the collection
//        const rotation = map.getView().getRotation();
//        const oblique = rotation % (Math.PI / 2) !== 0;

//        // when the view is obliquely rotated the box extent will
//        // exceed its geometry so both the box and the candidate
//        // feature geometries are rotated around a common anchor
//        // to confirm that, with the box geometry aligned with its
//        // extent, the geometries intersect
//        if (oblique) {
//            const anchor = [0, 0];
//            const geometry = dragBox.getGeometry().clone();
//            geometry.translate(-world * worldWidth, 0);
//            geometry.rotate(-rotation, anchor);
//            const extent = geometry.getExtent();
//            boxFeatures.forEach(function (feature) {
//                const geometry = feature.getGeometry().clone();
//                geometry.rotate(-rotation, anchor);
//                if (geometry.intersectsExtent(extent)) {
//                    selectedFeatures.push(feature);
//                }
//            });
//        } else {
//            selectedFeatures.extend(boxFeatures);
//        }
//    }
//    console.log(selectedFeatures);
//});

//// clear selection when drawing a new box and when clicking on the map
//dragBox.on('boxstart', function () {
//    selectedFeatures.clear();
//});

//const infoBox = document.getElementById('info');

//selectedFeatures.on(['add', 'remove'], function () {
//    const names = selectedFeatures.getArray().map((feature) => {
//        return feature.get('ECO_NAME');
//    });
//    if (names.length > 0) {
//        infoBox.innerHTML = names.join(', ');
//    } else {
//        infoBox.innerHTML = 'None';
//    }
//});




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

    if (selectedFeatures.getLength() <= 2) {
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
                if ((geoms[0] instanceof Polygon && geoms[1] instanceof Polygon) || (geoms[0] instanceof Point && geoms[1] instanceof Point)) {
                    if ((formInnerElements[i].id == "area_name-group" && (geoms[0] instanceof Polygon || geoms[1] instanceof Polygon)) ||
                        (formInnerElements[i].id == "point_name-group" && (geoms[0] instanceof Point || geoms[1] instanceof Point))) {
                        formInnerElements[i].style.display = "block";
                    } else {
                        formInnerElements[i].style.display = "none";
                    }
                } else {
                    alert("Selected features must not be the same type.");
                }
            }
        }
    } else {

        alert("Select no more than 2 features.");
    }

    if (e.deselected.length > 0 && e.selected.length == 0 && selectedFeatures.getLength() == 0) {
        selectedFeatures = null;
        map.removeInteraction(select);
        formElement.style.display = "none";
    }

});


$.get("/Map/Import")
    .done(function (data) {

        //console.log(data);
        const feature = new Feature({
            geometry: new Polygon([data.coords]),
            name: data.name,
        });

        //console.log(feature);

        source.addFeature(feature)
    });

//********************************************
//          HANDLE CHANGE EVENTS
//********************************************
$(document).ready(function () {

    //********************************************
    //          DRAWING SECTION
    //********************************************

    // ----- DRAW POLYGON -----
    $("#draw_polygon_button").click(function () {
        removeInteractions();
        addDrawInteraction('Polygon');
        map.addInteraction(snap);
        map.addInteraction(modify);
    });

    // ----- DRAW LOADING POINT -----
    $("#draw_point_button").click(function () {
        removeInteractions();
        addDrawInteraction('Point');
        map.addInteraction(modify);
    });

    // ----- UNDO LAST ACTION -----
    $("#undo_button").click(function () {
        draw.removeLastPoint();
    });

    //// ----- UNDO LAST ACTION -----
    //$("#select_box_button").click(function () {
    //    removeInteractions();

    //    map.addInteraction(dragBox);

    //});

    // ----- CANCEL DRAW -----
    $("#cancel_draw_button").click(function () {
        removeInteractions();
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

    // ----- EXPORT AREA ACTION -----
    $("form").submit(function (event) {
        //let sourceFeatures = source.getFeatures();

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
                        let area_obj = {};
                        area_obj.name = $("#area_name").val() != null ? $("#area_name").val() : null;
                        area_obj.coords = geoms[i].getCoordinates()[0];
                        formDataObject.area = area_obj;
                    }
                    if (geoms[i] instanceof Point) {
                        let point_obj = {};
                        point_obj.name = $("#point_name").val() != null ? $("#point_name").val() : null;
                        point_obj.coords = geoms[i].getCoordinates()[0];
                        formDataObject.point = point_obj;
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

                //console.log(data);
                const feature = new Feature({
                    geometry: new Polygon([data.coords]),
                    name: data.name,
                });

                //console.log(feature);

                source.addFeature(feature)
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

