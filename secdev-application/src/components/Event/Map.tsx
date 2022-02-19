import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { Paper, FormControlLabel } from '@material-ui/core';
import EventNoteIcon from '@material-ui/icons/EventNote';
import {
  makeStyles,
  createMuiTheme,
  ThemeProvider,
} from '@material-ui/core/styles';
import Footerbar from '../FootBar/FooterBar';
import DateRangeFilter from '../DateRangeFilter/DateRangeFilter';
import AreaChartData from '../Chart/AreaChartData';
import CustomSwitch from '../BaseUIComponents/CustomSwitch';
import {
  mapAreaConfig,
  primaryScore,
  eventMapAreaConfig,
  eventsPrimaryScore,
  LANGUAGE,
} from '../../configuration/app-config';
import { MapGradientType, AppState, ArticleData } from '../../types';
import {
  resetFilterSlider,
  setSelectedItem,
} from '../../store/modules/sidebarControlStore';
import { scaleSteps } from '../../services/sharedFunctions';
import './Map.scss';
import Popup from './MapTooltip/Popup';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { PlotData } from '../../types';
import ToneSlider from '../../ToneSlider/ToneSlider';
import { fetchArticles } from '../../store/modules/articlesStore';
import { Event, EventsFilters } from '../../types/modules/eventsFilters.type';
import { fetchAvgArticlesTonePlot } from '../../store/modules/avgArticleTonePlotStore';
import { fetchNoOfArticlesPlot } from '../../store/modules/noOfArticlePlotStore';
import {
  setEventsLanguage,
  setSelectedCommuneId,
} from '../../store/modules/eventsPageStore';
import moment from 'moment';
import SelectEvent from '../SelectBox/SelectEvent';
import { EventypePlotdata } from '../../types/modules/eventsPlots.type';
import { fetchNoOfArticlesPlotByEventType } from '../../store/modules/noOfArticleByEventTypePlotStore';
import MultiLineChartData from '../Chart/MultiLineChartData';
import MapAttribution from './MapAttribution';

const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`;

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.default,
    position: 'relative',
    overflow: 'auto',
    //maxHeight: 300,
  },
  listSection: {
    backgroundColor: 'inherit',
    height: 80,
    padding: '5px 15px',
    margin: '10px',
  },
  headlines: {
    fontWeight: 700,
    fontSize: '18px',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  datePubline: {
    fontWeight: 700,
    fontSize: '14px',
  },
  mainHeader: {
    textAlign: 'center',
  },
  mainHeader1: {
    textAlign: 'center',
    padding: '10px 30px',
    marginBottom: '2rem',
    fontSize: '11px',
  },
  rightDiv: {
    backgroundColor: theme.palette.background.default,
  },
  container2: {
    height: 'calc(100vh - 493px)',
    backgroundColor: theme.palette.background.default,
    border: '3px solid rgba(255, 255, 255, 0.12)',
  },
  summarySection: {
    backgroundColor: 'inherit',
    height: 50,
    padding: '5px 15px',
    margin: '10px',
  },
  headlinesSummary: {
    fontWeight: 300,
    fontSize: '18px',
    textDecoration: 'none',
    color: 'inherit',
  },
}));

interface MapProps {
  darkTheme: boolean;
  selectedMonth: number | number[];
  selectedYear: number | number[];
  mapGradient: MapGradientType;
}

const Map: React.FC<MapProps> = ({ darkTheme, mapGradient }) => {
  const classes = useStyles();
  const tableTheme = darkTheme
    ? createMuiTheme({ palette: { type: 'dark' } })
    : createMuiTheme({ palette: { type: 'light' } });
  const [map, setMap]: any = useState(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const startDate: string = useSelector(
    (state: AppState) => state.EventsPageStore.startDate,
  );
  const endDate: string = useSelector(
    (state: AppState) => state.EventsPageStore.endDate,
  );
  const selectedCommuneId: number = useSelector(
    (state: AppState) => state.EventsPageStore.selectedCommuneId,
  );
  const language: string = useSelector(
    (state: AppState) => state.EventsPageStore.language,
  );
  const selectedEvent: Event = useSelector(
    (state: AppState) => state.EventsPageStore.selectedEvent,
  );

  const eventsFilter: EventsFilters = {
    start_date: startDate,
    end_date: endDate,
    tone_end_range: 0,
    tone_start_range: 0,
    language: language,
    commune_id: selectedCommuneId,
    event_id: selectedEvent.event_id,
  };

  const selectedLayerId: string = useSelector(
    (state: AppState) => state.SidebarControl.selectedLayerId,
  );
  const satelliteView: boolean = useSelector(
    (state: AppState) => state.MapControl.satelliteView,
  );
  const filterSliderValue: [number, number] = useSelector(
    (state: AppState) => state.SidebarControl.filterSlider,
  );
  const noOfArticlesByEventTypePlotData: EventypePlotdata[] | [] = useSelector(
    (state: AppState) => state.NoOfArticleStoreByEventType.data,
  );
  const avgTonePlotData: PlotData[] = useSelector(
    (state: AppState) => state.AverageArticleToneStore.avgTonePlotData,
  );
  const articlesData: ArticleData[] | [] = useSelector(
    (state: AppState) => state.ArticlesStore.articles,
  );

  const setSelection = (
    e: mapboxgl.MapMouseEvent & {
      features?: mapboxgl.MapboxGeoJSONFeature[] | undefined;
    } & mapboxgl.EventData,
  ): void => {
    if (e.features !== undefined && e.features.length > 0) {
      const newSelection = e.features[0];
      if (newSelection.properties !== null) {
        dispatch(setSelectedCommuneId(newSelection.properties.gid));
        dispatch(setSelectedItem(newSelection.properties));
      }
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
      ['to-number', ['get', eventsPrimaryScore]],
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
        `${process.env.REACT_APP_MAP_TILESERVER_URL}get-commune/${startDate}/${endDate}/${language}/${selectedEvent.event_id}/{z}/{x}/{y}`,
      ],
      promoteId: 'gid',
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
    dispatch(fetchArticles(eventsFilter));
    dispatch(fetchAvgArticlesTonePlot(eventsFilter));
    dispatch(fetchNoOfArticlesPlot(eventsFilter));
    dispatch(fetchNoOfArticlesPlotByEventType(eventsFilter));

    if (!mapRef.current) {
      return;
    }

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: satelliteView
        ? eventMapAreaConfig.style.satellite
        : darkTheme
        ? eventMapAreaConfig.style.dark
        : eventMapAreaConfig.style.light,
      center: eventMapAreaConfig.mapCenter,
      zoom: eventMapAreaConfig.zoomLevel,
      maxBounds: eventMapAreaConfig.bounds,
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
      dispatch(setSelectedCommuneId(-1));
    });

    map.on('close-all-popups', () => {
      popup.remove();
    });

    map.on('clear-feature-state', () => {
      clearFeatureState();
    });
  }, [mapGradient, darkTheme]);

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
      dispatch(resetFilterSlider());
      dispatch(fetchArticles(eventsFilter));
      dispatch(fetchAvgArticlesTonePlot(eventsFilter));
      dispatch(fetchNoOfArticlesPlot(eventsFilter));
      dispatch(fetchNoOfArticlesPlotByEventType(eventsFilter));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, startDate, selectedEvent],
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
      clearSelectedItem();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map, filterSliderValue],
  );

  const toggleLanguage = () => {
    dispatch(setSelectedCommuneId(-1));
    dispatch(
      setEventsLanguage(
        language === LANGUAGE.ENGLISH ? LANGUAGE.FRENCH : LANGUAGE.ENGLISH,
      ),
    );
  };

  useEffect(() => {
    dispatch(fetchArticles(eventsFilter));
  }, [selectedCommuneId]);

  return (
    <div>
      <Grid container className="containerBox">
        <Grid item md={8} className={`${classes.rightDiv}`}>
          <div style={{ paddingTop: '4rem' }}>
            <div className="row">
              <h1 className={classes.mainHeader}>
                Violence in Port-au-Prince in the Media
              </h1>
            </div>
            <div className="row">
              <h3 className={classes.mainHeader1}>
                Articles related to violence in Port-au-Prince are processed using Natural Language
                Processing (NLP) techniques to extract the event category and
                sentiment or tone. The tone represents the level of violence or
                seriousness detected in the language of the article, where 0 is
                the least serious and -20 is the most serious.
              </h3>
            </div>
          </div>
          <div className="wrapper">
            <div className="cusSwitch">
              <FormControlLabel
                label={language.toLocaleUpperCase()}
                control={
                  <CustomSwitch
                    checked={language === LANGUAGE.ENGLISH}
                    onChange={toggleLanguage}
                    name="toggle language"
                  />
                }
              />
            </div>
            <div className="dateRangeFormat">
              <DateRangeFilter darkTheme={darkTheme} />
            </div>
            <div className="toneSlider">
              <SelectEvent />
            </div>
          </div>
          <Grid container style={{ paddingBottom: '15px' }}>
            <Grid item md={6} className="containerBox">
              <h3 style={{ textAlign: 'center', marginBottom: '-4px' }}>
                Articles By Event Type Over Time
              </h3>
              <MultiLineChartData
                darkTheme={darkTheme}
                data={noOfArticlesByEventTypePlotData}
                mapGradient={mapGradient}
              />
            </Grid>
            <Grid item md={6} className="containerBox">
              <h3 style={{ textAlign: 'center', marginBottom: '-4px' }}>
                Average Tone of Articles Over Time
              </h3>
              <AreaChartData
                darkTheme={darkTheme}
                mapGradient={mapGradient}
                data={avgTonePlotData}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item md={4}>
          <div>
            <div className="mapEventContainer" id="map" ref={mapRef} />
            <Footerbar
              mapGradient={mapGradient}
              elementData={'Number Of Events'}
              event={true}
            />
          </div>
          <MapAttribution />
        </Grid>
      </Grid>
      <Grid item md={12} className={classes.container2}>
        <ThemeProvider theme={tableTheme}>
          <Paper className={classes.summarySection} elevation={1}>
            <Grid container className={classes.headlinesSummary}>
              {`Articles from ${moment(startDate, 'DD-MM-YYYY').format(
                'DD MMM YYYY',
              )} to ${moment(endDate, 'DD-MM-YYYY').format('DD MMM YYYY')} ${
                selectedEvent.event_id > 0
                  ? `for ${selectedEvent.name} events`
                  : ''
              } in ${language.toUpperCase()}`}
            </Grid>
          </Paper>
          <Box className={classes.root}>
            {articlesData && articlesData.length ? (
              (articlesData as any[]).map((article: ArticleData) => (
                <Paper
                  className={classes.listSection}
                  key={article.eventInfoId}
                  elevation={1}
                >
                  <a
                    href={article.url}
                    target="_blank"
                    className={classes.headlines}
                    rel="noreferrer"
                  >
                    <span>{article.title}</span>
                  </a>
                  <Grid container>
                    <Grid item md={5} className={classes.datePubline}>
                      {article.publicationDate}
                    </Grid>
                    <Grid item md={3} className={classes.datePubline}>
                      {article.source}
                    </Grid>
                    <Grid item md={3} className={classes.datePubline}>
                      {article.source}
                    </Grid>
                  </Grid>

                  <Grid container>
                    <Grid item md={5} className={classes.datePubline}>
                      Event Type:{' '}
                      {article?.eventType.charAt(0).toUpperCase() +
                        article?.eventType.slice(1)}
                    </Grid>
                    <Grid item md={3} className={classes.datePubline}>
                      Tone: {article.tone}
                    </Grid>
                  </Grid>
                </Paper>
              ))
            ) : (
              <div className="noDataAvail">
                <EventNoteIcon />{' '}
                <span style={{ paddingLeft: '1rem' }}>
                  No News Headlines Available
                </span>
              </div>
            )}
          </Box>
        </ThemeProvider>
      </Grid>
    </div>
  );
};

export default Map;
