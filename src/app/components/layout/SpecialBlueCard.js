import React from 'react';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { encodeSvgDataUri } from '../../helpers';

import {
  checkBlue,
  white,
  title1,
  units,
  breakpointMobile,
} from '../../styles/js/shared';

const StyledCardIcon = styled.div`
  float: left;
  margin-top: ${units(0.5)};
  svg {
    max-width: 20px;
    max-height: 20px;
  }
`;

const StyledMdCard = styled(Card)`
  background-color: ${checkBlue} !important;
  ${props => props.svg ? `background-image: url("${encodeSvgDataUri(props.svg)}");` : null}
  background-repeat: no-repeat;
  background-size: auto;
  background-position: top ${props => props.theme.dir === 'rtl' ? 'left' : 'right'};
  padding-${props => props.theme.dir === 'rtl' ? 'left' : 'right'}: ${units(6)};
  @media all and (max-width: ${breakpointMobile}) {
    background-size: ${units(10)};
  }
  margin-top: ${units(2)};
  margin-bottom: ${units(2)};
  padding-top: 0;
  span, p, a, svg {
    color: ${white} !important;
  }
`;

const BackgroundImageRow = styled.div`
  margin-${props => props.theme.dir === 'rtl' ? 'right' : 'left'}: ${units(5)};
`;

const StyledMdCardTitle = styled.h2`
  font: ${title1};
  color: ${white};
  margin-bottom: ${units(1)};
`;

const SpecialBlueCard = props => (
  <StyledMdCard>
    <CardContent>
      <StyledCardIcon>
        {props.icon}
      </StyledCardIcon>
      <BackgroundImageRow>
        <StyledMdCardTitle>
          {props.title ? props.title : null}
        </StyledMdCardTitle>
        <span>
          {props.content ? props.content : null}
        </span>
      </BackgroundImageRow>
    </CardContent>
  </StyledMdCard>
);

export default SpecialBlueCard;
