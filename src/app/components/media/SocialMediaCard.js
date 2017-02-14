import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router';
import TimeAgo from 'react-timeago';
import MediaUtil from './MediaUtil';
import MediaInspector from './MediaInspector';
import { bemClass } from '../../helpers';

class SocialMediaCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isInspectorActive: false
    }
  }

  handleBodyClick(e) {
    if (!this.props.condensed) { // only open inspector on media page
      this.setState({isInspectorActive: true});
    }
  }

  handleInspectorDismiss(e) {
    this.setState({isInspectorActive: false});
  }

  render() {
    const { media, data, condensed } = this.props;
    // TODO: make less verbose
    const url = MediaUtil.url(media, data);
    const embedPublishedAt = MediaUtil.embedPublishedAt(media, data);
    const networkIconName = MediaUtil.networkIconName(media);
    const authorAvatarUrl = MediaUtil.authorAvatarUrl(media, data);
    const authorName = MediaUtil.authorName(media, data);
    const authorUsername = MediaUtil.authorUsername(media, data);
    const authorUrl = MediaUtil.authorUrl(media, data);
    const bodyText = MediaUtil.bodyText(media, data);
    const bodyImageUrl = MediaUtil.bodyImageUrl(media, data);
    const stats = MediaUtil.stats(media, data);

    return (
      <article className="social-media-card">

        <MediaInspector media={media} isActive={this.state.isInspectorActive} dismiss={this.handleInspectorDismiss.bind(this)} />

        <div className="social-media-card__header / card-header">
          {authorAvatarUrl ? <img src={authorAvatarUrl} className="social-media-card__author-avatar" /> : null}
          <div className="social-media-card__header-text-primary / header-text-primary">
            <a href={authorUrl} className="social-media-card__name">{authorName || authorUsername}</a>
            {authorName ?
              <a href={authorUrl} className="social-media-card__username">{authorUsername}</a> : null
            }
          </div>
        </div>

        <div className={bemClass("social-media-card__body", condensed, '--condensed')} onClick={this.handleBodyClick.bind(this)}>
          <div className="social-media-card__body-text">{bodyText}</div>
          {bodyImageUrl ?
            <div className="social-media-card__body-image" style={{ backgroundImage: `url(${bodyImageUrl})` }} />
          : null }
        </div>
        <FontAwesome className="social-media-card__network-icon" name={networkIconName} />
        <span className="social-media-card__header-text-secondary">
          <a href={url}>
            {embedPublishedAt ? <TimeAgo date={embedPublishedAt} live={false} /> : 'Link'}
          </a>
        </span>
        <div className="social-media-card__footer">
          {stats.map(stat => <span className="social-media-card__footer-stat">{stat}</span>)}
        </div>
      </article>
    );
  }
}

export default SocialMediaCard;
