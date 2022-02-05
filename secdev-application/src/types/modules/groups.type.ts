export interface Group {
  group_id: number;
  name: string;
}
export interface GroupsInitialState {
  status: string;
  error: boolean;
  loaded: boolean;
  groups: Group[] | [];
}