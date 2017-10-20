import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import deepEqual from 'deep-equal';
import MediaUtil from './MediaUtil';
import TimeBefore from '../TimeBefore';
import { bemClass } from '../../helpers';
import ParsedText from '../ParsedText';

const messages = defineMessages({
  link: {
    id: 'WebPageMediaCard.link',
    defaultMessage: 'Link',
  },
});

class WebPageMediaCard extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(nextProps, this.props) || !deepEqual(nextState, this.state);
  }

  render() {
    const { media, data } = this.props;
    const url = MediaUtil.url(media, data);
    const embedPublishedAt = MediaUtil.embedPublishedAt(media, data);
    const authorName = MediaUtil.authorName(media, data);
    const authorUsername = MediaUtil.authorUsername(media, data);
    const authorUrl = MediaUtil.authorUrl(media, data);
    const bodyText = MediaUtil.bodyText(media, data);
    const bodyImageUrl = MediaUtil.bodyImageUrl(media, data);

    return (
      <article className="web-page-media-card">
        <div>
          <div className="card-header">
            <div className="header-text-primary">
              <a href={authorUrl} target="_blank" rel="noopener noreferrer" className="web-page-media-card__name">
                {authorName || authorUsername}
              </a>
              { ((authorName && authorUsername) && (authorName !== authorUsername)) ?
                <a href={authorUrl} target="_blank" rel="noopener noreferrer" className="web-page-media-card__username">
                  {authorUsername}
                </a> : null
              }
            </div>
          </div>

          <div><ParsedText text={bodyText} /></div>

          <span>
            { media.domain }
            <a href={url} target="_blank" rel="noopener noreferrer">
              {embedPublishedAt
                ? <TimeBefore date={embedPublishedAt} />
                : this.props.intl.formatMessage(messages.link)}
            </a>
          </span>
        </div>

        <div>
          {bodyImageUrl ?
            <div className="web-page-media-card__body-image" style={{ backgroundImage: `url(${bodyImageUrl})` }} />
          : null }
        </div>
      </article>
    );
  }
}

WebPageMediaCard.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(WebPageMediaCard);
