import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import ProfileLink from '../layout/ProfileLink';
import MediaUtil from '../media/MediaUtil';
import ParsedText from '../ParsedText';
import TimeBefore from '../TimeBefore';
import { truncateLength } from '../../helpers'

class AccountCard extends React.Component {
  accountStats(account) {
    switch (account.provider) {
      case 'facebook':
        return account.embed.likes ? <FormattedMessage id="accountCard.fbStats" defaultMessage="{likes} likes" values={{ likes: account.embed.likes }} /> : null;
      case 'twitter':
        return <FormattedHTMLMessage id="accountCard.twitterStats" defaultMessage="{tweets} Tweets &bull; {followers} Followers &bull; {following} Following" values={{ tweets: account.embed.statuses_count, followers: account.embed.followers_count, following: account.embed.friends_count }} />;
      case 'youtube':
        return <FormattedHTMLMessage id="accountCard.youtubeStats" defaultMessage="{videos} Videos &bull; {subscribers} Subscribers" values={{ videos: account.embed.video_count, subscribers: account.embed.subscriber_count}} />;
    }
  }

  render() {
    const { account } = this.props;

    const byUser = (account.user) ?
      (<FormattedMessage id="mediaDetail.byUser" defaultMessage={'by {username}'} values={{ username: <ProfileLink user={account.user} /> }} />) : '';

    return (
      <Card className="source-card">
        <CardText className="source-card__content">
          <div className="source-card__avatar">
            <img src={account.embed.picture} className="social-media-card__author-avatar" />
          </div>

          <article className="source-card__body">
            <div className="source-card__heading">
              { MediaUtil.socialIcon(account.provider + '.com') /* TODO: refactor */ }
              <FormattedMessage id="accountCard.providerAccount" defaultMessage="{provider} account" values={{ provider: account.provider }} />
            </div>

            <div className="source-card__name">
              <a href={ account.embed.url } target="_blank" rel="noopener noreferrer">{ account.embed.name }</a>
            </div>

            <div className="source-card__description"><ParsedText text={truncateLength(account.embed.description, 300)} /></div>

            <div className="source-card__url">
              <a href={ account.embed.url } target="_blank" rel="noopener noreferrer">{ account.embed.url }</a>
            </div>

            <div className="source-card__account-stats">
              { this.accountStats(account) }
            </div>
          </article>

          <div className="media-detail__check-metadata source-card__footer">
            <span className="media-detail__check-added-by"><FormattedMessage id="mediaDetail.added" defaultMessage={'Added {byUser}'} values={{ byUser }} /> </span>
            { account.created_at ? <span className="media-detail__check-added-at"> <TimeBefore date={MediaUtil.createdAt({ published: account.created_at })} /> </span> : null }
          </div>
        </CardText>
      </Card>
    );
  }
}

export default AccountCard;
