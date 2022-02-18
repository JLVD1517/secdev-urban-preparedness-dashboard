import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import GroupsIcon from '@material-ui/icons/Group';
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
      //boxShadow:`0 0 5px 2px ${theme.palette.background.default}`,
      marginBottom:'13px'
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
    },
    imgNoData:{
      height:'100px',
      width:'100px',
      paddingLeft:'30px'
    },
    imgNoDatatext:{
      fontWeight:800,
      display:'flex',
      marginTop:'-10px'
    }
  }),
);

const GangInfo: React.FC = () => {
  const selectedItem: SelectedItemType | null = useSelector(
    (state: AppState) => state.SidebarControl.selectedItem,
    );  
  const darkTheme: boolean = useSelector(
    (state: AppState) => state.AppControl.darkTheme,
  );
  const classes = useStyles();
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const group_details = selectedItem && selectedItem.group_details ? JSON.parse(selectedItem.group_details) : {}

  const handleClick = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(-1)
    } else {
      setSelectedIndex(index)
    }
  }

  return (
    <Paper className={selectedItem ? 'main-paper-list' : ''} style={{display:!Object.keys(group_details).length ? 'flex' :''}}>
    {selectedItem && (
      Object.keys(group_details).length ?
      Object.keys(group_details).map( (key, index) => { 
        return <List
          component="nav"
          aria-labelledby="nested-list-subheader"
          className={classes.root}
        >
        <ListItem button onClick={() => handleClick(index)}>
          <ListItemText primary={group_details[key].name} />
          {index === selectedIndex ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={index === selectedIndex} timeout="auto" unmountOnExit>
            <Paper elevation={0} className={classes.nested}>
                <div style={{marginBottom:'10px'}}>
                    <div className={classes.details}><span className={classes.text}>Group Name: </span>{group_details[key].name}</div>
                    <div className={classes.details}><span className={classes.text}>Group Size: </span>{group_details[key].group_size}</div>
                    <div className={classes.details}><span className={classes.text}>Group Leader Name: </span>{group_details[key].leader_name}</div>
                    <div className={classes.details}><span className={classes.text}>Group Type: </span>{group_details[key].type}</div>
                </div>
            </Paper>  
        </Collapse>
      </List>
    }): <div style={{marginBottom:'10px', justifyContent:'center'}}>
      <div>
        <GroupsIcon color='primary' className={classes.imgNoData}/>
      </div>
      <div className={classes.imgNoDatatext}>No Groups Available</div>
      </div> )
    }
  </Paper>
  );
}
export default GangInfo;