import React from 'react';
import {
  AppBar,
  createStyles,
  makeStyles,
  Theme,
  Toolbar,
} from '@material-ui/core/';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { AppState } from '../../types';
import { componentSizing } from '../../services/component-sizing';
import NavLogoAndMenu from './NavLogoAndMenu';
import MapSearch from './MapSearch';

const Navbar: React.FC = () => {
  const darkTheme: boolean = useSelector(
    (state: AppState) => state.AppControl.darkTheme,
  );

  const location = useLocation();

  // Component Style
  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      AppBar: {
        backgroundColor: darkTheme
          ? theme.palette.background.default
          : theme.palette.primary.main,
        minHeight: componentSizing.appBarHeight,
      },
      ToolBar: {
        float: 'right',
      },
    }),
  );

  const classes = useStyles();

  return (
    <div>
      <AppBar id="TopNav" className={classes.AppBar}>
        <Toolbar className={classes.ToolBar}>
          <NavLogoAndMenu />
          {location.pathname === '/map' && <MapSearch />}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Navbar;
