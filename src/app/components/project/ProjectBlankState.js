import React from 'react';
import PropTypes from 'prop-types';
import BlankState from '../layout/BlankState';

export default function ProjectBlankState({ message }) {
  return (
    <BlankState>
      {message}
    </BlankState>
  );
}

ProjectBlankState.propTypes = {
  message: PropTypes.object.isRequired,
};
