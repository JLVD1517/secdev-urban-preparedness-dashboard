import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, useTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { ReportProblem } from '@material-ui/icons';
import { MapGradientType, AppState } from '../../types';
import { filterScale, projectedYears } from '../../configuration/app-config';

interface WindowDimensions {
  windowWidth: number;
  windowHeight: number;

  mapGradient: MapGradientType;
}

const MapLegend: React.FC<WindowDimensions> = ({
  windowWidth,
  windowHeight,
  mapGradient,
}) => {
  const [projected, setProjected] = useState(false);
  const selectedYear: number | number[] = useSelector(
    (state: AppState) => state.SidebarControl.selectedYear,
  );
  useEffect(() => {
    if (projectedYears.includes(selectedYear as number)) {
      setProjected(true);
    } else {
      setProjected(false);
    }
  }, [selectedYear]);
  const theme = useTheme();
  const useStyles = makeStyles(() =>
    createStyles({
      root: {
        position: 'fixed',
        bottom: '2rem',
        left: '1rem',
        zIndex: 199,
        width: '250px',
        height: '50px',
        '&.mobile': {
          top: '8rem',
          left: '1rem',
          height: '30px',
        },
        '&.hide': {
          display: 'none',
        },
      },
      gradientBar: {
        height: '25px',
        width: '100%',
        background: `linear-gradient(90deg, ${mapGradient.step1} 0%, ${mapGradient.step2} 18.23%, ${mapGradient.step3} 39.38%, ${mapGradient.step4} 59.23%, ${mapGradient.step5} 79.87%, ${mapGradient.step6} 100%)`,
        '&.mobile': {
          height: '10px',
        },
      },
      legendText: {
        display: 'flex',
        justifyContent: 'space-between',
        margin: '5px',
        '&.mobile': {
          marginTop: '-1px',
        },
      },
      boldText: {
        fontWeight: 'bold',
      },
      warning: {
        position: 'absolute',
        bottom: '6rem',
        left: '1rem',
        zIndex: 199,
        width: '250px',
        height: '50px',
        '&.mobile': {
          top: '170px',
          height: '30px',
          left: '1rem',
        },
        '&.hide': {
          display: 'none',
        },
        borderLeft: `12px solid ${theme.palette.warning.main}`,
      },
      warningTextContainer: {
        display: 'flex',
        padding: '10px',

        '&.mobile': {
          padding: '2px 10px',
        },
      },
      warningText: {
        margin: '4px 0 0 5px',
      },
      warningIcon: {
        color: theme.palette.warning.main,
      },
    }),
  );

  const classes = useStyles();

  const mobile = windowWidth < 960 ? 'mobile' : '';
  const hide = windowHeight < 565 && windowWidth < 960 ? 'hide' : '';

  return (
    <div>
      {projected ? (
        <Card
          id="ProjectedWarning"
          className={`${classes.warning} ${mobile} ${hide}`}
        >
          {/* <div className={`${classes.warningColor} ${mobile}`} /> */}
          <div className={`${classes.warningTextContainer} ${mobile} ${hide}`}>
            <ReportProblem className={classes.warningIcon} />

            <p className={classes.warningText}>Disclaimer: Projected data</p>
          </div>
        </Card>
      ) : null}

      <Card id="MapLegend" className={`${classes.root} ${mobile} ${hide}`}>
        <div className={`${classes.gradientBar} ${mobile}`} />
        <div className={`${classes.legendText} ${mobile}`}>
          <span>{filterScale.lowBound.toFixed(0)}</span>
          <span className={classes.boldText}>Index Value</span>
          <span>{filterScale.highBound.toFixed(0)}</span>
        </div>
      </Card>
    </div>
  );
};

export default MapLegend;
