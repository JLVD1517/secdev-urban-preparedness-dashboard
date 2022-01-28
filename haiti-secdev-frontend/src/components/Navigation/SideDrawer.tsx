import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Theme,
} from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import { createStyles, makeStyles } from '@material-ui/styles';
import { darken } from '@material-ui/core/styles';
import {
  setDarkTheme,
  setSideNavOpen,
} from '../../store/modules/appControlStore';
import { setSatelliteView } from '../../store/modules/mapControlStore';
import { AppState } from '../../types';
import CustomSwitch from '../BaseUIComponents/CustomSwitch';
import HomeIcon from '../../assets/customIcons/HomeIcon';
import MapIcon from '../../assets/customIcons/MapIcon';
import EventIcon from '@material-ui/icons/Event';
import NavLogoAndMenu from './NavLogoAndMenu';
import { sdgLogo, mbLogo, rs21Logo } from '../../configuration/img-config';

const SideDrawer: React.FC = () => {
  const dispatch = useDispatch();

  const sideNavOpen: boolean = useSelector(
    (state: AppState) => state.AppControl.sideNavOpen,
  );

  const darkTheme: boolean = useSelector(
    (state: AppState) => state.AppControl.darkTheme,
  );

  const satelliteView: boolean = useSelector(
    (state: AppState) => state.MapControl.satelliteView,
  );

  const handleClose = () => {
    dispatch(setSideNavOpen(false));
  };

  const toggleTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDarkTheme(event.target.checked));
    handleClose();
  };

  const toggleSatView = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSatelliteView(event.target.checked));
    handleClose();
  };

  const links = [
    {
      id: 1,
      route: '/',
      icon: HomeIcon,
      name: 'Home',
    },
    {
      id: 2,
      route: '/haiti/groups',
      icon: MapIcon,
      name: 'Groups',
    },
    {
      id: 3,
      route: '/haiti/events',
      icon: EventIcon,
      name: 'Events',
    },
  ];

  // Component Style
  const drawerWidth = 250;

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      sideBarHeader: {
        borderBottom: `2px solid ${theme.palette.text.disabled}`,
      },
      drawer: {
        width: drawerWidth,
        flexShrink: 0,
      },
      drawerPaper: {
        width: drawerWidth,
        marging: '0 1rem',
        color: 'white',
        backgroundColor: darkTheme
          ? theme.palette.background.default
          : theme.palette.primary.main,
      },
      listContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100vh - 64px)',
      },
      drawerContentBottom: {
        margin: '0 0 1rem 1rem',
      },
      themeSwitch: {
        marginLeft: '5px',
      },
      secDiv: {
        display: 'flex',
        // margin: '0 0.5rem',
      },
      secImage: {
        height: '40px',
        marginTop: '15px',
      },
      logoDiv: {
        display: 'flex',
        marginTop: '0.1rem',
      },
      logoImage: {
        height: '25px',
        margin: '10px',
      },
      logoText: {
        lineHeight: '20px',
        marginTop: '5px',
      },
      partnerDiv: {
        marginTop: '10px',
        marginBottom: '0',
      },
      linkList: {
        margin: '0 0.5rem',
      },
      link: {
        borderRadius: '5px',
        '&:hover': {
          backgroundColor: darken(`${theme.palette.primary.main}`, 0.5),
        },
        '&.active-link': {
          backgroundColor: darken(`${theme.palette.primary.main}33`, 0.5),
          '&:hover': {
            backgroundColor: darken(`${theme.palette.primary.main}`, 0.2),
          },
        },
      },
    }),
  );

  const classes = useStyles();

  // Component Structure
  return (
    <Drawer
      className={classes.drawer}
      classes={{ paper: classes.drawerPaper }}
      variant="temporary"
      anchor="left"
      open={sideNavOpen}
      ModalProps={{ onBackdropClick: handleClose }}
    >
      <Toolbar className={classes.sideBarHeader}>
        <NavLogoAndMenu />
      </Toolbar>
      <div className={classes.listContentContainer}>
        <List component="nav" className={classes.linkList}>
          {links.map(item => (
            <ListItem
              component={NavLink}
              button
              exact={item.route === '/'}
              to={item.route}
              className={classes.link}
              activeClassName="active-link"
              aria-label={`go to ${item.name} page`}
              onClick={handleClose}
              key={item.id}
            >
              {' '}
              <ListItemIcon>
                <item.icon aria-label={`icon for ${item.name} page`} />
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
        </List>
        <div className={classes.drawerContentBottom}>
          <FormControlLabel
            label={satelliteView ? 'Satellite View' : 'Map View'}
            control={
              <CustomSwitch
                className={classes.themeSwitch}
                checked={satelliteView}
                onChange={toggleSatView}
                name="toggle map base layer"
              />
            }
          />
          <FormControlLabel
            label={darkTheme ? 'Dark Mode' : 'Light Mode'}
            control={
              <CustomSwitch
                className={classes.themeSwitch}
                checked={darkTheme}
                onChange={toggleTheme}
                name="toggle theme"
              />
            }
          />
          <div className={classes.secDiv}>
            <a href="https://www.secdev.com/">
              <img
                className={classes.secImage}
                src={sdgLogo}
                alt="SecDev logo"
              />
            </a>
          </div>
          <div className={classes.partnerDiv}>
            <p className={classes.logoText}>In partnership with:</p>
          </div>
          <div className={classes.logoDiv}>
            <a href="https://www.rs21.io/">
              <img
                className={classes.logoImage}
                src={rs21Logo}
                alt="RS21 logo"
              />
            </a>
          </div>
          <div className={classes.logoDiv}>
            <a href="https://mapbox.com/community/">
              <img
                className={classes.logoImage}
                src={mbLogo}
                alt="Mapbox logo"
              />
            </a>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default SideDrawer;
