import React from 'react';
import cx from 'classnames/bind';
import { FormattedGlobalMessage } from '../MappedMessage';
import { stringHelper } from '../../customHelpers';
import PageTitle from '../PageTitle';
import styles from './ErrorPage.module.css';

const ErrorPage = ({
  pageTitle,
  cardTitle,
  cardText,
}) => (
  <PageTitle
    prefix={pageTitle}
  >
    <div className={cx('error-page__component', styles['error-page'])}>
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
      <h6>{cardTitle}</h6>
      <p>
        {cardText}
      </p>
    </div>
  </PageTitle>
);

export default ErrorPage;
