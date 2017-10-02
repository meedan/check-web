import React, { Component } from 'react';
import styled from 'styled-components';
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
`;

class QuoteMediaCard extends Component {
  render() {
    const { quote, sourceName, sourceUrl, languageCode } = this.props;
    const isRtl = rtlDetect.isRtlLang(languageCode);
    const StyledQuoteAttribution = styled.div`
      font: ${subheading2};
      text-align: ${isRtl ? 'left' : 'right'};
      margin: ${isRtl ? `0 auto 0 ${units(2)}` : `0 ${units(2)} 0 auto`};
      margin-top: ${units(4)};
    `;

    return (
      <Quote>
        <div>
          <StyledQuoteText className={`quote__text ${rtlClass(languageCode)}`}>
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
  }
}

export default QuoteMediaCard;
