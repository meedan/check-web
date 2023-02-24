import React from 'react';
import PropTypes from 'prop-types';
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import {
  validationLight,
  validationSecondary,
} from '../../../styles/js/shared';
import Alert from './Alert';

const SuccessAlert = ({ title, content }) => (
  <Alert
    title={title}
    content={content}
    primaryColor={validationLight}
    secondaryColor={validationSecondary}
    icon={<CheckCircleOutlineOutlinedIcon style={{ color: validationSecondary }} />}
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
