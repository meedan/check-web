import React from 'react';
import styled from 'styled-components';
import { injectIntl } from 'react-intl';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import rtlDetect from 'rtl-detect';
import { encodeSvgDataUri } from '../../helpers';

import {
  checkBlue,
  white,
  title1,
  units,
  breakpointMobile,
} from '../../styles/js/shared';

const SpecialBlueCard = (props) => {
  const { locale } = props.intl;
  const isRtl = rtlDetect.isRtlLang(locale);
  const fromDirection = isRtl ? 'right' : 'left';
  const toDirection = isRtl ? 'left' : 'right';

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
    ${props.svg ? `background-image: url("${encodeSvgDataUri(props.svg)}");` : null}
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top ${toDirection};
    padding-${toDirection}: ${units(6)};
    @media all and (max-width: ${breakpointMobile}) {
      padding-${toDirection}: ${units(6)};
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
    margin-${fromDirection}: ${units(5)};
  `;

  const StyledMdCardTitle = styled.h2`
    font: ${title1};
    color: ${white};
    margin-bottom: ${units(1)};
  `;

  return (
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
};

export default injectIntl(SpecialBlueCard);
