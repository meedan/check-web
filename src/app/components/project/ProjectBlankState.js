import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import BlankState from '../layout/BlankState';
import Can from '../Can';

export default function ProjectBlankState({ project }) {
  return (
    <BlankState>
      <Can
        permission="create Media"
        permissions={project.permissions}
        otherwise={<FormattedMessage id="userAssignments.blank" defaultMessage="No activity" />}
      >
        <FormattedHTMLMessage id="ProjectBlankState.createMedia" defaultMessage="Add a link or text" />
      </Can>
    </BlankState>
  );
}
ProjectBlankState.propTypes = {
  project: PropTypes.shape({
    permissions: PropTypes.string.isRequired,
  }).isRequired,
};
