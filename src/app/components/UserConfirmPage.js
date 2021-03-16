import React from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import PageTitle from './PageTitle';
import { FormattedGlobalMessage } from './MappedMessage';
import { stringHelper } from '../customHelpers';
import {
  ContentColumn,
  units,
  mediaQuery,
  title1,
  black54,
} from '../styles/js/shared';

const StyledSubHeader = styled.h2`
  font: ${title1};
  font-weight: 600;
  color: ${black54};
  text-align: center;
  margin-top: ${units(2)};
`;

const StyledCard = styled(Card)`
  padding: ${units(11)} ${units(15)} ${units(3)} !important;
  ${mediaQuery.handheld`
    padding: ${units(8)} ${units(4)} ${units(3)} !important;
  `}
`;

const useStyles = makeStyles({
  logo: {
    margin: '0 auto',
    display: 'block',
  },
  marginTop: {
    marginTop: `${units(2)}`,
    textAlign: 'center',
  },
});

function UserConfirmPage({ params }) {
  const classes = useStyles();

  return (
    <Typography component="div" variant="body2" gutterBottom>
      <PageTitle>
        <p className={classes.marginTop}>
          <FormattedHTMLMessage id="browser.support.message" defaultMessage='Best viewed with <a href="https://www.google.com/chrome/browser/desktop/">Chrome for Desktop</a>.' />
        </p>
        <ContentColumn center className="user-confirm-page__component">
          <StyledCard>
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
            <StyledSubHeader className="confirm__heading">
              { params.confirmType === 'confirmed' ?
                (<FormattedMessage
                  id="UserConfirmPage.confirmed"
                  defaultMessage="Account Confirmed"
                  description="Message for confirmed accounts"
                />) : null
              }
              { params.confirmType === 'already-confirmed' ?
                (<FormattedMessage
                  id="UserConfirmPage.alreadyConfirmed"
                  defaultMessage="Account Already Confirmed"
                  description="Message for accounts already confirmed"
                />) : null
              }
            </StyledSubHeader>
            <Typography component="div" align="center" paragraph>
              { params.confirmType === 'confirmed' ?
                (<FormattedMessage
                  id="userConfirmed.confrimMessage"
                  defaultMessage="Thanks for confirming your email address! Now you can sign in."
                  description="Message for confirmed user"
                />) : null
              }
              { params.confirmType === 'already-confirmed' ?
                (<FormattedMessage
                  id="userConfirmed.alreadyConfrimMessage"
                  defaultMessage="Oops! Your account is already confirmed. Please sign in to get started."
                  description="Message for user who already confirmed before"
                />) : null
              }
              { params.confirmType === 'unconfirmed' ?
                (<FormattedMessage
                  id="userConfirmed.unConfrimMessage"
                  defaultMessage="Sorry, an error occurred while confirming your account. Please try again and contact {supportEmail} if the condition persists."
                  values={{
                    supportEmail: stringHelper('SUPPORT_EMAIL'),
                  }}
                  description="Message for unconfirmed users"
                />) : null
              }
            </Typography>
            <Typography component="div" align="center">
              <Link to="/">
                <Button variant="contained" color="primary">
                  <FormattedMessage
                    id="userConfirmPage.signIn"
                    defaultMessage="Sign In"
                    description="Sign in button"
                  />
                </Button>
              </Link>
            </Typography>
          </StyledCard>
          <Box my={4}>
            <p style={{ textAlign: 'center' }}>
              <FormattedMessage
                id="userConfirmPage.agreeTerms"
                defaultMessage="By signing up, you agree to the {appName} {tosLink} and {ppLink}."
                values={{
                  appName: (<FormattedGlobalMessage messageKey="appNameHuman" />),
                  tosLink: <a className="confirm-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('TOS_URL')}><FormattedMessage id="tos.title" defaultMessage="Terms of Service" /></a>,
                  ppLink: <a className="confirm-container__footer-link" target="_blank" rel="noopener noreferrer" href={stringHelper('PP_URL')}><FormattedMessage id="privacy.policy.title" defaultMessage="Privacy&nbsp;Policy" /></a>,
                }}
              />
            </p>

            <p style={{ textAlign: 'center' }}>
              <FormattedHTMLMessage
                id="userConfirmPage.contactSupport"
                defaultMessage='For support contact <a href="mailto:{supportEmail}">{supportEmail}</a>.'
                values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
              />
            </p>
          </Box>
        </ContentColumn>
      </PageTitle>
    </Typography>
  );
}

export default UserConfirmPage;
