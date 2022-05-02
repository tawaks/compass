import React, { useRef, useState } from "react";
import { usePopper } from "react-popper";
import { useDispatch } from "react-redux";
// import { useDrag, useDrop } from "react-dnd";
import { Schema_Event } from "@core/types/event.types";
import { ZIndex } from "@web/common/constants/web.constants";
import { useOnClickOutside } from "@web/common/hooks/useOnClickOutside";
import { editEventSlice } from "@web/ducks/events/slice";
import { SomedayEventForm } from "@web/views/Forms/SomedayEventForm";

import { Styled } from "./styled";
interface TempEventSchema extends Schema_Event {
  order: number;
}
export interface Props {
  event: TempEventSchema; // $$ replace with Schema_Event or .._Grid
}

export const SomedayEvent = ({ event: _event }: Props) => {
  const dispatch = useDispatch();
  const formRef = useRef<HTMLDivElement>(null);

  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [event, setEvent] = useState(_event);
  // const [editingEvent, setEditingEvent] = useState<TempEventSchema | null>(
  //   null
  // );
  const [popperRef, setPopperRef] = useState<HTMLElement>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement>(null);

  useOnClickOutside(formRef, () => setIsEventFormOpen(false));

  const { styles, attributes } = usePopper(popperRef, popperElement, {
    placement: "right",
    strategy: "fixed",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 20],
        },
      },
    ],
  });
  const popperStyles = { ...styles.popper, zIndex: ZIndex.LAYER_2 };

  /*
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "event",
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    item: event,
    options: {
      dropEffect: "move",
    },
  }));
  */

  const onDrop = (draggedEvent: TempEventSchema) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const order =
      (draggedEvent.order || 0) < (event.order || 0)
        ? (event.order || 0) + 1
        : event.order;

    dispatch(
      editEventSlice.actions.request({
        _id: draggedEvent._id || "",
        event: { ...draggedEvent, order },
      })
    );
  };

  const onSubmit = () => {
    dispatch(editEventSlice.actions.request({ _id: event._id, event }));
    setIsEventFormOpen(false);
  };

  /*
  const [, drop] = useDrop(
    () => ({
      accept: "event",
      drop: onDrop,
    }),
    [event.order]
  );
  */

  return (
    <>
      <div ref={setPopperRef}>
        {/* <div ref={drag}> */}
        <div>
          <Styled
            // ref={drop}
            // isDragging={isDragging}
            isDragging={false}
            onClick={() => setIsEventFormOpen(true)}
            priority={event.priority}
          >
            {event.title}
          </Styled>
        </div>
      </div>
      <div ref={setPopperElement} style={popperStyles} {...attributes.popper}>
        {isEventFormOpen && (
          <div ref={formRef}>
            <SomedayEventForm
              event={event}
              isOpen={isEventFormOpen}
              onSubmit={onSubmit}
              onClose={() => setIsEventFormOpen(false)}
              setEvent={setEvent}
            />
          </div>
        )}
      </div>
    </>
  );
};