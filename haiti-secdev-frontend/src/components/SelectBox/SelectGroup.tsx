import React from "react";
import { Select, FormControl, InputLabel , Box} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from '../../types';
import { Group } from "../../types/modules/groups.type";
import { setSelectedGroup } from "../../store/modules/groupsPageStore";

const SelectGroup: React.FC = () => {
  const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 250,
    },
  }));

  const dispatch = useDispatch();
  const groupsList: Group[] | [] = useSelector (
    (state: AppState) => state.GroupsListStore.groups
  );
  const selectedGroup: Group = useSelector (
    (state: AppState) => state.GroupsPageStore.selectedGroup
  );

  const handleSelect = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const selectedItem = groupsList.find(item => item.group_id == event.target.value);
    dispatch(setSelectedGroup(selectedItem as any as Group));
  };

  const classes = useStyles();
  return (
    <FormControl className={classes.formControl} variant="outlined">
      <InputLabel htmlFor="IndexSelect">Select Group</InputLabel>
      <Select
        id="IndexSelect"
        label="Urban Resiliency Index"
        native
        value={selectedGroup.group_id > 0 ? selectedGroup.group_id : null}
        onChange={handleSelect}
      >
        {(groupsList as Group[]).map((item: Group, index: number) => {
          return (
            <option key={item.group_id} value={item.group_id}>
              {item?.name.charAt(0).toUpperCase() + item?.name.slice(1)}
            </option>
          );
        })}
      </Select>
    </FormControl>
  );
};
export default SelectGroup;
