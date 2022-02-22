import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import {
  tractId,
  mapAreaConfig,
  primaryScore,
  PointsOfInterest,
} from '../../configuration/app-config';
import {
  MapGradientType,
  AppState,
  PointsOfInterestStoreType,
} from '../../types';
import {
  resetFilterSlider,
  setSelectedItem,
} from '../../store/modules/sidebarControlStore';
import { scaleSteps } from '../../services/sharedFunctions';
import './Map.scss';
import Popup from './MapTooltip/Popup';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Group } from '../../types/modules/groups.type';

const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`;

interface MapProps {
  darkTheme: boolean;
  selectedMonth: number | number[];
  selectedYear: number | number[];
  mapGradient: MapGradientType;
}

const Map: React.FC<MapProps> = ({
  darkTheme,
  selectedYear,
  selectedMonth,
  mapGradient,
}) => {
  const [map, setMap]: any = useState(null);

  const mapRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();

  const selectedLayerId: string = useSelector(
    (state: AppState) => state.SidebarControl.selectedLayerId,
  );
  const satelliteView: boolean = useSelector(
    (state: AppState) => state.MapControl.satelliteView,
  );
  const filterSliderValue: [number, number] = useSelector(
    (state: AppState) => state.SidebarControl.filterSlider,
  );
  const selectedGroup: Group = useSelector(
    (state: AppState) => state.GroupsPageStore.selectedGroup,
  );
  const pointsOfInterest: PointsOfInterestStoreType = useSelector(
    (state: AppState) => state.SidebarControl.pointsOfInterest,
  );

  const setSelection = (
    e: mapboxgl.MapMouseEvent & {
      features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
    } & mapboxgl.EventData,
  ): void => {
    if (e.features !== undefined && e.features.length > 0) {
      const newSelection = e.features[0];
      if (newSelection.properties !== null) {
        dispatch(setSelectedItem(newSelection.properties));
      }
    }
  };

  const setFilters = () => {
    if (map) {
      map.setFilter('secdev-layer', [
        'all',
        ['has', primaryScore],
        ['>=', ['to-number', ['get', primaryScore]], filterSliderValue[0]],
        ['<=', ['to-number', ['get', primaryScore]], filterSliderValue[1]],
      ]);
    }
  };

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
      map.setPaintProperty('secdev-layer', 'fill-color', fillColor);
    }
  };

  const resetLayer = () => {
    if (map) {
      if (map.getLayer('secdev-layer') !== undefined) {
        map.removeLayer('secdev-layer');
        map.removeSource('secdev-layer');
      }
      map.addLayer(layer);
    }
  };

  const clearSelectedItem = () => {
    if (map) {
      map.fire('close-all-popups');
      map.fire('clear-feature-state');
      dispatch(setSelectedItem(null));
    }
  };

  const layer: mapboxgl.FillLayer = {
    id: 'secdev-layer',
    type: 'fill',
    source: {
      type: 'vector',
      tiles: [
        `${process.env.REACT_APP_MAP_TILESERVER_URL}get-subcommune/${selectedMonth}/${selectedYear}/${selectedGroup.group_id}/{z}/{x}/{y}`,
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
        0.9,
        0.7,
      ],
    },
  };

  const visCheck = (state: boolean) => {
    if (state === true) {
      return 'visible';
    }
    return 'none';
  };

  let selectedId: number | string | undefined;

  useEffect(() => {
    // clear selected map items
    dispatch(setSelectedItem(null));
    dispatch(resetFilterSlider());

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
      className: 'secdev-layer-popup',
    });

    const clearFeatureState = () => {
      if (selectedId !== undefined) {
        map.setFeatureState(
          {
            id: selectedId,
            source: 'secdev-layer',
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

      const generatePoiLayers = () => {
        console.log('PointsOfInterest ===>>> ', PointsOfInterest);

        PointsOfInterest.forEach(item => {
          map.addLayer({
            id: item.title,
            type: 'symbol',
            'source-layer': 'tile',
            source: {
              type: 'vector',
              tiles: [
                `${process.env.REACT_APP_MAP_TILESERVER_URL}assets/${item.endpoint}/{z}/{x}/{y}?fields=${item.nameField}`,
              ],
            },
            layout: {
              'icon-image': item.icon,
              'icon-allow-overlap': true,
              'icon-size': 1,
              visibility: visCheck(pointsOfInterest[item.title].selected),
            },
          });
        });
      };

      // tooltips for poi layers
      PointsOfInterest.forEach(item => {
        map.on(
          'click',
          item.title,
          (
            e: mapboxgl.MapMouseEvent & {
              features?: any;
            } & mapboxgl.EventData,
          ) => {
            e.originalEvent.cancelBubble = true;
            const newPopup = new mapboxgl.Popup({
              className: `poi-popup ${darkTheme ? 'dark' : 'light'}`,
            });
            const popupContent = e.features[0].properties[item.nameField];

            if (popupContent) {
              setTimeout(() => {
                newPopup
                  .setHTML(popupContent)
                  .setLngLat({ lat: e.lngLat.lat, lng: e.lngLat.lng })

                  .addTo(map);
              }, 5);
            }
          },
        );
      });

      map.on(
        'click',
        'secdev-layer',
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
                  source: 'secdev-layer',
                  sourceLayer: 'tile',
                },
                { click: true },
              );
            }
          }
        },
      );

      // pointer event on hover
      map.on('mouseenter', 'secdev-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      // add layers and set map
      map.addLayer(layer);
      generatePoiLayers();
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

    popup.on('close', () => {
      clearFeatureState();
      dispatch(setSelectedItem(null));
    });

    map.on('close-all-popups', () => {
      popup.remove();
    });

    map.on('clear-feature-state', () => {
      clearFeatureState();
    });
  }, [mapGradient, darkTheme]);

  useEffect(() => {
    if (map) {
      PointsOfInterest.forEach(item => {
        map.setLayoutProperty(
          item.title,
          'visibility',
          visCheck(pointsOfInterest[item.title].selected),
        );
      });
    }
  }, [map, pointsOfInterest]);

  useEffect(
    () => {
      if (map) {
        map.setStyle(
          satelliteView
            ? mapAreaConfig.style.satellite
            : darkTheme
            ? mapAreaConfig.style.dark
            : mapAreaConfig.style.light,
        );
        setTimeout(() => {
          resetLayer();
          clearSelectedItem();
          setMapFills();
          setFilters();
        }, 200);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [satelliteView],
  );

  useEffect(
    () => {
      resetLayer();
      clearSelectedItem();
      setMapFills();
      setFilters();
      dispatch(resetFilterSlider());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedYear, selectedMonth, selectedGroup],
  );

  useEffect(
    () => {
      setMapFills();
      dispatch(resetFilterSlider());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map, mapGradient, selectedLayerId],
  );

  // Filtering functions
  useEffect(
    () => {
      setFilters();
      clearSelectedItem();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map, filterSliderValue],
  );

  return <div className="mapContainer" id="map" ref={mapRef} />;
};

export default Map;
