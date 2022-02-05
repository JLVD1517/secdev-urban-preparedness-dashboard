import React from 'react';
import { CircularProgress, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';

const Loader: React.FC = () => {
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        backgroundColor: theme.palette.background.default,
        height: '100vh',
      },
    }),
  );
  const classes = useStyles();
  return (
    <Grid
      container
      alignItems="center"
      justify="center"
      className={classes.root}
    >
      <CircularProgress size="100px" />
    </Grid>
  );
};
export default Loader;
