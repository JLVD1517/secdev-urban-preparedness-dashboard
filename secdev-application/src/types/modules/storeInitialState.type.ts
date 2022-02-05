import { ArticlesInitialState, AvgTonePlotInitialState, NoOfArticlesPlotInitialState } from '..';
import { Event, EventsInitialState } from './eventsFilters.type';
import { NoOfArticlesByEventTypePlotInitialState } from './eventsPlots.type';
import { Group, GroupsInitialState } from './groups.type';
import { SelectedItemType } from './selectedItem.type';

export interface InitialStateAppControl {
  darkTheme: boolean;
  sideNavOpen: boolean;
}

export interface InitialStateMapControl {
  satelliteView: boolean;
}

export interface InitialAvailableYearsState {
  availableYears: number[];
  status: string;
  error: boolean;
  loaded: boolean;
}


export interface InitialSidebarState {
  selectedYear: number | number[];
  selectedMonth: number | number[];
  selectedItem: SelectedItemType | null;
  selectedLayerId: string;
  filterSlider: [number, number];
  sliderReset: number;
  desktopCollapse: boolean;
}
export interface InitialHistogramDataState {
  columnData: (number | null)[];
  status: string;
  error: boolean;
  loaded: boolean;
}

export interface InitialEventsComponentState {
  startDate: string;
  endDate: string;
  language: string;
  selectedCommuneId: number;
  selectedEvent: Event
}

export interface InitialGroupsComponentState {
  selectedGroup: Group
}

export interface AppState {
  AppControl: InitialStateAppControl;
  AvailableYears: InitialAvailableYearsState;
  HistogramData: InitialHistogramDataState;
  MapControl: InitialStateMapControl;
  SidebarControl: InitialSidebarState;
  EventsPageStore: InitialEventsComponentState;
  ArticlesStore: ArticlesInitialState;
  AverageArticleToneStore: AvgTonePlotInitialState;
  NoOfArticleStore: NoOfArticlesPlotInitialState;
  EventsListStore: EventsInitialState;
  GroupsListStore: GroupsInitialState;
  GroupsPageStore: InitialGroupsComponentState;
  NoOfArticleStoreByEventType: NoOfArticlesByEventTypePlotInitialState;
}
