import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage, FormattedHTMLMessage, defineMessages, injectIntl } from 'react-intl';
import { Link } from 'react-router';
import Avatar from 'material-ui/Avatar';
import { Card, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import MdLaunch from 'react-icons/lib/md/launch';
import UserUtil from './UserUtil';
import ParsedText from '../ParsedText';
import MediaUtil from '../media/MediaUtil';
import CheckContext from '../../CheckContext';
import { truncateLength } from '../../helpers';
import UserRoute from '../../relay/UserRoute';
import rtlDetect from 'rtl-detect';
import {
  white,
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
import styled from 'styled-components';

const StyledMdLaunch = styled.div`
  float: ${props => (props.isRtl ? 'left' : 'right')};
  svg {
    min-width: 20px !important;
    min-height: 20px !important;
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

class UserTooltipComponent extends React.Component {
  getContext() {
    const context = new CheckContext(this);
    return context;
  }

  localizedRole(role) {
    return role ? `${this.props.intl.formatMessage(messages[role])}` : '';
  }

  accountLink(account) {
    return (<StyledSocialLink key={account.id} href={account.url} target="_blank" rel="noopener noreferrer" style={{ paddingRight: units(1) }}>
      { MediaUtil.socialIcon(`${account.provider}.com`) /* TODO: refactor */ }
    </StyledSocialLink>);
  }

  render() {
    const { user, team } = this.props;
    const { source } = this.props.user;
    const role = UserUtil.userRole(user, team);
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
                <StyledMdLaunch isRtl={isRtl}>
                  <MdLaunch />
                </StyledMdLaunch>
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
            { source.account_sources.edges.map(as => this.accountLink(as.node.account)) }
          </StyledBigColumn>
        </StyledTwoColumns>
      </StyledTooltip>
    );
  }
}

const UserTooltipContainer = Relay.createContainer(injectIntl(UserTooltipComponent), {
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        id,
        dbid,
        name,
        number_of_teams,
        team_users(first: 10000) {
          edges {
            node {
              team {
                id,
                dbid,
                name,
                slug,
                private,
              }
              id,
              status,
              role
            }
          }
        },
        source {
          id,
          dbid,
          image,
          description,
          created_at,
          account_sources(first: 10000) {
            edges {
              node {
                account {
                  id,
                  url,
                  provider
                }
              }
            }
          }
        }
      }
    `,
  },
});

class UserTooltip extends React.Component {
  render() {
    const route = new UserRoute({ userId: this.props.user.dbid });
    return (
      <Relay.RootContainer
        Component={UserTooltipContainer}
        route={route}
        renderFetched={data => <UserTooltipContainer {...this.props} {...data} />}
      />
    );
  }
}


UserTooltipComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default UserTooltip;
