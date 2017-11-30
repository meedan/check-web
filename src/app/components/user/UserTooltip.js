import React from 'react';
import Relay from 'react-relay';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router';
import Avatar from 'material-ui/Avatar';
import { Card, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import MdLaunch from 'react-icons/lib/md/launch';
import ParsedText from '../ParsedText';
import MediaUtil from '../media/MediaUtil';
import { truncateLength } from '../../helpers';
import UserRoute from '../../relay/UserRoute';
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
  StyledSmallColumn,
  StyledBigColumn,
} from '../../styles/js/HeaderCard';
import styled from 'styled-components';

const StyledMdLaunch = styled(MdLaunch)`
  float: right;
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

class UserTooltipComponent extends React.Component {
  accountLink(account) {
    return (<StyledSocialLink key={account.id} href={account.url} target="_blank" rel="noopener noreferrer" style={{ paddingRight: units(1) }}>
      { MediaUtil.socialIcon(`${account.provider}.com`) /* TODO: refactor */ }
    </StyledSocialLink>);
  }

  render() {
    const { user } = this.props;
    const { source } = this.props.user;

    return (
      <StyledTooltip>
        <StyledTwoColumns style={{ paddingBottom: 0 }}>
          <StyledSmallColumn>
            <Avatar
              className="avatar"
              src={user.source.image}
              alt={user.name}
            />
          </StyledSmallColumn>

          <StyledBigColumn>
            <div className="tooltip__primary-info">
              <strong className="tooltip__name" style={{ font: body2, fontWeight: 500 }}>
                {user.name}
              </strong>

              <Link to={`/check/user/${user.dbid}`} className="tooltip__profile-link" >
                <StyledMdLaunch />
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
      />
    );
  }
}

export default UserTooltip;
