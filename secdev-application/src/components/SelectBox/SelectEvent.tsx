import React from "react";
import { Select, FormControl, InputLabel } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from "react-redux";
import { AppState } from '../../types';
import { Event } from "../../types/modules/eventsFilters.type";
import { setSelectedEventId } from "../../store/modules/eventsPageStore";

const SelectEvent: React.FC = () => {
  const useStyles = makeStyles((theme) => ({
    formControl: {
      minWidth: 250,
    },
  }));
  const dispatch = useDispatch();
  const eventsList: Event[] | [] = useSelector (
    (state: AppState) => state.EventsListStore.events
  );
  const selectedEvent: Event = useSelector (
    (state: AppState) => state.EventsPageStore.selectedEvent
  );

  const handleSelect = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    let selectedItem: Event| any = {
      event_id: -1,
      name: ''
    }
    if(event.target.value != -1) {
      selectedItem = eventsList.find(item => item.event_id as number == event.target.value);
    }

    dispatch(setSelectedEventId(selectedItem as any as Event));
  };

  const classes = useStyles();
  return (
    <FormControl className={classes.formControl} variant="outlined">
      <InputLabel htmlFor="IndexSelect">Select Event</InputLabel>
      <Select
        id="IndexSelect"
        label="Select Event"
        native
        value={selectedEvent.event_id > 0 ? selectedEvent.event_id : 'All'}
        onChange={handleSelect}
      >
        <option aria-label="None" value="-1" >
          {'All'}
        </option>
        {(eventsList as Event[]).map((item: Event, index: number) => {
          return (
            <option key={item.event_id} value={item.event_id}>
              {item?.name.charAt(0).toUpperCase() + item?.name.slice(1)}
            </option>
          );
        })}
      </Select>
    </FormControl>
  );
};
export default SelectEvent;
