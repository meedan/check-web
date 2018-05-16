import styled from 'styled-components';
import { stripUnit } from 'polished';

import {
  mediaQuery,
  units,
  headline,
  black38,
  black54,
  black87,
  caption,
  boxShadow,
  subheading1,
  Row,
  avatarSizeLarge,
} from './shared';

// The "Header Card" is the layout at the top of Source, Profile and Team.
// Currently we have an actual HeaderCard component that the TeamComponent uses,
// but the user profile and source profile are using a selection of these constants
// without the HeaderCard component.
// See: components/HeaderCard
// TODO Standardize to use the HeaderCard in all three components that use this layout.
// @chris 2017-10-17

const sourceProfileOffset = units(24);
const sourceProfileFabWidth = units(5);

// Ideally this would be a FAB component,
// but MUI FAB doesn't have a tooltip
// so we're doing our own using iconButton
export const StyledEditButtonWrapper = styled.div`
  [class*='edit-button'] {
    box-shadow: ${boxShadow(2)};
    background-color: white !important;
    border-radius: 50% !important;
    bottom: ${((-1 * stripUnit(sourceProfileFabWidth)) / 2)}px !important;
    position: absolute !important;
    ${props => (props.isRtl ? 'left' : 'right')}: 16% !important;

    &:hover {
      box-shadow: ${boxShadow(4)};

      svg {
        fill: ${black87} !important;
      }
    }
    svg {
      fill: ${black54} !important;
      font-size: 20px;
    }
  }
`;

export const StyledButtonGroup = styled.div`
  margin: ${units(6)} auto;
  display: flex;

  .source__edit-buttons-cancel-save {
    margin-${props => (props.isRtl ? 'right' : 'left')}: auto;

    ${mediaQuery.desktop`
      margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(3)};
    `}

    .source__edit-cancel-button {
      margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(1)} !important;
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
  margin-top: ${stripUnit(sourceProfileOffset) * -1}px;
  padding-top: ${sourceProfileOffset};
  background-color: white;
  box-shadow: ${boxShadow(1)};
`;

export const StyledContactInfo = styled.div`
  color: ${black54};
  display: flex;
  flex-flow: wrap row;
  font: ${caption};

  margin: ${props => (props.noVerticalMargin ? '0' : `${units(2)} 0`)};

  & > span {
    margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(2)};
  }
`;

export const StyledAvatarEditButton = styled.div`
  button {
    min-width: ${avatarSizeLarge}!important;
  }
`;

export const StyledTwoColumns = styled(Row)`
  align-items: flex-start;
  padding-bottom: ${units(3)};
`;

export const StyledSmallColumn = styled.div`
  flex: 0;
  margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(2)};
  ${mediaQuery.desktop`
    margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(3)};
  `}
  justify-content: center;
  flex-shrink: 0;
`;

export const StyledBigColumn = styled.div`
  flex: 3;
`;
