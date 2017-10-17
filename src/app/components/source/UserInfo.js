import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';
import AccountChips from './AccountChips';
import ParsedText from '../ParsedText';
import MediaUtil from '../media/MediaUtil';
import { truncateLength } from '../../helpers';
import {
  StyledSourceContactInfo,
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledSourceName,
  StyledSourceDescription,
  StyledSourcePicture,
} from '../../styles/js/source';

class UserInfo extends React.Component {
  render() {
    const { user } = this.props;
    const { source } = this.props.user;

    return (
      <StyledTwoColumns>
        <StyledSmallColumn isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
          <StyledSourcePicture object={source} type="source" className="source__avatar" />
        </StyledSmallColumn>

        <StyledBigColumn>
          <div className="source__primary-info">
            <StyledSourceName className="source__name">
              {user.name}
            </StyledSourceName>
            <StyledSourceDescription>
              <p>
                <ParsedText text={truncateLength(source.description, 600)} />
              </p>
            </StyledSourceDescription>
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
    );
  }
}

export default injectIntl(UserInfo);
