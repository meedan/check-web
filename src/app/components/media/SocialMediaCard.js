import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router';
import TimeAgo from 'react-timeago';
import util from './MediaUtil';

class SocialMediaCard extends Component {
  render() {
    const { media, data } = this.props;
    // TODO: make less verbose
    const url = util.url(media, data);
    const embedPublishedAt = util.embedPublishedAt(media, data);
    const networkIconName = util.networkIconName(media);
    const authorAvatarUrl = util.authorAvatarUrl(media, data);
    const authorName = util.authorName(media, data);
    const authorUsername = util.authorUsername(media, data);
    const authorUrl = util.authorUrl(media, data);
    const bodyText = util.bodyText(media, data);
    const bodyImageUrl = util.bodyImageUrl(media, data);
    const stats = util.stats(media, data);

    return (
      <article className="social-media-card">
        <div className="social-media-card__header / card-header">
          <FontAwesome className="social-media-card__network-icon" name={networkIconName} />
          {authorAvatarUrl ? <img src={authorAvatarUrl} className="social-media-card__author-avatar" /> : null}
          <div className="social-media-card__header-text-primary / header-text-primary">
            <a href={authorUrl} className="social-media-card__name">{authorName || authorUsername}</a>
            {authorName ?
              <a href={authorUrl} className="social-media-card__username">{authorUsername}</a> : null
            }
          </div>

          <span className="social-media-card__header-text-secondary">
            <a href={url}>
              {embedPublishedAt ? <TimeAgo date={embedPublishedAt} live={false} /> : 'Link'}
            </a>
          </span>
        </div>

        <div className="social-media-card__body">
          <div className="social-media-card__body-text">{bodyText}</div>
          {bodyImageUrl ?
            <div className="social-media-card__body-image" style={{ backgroundImage: `url(${bodyImageUrl})` }} />
          : null }
        </div>
        <div className="social-media-card__footer">
          {stats.map(stat => <span className="social-media-card__footer-stat">{stat}</span>)}
        </div>
      </article>
    );
  }
}

export default SocialMediaCard;
