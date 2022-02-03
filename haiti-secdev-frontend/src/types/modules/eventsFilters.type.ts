export interface EventsFilters {
  start_date: string;
  end_date: string;
  language: string;
  tone_start_range: number;
  tone_end_range: number;
  commune_id: number;
  event_id: number;
}

export interface Event {
  event_id: number;
  name: string;
}
export interface EventsInitialState {
  status: string;
  error: boolean;
  loaded: boolean;
  events: Event[] | [];
}