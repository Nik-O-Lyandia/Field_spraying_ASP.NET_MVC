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

import Feature from '/node_modules/ol/Feature.js';
import Polygon from '/node_modules/ol/geom/Polygon.js';
import Point from '/node_modules/ol/geom/Point.js';

//const Map = require('/node_modules/ol/Map.js');

const source = new VectorSource();
const vector = new VectorLayer({
    source: source,
    style: {
        'fill-color': 'rgba(255, 255, 255, 0.2)',
        'stroke-color': '#48a1f0',
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
map.addInteraction(modify);

//let draw, snap; // global so we can remove them later
let draw = new Draw({
    source: source,
    type: 'Polygon',
});
let snap = new Snap({ source: source });

/**
 * Handle change event.
 */
$(document).ready(function () {

    //********************************************
    //          ACTIVATE DRAW FUNC
    //********************************************
    function addInteractions() {
        map.addInteraction(draw);
        map.addInteraction(snap);
    }

    //********************************************
    //          ACTIVATE DRAW CLICK ACTION
    //********************************************
    $("#draw_button").click(function () {
        addInteractions();
    });

    //********************************************
    //          CANCEL DRAW CLICK ACTION
    //********************************************
    $("#cancel_draw_button").click(function () {
        map.removeInteraction(draw);
        map.removeInteraction(snap);
    });

    //********************************************
    //          EXPORT AREA ACTION
    //********************************************
    $("form").submit(function (event) {
        let sourceFeatures = source.getFeatures();
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

            source.addFeature(feature)
        });
    });
});

//undoButton.onclick = function () {
//    const sourceFeatures = source.getFeatures();
//    //console.log(sourceFeatures);
//    //const features = vector.getSource();
//    //console.log(features);
//    //console.log('\n\n');

//    const firstSourceFeature = sourceFeatures[0];
//    //console.log(firstSourceFeature);
//    //const firstFeature = features[0];
//    //console.log(firstFeature);
//    //console.log('\n\n');

//    const firstSourceFeatureGeometry = firstSourceFeature.getGeometry();
//    //console.log(firstSourceFeatureGeometry);
//    //const firstFeatureGeometry = firstFeature.getGeometry();
//    //console.log(firstFeatureGeometry);
//    //console.log('\n\n');

//    const coords = firstSourceFeatureGeometry.getCoordinates();
//    console.log(coords);

//    var coordinatesInGPS = [];
//    var coordinatesInGPS2 = [];
//    for (var i = 0; i < coords.length; i++) {
//        //console.log(coords[i]);
//        var lonlat = transform(coords[i], 'EPSG:3857', 'EPSG:4326');

//        coordinatesInGPS.push(lonlat);
//        coordinatesInGPS2.push(toLonLat(coords[i], 'EPSG:3857'));
//    }

//    //console.log(coordinatesInGPS);
//    //console.log(coordinatesInGPS2);

//    let distanceBetweenPoints = function (latlng1, latlng2) {
//        var line = new LineString([latlng1, latlng2]);
//        return [Math.round(line.getLength() * 100) / 100, Math.round(getLength(line) * 100) / 100];
//    };

//    console.log(distanceBetweenPoints(coords[0][0], coords[0][1]));
//    //console.log(coords[1].toFixed(2));
//    //console.log(coords[1].toFixed(2));

//    //    (1)[3760068.9670060794,   6784271.42795164]               [3760068.1628284436, 6784270.863947619]
//    //    (2)[3759978.829972721,    6784266.898452477] -90; -5      [3759980.5543891885, 6784264.006500738]
//    //    (3)[3759976.112273223,    6784422.260273792] -2;  +156
//    //    (1)[3760068.9670060794,   6784271.42795164]  +92; -151

//}


//let distanceBetweenPoints = function (latlng1, latlng2) {
//    var line = new LineString([latlng1, latlng2]);
//    console.log(new LineString([latlng1, latlng2]));
//    console.log(line.getCoordinates());
//    return Math.round(line.getLength() * 100) / 100;
//};

//console.log(distanceBetweenPoints([3760068.9670060794, 6784271.42795164], [3759978.829972721, 6784266.898452477]));

//draw.on('drawend', function () {
//    map.removeInteraction(draw);
//})