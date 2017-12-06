import React from 'react';
import styled from 'styled-components';
import { injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';
import { Link } from 'react-router';
import { rtlClass } from '../../helpers';

import { Row, breakWordStyles, headline, units, subheading2 } from '../../styles/js/shared';

const Quote = styled.div`
  margin: ${units(3)};
`;

const StyledQuoteText = styled.div`
  ${breakWordStyles}
  font: ${headline};
  ${props =>
    props.quoteIsRtl ? 'direction: rtl; text-align: right;' : 'direction: ltr; text-align: left;'};
`;

const QuoteMediaCard = (props) => {
  const { quote, sourceName, sourceUrl, languageCode } = props;
  const localeIsRtl = rtlDetect.isRtlLang(props.intl.locale);

  const StyledQuoteAttribution = styled.div`
    font: ${subheading2};
    text-align: ${localeIsRtl ? 'left' : 'right'};
    margin: ${localeIsRtl ? `0 auto 0 ${units(2)}` : `0 ${units(2)} 0 auto`};
    margin-top: ${units(4)};
  `;

  return (
    <Quote>
      <div>
        <StyledQuoteText
          className={`quote__text ${rtlClass(languageCode)}`}
          quoteIsRtl={rtlDetect.isRtlLang(languageCode)}
        >
          {quote}
        </StyledQuoteText>
        <Row>
          <StyledQuoteAttribution>
            {sourceName && sourceUrl
              ? <div>
                {'— '}
                <Link to={sourceUrl}>
                  {sourceName}
                </Link>
              </div>
              : null}
          </StyledQuoteAttribution>
        </Row>
      </div>
    </Quote>
  );
};

export default injectIntl(QuoteMediaCard);
