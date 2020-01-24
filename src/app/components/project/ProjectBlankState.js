import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import BlankState from '../layout/BlankState';
import { can } from '../Can';

const ProjectBlankState = (props) => {
  const message = (
    <FormattedHTMLMessage
      id="ProjectBlankState.createMedia"
      defaultMessage="Add a link or text"
    />
  );

  return (
    <BlankState>
      {
        can(props.project.permissions, 'create Media')
          ? message
          : <FormattedMessage id="userAssignments.blank" defaultMessage="No activity" />
      }
    </BlankState>
  );
};

export default ProjectBlankState;
