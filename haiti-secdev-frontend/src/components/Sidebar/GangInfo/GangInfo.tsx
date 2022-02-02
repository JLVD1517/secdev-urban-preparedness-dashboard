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
import './GangInfo.scss';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
      boxShadow:`0 0 5px 2px ${theme.palette.background.default}`
    },
    nested: {
      paddingLeft: theme.spacing(3),
    },
    text:{
        fontWeight:900,
        fontSize:'14px'
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

  const group_details = selectedItem && selectedItem.group_details ? JSON.parse(selectedItem.group_details) : {}

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <Paper className={Object.keys(group_details).length ? 'main-paper-list' : ''}>
    {selectedItem && (
    Object.keys(group_details).map( (key, index) => { 
        return <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        className={classes.root}
      >
        <ListItem button onClick={handleClick}>
          <ListItemText primary={group_details[key].name} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Paper elevation={0} className={classes.nested}>
                    <div>
                        <div className={classes.details}><span className={classes.text}>Group Name :</span>{group_details[key].name}</div>
                        <div className={classes.details}><span className={classes.text}>Group Size :</span>{group_details[key].group_size}</div>
                        <div className={classes.details}><span className={classes.text}>Group Leader Name :</span>{group_details[key].leader_name}</div>
                        <div className={classes.details}><span className={classes.text}>Group Type :</span>{group_details[key].type}</div>
                    </div>
                </Paper>  
            </Collapse>
      </List>
    }))}
    </Paper>
  );
}

export default GangInfo;