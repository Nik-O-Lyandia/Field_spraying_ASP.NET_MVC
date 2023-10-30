import Feature from '/node_modules/ol/Feature.js';
//import Polygon from '/node_modules/ol/geom/Polygon.js';
//import { LineString } from '/node_modules/ol/geom.js';
import Map from '/node_modules/ol/Map.js';
import View from '/node_modules/ol/View.js';
import { fromLonLat } from '/node_modules/ol/proj.js';
import { Draw, Modify, Snap } from '/node_modules/ol/interaction.js';
import { BingMaps, Vector as VectorSource } from '/node_modules/ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from '/node_modules/ol/layer.js';
import Select from '/node_modules/ol/interaction/Select.js';
import { pointerMove } from '/node_modules/ol/events/condition.js';
import { Fill, Stroke, Style, Icon } from '/node_modules/ol/style.js';
import { LineString, Polygon, Point } from '/node_modules/ol/geom.js';
import { forEach } from 'ol/geom/flat/segments';
//import Point from '/node_modules/ol/geom/Point.js';


const styleFunction = function (feature) {

    const geometry = feature.getGeometry();
    const styles = [
        // linestring
        new Style({
            stroke: new Stroke({
                color: 'rgba(220, 220, 220, 0.8)',
                width: 2,
            }),
            fill: new Fill({
                color: 'rgba(220, 220, 220, 0.2)',
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

function turnOverlayOn() {
    //document.getElementById('waiting_overlay').classList.toggle("waiting-overlay-showed");
    //document.getElementById('waiting_overlay').show();
    //$('#waiting_overlay').show();
    document.getElementById('waiting_overlay').style.display = 'flex';
}

function turnOverlayOff() {
    //$('#waiting_overlay').hide();
    document.getElementById('waiting_overlay').style.display = 'none';
}

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
let draw = new Draw({
    source: source,
    type: 'Polygon',
});
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
});

const hovered = new Style({
    fill: new Fill({
        color: 'rgba(0, 100, 255, 0.2)',
    }),
    stroke: new Stroke({
        color: 'rgba(0, 100, 255, 0.6)',
        width: 2,
    }),
});

// select interaction working on "singleclick"
const select = new Select({ style: selected });

// select interaction working on "pointermove"
const selectPointerMove = new Select({
    condition: pointerMove,
    style: hovered,
});

let selectedFeature = null;
let featuresAddedThisSession = [];

select.on("select", function (e) {
    if (e.selected.length > 0) {
        map.removeInteraction(selectPointerMove);
        selectedFeature = e.target.getFeatures().item(0);
    }

    if (e.deselected.length > 0 && e.selected.length == 0) {
        selectedFeature = null;
        map.removeInteraction(select);
    }

});

draw.on("drawend", function (event) {
    featuresAddedThisSession.push(event.feature);
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
    //          ACTIVATE DRAW
    //********************************************
    $("#draw_button").click(function () {
        map.addInteraction(draw);
        map.addInteraction(snap);
        map.addInteraction(modify);
    });

    //********************************************
    //          UNDO DRAW
    //********************************************
    $("#undo_button").click(function () {
        draw.removeLastPoint();
    });

    //********************************************
    //          CANCEL DRAW
    //********************************************
    $("#cancel_draw_button").click(function () {
        map.removeInteraction(draw);
        map.removeInteraction(snap);
        map.removeInteraction(modify);
    });


    //********************************************
    //          CLEAR LAST ADDED FEATURE
    //********************************************
    $("#clear_last_feature_button").click(function () {
        source.removeFeature(featuresAddedThisSession.pop());
    });

    //********************************************
    //          CLEAR ALL NEW FEATURES
    //********************************************
    $("#clear_all_new_button").click(function () {
        for (let i = 0; i < featuresAddedThisSession.length; i++) {
            source.removeFeature(featuresAddedThisSession[i]);
        }
        featuresAddedThisSession = [];
    });

    //********************************************
    //          EXPORT AREA ACTION
    //********************************************
    $("form").submit(function (event) {
        let sourceFeatures = source.getFeatures();
        if (sourceFeatures != null) {
            let firstSourceFeature = sourceFeatures[0];
            let firstSourceFeatureGeometry = firstSourceFeature.getGeometry();
            let coords = firstSourceFeatureGeometry.getCoordinates();

            //console.log(coords[0]);

            var formData = JSON.stringify({
                'area_name': $("#area_name").val(),
                'coords': coords[0],
            });

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
        }
        event.preventDefault();
    });

    //********************************************
    //          IMPORT AREA ACTION
    //********************************************
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
    //           AREA SELECTION
    //********************************************
    $("#select_area_button").click(function () {

        map.addInteraction(selectPointerMove);
        map.addInteraction(select);

    });

    //********************************************
    //      CALCULATE COVERAGE TRAJECTORY
    //********************************************
    $("#build_trajectory_button").click(function () {

        if (selectedFeature != null) {
            let selectedFeatureName = selectedFeature.get("name");

            //console.log(selectedFeature);

            turnOverlayOn();

            $.get("/Map/Build_trajectory", { area_name: selectedFeatureName, spraying_radius: 15})
                .done(function (coords) {

                    //console.log(coords);
                    const feature = new Feature({
                        geometry: new LineString(coords),
                    });

                    source.addFeature(feature)

                    turnOverlayOff();

                });

        } else {
            alert("Please, select area first.")
        }
    });
});

