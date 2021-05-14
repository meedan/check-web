import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

const StyledButton = withStyles({
  root: {
    backgroundColor: '#ddd',
    padding: '0 8px',
    fontWeight: 'normal',
  },
  text: {
    color: '#777',
    textTransform: 'none',
  },
})(Button);

const SelectButton = ({ onClick }) => (
  <StyledButton
    className="custom-select-dropdown__select-button"
    endIcon={<KeyboardArrowDownIcon />}
    onClick={onClick}
  >
    <FormattedMessage
      id="customAutocomplete.select"
      defaultMessage="Select"
      description="Verb. Label for generic dropdown component"
    />
  </StyledButton>
);

SelectButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default SelectButton;
