import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
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
  endAdornmentContainer: {
    width: theme.spacing(18),
  },
  endAdornmentRoot: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  expanded: {
    padding: theme.spacing(2),
    width: '500px',
  },
  button: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
}));

const SearchField = ({
  isActive,
  inputBaseProps,
  endAdornment,
  showExpand,
  setParentSearchText,
  searchText,
}) => {
  const classes = useStyles();
  const [expand, setExpand] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [expandedText, setExpandedText] = React.useState(searchText);

  function handleExpand(event) {
    setExpand(true);
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setExpand(false);
  }

  return (
    <FormattedMessage id="search.inputHint" defaultMessage="Search" description="Placeholder for search keywords input">
      { placeholder => (
        <div>
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
            onChange={(e) => {
              setParentSearchText(e.target.value);
              inputBaseProps.onChange(e);
            }}
            value={searchText}
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
              endAdornment: (
                <Grid
                  container
                  direction="row"
                  justify="flex-end"
                  alignItems="center"
                  className={classes.endAdornmentContainer}
                >
                  { showExpand ? (
                    <Grid item>
                      <InputAdornment
                        classes={{
                          root: classes.endAdornmentRoot,
                        }}
                      >
                        <IconButton
                          onClick={handleExpand}
                        >
                          <img
                            src="/images/open_full.svg"
                            height="24"
                            width="24"
                            alt="Expand"
                          />
                        </IconButton>
                      </InputAdornment>
                    </Grid>) : null
                  }
                  <Grid item>
                    {endAdornment}
                  </Grid>
                </Grid>
              ),
            }}
            fullWidth
          />
          <Popover
            open={expand}
            onClose={handleClose}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            classes={{
              paper: classes.expanded,
            }}
            PaperProps={{
              elevation: 8,
            }}
          >
            <InputBase
              label="Type something"
              multiline
              rows={20}
              variant="outlined"
              fullWidth
              onChange={(e) => {
                setExpandedText(e.target.value);
              }}
              value={expandedText}
            />
            <Grid
              container
              direction="row"
              justify="flex-end"
              alignItems="center"
            >
              <Grid item className={classes.button}>
                <Button
                  onClick={handleClose}
                >
                  <FormattedMessage id="search.cancel" defaultMessage="Cancel" description="A label on a button that lets a user cancel typing search text, deleting the text in the process." />
                </Button>
              </Grid>
              <Grid item className={classes.button}>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={(e) => {
                    setParentSearchText(expandedText);
                    handleClose();
                    inputBaseProps.onChange(e, expandedText);
                  }}
                >
                  <FormattedMessage id="search.setText" defaultMessage="Set text" description="A label on a button that lets a user set the text on an associated popup to the original input field." />
                </Button>
              </Grid>
            </Grid>
          </Popover>
        </div>
      )}
    </FormattedMessage>
  );
};

SearchField.defaultProps = {
  isActive: false,
  inputBaseProps: {},
  endAdornment: null,
  showExpand: false,
  setParentSearchText: () => {},
};

SearchField.propTypes = {
  isActive: PropTypes.bool,
  inputBaseProps: PropTypes.object,
  endAdornment: PropTypes.node,
  showExpand: PropTypes.bool,
  setParentSearchText: PropTypes.func,
};

export default SearchField;
