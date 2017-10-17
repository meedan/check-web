import styled from 'styled-components';
import { stripUnit } from 'polished';
import SourcePicture from '../../components/source/SourcePicture';

import {
  mediaQuery,
  units,
  headline,
  black38,
  black54,
  black87,
  caption,
  boxShadow,
  headerHeight,
  gutterMedium,
  subheading1,
  Row,
  avatarSizeLarge,
  } from './shared';

const sourceProfileOffset = units(24);
const sourceProfileBottomPad = 0;
const sourceProfileFabWidth = units(5);

export const StyledSourceEditButtonWrapper = styled.div`
  // Ideally this would be a FAB component,
  // but MUI FAB doesn't have a tooltip
  // so we're doing our own using iconButton
  .source__edit-button {
    box-shadow: ${boxShadow(2)};
    background-color: white !important;
    border-radius: 50% !important;
    bottom: ${((-1 * stripUnit(sourceProfileFabWidth)) / 2) +
      stripUnit(sourceProfileBottomPad)}px !important;
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

export const StyledSourceButtonGroup = styled.div`
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

export const StyledSourceName = styled.h1`
  font: ${headline};
  margin-bottom: ${units(1)};
`;

export const StyledSourceDescription = styled.div`
  color: ${black54};
  font: ${subheading1};
  margin-bottom: ${units(1)};
`;

export const StyledSourceMetadata = styled.span`
  margin: ${units(1)} 0;
  color: ${black38};
  font: ${caption};
`;

export const StyledSourceHelper = styled.div`
  color: ${black38};
  font: ${caption};
  margin-bottom: ${units(2)};
  ${mediaQuery.handheld`
    display: none;
  `}
`;

export const StyledSourceProfileCard = styled.div`
  margin-bottom: ${units(6)};
  margin-top: ${stripUnit(sourceProfileOffset) * -1}px;
  padding-bottom: ${sourceProfileBottomPad};
  padding-top: ${sourceProfileOffset};
  background-color: white;
  box-shadow: ${boxShadow(1)};
`;

export const StyledSourceContactInfo = styled.div`
  color: ${black54};
  display: flex;
  flex-flow: wrap row;
  font: ${caption};
  margin: ${units(2)} 0;

  & > span {
    margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(2)};
  }
`;

export const StyledAvatarEditButton = styled.div`
  button {
    min-width: ${avatarSizeLarge}!important;
  }
`;

export const StyledSourcePicture = styled(SourcePicture)`
  margin-top: ${units(2)};
`;


// Two column layout
// TODO: I think this can also be used on the Team, so
// might be merged with a HeaderCard component
// @chris 2017-10-16
export const StyledTwoColumns = styled(Row)`
  align-items: flex-start;
`;

export const StyledSmallColumn = styled.div`
  flex: 0;
  margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(2)};
  justify-content: center;
`;

export const StyledBigColumn = styled.div`
  flex: 3;
`;
