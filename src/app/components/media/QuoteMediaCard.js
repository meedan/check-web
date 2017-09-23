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
    const { quoteText, attributionName, attributionUrl, languageCode } = this.props;
    console.log(attributionUrl);
    const anchor = document.createElement('a');
    anchor.setAttribute('href', attributionUrl);
    const attributionUrlHost = anchor.hostname;

    return (
      <Quote>
        <div>
          <QuoteText className={`quote__text ${rtlClass(languageCode)}`}>
            {quoteText}
          </QuoteText>
          <QuoteAttribution>
            {attributionName
              ? <div>— {attributionName}</div>
              : null}
            {attributionUrl
              ? <a href={attributionUrl} target="_blank" rel="noopener noreferrer">
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
