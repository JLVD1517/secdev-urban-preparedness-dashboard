export interface PointsOfInterestType {
    title: string;
    endpoint: string;
    icon: string;
    nameField: string;
  }
  
  export interface PointsOfInterestStoreType {
    [key: string]: {
      selected: boolean;
    };
  }
  