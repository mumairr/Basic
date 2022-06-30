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

let layers = [];
let basemaps;
let initialMap;
let zoom = 5;
let center = [14848876, -2990883];
let rotation = 0;

var mapboxKey = "pk.eyJ1IjoiZGh5ZmIiLCJhIjoiY2o4M3F6MzJpMDBoejMybXBhZGF4aXJjOCJ9.rqAE8kSRfPbAdypH3Ydx-g";

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
                new TileLayer({
                    baseLayer: true,
                    title: "OSM",
                    visible: false,
                    source: new OSM()
                }),
                new TileLayer({
                    baseLayer: true,
                    title: "Mapbox",
                    visible: true,
                    source: new XYZ({
                        tileSize: [512, 512],
                        url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v8/tiles/{z}/{x}/{y}?access_token=' + mapboxKey
                    })
                }),
                new TileLayer({
                    title: "Bing",
                    baseLayer: true,
                    visible: false,
                    preload: Infinity,
                    source: new BingMaps({
                        key: 'Ai9y3x8v0FM1vGDUXevZDinOzkJVacIW8kJOtSwUDNn8WGpE0ZjxZPJttvIYZg5L',
                        imagerySet: "AerialWithLabels"
                    }),
                })
            ]
        });
        layers = [
            basemaps,
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