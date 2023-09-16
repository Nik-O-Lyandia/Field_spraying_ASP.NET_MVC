// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

//import "../css/site.css";
import Map from '/node_modules/ol/Map.js';
import OSM from '/node_modules/ol/source/OSM.js';
import TileLayer from '/node_modules/ol/layer/Tile.js';
import View from '/node_modules/ol/View.js';
import { fromLonLat } from '/node_modules/ol/proj.js';

//const Map = require('/node_modules/ol/Map.js');

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
    ],
    view: new View({
        center: fromLonLat([33.780350, 51.909576]),
        zoom: 14,
    }),
});
