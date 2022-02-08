import styled from "styled-components";
import TextareaAutoSize from "react-textarea-autosize";

import { getInputCommonStyles } from "@web/common/styles/components";

import { Props } from "./types";

export const Styled = styled(TextareaAutoSize)<Props>`
  ${getInputCommonStyles}
  border: none;
  outline: none;
  font-weight: 600;
  width: 100%;
  resize: none;
`;