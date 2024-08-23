/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import { FormattedGlobalMessage } from './MappedMessage';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import PageTitle from './PageTitle';
import { stringHelper } from '../customHelpers';
import styles from './NotFound.module.css';

const NotFound = ({ description, title }) => (
  <PageTitle
    prefix={
      <FormattedMessage
        defaultMessage="Page not found"
        description="Page title for the Not found page"
        id="notFound.pageTitle"
      />
    }
  >
    <div className={cx('not-found__component', styles['not-found'])}>
      <FormattedGlobalMessage messageKey="appNameHuman">
        {appNameHuman => (
          <img
            alt={appNameHuman}
            className={styles.logo}
            src={stringHelper('LOGO_URL')}
            width="120"
          />
        )}
      </FormattedGlobalMessage>
      <h6>
        {
          title ||
          <FormattedMessage
            defaultMessage="This page does not exist or you do not have authorized access."
            description="Not found page title"
            id="notFound.title"
          />
        }
      </h6>
      <p>
        { description ||
          <FormattedMessage
            defaultMessage="If you are trying to access an existing workspace, please contact the workspace owner."
            description="Help text for the user to contact the workspace admin for additional help accessing"
            id="notFound.text"
          />
        }
      </p>
      <ButtonMain
        className={cx('int-feed-invitation__button--profile')}
        label={
          <FormattedMessage
            defaultMessage="Go to my profile page"
            description="Go to profile page button"
            id="notFound.back"
          />
        }
        size="default"
        theme="info"
        variant="contained"
        onClick={() => browserHistory.push('/check/me')}
      />
    </div>
  </PageTitle>
);

NotFound.defaultProps = {
  title: null,
  description: null,
};

NotFound.propTypes = {
  title: PropTypes.node, // <FormattedMessage />, <FormattedHTMLMessage />, <Element>String</Element>, etc.
  description: PropTypes.node, // <FormattedMessage />, <FormattedHTMLMessage />, <Element>String</Element>, etc.
};

export default NotFound;
