import React from 'react';
import PropTypes from 'prop-types';
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import {
  validationLightCDS,
  validationSecondaryCDS,
} from '../../../styles/js/shared';
import Alert from './Alert';

const SuccessAlert = ({ title, content }) => (
  <Alert
    title={title}
    content={content}
    primaryColor={validationLightCDS}
    secondaryColor={validationSecondaryCDS}
    icon={<CheckCircleOutlineOutlinedIcon style={{ color: validationSecondaryCDS }} />}
  />
);

SuccessAlert.defaultProps = {
  content: null,
};

SuccessAlert.propTypes = {
  title: PropTypes.object.isRequired,
  content: PropTypes.object,
};

export default SuccessAlert;
