import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import { parseStringUnixTimestamp } from '../../helpers';
import SourcePicture from '../source/SourcePicture';
import styles from '../user/user.module.css';

const UserInfo = (props) => {
  if (props.user.source === null) return null;

  return (
    <div className={styles['user-info-edit']}>
      <div className={styles['user-info-avatar']}>
        <SourcePicture
          size="large"
          object={props.user.source}
          type="user"
          className="source__avatar"
        />
      </div>

      <div className={cx(styles['user-info-primary'], styles['user-setting-content-container'])}>
        <div className="source__primary-info">
          <div className={cx(styles['user-info-name'])}>
            <h5 className="source__name">{props.user.name}</h5>
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
    </div>
  );
};

export default injectIntl(UserInfo);
