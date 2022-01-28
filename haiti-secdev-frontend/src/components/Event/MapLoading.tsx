import React from 'react';
import { makeStyles, Paper } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import { useSelector } from 'react-redux';
import { componentSizing } from '../../services/component-sizing';
import Loader from '../BaseUIComponents/Loader';
import { AppState } from '../../types';

const useStyles = makeStyles({
  errorContainer: {
    position: 'absolute',
    height: `calc(100vh - ${componentSizing.appBarHeight})`,
    width: '100vw',
    top: componentSizing.appBarHeight,
    borderRadius: 0,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  centeredDiv: {
    display: 'flex',
    justifyContent: 'center',
  },
  centeredContent: {
    textAlign: 'center',
  },
  warningIcon: {
    color: 'red',
  },
});

const MapLoading: React.FC = () => {
  const classes = useStyles();

  const availableYearsLoadingStatus: string = useSelector(
    (state: AppState) => state.AvailableYears.status,
  );

  const availableYearsError: boolean = useSelector(
    (state: AppState) => state.AvailableYears.error,
  );

  return (
    <Paper className={classes.errorContainer}>
      {availableYearsError && (
        <div className={classes.centeredDiv}>
          <div className={classes.centeredContent}>
            <ErrorIcon className={classes.warningIcon} fontSize="large" />
            <p>{availableYearsLoadingStatus}</p>
          </div>
        </div>
      )}
      {availableYearsLoadingStatus === 'Loading' && <Loader />}
    </Paper>
  );
};

export default MapLoading;
