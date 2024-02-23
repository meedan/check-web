import React from 'react';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Can from '../Can';
import { parseStringUnixTimestamp } from '../../helpers';
import SourcePicture from './SourcePicture';
import IconEdit from '../../icons/edit.svg';
import styles from './User.module.css';

const messages = defineMessages({
  editTooltip: {
    id: 'global.edit',
    defaultMessage: 'Edit',
    description: 'Generic label for a button or link for a user to press when they wish to edit content or functionality',
  },
});

const UserInfo = (props) => {
  if (props.user.source === null) return null;
  const isUserSelf = (props.user?.dbid && props.user?.dbid === props.context?.currentUser?.dbid);

  return (
    <>
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
                  if (isUserSelf) {
                    browserHistory.push('/check/me/edit');
                  } else {
                    browserHistory.push(`/check/user/${props.user.dbid}/edit`);
                  }
                }}
                title={props.intl.formatMessage(messages.editTooltip)}
              />
            </Can>
          </div>
        </div>
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
              teamsCount: props.user?.number_of_teams || 0,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default injectIntl(UserInfo);
