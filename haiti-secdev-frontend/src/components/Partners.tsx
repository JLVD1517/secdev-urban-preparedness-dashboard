import React from 'react';
import { useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { useSelector } from 'react-redux';
import { AppState } from '../types';
import {
  sdgLogo,
  mbLogo,
  rs21Logo,
  sdgDark,
  mbDark,
  rs21Dark,
} from '../configuration/img-config';

const Partners: React.FC = () => {
  const theme = useTheme();
  const darkTheme: boolean = useSelector(
    (state: AppState) => state.AppControl.darkTheme,
  );
  const useStyles = makeStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      '& > *': {
        margin: 'auto',
      },
    },
    Button: {
      margin: 'auto',
      marginTop: '1rem',
      marginBottom: '1rem',
    },
    secImage: {
      height: '40px',
      margin: '5px',
    },
    logoImage: {
      height: '28px',
      margin: '8px',
    },
  });
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Button
        variant="outlined"
        className={classes.Button}
        href="https://www.secdev.com/"
      >
        <img
          className={classes.secImage}
          src={darkTheme ? sdgLogo : sdgDark}
          alt="SecDev logo"
        />
      </Button>
      <Button
        variant="outlined"
        className={classes.Button}
        href="https://mapbox.com/community/"
      >
        <img
          className={classes.logoImage}
          src={darkTheme ? mbLogo : mbDark}
          alt="Mapbox logo"
        />
      </Button>
    </div>
  );
};
export default Partners;
