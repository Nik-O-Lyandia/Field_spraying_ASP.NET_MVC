//import "../css/site.css";
import Map from '/node_modules/ol/Map.js';
//import OSM from '/node_modules/ol/source/OSM.js';
//import XYZ from '/node_modules/ol/source/XYZ.js';
import View from '/node_modules/ol/View.js';
import { fromLonLat } from '/node_modules/ol/proj.js';
import { Draw, Modify, Snap } from '/node_modules/ol/interaction.js';
import { BingMaps, Vector as VectorSource } from '/node_modules/ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from '/node_modules/ol/layer.js';
import { transform, toLonLat } from '/node_modules/ol/proj.js';
import { LineString } from '/node_modules/ol/geom.js';
import { getArea, getLength } from '/node_modules/ol/sphere.js';
import Select from '/node_modules/ol/interaction/Select.js';
import { Fill, Stroke, Style } from '/node_modules/ol/style.js';
import { pointerMove } from '/node_modules/ol/events/condition.js';

import Feature from '/node_modules/ol/Feature.js';
import Polygon from '/node_modules/ol/geom/Polygon.js';
import Point from '/node_modules/ol/geom/Point.js';

//const Map = require('/node_modules/ol/Map.js');

const source = new VectorSource();
const vector = new VectorLayer({
    source: source,
    style: {
        'fill-color': 'rgba(220, 220, 220, 0.2)',
        'stroke-color': 'rgba(220, 220, 220, 0.8)',
        'stroke-width': 2,
        'circle-radius': 3,
        'circle-fill-color': '#48a1f0',
    },
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


//********************************************
//          HANDLE CHANGE EVENTS
//********************************************
$(document).ready(function () {

    //********************************************
    //          ACTIVATE DRAW CLICK ACTION
    //********************************************
    $("#draw_button").click(function () {
        map.addInteraction(draw);
        map.addInteraction(snap);
        map.addInteraction(modify);
    });

    //********************************************
    //          CANCEL DRAW CLICK ACTION
    //********************************************
    $("#cancel_draw_button").click(function () {
        map.removeInteraction(draw);
        map.removeInteraction(snap);
        map.removeInteraction(modify);
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

            console.log(coords[0]);

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
                    alert(data);
                }
            }).done(function (data) {
                console.log(data);
            });
        }
        event.preventDefault();
    });

    //********************************************
    //          IMPORT AREA ACTION
    //********************************************
    $("#import_button").click(function () {

        $.get("/Map/Import", function (data) {

            const feature = new Feature({
                geometry: new Polygon([data.coords]),
                name: data.name,
            });

            console.log(feature);

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

            var formData = JSON.stringify({
                'area_name': selectedFeatureName
            });

        //$.ajax({
        //    type: "POST",
        //    url: "/Map/Export",
        //    headers: {
        //        'Accept': 'application/json',
        //        'Content-Type': 'application/json'
        //    },
        //    data: formData,
        //    dataType: "json",
        //    success: function (data) {
        //        alert(data);
        //    }
        //}).done(function (data) {
        //    console.log(data);
        //});

        //event.preventDefault();
        }
    });
});


//    //    (1)[3760068.9670060794,   6784271.42795164]               [3760068.1628284436, 6784270.863947619]
//    //    (2)[3759978.829972721,    6784266.898452477] -90; -5      [3759980.5543891885, 6784264.006500738]
//    //    (3)[3759976.112273223,    6784422.260273792] -2;  +156
//    //    (1)[3760068.9670060794,   6784271.42795164]  +92; -151
