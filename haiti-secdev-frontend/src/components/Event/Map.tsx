import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { tileFields } from '../../services/tileFields';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { Paper } from '@material-ui/core';
import {
  makeStyles,
  createMuiTheme,
  ThemeProvider,
  styled,
} from '@material-ui/core/styles';
import Footerbar from '../FootBar/FooterBar';
import DateRangeFilter from '../DateRangeFilter/DateRangeFilter'
import AreaChartData from '../Chart/AreaChartData';
import {
  tractId,
  mapAreaConfig,
  primaryScore,
} from '../../configuration/app-config';
import {
  MapGradientType,
  AppState,
} from '../../types';
import {
  resetFilterSlider,
  setSelectedItem,
} from '../../store/modules/sidebarControlStore';
import { scaleSteps } from '../../services/sharedFunctions';
import './Map.scss';
import Popup from './MapTooltip/Popup';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}`;

const articlesData = [
  {
    source: {
      id: null,
      name: 'Gizmodo Australia',
    },
    author: 'Bradley Brownell',
    title: 'Winnebago Is Prepping Itself For The Electric Future',
    description:
      'Winnebago, yes that Winnebago, is jumping onboard the electric vehicle bandwagon in a big way. This week at the RV...\nThe post Winnebago Is Prepping Itself For The Electric Future appeared first on Gizmodo Australia.\n  Related Stories\r\n<ul><li>This “Land Yach…',
    url:
      'https://www.gizmodo.com.au/2022/01/winnebago-is-prepping-itself-for-the-electric-future/',
    urlToImage:
      'https://imgix.gizmodo.com.au/content/uploads/sites/2/2022/01/20/0f817614a360dd9c12f213b6c3930759-scaled.jpg?ar=16%3A9&auto=format&fit=crop&q=65&w=1200',
    publishedAt: '2022-01-20T00:00:49Z',
    content:
      'Winnebago, yes that Winnebago, is jumping onboard the electric vehicle bandwagon in a big way. This week at the RV Super Show in Tampa, Fla. the company unveiled the e-RV, what it is calling the firs… [+3243 chars]',
  },
  {
    source: {
      id: null,
      name: 'Bitcoinist',
    },
    author: 'Anifowoshe Ibrahim',
    title:
      'European Markets Regulator Urges The EU To Ban Proof-of-Work Bitcoin Mining',
    description:
      'Proof-of-work bitcoin mining should be banned, according to the vice chair of the European Securities and Markets Authority. Erik Thedéen suggested that European authorities explore prohibiting proof-of-work mining in favor of proof-of-stake mining. Thedeen A…',
    url:
      'https://bitcoinist.com/european-markets-regulator-urges-ban-bitcoin-minig/',
    urlToImage:
      'https://bitcoinist.com/wp-content/uploads/2022/01/gold-3080552_1280.jpg',
    publishedAt: '2022-01-20T00:00:28Z',
    content:
      'Proof-of-work bitcoin mining should be banned, according to the vice chair of the European Securities and Markets Authority.\r\nErik Thedéen suggested that European authorities explore prohibiting proo… [+3859 chars]',
  },
  {
    source: {
      id: null,
      name: 'Ozbargain.com.au',
    },
    author: 'allmightyg',
    title:
      '[VIC] Tesla Model 3 RWD (Previously SR+) $62,193 Delivered after $3000 VIC ZEV Subsidy (Was $65,193) @ Tesla',
    description:
      'Just noticed a significant price drop for the RWD model\n\nThis is for white color only and with black interior and no other upgrades/changes\n\nHope it helps someone :)',
    url: 'https://www.ozbargain.com.au/node/678531',
    urlToImage: 'https://files.ozbargain.com.au/n/31/678531x.jpg?h=8d38bdcc',
    publishedAt: '2022-01-19T23:49:12Z',
    content:
      'All trademarks are owned by their respective owners.OzBargain is an independent community website which has no association with nor endorsement by the respective trademark owners.\r\nCopyright © 2006-2… [+32 chars]',
  },
  {
    source: {
      id: null,
      name: 'Sky.com',
    },
    author: 'Samuel Osborne',
    title: 'Novak Djokovic owns majority stake of COVID cure company',
    description:
      "Novak Djokovic won't be able to play in the Australian Open but it appears he has high hopes of curing COVID.",
    url:
      'https://news.sky.com/story/novak-djokovic-owns-majority-stake-of-covid-cure-company-12520442',
    urlToImage:
      'https://e3.365dm.com/22/01/1600x900/skynews-novak-djokovic-australia_5643734.jpg?20220117064607',
    publishedAt: '2022-01-19T23:39:00Z',
    content:
      "Novak Djokovic won't be able to play in the Australian Open but it appears he has high hopes of curing COVID.\r\nIt has emerged the Serbian tennis player and his wife hold a majority stake in a Danish … [+2107 chars]",
  },
  {
    source: {
      id: null,
      name: 'iPhone in Canada',
    },
    author: 'iPhoneinCanada.ca',
    title: 'Tesla Model S Plaid Reviewed in Canada [VIDEO]',
    description:
      "Tesla's Model S Plaid has been reviewed by Canadian YouTube channel 'Unbox Therapy'.\nContinue reading Tesla Model S Plaid Reviewed in Canada [VIDEO] at iPhone in Canada Blog.",
    url:
      'https://www.iphoneincanada.ca/tesla/tesla-model-s-plaid-reviewed-in-canada-video/',
    urlToImage:
      'https://cdn.iphoneincanada.ca/wp-content/uploads/2022/01/model-s-plaid.jpeg',
    publishedAt: '2022-01-19T23:35:42Z',
    content:
      'Image credit: Unbox Therapy\r\nToronto-based YouTube channel, Unbox Therapy, recently shared a review of Teslas newest Model S Plaid electric sedan (via Tesla North).\r\nThe Model S Plaid is the newest v… [+1106 chars]',
  },
  {
    source: {
      id: null,
      name: 'CarScoops',
    },
    author: 'Brad Anderson',
    title: 'Jet-Powered Tesla Model S P85D Leaves A Plaid In Its Dust',
    description:
      'Who needs a Tesla Model S Plaid when you can fit a P85D with jet engines?',
    url:
      'https://www.carscoops.com/2022/01/jet-powered-tesla-model-s-p85d-leaves-a-plaid-in-its-dust/',
    urlToImage:
      'https://www.carscoops.com/wp-content/uploads/2022/01/Tesla-Model-S.jpg',
    publishedAt: '2022-01-19T23:30:27Z',
    content:
      'Last month, the owner of a Tesla Model S P85D decided he wasnt going to wait around for the Tesla Roadsters long-promised SpaceX package and fitted his EV with a trio of small jet engines to make it … [+1647 chars]',
  },
  {
    source: {
      id: null,
      name: "Investor's Business Daily",
    },
    author: "Investor's Business Daily",
    title:
      'Dow Jones Futures: Market Correction Extends Losses; Four Stocks In Beat-Up Sector Worth Watching',
    description:
      'Strong open, weak close is classic bad market action. More leaders are cracking.',
    url:
      'https://www.investors.com/market-trend/stock-market-today/dow-jones-futures-market-correction-extends-losses-four-stocks-in-beat-up-sector-worth-watching/',
    urlToImage:
      'https://www.investors.com/wp-content/uploads/2018/04/Stock-BearVista-01-adobe.jpg',
    publishedAt: '2022-01-19T23:13:40Z',
    content:
      'Dow Jones futures were little changed overnight, along with S&amp;P 500 futures and Nasdaq futures. The stock market extended losses Wednesday even as the 10-year Treasury yield retreated modestly.\r\n… [+9313 chars]',
  },
];

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.default,
    position: 'relative',
    overflow: 'auto',
    maxHeight: 300,
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
  },
  datePubline: {
    fontWeight: 700,
    fontSize: '14px',
  },
  mainHeader: {
    textAlign: 'center',
  },
  rightDiv: {
    backgroundColor: theme.palette.background.default,
  },
}));

interface MapProps {
  darkTheme: boolean;
  selectedMonth: number | number[];
  selectedYear: number | number[];
  mapGradient: MapGradientType;
}

const Map: React.FC<MapProps> = ({ darkTheme, selectedYear, selectedMonth, mapGradient }) => {
  const classes = useStyles();
  const tableTheme = darkTheme
    ? createMuiTheme({ palette: { type: 'dark' } })
    : createMuiTheme({ palette: { type: 'light' } });
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
      map.setFilter('uppd-layer', [
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
      ['to-number', ['get', "gid"]],
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

  const resetLayer = () => {
    if (map) {
      if (map.getLayer('uppd-layer') !== undefined) {
        map.removeLayer('uppd-layer');
        map.removeSource('uppd-layer');
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
    id: 'uppd-layer',
    type: 'fill',
    source: {
      type: 'vector',
      tiles: [
        `${
          process.env.REACT_APP_MAP_TILESERVER_URL
        }get-commune/{z}/{x}/{y}`,
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
        0.85,
        0.4,
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
          // setFilters();
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
      // setFilters();
      dispatch(resetFilterSlider());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedYear],
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
      // setFilters();
      clearSelectedItem();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map, filterSliderValue],
  );

  return (
    <div className="divClass">
      <Grid container>
        <Grid item md={5} className="containerBox">
          <div className="col-5">
            <div className="mapEventContainer" id="map" ref={mapRef} />
            <Footerbar mapGradient={mapGradient} elementData={'Number Of Events'}/>
          </div>
        </Grid>
        <Grid item md={7} className={`containerBox ${classes.rightDiv}`}>
          <div style={{ marginTop: '65px' }}>
            <h1 className={classes.mainHeader}>
              UN Haiti Port Au Prince Event Monitor
            </h1>
            <div>
              <DateRangeFilter darkTheme={darkTheme}/>
            </div>
          </div>
          <Grid container>
            <Grid item md={6} className="containerBox">
                <AreaChartData darkTheme={darkTheme} mapGradient={mapGradient}/>
            </Grid>
            <Grid item md={6} className="containerBox">
                <AreaChartData darkTheme={darkTheme} mapGradient={mapGradient}/>
            </Grid>
          </Grid>
        </Grid>
        <Grid item md={12}>
          <ThemeProvider theme={tableTheme}>
            <Box className={classes.root}>
              {articlesData.map(article => (
                <Paper
                  className={classes.listSection}
                  key={article.title}
                  elevation={2}
                >
                  <div>
                    <div className={classes.headlines}>{article.title}</div>
                    <Grid container>
                      <Grid item md={2} className={classes.datePubline}>
                        Date: {article.publishedAt}
                      </Grid>
                      <Grid item md={3} className={classes.datePubline}>
                        {article?.source?.name ?? ''}
                      </Grid>
                    </Grid>
                    <Grid container>
                      Article tags, including language, event type, tone
                    </Grid>
                  </div>
                </Paper>
              ))}
            </Box>
          </ThemeProvider>
        </Grid>
      </Grid>
    </div>
  );
};

export default Map;
