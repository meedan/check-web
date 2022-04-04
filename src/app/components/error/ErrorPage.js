import React from 'react';
import Typography from '@material-ui/core/Typography';
import PageTitle from '../PageTitle';
import CheckStyledCard from '../layout/CheckStyledCard';
import { ContentColumn } from '../../styles/js/shared';

const ErrorPage = ({
  pageTitle,
  cardTitle,
  cardText,
}) => (
  <PageTitle
    prefix={pageTitle}
  >
    <ContentColumn center className="error-page__component" style={{ marginTop: 80 }}>
      <CheckStyledCard
        title={cardTitle}
        body={
          <Typography variant="body1">
            {cardText}
          </Typography>
        }
      />
    </ContentColumn>
  </PageTitle>
);

export default ErrorPage;
