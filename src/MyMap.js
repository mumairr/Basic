import { useState, useEffect, useRef } from 'react';

/* Stylesheets */
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css'
import "./styles/ol.css";
import "./styles/index.css";

/* Openlayers */
import Map from 'ol/Map'
import BingMaps from 'ol/source/BingMaps';
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import { OSM, XYZ } from 'ol/source';
import { defaults as defaultControls, } from 'ol/control';
import LayerGroup from 'ol/layer/Group';

/* Ol-ext */

import LayerSwitcherImage from "ol-ext/control/LayerSwitcherImage";

let layers = [];
let basemaps;
let initialMap;
let zoom = 5;
let center = [14848876, -2990883];
let rotation = 0;

var mapboxKey = "pk.eyJ1IjoiZGh5ZmIiLCJhIjoiY2o4M3F6MzJpMDBoejMybXBhZGF4aXJjOCJ9.rqAE8kSRfPbAdypH3Ydx-g";

let osm = new TileLayer({
    baseLayer: true,
    title: "OSM",
    visible: false,
    source: new OSM()
});

let mapbox = new TileLayer({
    baseLayer: true,
    title: "Mapbox",
    visible: true,
    source: new XYZ({
        tileSize: [512, 512],
        url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v8/tiles/{z}/{x}/{y}?access_token=' + mapboxKey
    })
});

let bing = new TileLayer({
    title: "Aerial",
    baseLayer: true,
    visible: false,
    preview: "data:image/jpeg;base64,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",
    preload: Infinity,
    source: new BingMaps({
        key: 'Ai9y3x8v0FM1vGDUXevZDinOzkJVacIW8kJOtSwUDNn8WGpE0ZjxZPJttvIYZg5L',
        imagerySet: "AerialWithLabels"
    }),
});

function MapWrapper(props) {
    const [map, setMap] = useState()
    // const [fields, setFields] = useState([])

    const mapElement = useRef()
    const mapRef = useRef()
    mapRef.current = map

    useEffect(() => {
        basemaps = new LayerGroup({
            title: 'Basemaps',
            openInLayerSwitcher: false,
            layers: [
            ]
        });
        layers = [
            osm,
            mapbox,
            bing
        ];

        if (window.location.hash !== '') {
            // try to restore center, zoom-level and rotation from the URL
            const hash = window.location.hash.replace('#map=', '');
            const parts = hash.split('/');
            if (parts.length === 4) {
                zoom = parseFloat(parts[0]);
                center = [parseFloat(parts[1]), parseFloat(parts[2])];
                rotation = parseFloat(parts[3]);
            }
        }

        initialMap = new Map({
            target: mapElement.current,
            layers: layers,
            view: new View({
                center: center,
                zoom: zoom,
                rotation: rotation
            }),
            controls: defaultControls().extend([]),
        })

        setMap(initialMap);

        initialMap.on("pointermove", function (evt) {
            var hit = this.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
                return true;
            });
            if (hit) {
                this.getTargetElement().style.cursor = 'pointer';
            } else {
                this.getTargetElement().style.cursor = '';
            }
        });

        initialMap.addControl(new LayerSwitcherImage());

        let shouldUpdate = true;
        const view = initialMap.getView();
        const updatePermalink = function () {
            if (!shouldUpdate) {
                // do not update the URL when the view was changed in the 'popstate' handler
                shouldUpdate = true;
                return;
            }

            const center = view.getCenter();
            const hash =
                '#map=' +
                view.getZoom().toFixed(2) +
                '/' +
                center[0].toFixed(2) +
                '/' +
                center[1].toFixed(2) +
                '/' +
                view.getRotation();
            const state = {
                zoom: view.getZoom(),
                center: view.getCenter(),
                rotation: view.getRotation(),
            };
            window.history.pushState(state, 'map', hash);
        };

        initialMap.on('moveend', updatePermalink);

        window.addEventListener('popstate', function (event) {
            if (event.state === null) {
                return;
            }
            initialMap.getView().setCenter(event.state.center);
            initialMap.getView().setZoom(event.state.zoom);
            initialMap.getView().setRotation(event.state.rotation);
            shouldUpdate = false;
        });
    }, [])

    return (
        <>
            <div ref={mapElement} id="map">
            </div>
        </>
    )
}

export default MapWrapper;