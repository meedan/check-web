/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import SwitchTeams from './SwitchTeams';
import PageTitle from '../PageTitle';
import ErrorBoundary from '../error/ErrorBoundary';
import { ContentColumn } from '../../styles/js/shared';

const Teams = () => (
  <ErrorBoundary component="teams">
    <React.Fragment>
      <PageTitle prefix={<FormattedMessage id="teams.title" defaultMessage="Workspaces" />} />
      <ContentColumn>
        <SwitchTeams />
      </ContentColumn>
    </React.Fragment>
  </ErrorBoundary>
);

export default Teams;
