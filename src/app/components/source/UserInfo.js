import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AccountChips from './AccountChips';
import Can from '../Can';
import ParsedText from '../ParsedText';
import { parseStringUnixTimestamp, truncateLength } from '../../helpers';
import SourcePicture from './SourcePicture';
import { logout } from '../../redux/actions.js';
import globalStrings from '../../globalStrings';
import IconEdit from '../../icons/edit.svg';
import styles from './UserInfo.module.css';

const UserInfo = (props) => {
  if (props.user.source === null) return null;

  return (
    <div className={styles['user-info-wrapper']}>
      <div className={styles['user-info-avatar']}>
        <SourcePicture
          size="large"
          object={props.user.source}
          type="user"
          className="source__avatar"
        />
      </div>

      <div className={styles['user-info-primary']}>
        <div className="source__primary-info">
          <div className={cx(styles['user-info-name'])}>
            <h5 className="source__name">{props.user.name}</h5>
            <Can permissions={props.user.permissions} permission="update User">
              <ButtonMain
                iconCenter={<IconEdit />}
                variant="text"
                theme="lightText"
                size="default"
                className="source__edit-source-button"
                onClick={() => {
                  if (props.user.dbid === props.context.currentUser.dbid) {
                    browserHistory.push('/check/me/edit');
                  } else {
                    browserHistory.push(`/check/user/${props.user.dbid}/edit`);
                  }
                }}
                title={props.intl.formatMessage(globalStrings.edit)}
              />
            </Can>
          </div>
          <div className={styles['user-info-description']}>
            <p className="typography-subtitle1">
              <ParsedText text={truncateLength(props.user.source.description, 600)} />
            </p>
          </div>
        </div>

        <AccountChips
          accounts={props.user.source.account_sources.edges.map(as => as.node.account)}
        />

        <div className={styles['contact-info']}>
          <FormattedMessage
            id="userInfo.dateJoined"
            defaultMessage="Joined {date}"
            description="Informational line showing the user the date their account was created on check"
            values={{
              date: props.intl.formatDate(
                parseStringUnixTimestamp(props.user.source.created_at),
                { year: 'numeric', month: 'short', day: '2-digit' },
              ),
            }}
          />
          &bull;
          <FormattedMessage
            id="userInfo.teamsCount"
            defaultMessage="{teamsCount, plural, one {# workspace} other {# workspaces}}"
            description="Count of how many work spaces this user account can access"
            values={{
              teamsCount: props.user.team_users.edges.length || 0,
            }}
          />
        </div>
        <ButtonMain
          className="user-menu__logout"
          variant="contained"
          theme="lightText"
          size="default"
          onClick={logout}
          label={
            <FormattedMessage
              id="UserMenu.signOut"
              defaultMessage="Sign Out"
              description="This is the sign out button on the user profile page"
            />
          }
        />
      </div>
    </div>
  );
};

export default injectIntl(UserInfo);
