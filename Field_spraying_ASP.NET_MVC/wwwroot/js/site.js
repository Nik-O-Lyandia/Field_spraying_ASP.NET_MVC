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

//const Map = require('/node_modules/ol/Map.js');

const bingStyles = [
    'RoadOnDemand',
    'Aerial',
    'AerialWithLabelsOnDemand',
    'CanvasDark',
    'OrdnanceSurvey',
];

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
                imagerySet: bingStyles[1],
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

const drawButton = document.getElementById('draw_button');
const setLoadingPointButton = document.getElementById('set_loading_point_button');
const exportButton = document.getElementById('export_button');
const cancelDrawButton = document.getElementById('cancel_draw_button');
const undoButton = document.getElementById('undo_button');

function addInteractions() {

    map.addInteraction(draw);
    map.addInteraction(snap);
}

/**
 * Handle change event.
 */
drawButton.onclick = function () {
    addInteractions()
}


exportButton.onclick = function () {
    let sourceFeatures = source.getFeatures();
    let firstSourceFeature = sourceFeatures[0];
    let firstSourceFeatureGeometry = firstSourceFeature.getGeometry();
    let coords = firstSourceFeatureGeometry.getCoordinates();
    console.log(coords);
    console.log(coords[0]);
    $.ajax({
        url: "/Map/Export",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        type: "POST",
        dataType: "json",
        data: JSON.stringify(coords[0]),
        success: function (data) {
            alert(data);
        }
    });
    return false;
}

cancelDrawButton.onclick = function () {
    map.removeInteraction(draw);
    map.removeInteraction(snap);
}

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

draw.on('drawend', function () {
    map.removeInteraction(draw);
})