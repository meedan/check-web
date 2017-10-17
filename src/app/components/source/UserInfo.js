import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';
import AccountChips from './AccountChips';
import SourcePicture from './SourcePicture';
import ParsedText from '../ParsedText';
import MediaUtil from '../media/MediaUtil';
import { truncateLength } from '../../helpers';
import {
  StyledSourceWrapper,
  StyledSourceProfileCard,
  StyledSourceContactInfo,
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
} from '../../styles/js/source';

import {
  Row,
} from '../../styles/js/shared';

class UserInfo extends React.Component {
  render() {
    const { user } = this.props;
    const { source } = this.props.user;

    return (
      <StyledSourceProfileCard>
        <StyledTwoColumns>
          <StyledSmallColumn isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
            <SourcePicture object={source} type="source" className="source__avatar" />
          </StyledSmallColumn>

          <StyledBigColumn>
            <div className="source__primary-info">
              <h1 className="source__name">
                {user.name}
              </h1>
              <div className="source__description">
                <p className="source__description-text">
                  <ParsedText text={truncateLength(source.description, 600)} />
                </p>
              </div>
            </div>

            <AccountChips accounts={source.account_sources.edges.map(as => as.node.account)} />

            <StyledSourceContactInfo>
              <FormattedHTMLMessage
                id="UserInfo.dateJoined" defaultMessage="Joined {date} &bull; {teamsCount, plural, =0 {No teams} one {1 team} other {# teams}}"
                values={{
                  date: this.props.intl.formatDate(MediaUtil.createdAt({ published: source.created_at }), { year: 'numeric', month: 'short', day: '2-digit' }),
                  teamsCount: user.team_users.edges.length || 0,
                }}
              />
            </StyledSourceContactInfo>

          </StyledBigColumn>
        </StyledTwoColumns>
      </StyledSourceProfileCard>
    );
  }
}

export default injectIntl(UserInfo);
