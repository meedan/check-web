import styled from 'styled-components';

import {
  mediaQuery,
  units,
  Row,
} from './shared';

// FIXME: Highly deprecated stuff
// TODO: Do not reuse these components and replace any usage with updated solutions

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
