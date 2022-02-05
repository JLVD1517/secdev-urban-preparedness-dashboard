export interface CensusDetailedType {
  title: string;
  value: string;
  fields: CensusFieldType[];
}

export interface CensusFieldType {
  title: string;
  value: string;
  percentValue?: string;
}
