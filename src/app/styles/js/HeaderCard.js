import styled from 'styled-components';

import {
  mediaQuery,
  units,
  Row,
} from './shared';

// FIXME: Highly deprecated stuff
// TODO: Do not reuse these components and replace any usage with updated solutions

export const StyledButtonGroup = styled.div`
  margin: ${units(6)} auto 0;
  display: flex;

  .source__edit-buttons-cancel-save {
    margin-${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: auto;

    ${mediaQuery.desktop`
      margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(3)};
    `}

    .source__edit-cancel-button {
      margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(1)} !important;
    }
  }
`;

export const StyledHelper = styled.div`
  color: var(--textDisabled);
  font: 400 ${units(1.5)}/${units(2.5)} var(--fontStackSans);
  margin-bottom: ${units(2)};
  ${mediaQuery.handheld`
    display: none;
  `}
`;

export const StyledAvatarEditButton = styled.div`
  button {
    min-width: 72px!important;
  }
`;

export const StyledTwoColumns = styled(Row)`
  align-items: flex-start;
`;

export const StyledSmallColumn = styled.div`
  flex: 0;
  margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(2)};
  ${mediaQuery.desktop`
    margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(3)};
  `}
  justify-content: center;
  flex-shrink: 0;
`;

export const StyledBigColumn = styled.div`
  flex: 3;
`;
