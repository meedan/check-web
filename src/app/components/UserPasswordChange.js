import React from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import PageTitle from './PageTitle';
import ChangePasswordComponent from './ChangePasswordComponent';
import { FormattedGlobalMessage } from './MappedMessage';
import { stringHelper } from '../customHelpers';
import {
  units,
  ContentColumn,
  StyledSubHeader,
  StyledCard,
} from '../styles/js/shared';

const useStyles = makeStyles({
  logo: {
    margin: '0 auto',
    display: 'block',
  },
  marginTop: {
    marginTop: `${units(9)}`,
  },
});

function UserPasswordChange() {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const handleSignIn = () => {
    browserHistory.push('/');
  };

  const getQueryStringValue = (key) => {
    const value = window.location.search.replace(new RegExp(`^(?:.*[&\\?]${encodeURIComponent(key).replace(/[.+*]/g, '\\$&')}(?:\\=([^&]*))?)?.*$`, 'i'), '$1');
    return decodeURIComponent(value);
  };

  const showConfirm = () => {
    setShowConfirmDialog(true);
  };

  const token = getQueryStringValue('reset_password_token');

  const classes = useStyles();

  return (
    <PageTitle>
      <ContentColumn center className="user-password-reset__component">
        <StyledCard className={classes.marginTop}>
          <FormattedGlobalMessage messageKey="appNameHuman">
            {appNameHuman => (
              <img
                className={classes.logo}
                alt={appNameHuman}
                width="120"
                src={stringHelper('LOGO_URL')}
              />
            )}
          </FormattedGlobalMessage>
          <StyledSubHeader className="reset-password__heading">
            { showConfirmDialog ?
              <FormattedMessage id="passwordChange.successTitle" defaultMessage="Password updated" />
              : <FormattedMessage id="passwordChange.title" defaultMessage="Change password" />
            }
          </StyledSubHeader>

          { showConfirmDialog ?
            <div>
              <CardContent>
                <FormattedMessage
                  id="passwordChange.successMsg"
                  defaultMessage="You're all set. Now you can log in with your new password."
                />
              </CardContent>
              <CardActions className="user-password-change__actions">
                <Button color="primary" onClick={handleSignIn}>
                  <FormattedMessage id="passwordChange.signIn" defaultMessage="Got it" />
                </Button>
              </CardActions>
            </div> :
            <div className="user-password-change__card">
              <CardContent>
                <ChangePasswordComponent
                  type="reset-password"
                  showCurrentPassword={false}
                  token={token}
                  showConfirm={showConfirm}
                />
              </CardContent>
            </div>
          }
        </StyledCard>
      </ContentColumn>
    </PageTitle>
  );
}

export default UserPasswordChange;
