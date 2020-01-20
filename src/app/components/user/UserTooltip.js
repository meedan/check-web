import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router';
import Avatar from 'material-ui/Avatar';
import MdLaunch from 'react-icons/lib/md/launch';
import rtlDetect from 'rtl-detect';
import styled from 'styled-components';
import UserUtil from './UserUtil';
import ParsedText from '../ParsedText';
import MediaUtil from '../media/MediaUtil';
import CheckContext from '../../CheckContext';
import { nested, truncateLength } from '../../helpers';
import UserRoute from '../../relay/UserRoute';
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

class UserTooltipComponent extends Component {
  static accountLink(account) {
    return (
      <StyledSocialLink key={account.id} href={account.url} target="_blank" rel="noopener noreferrer" style={{ paddingRight: units(1) }}>
        { MediaUtil.socialIcon(account.provider) }
      </StyledSocialLink>
    );
  }

  getContext() {
    return new CheckContext(this);
  }

  render() {
    const { user, team } = this.props;
    const source = nested(['props', 'user', 'source'], this);
    const role = UserUtil.userRole(user, team);
    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    if (!source) {
      return null;
    }

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
              <StyledUserRole>{UserUtil.localizedRole(role, this.props.intl)}</StyledUserRole>

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
                id="userTooltip.dateJoined"
                defaultMessage="Joined {date} &bull; {teamsCount, plural, =0 {No workspaces} one {1 workspace} other {# workspaces}}"
                values={{
                  date: this.props.intl.formatDate(MediaUtil.createdAt({ published: source.created_at }), { year: 'numeric', month: 'short', day: '2-digit' }),
                  teamsCount: user.number_of_teams,
                }}
              />
            </div>
            { source.account_sources.edges
              .map(as => UserTooltipComponent.accountLink(as.node.account)) }
          </StyledBigColumn>
        </StyledTwoColumns>
      </StyledTooltip>
    );
  }
}

UserTooltipComponent.contextTypes = {
  store: PropTypes.object,
};

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

const UserTooltip = (props) => {
  const route = new UserRoute({ userId: props.user.dbid });
  return (
    <Relay.RootContainer
      Component={UserTooltipContainer}
      route={route}
      renderFetched={data => <UserTooltipContainer {...props} {...data} />}
    />
  );
};

export default UserTooltip;
