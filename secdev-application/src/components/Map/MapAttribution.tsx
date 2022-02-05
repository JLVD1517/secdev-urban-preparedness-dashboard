import { createStyles, makeStyles } from '@material-ui/styles';
import Link from '@material-ui/core/Link';
import { Theme } from '@material-ui/core';
import React from 'react';

const MapAttribution: React.FC = () => {
  const useStyles = makeStyles(() =>
    createStyles({
      root: {
        position: 'fixed',
        bottom: '0',
        left: '0',
        padding: '5px 5px 5px 2rem',
        backgroundColor: 'rgba(256, 256, 256, 0.15)',
        borderRadius: '0 5px 0 0',
      },
    }),
  );

  const classes = useStyles();
  return (
    <div className={`${classes.root} mapbox-attribution-container`}>
      <Link href="https://www.mapbox.com/about/maps/">© Mapbox </Link> |{' '}
      <Link href="http://www.openstreetmap.org/copyright">
        © OpenStreetMap{' '}
      </Link>{' '}
      |{' '}
      <Link href="https://www.mapbox.com/map-feedback/" target="blank">
        <strong>Improve this map</strong>
      </Link>
    </div>
  );
};

export default MapAttribution;
