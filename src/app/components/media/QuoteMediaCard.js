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

    // Extract the hostname using the browser, without a regex
    const anchor = document.createElement('a');
    anchor.setAttribute('href', quoteAttributionLink);
    const attributionUrlHostname = anchor.hostname;

    return (
      <Quote>
        <div>
          <QuoteText className={`quote__text ${rtlClass(languageCode)}`}>
            {quote}
          </QuoteText>
          <QuoteAttribution>
            {quoteAttributionText
              // TODO link to source page
              ? <div>— <a href="#">{quoteAttributionText}</a></div>
              : null}
            {quoteAttributionLink
              ? <a href={quoteAttributionLink} target="_blank" rel="noopener noreferrer">
                {attributionUrlHostname}
              </a>
              : null}
          </QuoteAttribution>
        </div>
      </Quote>
    );
  }
}

export default QuoteMediaCard;
