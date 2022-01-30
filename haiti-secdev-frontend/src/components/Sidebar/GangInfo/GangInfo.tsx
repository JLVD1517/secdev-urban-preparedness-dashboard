import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { AppState, SelectedItemType } from '../../../types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Paper } from '@material-ui/core';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(3),
    },
    text:{
        fontSize: '30px',
        fontWeight:900
    },
    details:{
        margin:".8rem 0"
    }
  }),
);

const GangInfo: React.FC = () => {
const selectedItem: SelectedItemType | null = useSelector(
    (state: AppState) => state.SidebarControl.selectedItem,
    );  
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
    {selectedItem && (  
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      className={classes.root}
    >
      <ListItem button onClick={handleClick}>
        <ListItemText className={classes.text} primary="Gang Details" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Paper elevation={0} className={classes.nested}>
            <div>
                <div className={classes.details}>Gang Name</div>
                <div className={classes.details}>Gang Leader</div>
            </div>
        </Paper>  
      </Collapse>
    </List>)}
    </>
  );
}

export default GangInfo;