import React from 'react';
import { createStyles, makeStyles, Paper, Theme } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { AppState } from '../../types';
import { componentSizing } from '../../services/component-sizing';

type InfoPageProps = {
  image: string;
  children: React.ReactNode;
};

function InfoPageContainer({ image, children }: InfoPageProps) {
  const darkTheme: boolean = useSelector(
    (state: AppState) => state.AppControl.darkTheme,
  );
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      InfoPageContainer: {
        position: 'absolute',
        top: componentSizing.appBarHeight,
        height: `calc(100vh - ${componentSizing.appBarHeight})`,
        width: '100vw',
        borderRadius: 0,
        overflowY: 'auto',

        background: `linear-gradient(
        to left,
        ${darkTheme ? 'rgba(0,0,0, 0.3)' : 'rgba(220,220,220, 0.3)'},
        ${darkTheme ? 'rgba(0,0,0, 1)' : 'rgba(220,220,220, 1)'}
      ),url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'right',
        backgroundRepeat: 'no-repeat',
      },
    }),
  );

  const classes = useStyles();

  return <Paper className={classes.InfoPageContainer}>{children}</Paper>;
}

export default InfoPageContainer;
