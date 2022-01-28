import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { tileFields } from '../../services/tileFields';
import {  
  tractId,
  mapAreaConfig,
  primaryScore,
} from '../../configuration/app-config';
import { MapGradientType, AppState } from '../../types';
import {
  resetFilterSlider,
  setSelectedItem,
  setSelectedMonth,
} from '../../store/modules/sidebarControlStore';
import { scaleSteps } from '../../services/sharedFunctions';
import './Map.scss';
import Popup from './MapTooltip/Popup';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`;

interface MapProps {
  darkTheme: boolean;
  selectedYear: number | number[];
  selectedMonth: number | number[];
  mapGradient: MapGradientType;
}

const Map: React.FC<MapProps> = ({ darkTheme, selectedYear, selectedMonth, mapGradient }) => {


  console.log("selectedYear ==>> ", selectedYear);
  
  const [map, setMap]: any = useState(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const satelliteView: boolean = useSelector(
    (state: AppState) => state.MapControl.satelliteView,
  );

  const setMapFills = () => {
    const fillColor:
      | string
      | mapboxgl.StyleFunction
      | mapboxgl.Expression
      | undefined = [
      'interpolate',
      ['linear'],
      ['to-number', ['get', primaryScore]],
      scaleSteps().step1,
      mapGradient.step1,
      scaleSteps().step2,
      mapGradient.step2,
      scaleSteps().step3,
      mapGradient.step3,
      scaleSteps().step4,
      mapGradient.step4,
      scaleSteps().step5,
      mapGradient.step5,
      scaleSteps().step6,
      mapGradient.step6,
    ];
    if (map) {
      map.setPaintProperty('uppd-layer', 'fill-color', fillColor);
    }
  };

  

  let selectedId: number | string | undefined;

  const setSelection = (
    e: mapboxgl.MapMouseEvent & {
      features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
    } & mapboxgl.EventData,
  ): void => {
    console.log('setSelectionCalled');

    if (e.features !== undefined && e.features.length > 0) {
      const newSelection = e.features[0];
      if (newSelection.properties !== null) {
        console.log(' selectedItem =>', newSelection.properties);

        dispatch(setSelectedItem(newSelection.properties));
      }
    }
  };

  useEffect(() => {
    // clear selected map items   
    debugger
    dispatch(setSelectedItem(null));
    dispatch(resetFilterSlider());

    const layer: mapboxgl.FillLayer = {
      id: 'uppd-layer',
      type: 'fill',
      source: {
        type: 'vector',
        tiles: [
          `http://localhost:8000/get-subcommune/${selectedYear}/${selectedMonth}/{z}/{x}/{y}`
        ],
        promoteId: tractId,
        minzoom: 0,
        maxzoom: 22,
      },
      'source-layer': 'tile',
      paint: {
        'fill-outline-color': '#343332',
        'fill-color': 'transparent',
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'click'], false],
          0.85,
          0.4,
        ],
      },
    };

    if (!mapRef.current) {
      return;
    }

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: satelliteView
        ? mapAreaConfig.style.satellite
        : darkTheme
        ? mapAreaConfig.style.dark
        : mapAreaConfig.style.light,
      center: mapAreaConfig.mapCenter,
      zoom: mapAreaConfig.zoomLevel,
      maxBounds: mapAreaConfig.bounds,
    });

    // geocoder/search bar
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: true,
    });

    // set the default popup
    const popup = new mapboxgl.Popup({
      className: 'uppd-layer-popup',
    });

    const clearFeatureState = () => {
      if (selectedId !== undefined) {
        map.setFeatureState(
          {
            id: selectedId,
            source: 'uppd-layer',
            sourceLayer: 'tile',
          },
          { click: false },
        );
      }
    };

    map.on('load', () => {
      // set geocoder bounding box on load
      const bounds = map.getBounds();
      geocoder.setBbox([
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ]);
      
      const addPopup = (el: JSX.Element, lat: number, lng: number) => {
        const placeholder = document.createElement('div');

        ReactDOM.render(el, placeholder);

        setTimeout(() => {
          popup.setDOMContent(placeholder).setLngLat({ lng, lat }).addTo(map);
        }, 5);
      };
      
      map.on(
        'click',
        'uppd-layer',
        (
          e: mapboxgl.MapMouseEvent & {
            features?: any;
          } & mapboxgl.EventData,
        ) => {
          if (e.originalEvent.cancelBubble) {
            return;
          }
          // set selection
          setSelection(e);

          // add the popup
          addPopup(
            <Popup clickedItem={e.features[0].properties} />,
            e.lngLat.lat,
            e.lngLat.lng,
          );

          // style the selected feature
          if (e.features !== undefined && e.features.length > 0) {
            clearFeatureState();

            // eslint-disable-next-line react-hooks/exhaustive-deps
            selectedId = e.features[0].id;

            if (selectedId !== undefined) {
              map.setFeatureState(
                {
                  id: selectedId,
                  source: 'uppd-layer',
                  sourceLayer: 'tile',
                },
                { click: true },
              );
            }
          }
        },
      );

      // pointer event on hover
      map.on('mouseenter', 'uppd-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      // add layers and set map
      map.addLayer(layer);
      setMap(map);

      if (document.getElementById('MapSearchBar')) {
        const removeAllChildNodes = (parent: any) => {
          while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
          }
        };

        const container = document.querySelector('#MapSearchBar');
        removeAllChildNodes(container);

        document
          .getElementById('MapSearchBar')!
          .appendChild(geocoder.onAdd(map));
      }
    });

    map.on('close-all-popups', () => {
      popup.remove();
    });

    map.on('clear-feature-state', () => {
      clearFeatureState();
    });
  }, [selectedYear, selectedMonth]);

  useEffect(
    () => {
      setMapFills();
      dispatch(resetFilterSlider());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedYear, selectedMonth],
  );
  
  return <div className="mapContainer" id="map" ref={mapRef} />;
};

export default Map;