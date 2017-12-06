import React from 'react';
import { FormattedHTMLMessage, defineMessages } from 'react-intl';
import { Link } from 'react-router';
import Avatar from 'material-ui/Avatar';
import MdLaunch from 'react-icons/lib/md/launch';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import ParsedText from '../ParsedText';
import MediaUtil from '../media/MediaUtil';
import CheckContext from '../../CheckContext';
import { truncateLength } from '../../helpers';
import {
  black38,
  black54,
  body2,
  caption,
  units,
} from '../../styles/js/shared';
import {
  StyledTwoColumns,
  StyledBigColumn,
} from '../../styles/js/HeaderCard';

const StyledMdLaunch = styled(MdLaunch)`
  float: ${props => (props.isRtl ? 'left' : 'right')};
  min-width: 20px !important;
  min-height: 20px !important;

  svg {
    color: ${black38};
  }
`;

const StyledSocialLink = styled.a`
  min-width: 20px !important;
  min-height: 20px !important;

  svg {
    min-width: 20px !important;
    min-height: 20px !important;
  }
`;

const StyledTooltip = styled.div`
  max-width: 300px;
`;

const StyledSmallColumnTooltip = styled.div`
  flex: 0;
  margin-left: ${props => (props.isRtl ? units(2) : units(1))};
  margin-right: ${props => (props.isRtl ? units(1) : units(2))};

  justify-content: center;
  flex-shrink: 0;
`;

const StyledUserRole = styled.span`
  color: ${black54};
  font: ${caption};
  margin: ${units(1)};
`;

const messages = defineMessages({
  contributor: {
    id: 'UserTooltip.contributor',
    defaultMessage: 'Contributor',
  },
  journalist: {
    id: 'UserTooltip.journalist',
    defaultMessage: 'Journalist',
  },
  editor: {
    id: 'UserTooltip.editor',
    defaultMessage: 'Editor',
  },
  owner: {
    id: 'UserTooltip.owner',
    defaultMessage: 'Owner',
  },
});

class UserTooltip extends React.Component {
  static accountLink(account) {
    return (<StyledSocialLink key={account.id} href={account.url} target="_blank" rel="noopener noreferrer" style={{ paddingRight: units(1) }}>
      { MediaUtil.socialIcon(`${account.provider}.com`) /* TODO: refactor */ }
    </StyledSocialLink>);
  }

  getContext() {
    const context = new CheckContext(this);
    return context;
  }

  userRole() {
    const context = this.getContext();
    const team = context.getContextStore().currentUser.current_team;
    const current_team_user =
      this.props.user.team_users.edges.find(tu => tu.node.team.slug === team.slug);
    return current_team_user.node.status !== 'requested' ? current_team_user.node.role : '';
  }

  localizedRole(role) {
    return role ? `${this.props.intl.formatMessage(messages[role])}` : '';
  }

  render() {
    const { user } = this.props;
    const { source } = this.props.user;
    const role = this.userRole();
    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    return (
      <StyledTooltip>
        <StyledTwoColumns style={{ paddingBottom: 0 }}>
          <StyledSmallColumnTooltip isRtl={isRtl}>
            <Avatar
              className="avatar"
              src={user.source.image}
              alt={user.name}
            />
          </StyledSmallColumnTooltip>

          <StyledBigColumn>
            <div className="tooltip__primary-info">
              <strong className="tooltip__name" style={{ font: body2, fontWeight: 500 }}>
                {user.name}
              </strong>
              <StyledUserRole>{this.localizedRole(role)}</StyledUserRole>

              <Link to={`/check/user/${user.dbid}`} className="tooltip__profile-link" >
                <StyledMdLaunch isRtl={isRtl} />
              </Link>

              <div className="tooltip__description">
                <p className="tooltip__description-text" style={{ font: caption }}>
                  <ParsedText text={truncateLength(source.description, 600)} />
                </p>
              </div>
            </div>

            <div className="tooltip__contact-info">
              <FormattedHTMLMessage
                id="userTooltip.dateJoined" defaultMessage="Joined {date} &bull; {teamsCount, plural, =0 {No teams} one {1 team} other {# teams}}"
                values={{
                  date: this.props.intl.formatDate(MediaUtil.createdAt({ published: source.created_at }), { year: 'numeric', month: 'short', day: '2-digit' }),
                  teamsCount: user.number_of_teams,
                }}
              />
            </div>
            { source.account_sources.edges.map(as => UserTooltip.accountLink(as.node.account)) }
          </StyledBigColumn>
        </StyledTwoColumns>
      </StyledTooltip>
    );
  }
}

UserTooltip.contextTypes = {
  store: React.PropTypes.object,
};

export default UserTooltip;
