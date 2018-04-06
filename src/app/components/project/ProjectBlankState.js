import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import styled from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { can } from '../Can';
import { units, headline, black38 } from '../../styles/js/shared';

const StyledBlankState = styled.div`
  margin-top: ${units(5)};
  font: ${headline};
  color: ${black38};
  text-align: center;
`;

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
    <StyledBlankState>
      {
        can(props.project.permissions, 'create Media')
          ? message
          : <FormattedMessage id="userAssignments.blank" defaultMessage="No activity yet" />
      }
    </StyledBlankState>
  );
};

export default ProjectBlankState;
