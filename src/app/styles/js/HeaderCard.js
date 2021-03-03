import styled from 'styled-components';

import {
  mediaQuery,
  units,
  headline,
  black38,
  black54,
  caption,
  subheading1,
  Row,
  avatarSizeLarge,
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

export const StyledName = styled.h1`
  font: ${headline};
  margin-bottom: ${units(1)};
`;

export const StyledDescription = styled.div`
  color: ${black54};
  font: ${subheading1};
  margin-bottom: ${units(1)};
`;

export const StyledHelper = styled.div`
  color: ${black38};
  font: ${caption};
  margin-bottom: ${units(2)};
  ${mediaQuery.handheld`
    display: none;
  `}
`;

export const StyledContactInfo = styled.div`
  color: ${black54};
  display: flex;
  flex-flow: wrap row;
  font: ${caption};
  align-items: center;

  svg {
    max-height: 16px;
    max-width: 16px;
    margin-right: ${units(1)}
  }

  margin: ${props => (props.noVerticalMargin ? '0' : `${units(2)} 0`)};

  & > span {
    margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(2)};
  }
`;

export const StyledAvatarEditButton = styled.div`
  button {
    min-width: ${avatarSizeLarge}!important;
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
