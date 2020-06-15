import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedHTMLMessage, FormattedDate } from 'react-intl';
import { Link } from 'react-router';
import Avatar from '@material-ui/core/Avatar';
import MdLaunch from 'react-icons/lib/md/launch';
import styled from 'styled-components';
import { LocalizedRole, userRole } from './UserUtil';
import ParsedText from '../ParsedText';
import { SocialIcon } from '../media/MediaUtil';
import { truncateLength } from '../../helpers';
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
  float: ${props => (props.theme.dir === 'rtl' ? 'left' : 'right')};
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
  margin-left: ${props => (props.theme.dir === 'rtl' ? units(2) : units(1))};
  margin-right: ${props => (props.theme.dir === 'rtl' ? units(1) : units(2))};

  justify-content: center;
  flex-shrink: 0;
`;

const StyledUserRole = styled.span`
  color: ${black54};
  font: ${caption};
  margin: ${units(1)};
`;

const AccountLink = ({ id, url, provider }) => (
  <StyledSocialLink key={id} href={url} target="_blank" rel="noopener noreferrer" style={{ paddingRight: units(1) }}>
    <SocialIcon domain={provider} />
  </StyledSocialLink>
);

function UserTooltipComponent({ user, team }) {
  const { source } = user;
  const role = userRole(user, team);

  if (!source) {
    return null;
  }

  // TODO make API give ISO8601 dates
  const createdAt = new Date(parseInt(source.created_at, 10) * 1000);

  return (
    <StyledTooltip>
      <StyledTwoColumns style={{ paddingBottom: 0 }}>
        <StyledSmallColumnTooltip>
          <Avatar
            className="avatar"
            src={source.image}
            alt={user.name}
          />
        </StyledSmallColumnTooltip>

        <StyledBigColumn>
          <div className="tooltip__primary-info">
            <strong className="tooltip__name" style={{ font: body2, fontWeight: 500 }}>
              {user.name}
            </strong>
            <StyledUserRole>{role ? <LocalizedRole role={role} /> : null}</StyledUserRole>
            <Link to={`/check/user/${user.dbid}`} className="tooltip__profile-link" >
              <StyledMdLaunch>
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
            <FormattedDate value={createdAt} year="numeric" month="short" day="numeric">
              {dateString => (
                <FormattedHTMLMessage
                  id="userTooltip.dateJoined"
                  defaultMessage="Joined {date} &bull; {teamsCount, plural, =0 {No workspaces} one {1 workspace} other {# workspaces}}"
                  values={{
                    date: dateString,
                    teamsCount: user.number_of_teams,
                  }}
                />
              )}
            </FormattedDate>
          </div>
          {source.account_sources.edges.map(({ node: { id, url, provider } }) => (
            <AccountLink key={id} id={id} url={url} provider={provider} />
          ))}
        </StyledBigColumn>
      </StyledTwoColumns>
    </StyledTooltip>
  );
}

const UserTooltipContainer = Relay.createContainer(UserTooltipComponent, {
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        id
        dbid
        name
        number_of_teams
        team_users(first: 10000) {
          edges {
            node {
              id
              status
              role
              team {
                id
                slug
              }
            }
          }
        }
        source {
          id
          image
          description
          created_at
          account_sources(first: 10000) {
            edges {
              node {
                account {
                  id
                  url
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
