import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import { rtlClass } from '../../helpers';
import {
  breakWordStyles,
  headline,
  units,
  subheading2,
} from '../../styles/js/variables';

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
              ? <Link to={attributionUrl}>
                {attributionUrl}
              </Link>
              : null}
          </QuoteAttribution>
        </div>
      </Quote>
    );
  }
}

export default QuoteMediaCard;
