import React from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import PageTitle from './PageTitle';
import CheckStyledCard from './layout/CheckStyledCard';
import { ContentColumn } from '../styles/js/shared';

const NotFound = () => (
  <PageTitle
    prefix={
      <FormattedMessage
        id="notFound.pageTitle"
        defaultMessage="Page not found"
      />
    }
  >
    <ContentColumn center className="not-found__component" style={{ marginTop: 80 }}>
      <CheckStyledCard
        title={
          <FormattedMessage
            id="notFound.title"
            defaultMessage="Oh no! This page does not exist or you do not have authorized access."
            description="Not found page title"
          />
        }
        body={
          <React.Fragment>
            <Box mb={3}>
              <Typography variant="body1">
                <FormattedMessage
                  id="notFound.text"
                  defaultMessage="If you are trying to access an existing workspace, please contact the workspace owner."
                />
              </Typography>
            </Box>
            <Typography component="div" align="center">
              <Button
                color="primary"
                variant="contained"
                onClick={() => browserHistory.push('/check/me')}
              >
                <FormattedMessage
                  id="notFound.back"
                  defaultMessage="Go to my profile page"
                  description="Go to profile page button"
                />
              </Button>
            </Typography>
          </React.Fragment>
        }
      />
    </ContentColumn>
  </PageTitle>
);

export default NotFound;
