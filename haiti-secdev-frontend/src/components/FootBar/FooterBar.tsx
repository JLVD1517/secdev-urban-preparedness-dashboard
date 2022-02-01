import React from 'react';
import { useTheme, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { MapGradientType } from '../../types';

interface FootBarProps {
  mapGradient: MapGradientType;
  elementData: string;
  event:Boolean
}

const FootBar: React.FC<FootBarProps> = ({ mapGradient, elementData, event}) => {
  const theme = useTheme();
  const useStyles = makeStyles((theme: Theme) => ({
    root: {
      position: 'relative',
      top: event ? `calc(100vh - 75vh)` : `calc(100vh - 15vh)`,
      left: '30%',
      width: '293px',
      height: '50px',
      background: theme.palette.background.paper,
      borderRadius: '.5rem',
    },
    lengend: {
      margin: 'auto',
      padding: '5px 5px 10px',
    },
    bar: {
      opacity: 1,
      backgroundImage: `linear-gradient(90deg, ${mapGradient.step1} 0%, ${mapGradient.step2} 18.23%, ${mapGradient.step3} 39.38%, ${mapGradient.step4} 59.23%, ${mapGradient.step5} 79.87%, ${mapGradient.step6} 100%)`,
      width: '263px',
      height: '24px',
    },
    text: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    rangeText: {
      fontSize: '12px',
      lineHeight: '14.39px',
    },
    centerBarText: {
      fontSize: '16px',
      lineHeight: '16.45px',
      fontWeight: 700,
    },
  }));

  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.lengend}>
        <div className={classes.bar} />
        <div className={`row ${classes.text}`}>
          <div className={classes.rangeText}>0</div>
          <div className={classes.centerBarText}>{elementData}</div>
          <div className={classes.rangeText}>MAX</div>
        </div>
      </div>
    </div>
  );
};

export default FootBar;
