import { useCallback } from "react";
import dayjs from "dayjs";
import { SOMEDAY_WEEK_LIMIT_MSG } from "@core/constants/core.constants";
import { YEAR_MONTH_DAY_FORMAT } from "@core/constants/date.constants";
import { Categories_Event, Schema_Event } from "@core/types/event.types";
import { getWeekRangeDates } from "@core/util/date.utils";
import { DropResult } from "@hello-pangea/dnd";
import { ID_SOMEDAY_DRAFT } from "@web/common/constants/web.constants";
import { DropResult_ReactDND } from "@web/common/types/dnd.types";
import { Schema_GridEvent } from "@web/common/types/web.event.types";
import {
  prepEvtAfterDraftDrop,
  getDefaultEvent,
  prepEvtBeforeSubmit,
} from "@web/common/utils/event.util";
import { getX } from "@web/common/utils/grid.util";
import { draftSlice } from "@web/ducks/events/slices/draft.slice";
import {
  createEventSlice,
  editEventSlice,
} from "@web/ducks/events/slices/event.slice";
import { getSomedayEventsSlice } from "@web/ducks/events/slices/someday.slice";
import { useAppDispatch } from "@web/store/store.hooks";
import { Range_Week } from "@web/common/types/util.types";

import { DateCalcs } from "../../grid/useDateCalcs";
import { State_Sidebar } from "./useSidebarState";

export const useSidebarUtil = (
  dateCalcs: DateCalcs,
  state: State_Sidebar,
  weekRange: Range_Week
) => {
  const dispatch = useAppDispatch();

  const close = () => {
    state.setIsDrafting(false);
    state.setDraft(null);

    if (
      state.isDraftingRedux &&
      state.draftType === Categories_Event.SOMEDAY_WEEK //++
    ) {
      dispatch(draftSlice.actions.discard());
    }
  };

  // call this when enabling DND for drafts
  const convertSomedayDraftToTimed = (
    dropItem: DropResult_ReactDND,
    dates: { startDate: string; endDate: string }
  ) => {
    const event = prepEvtAfterDraftDrop(
      Categories_Event.TIMED,
      dropItem,
      dates
    );

    dispatch(createEventSlice.actions.request(event));
    dispatch(draftSlice.actions.discard());
  };

  const convertSomedayDraftToAllDay = (
    dropItem: DropResult_ReactDND,
    dates: { startDate: string; endDate: string }
  ) => {
    const event = prepEvtAfterDraftDrop(
      Categories_Event.ALLDAY,
      dropItem,
      dates
    );

    dispatch(createEventSlice.actions.request(event));
    dispatch(draftSlice.actions.discard());
  };

  const convertSomedayEventToAllDay = (
    _id: string,
    dates: { startDate: string; endDate: string }
  ) => {
    const updatedFields: Schema_Event = {
      isAllDay: true,
      isSomeday: false,
      isTimesShown: false,
      startDate: dates.startDate,
      endDate: dates.endDate,
    };

    dispatch(
      getSomedayEventsSlice.actions.convert({
        _id,
        updatedFields,
      })
    );
  };

  const convertSomedayEventToTimed = (
    _id: string,
    dates: { startDate: string; endDate: string }
  ) => {
    const updatedFields: Schema_Event = {
      isAllDay: false,
      isSomeday: false,
      isTimesShown: true,
      startDate: dates.startDate,
      endDate: dates.endDate,
    };

    dispatch(
      getSomedayEventsSlice.actions.convert({
        _id,
        updatedFields,
      })
    );
  };

  const createDefaultSomeday = useCallback(() => {
    const somedayDefault = getDefaultEvent(Categories_Event.SOMEDAY_WEEK);

    state.setDraft({
      ...somedayDefault,
      endDate: weekRange.weekEnd.format(YEAR_MONTH_DAY_FORMAT),
      startDate: weekRange.weekStart.format(YEAR_MONTH_DAY_FORMAT),
      isOpen: true,
    });

    state.setIsDrafting(true);
  }, [weekRange.weekEnd, weekRange.weekStart]);

  const getDatesAfterDroppingOn = (
    target: "mainGrid" | "alldayRow",
    mouseCoords: { x: number; y: number }
  ) => {
    const x = getX(mouseCoords.x, true);
    const y = mouseCoords.y;

    if (target === "mainGrid") {
      const _start = dateCalcs.getDateByXY(x, y, weekRange.weekStart);
      const startDate = _start.format();
      const endDate = _start.add(1, "hour").format();

      return { startDate, endDate };
    }

    if (target === "alldayRow") {
      const _start = dateCalcs.getDateByXY(x, y, weekRange.weekStart);
      const startDate = _start.format(YEAR_MONTH_DAY_FORMAT);
      const endDate = _start.add(1, "day").format(YEAR_MONTH_DAY_FORMAT);

      return { startDate, endDate };
    }
  };

  const onDraft = (event: Schema_Event) => {
    state.setIsDrafting(true);
    state.setDraft({
      ...event,
      isOpen: true,
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, draggableId, source } = result;

    const droppedOnSidebar = destination !== null;
    if (droppedOnSidebar) {
      const reorderedDraft = draggableId === ID_SOMEDAY_DRAFT;
      if (reorderedDraft && !state.isDraftingNewWeekly) {
        console.log("Tried reordering a draft. TODO: add draft to state");
        return;
      }

      const noChange =
        destination.droppableId === source.droppableId &&
        destination.index === source.index;

      if (noChange) {
        close();
        return;
      }

      reorder(result);
    } else {
      if (state.isOverMainGrid) {
        const dates = getDatesAfterDroppingOn("mainGrid", state.mouseCoords);
        convertSomedayEventToTimed(draggableId, dates);
      }

      if (state.isOverAllDayRow) {
        const dates = getDatesAfterDroppingOn("alldayRow", state.mouseCoords);
        convertSomedayEventToAllDay(draggableId, dates);
      }
    }

    close();
  };

  const onDragStart = (props: { draggableId: string }) => {
    const existingEvent = state.somedayEvents.events[props.draggableId];
    const isExisting = existingEvent !== undefined;

    let _draft: Schema_GridEvent;
    if (isExisting) {
      _draft = {
        ...existingEvent,
        isOpen: false,
      };
    } else {
      console.log("REMINDER: update for monthly"); //++

      const defaultSomeday = getDefaultEvent(Categories_Event.SOMEDAY_WEEK);
      _draft = { ...defaultSomeday, isOpen: false };
    }

    state.setDraft(_draft);
    state.setIsDrafting(true);
  };

  const onMigrate = (event: Schema_Event, location: "forward" | "back") => {
    const diff = location === "forward" ? 7 : -7;

    const startDate = dayjs(event.startDate)
      .add(diff, "days")
      .format(YEAR_MONTH_DAY_FORMAT);

    const endDate = dayjs(event.endDate)
      .add(diff, "days")
      .format(YEAR_MONTH_DAY_FORMAT);

    const _event = { ...event, startDate, endDate };

    const isExisting = _event._id;
    if (isExisting) {
      dispatch(
        editEventSlice.actions.migrate({
          _id: _event._id,
          event: _event,
        })
      );
    } else {
      dispatch(createEventSlice.actions.request(_event));
    }

    close();
  };

  const onSubmit = () => {
    const _event = prepEvtBeforeSubmit(state.draft);
    const { startDate, endDate } = getWeekRangeDates(
      weekRange.weekStart,
      weekRange.weekEnd
    );
    const event = { ..._event, startDate, endDate };

    const isExisting = event._id;
    if (isExisting) {
      dispatch(
        editEventSlice.actions.request({
          _id: event._id,
          event,
        })
      );
    } else {
      const eventWithOrder = {
        ...event,
        order: state.somedayWeekIds.length,
      };
      dispatch(createEventSlice.actions.request(eventWithOrder));
    }

    close();
  };

  const onSectionClick = (section: "week" | "month") => {
    if (state.isDraftingRedux) {
      dispatch(draftSlice.actions.discard());
      return;
    }

    if (state.isDraftingExisting) {
      console.log("closing");
      state.draft && close();
      return;
    }

    const isAtLimit = section === "week" ? state.isAtWeeklyLimit : false;
    if (isAtLimit) {
      alert(SOMEDAY_WEEK_LIMIT_MSG);
      return;
    }

    const eventType =
      section === "week"
        ? Categories_Event.SOMEDAY_WEEK
        : Categories_Event.SOMEDAY_MONTH;
    dispatch(
      draftSlice.actions.start({
        eventType,
      })
    );

    createDefaultSomeday();
  };

  const reorder = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    const column = state.somedayEvents.columns[source.droppableId];
    const newEventIds = Array.from(column.eventIds);
    newEventIds.splice(source.index, 1);
    newEventIds.splice(destination.index, 0, draggableId);
    const newColumn = {
      ...column,
      eventIds: newEventIds,
    };

    const newState = {
      ...state.somedayEvents,
      columns: {
        ...state.somedayEvents.columns,
        [newColumn.id]: newColumn,
      },
    };

    state.setSomedayWeekEvents(newState);

    const newOrder = newEventIds.map((_id, index) => {
      return { _id, order: index };
    });
    dispatch(getSomedayEventsSlice.actions.reorder(newOrder));
  };

  return {
    close,
    createDefaultSomeday,
    onDraft,
    onDragEnd,
    onDragStart,
    onMigrate,
    onSectionClick,
    onSubmit,
  };
};

export type Util_Sidebar = ReturnType<typeof useSidebarUtil>;