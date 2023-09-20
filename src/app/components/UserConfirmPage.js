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
import CheckAgreeTerms from './CheckAgreeTerms';
import ErrorBoundary from './error/ErrorBoundary';
import { stringHelper } from '../customHelpers';
import {
  ContentColumn,
  units,
  mediaQuery,
} from '../styles/js/shared';

const StyledSubHeader = styled.h2`
  font-weight: 600;
  color: var(--textSecondary);
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
});

function UserConfirmPage({ params }) {
  const classes = useStyles();

  return (
    <ErrorBoundary component="UserConfirmPage">
      <Typography component="div" variant="body1" gutterBottom>
        <PageTitle>
          <Box m={2} align="center">
            <FormattedHTMLMessage
              id="global.bestViewed"
              defaultMessage='Best viewed with <a href="{chromedownload}">Chrome for Desktop</a>.'
              values={{ chromedownload: 'https://www.google.com/chrome/browser/desktop/' }}
              description="Message shown to the user when they are using an unsupported browser"
            />
          </Box>
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
              <StyledSubHeader className="confirm__heading typography-h6">
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
              <Typography component="div" align="center" paragraph className="confirm_content">
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
              <CheckAgreeTerms />
            </Box>
          </ContentColumn>
        </PageTitle>
      </Typography>
    </ErrorBoundary>
  );
}

export default UserConfirmPage;
