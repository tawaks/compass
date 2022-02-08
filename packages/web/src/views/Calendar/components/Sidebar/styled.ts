import styled from "styled-components";

import { SidebarCollapseIcon, SidebarOpenIcon } from "@web/assets/svg";
import { getColor } from "@web/common/helpers/colors";
import { ColorNames } from "@web/common/types/styles";
import { CheckBox } from "@web/components/CheckBox";
import { Flex } from "@web/components/Flex";
import { SIDEBAR_WIDTH } from "@web/views/Calendar/constants";

import { ToggleableEventsListSection } from "./ToggleableEventsListSection";

export interface Props {
  isToggled: boolean;
}

export const Styled = styled.div<Props>`
  height: 100%;
  width: ${({ isToggled }) => (isToggled ? SIDEBAR_WIDTH : 65)}px;
  background: ${getColor(ColorNames.DARK_3)};
  overflow: hidden;
  transition: 0.4s;
  position: relative;
`;

export const StyledSidebarOverflow = styled.div<Props>`
  position: absolute;
  background: ${getColor(ColorNames.DARK_3)};
  width: ${({ isToggled }) => (isToggled ? 0 : "100%")};
  height: 100%;
  right: 0;
  transition: 0.4s;
  z-index: 3;
`;

// TODO make this dynamic so you don't have to duplicate styles
const StyledOpenIcon = styled(SidebarOpenIcon)`
  cursor: pointer;
  color: #7a858d;
  position: absolute;
  right: 20px;
  top: 28px;
  z-index: 4;

  &:hover {
    color: ${getColor(ColorNames.WHITE_2)};
  }
`;

const StyledCollapseIcon = styled(SidebarCollapseIcon)`
  cursor: pointer;
  color: #7a858d;
  position: absolute;
  right: 20px;
  top: 28px;
  z-index: 4;

  &:hover {
    color: ${getColor(ColorNames.WHITE_2)};
  }
`;

export const renderStyledSidebarToggleIcon = (isToggled: boolean) => {
  if (isToggled) {
    return StyledCollapseIcon;
  } else {
    return StyledOpenIcon;
  }
};

export interface SectionProps {
  height?: string;
}

export const StyledTopSectionFlex = styled(Flex)<SectionProps>`
  padding: 16px 22px 0 14px;
  height: ${({ height }) => height};
  overflow: hidden;
`;

export const StyledFiltersPopoverContent = styled.div`
  background: ${getColor(ColorNames.WHITE_5)};
  padding: 8px 8px 8px 5px;
  border-radius: 4px;
`;

export const StyledHeaderFlex = styled(Flex)`
  width: calc(100% - 45px);
`;

export const StyledCheckBox = styled(CheckBox)`
  margin-right: 5px;
`;

export const StyledPriorityFilterItem = styled(Flex)`
  &:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export const StyledPriorityFilterButton = styled.div`
  color: ${getColor(ColorNames.WHITE_1)};
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    color: ${getColor(ColorNames.WHITE_4)};
  }
`;

export const StyledDividerWrapper = styled.div`
  cursor: row-resize;
  padding: 5px 0 7px 0;
`;

export const StyledBottomSection = styled.div<SectionProps>`
  height: ${({ height }) => height}px;
`;

export interface FutureEventsProps {
  shouldSetTopMargin?: boolean;
}

export const StyledFutureEventsToggleableSection = styled(
  ToggleableEventsListSection
)<FutureEventsProps>`
  margin-top: ${({ shouldSetTopMargin }) => (shouldSetTopMargin ? "auto" : 0)};
`;