import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import ProfileLink from '../layout/ProfileLink';
import MediaUtil from '../media/MediaUtil';
import ParsedText from '../ParsedText';
import TimeBefore from '../TimeBefore';
import { truncateLength } from '../../helpers';
import SourcePicture from './SourcePicture';
import { units, black54, opaqueBlack54, avatarSizeSmall } from '../../styles/js/shared';

const StyledAccountCardBody = styled.div`
  margin-${props => (props.isRtl ? 'right' : 'left')}: ${units(2)};
  color: ${opaqueBlack54};
  .source-card__heading {
    svg {
      margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(1)};
    }
  }
`;

class AccountCard extends React.Component {
  accountStats(account) {
    switch (account.provider) {
    case 'facebook':
      return account.embed.likes ? <FormattedMessage id="accountCard.fbStats" defaultMessage="{likes, number} likes" values={{ likes: account.embed.likes }} /> : null;
    case 'twitter':
      return account.embed.raw ? <FormattedHTMLMessage id="accountCard.twitterStats" defaultMessage="{tweets, number} Tweets &bull; {followers, number} Followers &bull; {following, number} Following" values={{ tweets: account.embed.raw.api.statuses_count, followers: account.embed.raw.api.followers_count, following: account.embed.raw.api.friends_count }} /> : null;
    case 'youtube':
      return account.embed.raw ? <FormattedHTMLMessage id="accountCard.youtubeStats" defaultMessage="{videos, number} Videos &bull; {subscribers, number} Subscribers" values={{ videos: account.embed.raw.api.video_count, subscribers: account.embed.raw.api.subscriber_count }} /> : null;
    }
  }

  render() {
    const { account } = this.props;

    const byUser = (account.user) ?
      (<FormattedMessage id="mediaDetail.byUser" defaultMessage={'by {username}'} values={{ username: <ProfileLink user={account.user} /> }} />) : '';

    return (
      <Card className="source-card" style={{ marginBottom: units(2) }}>
        <CardText style={{ display: 'flex', paddingBottom: 0 }}>
          <SourcePicture className="source-card__avatar" object={account} type="account" size={avatarSizeSmall} />

          <StyledAccountCardBody isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
            <div className="source-card__heading">
              { MediaUtil.socialIcon(`${account.provider}.com`) /* TODO: refactor */ }
              <FormattedMessage id="accountCard.providerAccount" defaultMessage="{provider} account" values={{ provider: account.provider }} />
            </div>

            <div className="source-card__name">
              <a href={account.embed.url} target="_blank" rel="noopener noreferrer">{ account.embed.name }</a>
            </div>

            <div className="source-card__description" style={{ paddingTop: units(1.5) }}>
              <ParsedText text={truncateLength(account.embed.description, 300)} />
            </div>

            <div className="source-card__url" style={{ paddingTop: units(1.5) }}>
              <a href={account.embed.url} target="_blank" rel="noopener noreferrer">{ account.embed.url }</a>
            </div>

            <div className="source-card__account-stats">
              { this.accountStats(account) }
            </div>
          </StyledAccountCardBody>
        </CardText>
        <div
          className="media-detail__check-metadata source-card__footer"
          style={{ color: black54, padding: `${units(2)}` }}
        >
          <span className="media-detail__check-added-by"><FormattedMessage id="mediaDetail.added" defaultMessage={'Added {byUser}'} values={{ byUser }} /> </span>
          { account.created_at ? <span className="media-detail__check-added-at"> <TimeBefore date={MediaUtil.createdAt({ published: account.created_at })} /> </span> : null }
        </div>
      </Card>
    );
  }
}

export default injectIntl(AccountCard);
