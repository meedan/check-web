import styled from 'styled-components';
import { stripUnit } from 'polished';

import {
  mediaQuery,
  units,
  headline,
  black38,
  black54,
  caption,
  boxShadow,
  subheading1,
  Row,
  gutterMedium,
  avatarSizeLarge,
} from './shared';

// The "Header Card" is the layout at the top of Source, Profile and Team.
// Currently we have an actual HeaderCard component that the TeamComponent uses,
// but the user profile and source profile are using a selection of these constants
// without the HeaderCard component.
// See: components/HeaderCard
// TODO Standardize to use the HeaderCard in all three components that use this layout.
// @chris 2017-10-17

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

export const StyledMetadata = styled.div`
  margin: ${units(1)} 0;
  color: ${black38};
  font: ${caption};
`;

export const StyledHelper = styled.div`
  color: ${black38};
  font: ${caption};
  margin-bottom: ${units(2)};
  ${mediaQuery.handheld`
    display: none;
  `}
`;

export const StyledProfileCard = styled.div`
  margin-bottom: ${units(6)};
  
  background-color: white;
  box-shadow: ${boxShadow(1)};
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
