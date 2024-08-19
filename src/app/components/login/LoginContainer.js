import React from 'react';
import Favicon from 'react-favicon';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import cx from 'classnames/bind';
import Login from './Login';
import BrowserSupport from '../BrowserSupport';
import Alert from '../cds/alerts-and-prompts/Alert';
import Footer from '../Footer';
import PageTitle from '../PageTitle';
import styles from './login.module.css';

const LoginContainer = props => (
  <PageTitle>
    <div className={styles['login-wrapper']}>
      <BrowserSupport />
      <div className={cx('login-container', styles['login-container'])} id="login-container">
        <Favicon animated={false} url={`/images/logo/${config.appName}.ico`} />
        {props.message &&
          <Alert
            content={props.message}
            variant="error"
          />
        }
        <Login loginCallback={props.loginCallback} />
        <Footer />
      </div>
    </div>
  </PageTitle>
);

export default LoginContainer;
