import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import BlankState from '../layout/BlankState';
import { can } from '../Can';

const ProjectBlankState = (props) => {
  const checkMessage = (
    <FormattedHTMLMessage
      id="ProjectBlankState.createMedia"
      defaultMessage="Add a link or claim<br>to start verifying it"
    />
  );

  const bridgeMessage = (
    <FormattedHTMLMessage
      id="ProjectBlankState.createMediaBridge"
      defaultMessage="Add a link or quote<br>to start translating it"
    />
  );

  const message = config.appName === 'bridge' ? bridgeMessage : checkMessage;

  return (
    <BlankState>
      {
        can(props.project.permissions, 'create Media')
          ? message
          : <FormattedMessage id="userAssignments.blank" defaultMessage="No activity yet" />
      }
    </BlankState>
  );
};

export default ProjectBlankState;
