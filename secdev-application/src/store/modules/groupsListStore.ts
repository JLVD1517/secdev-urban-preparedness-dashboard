import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axios } from '../../services/axios';
import { GroupsInitialState } from '../../types/modules/groups.type';

const groupsInitialState: GroupsInitialState = {
  status: 'idle',
  error: false,
  loaded: false,
  groups: [],
};

export const fetchGroups = createAsyncThunk('fetch-groups', async () => {
  const apiUrl = `${process.env.REACT_APP_ENDPOINT_URL}groups`;
  const response = await axios.get(apiUrl);
  return response.data;
});

const groupsListSlice = createSlice({
  name: 'groups-list',
  initialState: groupsInitialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchGroups.pending, state => {
      state.status = 'Loading';
      state.loaded = false;
      state.error = false;
    });
    builder.addCase(fetchGroups.fulfilled, (state, { payload }) => {
      state.status = 'Loaded';
      state.error = false;
      state.groups = payload.data;
      state.loaded = true;
    });
    builder.addCase(fetchGroups.rejected, state => {
      state.error = true;
      state.loaded = false;
      state.status = 'Error Fetching Events List';
    });
  },
});

export default groupsListSlice.reducer;
