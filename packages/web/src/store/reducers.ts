import { draftSlice } from "@web/ducks/events/slices/draft.slice";
import {
  createEventSlice,
  deleteEventSlice,
  editEventSlice,
  eventsEntitiesSlice,
  getCurrentMonthEventsSlice,
} from "@web/ducks/events/slices/event.slice";
import { getWeekEventsSlice } from "@web/ducks/events/slices/week.slice";
import { getSomedayEventsSlice } from "@web/ducks/events/slices/someday.slice";
import { combineReducers } from "redux";

export const eventsReducer = combineReducers({
  createEvent: createEventSlice.reducer,
  draft: draftSlice.reducer,
  deleteEvent: deleteEventSlice.reducer,
  editEvent: editEventSlice.reducer,
  entities: eventsEntitiesSlice.reducer,
  getCurrentMonthEvents: getCurrentMonthEventsSlice.reducer,
  getSomedayEvents: getSomedayEventsSlice.reducer,
  getWeekEvents: getWeekEventsSlice.reducer,
});

export const reducers = {
  events: eventsReducer,
};
