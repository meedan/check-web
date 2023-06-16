/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import IconEdit from '@material-ui/icons/Edit';
import AccountChips from './AccountChips';
import Can from '../Can';
import ParsedText from '../ParsedText';
import { parseStringUnixTimestamp, truncateLength } from '../../helpers';
import SourcePicture from './SourcePicture';
import { logout } from '../../redux/actions.js';
import {
  StyledContactInfo,
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledName,
  StyledDescription,
} from '../../styles/js/HeaderCard';
import { Row } from '../../styles/js/shared';
import globalStrings from '../../globalStrings';

const UserInfo = (props) => {
  if (props.user.source === null) return null;

  return (
    <StyledTwoColumns>
      <StyledSmallColumn>
        <SourcePicture
          size="large"
          object={props.user.source}
          type="user"
          className="source__avatar"
        />
      </StyledSmallColumn>

      <StyledBigColumn>
        <div className="source__primary-info">
          <StyledName className="source__name">
            <Row>
              {props.user.name}
              <Can permissions={props.user.permissions} permission="update User">
                <IconButton
                  className="source__edit-source-button"
                  onClick={() => {
                    if (props.user.dbid === props.context.currentUser.dbid) {
                      browserHistory.push('/check/me/edit');
                    } else {
                      browserHistory.push(`/check/user/${props.user.dbid}/edit`);
                    }
                  }}
                  tooltip={props.intl.formatMessage(globalStrings.edit)}
                >
                  <IconEdit />
                </IconButton>
              </Can>
            </Row>
          </StyledName>
          <StyledDescription>
            <p className="typography-subtitle1">
              <ParsedText text={truncateLength(props.user.source.description, 600)} />
            </p>
          </StyledDescription>
        </div>

        <AccountChips
          accounts={props.user.source.account_sources.edges.map(as => as.node.account)}
        />

        <StyledContactInfo>
          <FormattedMessage
            id="userInfo.dateJoined"
            defaultMessage="Joined {date}"
            values={{
              date: props.intl.formatDate(
                parseStringUnixTimestamp(props.user.source.created_at),
                { year: 'numeric', month: 'short', day: '2-digit' },
              ),
            }}
          />
          <FormattedMessage
            id="userInfo.teamsCount"
            defaultMessage="{teamsCount, plural, one {# workspace} other {# workspaces}}"
            values={{
              teamsCount: props.user.team_users.edges.length || 0,
            }}
          />
        </StyledContactInfo>
        <div>
          <Button
            className="user-menu__logout"
            variant="contained"
            onClick={logout}
          >
            <FormattedMessage
              id="UserMenu.signOut"
              defaultMessage="Sign Out"
              description="This is the sign out button on the user profile page"
            />
          </Button>
        </div>
      </StyledBigColumn>
    </StyledTwoColumns>
  );
};

export default injectIntl(UserInfo);
