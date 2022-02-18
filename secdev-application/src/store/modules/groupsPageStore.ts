import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Group } from '../../types/modules/groups.type';
import { InitialGroupsComponentState } from '../../types/modules/storeInitialState.type';

const groupsComponentInitialState: InitialGroupsComponentState = {
  selectedGroup: {
    group_id: -1,
    name: '',
  },
};

const groupsComponentSlice = createSlice({
  name: 'groupsComponent',
  initialState: groupsComponentInitialState,
  reducers: {
    setSelectedGroup: (state, { payload }: PayloadAction<Group>): void => {
      state.selectedGroup = payload;
    },
  },
});

export const { setSelectedGroup } = groupsComponentSlice.actions;

export default groupsComponentSlice.reducer;
