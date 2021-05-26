import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import {
  black16,
  borderWidthLarge,
  brandHighlight,
} from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  inputInactive: {
    borderRadius: theme.spacing(0.5),
    border: `${borderWidthLarge} solid ${black16}`,
  },
  inputActive: {
    borderRadius: theme.spacing(0.5),
    border: `${borderWidthLarge} solid ${brandHighlight}`,
  },
  startAdornmentRoot: {
    display: 'flex',
    justifyContent: 'center',
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
}));

const SearchField = ({ isActive, inputBaseProps, endAdornment }) => {
  const classes = useStyles();

  return (
    <FormattedMessage id="search.inputHint" defaultMessage="Search" description="Placeholder for search keywords input">
      { placeholder => (
        <InputBase
          classes={{
            root: (
              isActive ?
                classes.inputActive :
                classes.inputInactive
            ),
          }}
          placeholder={placeholder}
          name="search-input"
          id="search-input"
          {...inputBaseProps}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment
                classes={{
                  root: classes.startAdornmentRoot,
                }}
              >
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment,
          }}
          autoFocus
          fullWidth
        />
      )}
    </FormattedMessage>
  );
};

SearchField.defaultProps = {
  isActive: false,
  inputBaseProps: {},
  endAdornment: null,
};

SearchField.propTypes = {
  isActive: PropTypes.bool,
  inputBaseProps: PropTypes.object,
  endAdornment: PropTypes.node,
};

export default SearchField;
