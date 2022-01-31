export interface PlotData {
  name: string;
  value: number;
  date: string;
}

export interface PlotInitialState {
  status: string;
  error: boolean;
  loaded: boolean;
  avgTonePlotData: [PlotData] | []; 
  noOfArticlesPlotData: [PlotData] | [];
}