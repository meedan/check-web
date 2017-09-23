import React, { Component } from 'react';
import styled from 'styled-components';
import { rtlClass } from '../../helpers';
import {
  breakWordStyles,
  headline,
  units,
  subheading2,
} from '../../styles/js/shared';

const Quote = styled.div`
  margin: ${units(3)};
`;

const QuoteText = styled.div`
  ${breakWordStyles}
  font: ${headline};
`;

const QuoteAttribution = styled.div`
  font: ${subheading2};
`;

class QuoteMediaCard extends Component {
  render() {
    const { quote, quoteAttributionText, quoteAttributionLink, languageCode } = this.props;
    const anchor = document.createElement('a');
    anchor.setAttribute('href', quoteAttributionLink);
    const attributionUrlHost = anchor.hostname;

    return (
      <Quote>
        <div>
          <QuoteText className={`quote__text ${rtlClass(languageCode)}`}>
            {quote}
          </QuoteText>
          <QuoteAttribution>
            {quoteAttributionText
              ? <div>— {quoteAttributionText}</div>
              : null}
            {quoteAttributionLink
              ? <a href={quoteAttributionLink} target="_blank" rel="noopener noreferrer">
                {attributionUrlHost}
              </a>
              : null}
          </QuoteAttribution>
        </div>
      </Quote>
    );
  }
}

export default QuoteMediaCard;
