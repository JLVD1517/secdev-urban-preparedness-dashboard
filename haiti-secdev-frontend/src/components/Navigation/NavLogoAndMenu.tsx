import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createStyles, IconButton, makeStyles } from '@material-ui/core/';
import { setSideNavOpen } from '../../store/modules/appControlStore';
import MenuIcon from '../../assets/customIcons/MenuIcon';
import { AppState } from '../../types';
import { mainLogo } from '../../configuration/img-config';

const NavLogoAndMenu: React.FC = () => {
  const dispatch = useDispatch();
  const sideNavOpen: boolean = useSelector(
    (state: AppState) => state.AppControl.sideNavOpen,
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    dispatch(setSideNavOpen(!sideNavOpen));
  };

  // Component Style
  const useStyles = makeStyles(() =>
    createStyles({
      TopNavLogo: {
        height: '50px',
        margin: '8px 1rem 0 5px',
      },
    }),
  );
  const classes = useStyles();

  // Component Structure
  return (
    <>
      <NavLink to="/">
        <img className={classes.TopNavLogo} src={mainLogo} alt="logo" />
      </NavLink>{' '}
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleClick}
      >
        <MenuIcon />
      </IconButton>
    </>
  );
};

export default NavLogoAndMenu;
