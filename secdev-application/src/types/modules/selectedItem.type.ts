import { tileFields } from '../../services/tileFields';

const fields: string[] = tileFields();

export type SelectedItemType = {
  [key in typeof fields[number]]: string;
};
