import React, { FC } from "react";
import { ColorNames } from "@core/types/color.types";
import { SomedayEventsProps } from "@web/views/Calendar/hooks/draft/sidebar/useSidebar";
import { DateCalcs } from "@web/views/Calendar/hooks/grid/useDateCalcs";
import { Measurements_Grid } from "@web/views/Calendar/hooks/grid/useGridLayout";
import { Text } from "@web/components/Text";
import { WeekProps } from "@web/views/Calendar/hooks/useWeek";
import { AlignItems, JustifyContent } from "@web/components/Flex/styled";
import { StyledAddEventButton, StyledSidebarHeader } from "../styled";
import { getMonthListLabel } from "@web/common/utils/event.util";
import { TooltipWrapper } from "@web/components/Tooltip/TooltipWrapper";
import { StyledSidebarList } from "../../EventsList/styled";

interface Props {
  dateCalcs: DateCalcs;
  measurements: Measurements_Grid;
  somedayProps: SomedayEventsProps;
  viewStart: WeekProps["component"]["startOfView"];
}

export const MonthSection: FC<Props> = ({
  dateCalcs,
  measurements,
  somedayProps,
  viewStart,
}) => {
  const monthLabel = getMonthListLabel(viewStart);

  return (
    <>
      <StyledSidebarHeader
        alignItems={AlignItems.CENTER}
        justifyContent={JustifyContent.SPACE_BETWEEN}
      >
        <Text colorName={ColorNames.WHITE_1} role="heading" size={22}>
          {monthLabel}
        </Text>
        <div onClick={(e) => e.stopPropagation()}>
          <TooltipWrapper
            description="Add to month"
            onClick={() => console.log("clicked")}
            shortcut="M"
          >
            <div role="button">
              <StyledAddEventButton size={25}>+</StyledAddEventButton>
            </div>
          </TooltipWrapper>
        </div>
      </StyledSidebarHeader>
      <StyledSidebarList onClick={() => console.log("clicked")}>
        <p>list</p>
      </StyledSidebarList>
    </>
  );
};
