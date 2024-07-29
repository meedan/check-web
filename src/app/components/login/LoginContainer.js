import React from 'react';
import Favicon from 'react-favicon';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import cx from 'classnames/bind';
import BrowserSupport from '../BrowserSupport';
import Alert from '../cds/alerts-and-prompts/Alert';
import Footer from '../Footer';
import Login from './Login';
import PageTitle from '../PageTitle';
import styles from './login.module.css';

const LoginContainer = props => (
  <PageTitle>
    <div className={styles['login-wrapper']}>
      <BrowserSupport />
      <div id="login-container" className={cx('login-container', styles['login-container'])}>
        <Favicon url={`/images/logo/${config.appName}.ico`} animated={false} />
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
