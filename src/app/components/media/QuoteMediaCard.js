import React, { Component } from 'react';
import { Link } from 'react-router';
import { rtlClass } from '../../helpers';

class QuoteMediaCard extends Component {
  render() {
    const { quoteText, attributionName, attributionUrl, languageCode } = this.props;

    return (
      <article className="quote-media-card">
        <div className="quote-media-card__body">
          <div className={`quote-media-card__body-text ${rtlClass(languageCode)}`}>{quoteText}</div>
          <div className="quote-media-card__attribution">
            {attributionName ? <div className="quote-media-card__attribution-name">— {attributionName}</div> : null}
            {attributionUrl ? <Link to={attributionUrl} className="quote-media-card__attribution-link">{attributionUrl}</Link> : null}
          </div>
        </div>
      </article>
    );
  }
}

export default QuoteMediaCard;
