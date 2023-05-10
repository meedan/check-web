import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedHTMLMessage, FormattedDate } from 'react-intl';
import { Link } from 'react-router';
import Avatar from '@material-ui/core/Avatar';
import LaunchIcon from '@material-ui/icons/Launch';
import styled from 'styled-components';
import '../../styles/css/tooltip.css';
import { LocalizedRole } from './UserUtil';
import ParsedText from '../ParsedText';
import SocialIcon from '../SocialIcon';
import { truncateLength } from '../../helpers';
import { units } from '../../styles/js/shared';
import {
  StyledTwoColumns,
  StyledBigColumn,
} from '../../styles/js/HeaderCard';

const StyledMdLaunch = styled.div`
  float: ${props => (props.theme.dir === 'rtl' ? 'left' : 'right')};
  svg {
    min-width: 20px !important;
    min-height: 20px !important;
    color: var(--textDisabled);
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
  color: var(--textSecondary);
  margin: ${units(1)};
`;

const AccountLink = ({ url, provider }) => (
  <StyledSocialLink href={url} target="_blank" rel="noopener noreferrer" style={{ paddingRight: units(1) }}>
    <SocialIcon domain={provider} />
  </StyledSocialLink>
);
AccountLink.propTypes = {
  url: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
};

const userRole = ({
  user, team, status, role,
}) => {
  // Copied from UserUtil.js, minus the Array#find(). Don't know whether these
  // if-statements are needed.
  if (!user || !team || !team.slug) {
    return null;
  }
  return status === 'requested' ? '' : role;
};

function UserTooltipComponent({ teamUser }) {
  const user = teamUser && teamUser.user;
  const source = user && user.source;
  const role = teamUser ? userRole(teamUser) : null;

  if (!source) {
    return null;
  }

  // TODO make API give ISO8601 dates
  const createdAt = new Date(parseInt(source?.created_at, 10) * 1000);

  return (
    <StyledTooltip>
      <StyledTwoColumns>
        <StyledSmallColumnTooltip>
          <Avatar
            className="avatar"
            src={source?.image}
            alt={user?.name}
          />
        </StyledSmallColumnTooltip>

        <StyledBigColumn>
          <div className="tooltip__primary-info">
            <strong className="tooltip__name typography-body2" style={{ fontWeight: 500 }}>
              {user.name}
            </strong>
            <StyledUserRole className="typography-caption">{role ? <LocalizedRole role={role} /> : null}</StyledUserRole>
            <Link to={`/check/user/${user?.dbid}`} className="tooltip__profile-link" >
              <StyledMdLaunch>
                <LaunchIcon />
              </StyledMdLaunch>
            </Link>

            <div className="tooltip__description">
              <p className="tooltip__description-text typography-caption">
                <ParsedText text={truncateLength(source?.description, 600)} />
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
                    teamsCount: user?.number_of_teams,
                  }}
                />
              )}
            </FormattedDate>
          </div>
          {source?.account_sources?.edges.map(({ node: { account: { id, url, provider } } }) => (
            <AccountLink key={id} url={url} provider={provider} />
          ))}
        </StyledBigColumn>
      </StyledTwoColumns>
    </StyledTooltip>
  );
}
// eslint-disable-next-line
export { UserTooltipComponent }; 

export default Relay.createContainer(UserTooltipComponent, {
  fragments: {
    teamUser: () => Relay.QL`
      fragment on TeamUser {
        id
        status
        role
        team {
          id
          slug
        }
        user {
          id
          dbid
          name
          number_of_teams
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
      }
    `,
  },
});
