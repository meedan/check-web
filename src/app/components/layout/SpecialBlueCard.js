import React from 'react';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { encodeSvgDataUri } from '../../helpers';

const StyledCardIcon = styled.div`
  float: left;
  margin-top: 4px;
  svg {
    max-width: 20px;
    max-height: 20px;
  }
`;

const StyledMdCard = styled(Card)`
  background-color: var(--brandMain) !important;
  ${props => props.svg ? `background-image: url("${encodeSvgDataUri(props.svg)}");` : null}
  background-repeat: no-repeat;
  background-size: auto;
  background-position: top ${props => props.theme.dir === 'rtl' ? 'left' : 'right'};
  padding-${props => props.theme.dir === 'rtl' ? 'left' : 'right'}: 48px;
  @media all and (max-width: 448px) {
    background-size: 80px;
  }
  margin-top: 16px;
  margin-bottom: 16px;
  padding-top: 0;
  span, p, a, svg {
    color: var(--otherWhite) !important;
  }
`;

const BackgroundImageRow = styled.div`
  margin-${props => props.theme.dir === 'rtl' ? 'right' : 'left'}: 40px;
`;

const StyledMdCardTitle = styled.h2`
  color: var(--otherWhite);
  margin-bottom: 8px;
`;

const SpecialBlueCard = props => (
  <StyledMdCard>
    <CardContent>
      <StyledCardIcon>
        {props.icon}
      </StyledCardIcon>
      <BackgroundImageRow>
        <StyledMdCardTitle className="typography-h6">
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
