import React from 'react';
import PropTypes from 'prop-types';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import {
  alertLightCDS,
  alertSecondaryCDS,
  alertMainCDS,
} from '../../../styles/js/shared';
import Alert from './Alert';

const WarningAlert = ({ title, content }) => (
  <Alert
    title={title}
    content={content}
    primaryColor={alertLightCDS}
    secondaryColor={alertSecondaryCDS}
    icon={<ErrorOutlineIcon style={{ color: alertMainCDS }} />}
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
