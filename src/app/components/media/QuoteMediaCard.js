import React, { Component } from 'react';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import { Link } from 'react-router';
import { rtlClass } from '../../helpers';

import { Row, breakWordStyles, headline, units, subheading2, black38 } from '../../styles/js/shared';

const Quote = styled.div`
  margin: ${units(3)};
`;

const StyledQuoteText = styled.div`
  ${breakWordStyles}
  font: ${headline};
`;

// stringToHostname()
//
// We want only the hostname to display in the attributionContext.
//
// Extract the hostname using the browser (without a regex.)
// and try to set the hostname, unless it's localhost,
// which is a browser fallback; it's probably not a url.
//
// TODO: make this link parsing more robust...
// • Presence of 'localhost' is not the only indicator a link is malformed.
// • A string without the protocol will return false, but should be parsed.
//
function stringToHostname(testString) {
  const anchor = document.createElement('a');
  anchor.setAttribute('href', testString);
  return anchor.hostname.includes('localhost') ? false : anchor.hostname;
}

class QuoteMediaCard extends Component {
  render() {
    const { quote, quoteAttributionSource, quoteAttributionContext, languageCode } = this.props;

    const isRtl = rtlDetect.isRtlLang(languageCode);

    const StyledQuoteAttribution = styled.div`
      font: ${subheading2};
      text-align: ${isRtl ? 'left' : 'right'};
      margin: ${isRtl ? `0 auto 0 ${units(2)}` : `0 ${units(2)} 0 auto`};
      margin-top: ${units(4)};
    `;

    // If it doesn't seem like a link, display the plain text "context"
    //
    const attributionContextAsLinkOrText = (
      stringToHostname(quoteAttributionContext)
        ? (<a href={quoteAttributionContext} target="_blank" rel="noopener noreferrer">
          {stringToHostname(quoteAttributionContext)}
        </a>)
        : (<div style={{ color: black38 }}> {quoteAttributionContext} </div>)
      );

    return (
      <Quote>
        <div>
          <StyledQuoteText className={`quote__text ${rtlClass(languageCode)}`}>
            {quote}
          </StyledQuoteText>
          <Row>
            <StyledQuoteAttribution>
              {/* If there is any attribution, display it */}
              { quoteAttributionSource
                ? <div>
                    —{' '} {/* TODO link to source page here */}
                  <Link to="TODO">{quoteAttributionSource}</Link>
                </div>
                : null}

              {/* If there is any "context" display it */}
              { quoteAttributionContext
                ? attributionContextAsLinkOrText
                : null}
            </StyledQuoteAttribution>
          </Row>
        </div>
      </Quote>
    );
  }
}

export default QuoteMediaCard;
