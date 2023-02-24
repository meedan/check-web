import React from 'react';
import PropTypes from 'prop-types';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import {
  alertLight,
  alertSecondary,
  alertMain,
} from '../../../styles/js/shared';
import Alert from './Alert';

const WarningAlert = ({ title, content }) => (
  <Alert
    title={title}
    content={content}
    primaryColor={alertLight}
    secondaryColor={alertSecondary}
    icon={<ErrorOutlineIcon style={{ color: alertMain }} />}
  />
);

WarningAlert.defaultProps = {
  content: null,
};

WarningAlert.propTypes = {
  title: PropTypes.object.isRequired,
  content: PropTypes.object,
};

export default WarningAlert;
