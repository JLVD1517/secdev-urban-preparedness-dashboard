export interface PlotData {
  name: string;
  value: number;
  date?: string;
}

export interface AvgTonePlotInitialState {
  status: string;
  error: boolean;
  loaded: boolean;
  avgTonePlotData: PlotData[] | [];
}
export interface NoOfArticlesPlotInitialState {
  status: string;
  error: boolean;
  loaded: boolean;
  noOfArticlesPlotData: PlotData[] | [];
}

export interface EventypePlotdata {
  [key: string]: string;
}
export interface NoOfArticlesByEventTypePlotInitialState {
  status: string;
  error: boolean;
  loaded: boolean;
  data: EventypePlotdata[] | [];
}