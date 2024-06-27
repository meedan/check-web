import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import cx from 'classnames/bind';
import { FormattedGlobalMessage } from './MappedMessage';
import { stringHelper } from '../customHelpers';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import PageTitle from './PageTitle';
import styles from './NotFound.module.css';

const NotFound = ({ title, description }) => (
  <PageTitle
    prefix={
      <FormattedMessage
        id="notFound.pageTitle"
        defaultMessage="Page not found"
        description="Page title for the Not found page"
      />
    }
  >
    <div className={cx('not-found__component', styles['not-found'])}>
      <FormattedGlobalMessage messageKey="appNameHuman">
        {appNameHuman => (
          <img
            className={styles.logo}
            alt={appNameHuman}
            width="120"
            src={stringHelper('LOGO_URL')}
          />
        )}
      </FormattedGlobalMessage>
      <h6>
        {
          title ||
          <FormattedMessage
            id="notFound.title"
            defaultMessage="This page does not exist or you do not have authorized access."
            description="Not found page title"
          />
        }
      </h6>
      <p>
        { description ||
          <FormattedMessage
            id="notFound.text"
            defaultMessage="If you are trying to access an existing workspace, please contact the workspace owner."
            description="Help text for the user to contact the workspace admin for additional help accessing"
          />
        }
      </p>
      <ButtonMain
        className={cx('int-feed-invitation__button--profile')}
        size="default"
        theme="brand"
        variant="contained"
        onClick={() => browserHistory.push('/check/me')}
        label={
          <FormattedMessage
            id="notFound.back"
            defaultMessage="Go to my profile page"
            description="Go to profile page button"
          />
        }
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
