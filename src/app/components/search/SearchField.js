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
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import SearchIcon from '@material-ui/icons/Search';
import { Clear as ClearIcon } from '@material-ui/icons';
import { MediaPreview } from '../feed/MediaPreview';
import {
  black16,
  borderWidthLarge,
  checkBlue,
} from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  input: {
    borderRadius: 50,
    fontSize: 14,
  },
  inputInactive: {
    border: `${borderWidthLarge} solid ${black16}`,
  },
  inputActive: {
    border: `${borderWidthLarge} solid ${checkBlue}`,
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
  closeButton: {
    color: 'white',
    zIndex: 1000,
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

const SearchField = ({
  isActive,
  inputBaseProps,
  endAdornment,
  showExpand,
  setParentSearchText,
  searchText,
  handleClear,
  searchQuery,
}) => {
  const classes = useStyles();
  const [expand, setExpand] = React.useState(false);
  const [expandMedia, setExpandMedia] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [localSearchText, setLocalSearchText] = React.useState(searchText || searchQuery?.file_name);

  function handleExpand(event) {
    setExpand(true);
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setExpand(false);
  }

  function handleExpandMedia() {
    setExpandMedia(true);
  }

  function handleCloseExpandMedia() {
    setExpandMedia(false);
  }

  function handleClickClear() {
    setLocalSearchText('');
    handleClear();
  }

  let mediaData = {};
  if (searchQuery?.file_type) {
    const mediaMapping = { image: 'UploadedImage', video: 'UploadedVideo', audio: 'UploadedAudio' };
    mediaData = {
      picture: searchQuery?.file_url,
      url: searchQuery?.file_url,
      type: mediaMapping[searchQuery?.file_type],
    };
  }

  return (
    <FormattedMessage id="search.inputHint" defaultMessage="Search" description="Placeholder for search keywords input">
      { placeholder => (
        <div>
          <InputBase
            classes={{
              root: (
                isActive ?
                  [classes.input, classes.inputActive].join(' ') :
                  [classes.input, classes.inputInactive].join(' ')
              ),
            }}
            placeholder={placeholder}
            name="search-input"
            id="search-input"
            {...inputBaseProps}
            onBlur={(e) => {
              setParentSearchText(e.target.value);
              if (inputBaseProps.onBlur) {
                inputBaseProps.onBlur(e);
              }
            }}
            onChange={(e) => {
              setLocalSearchText(e.target.value);
              if (inputBaseProps.onChange) {
                inputBaseProps.onChange(e);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                setParentSearchText(e.target.value);
                setLocalSearchText(e.target.value);
                if (inputBaseProps.onBlur) {
                  inputBaseProps.onBlur(e);
                }
              }
            }}
            value={localSearchText}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment
                  classes={{
                    root: classes.startAdornmentRoot,
                  }}
                >
                  { localSearchText || searchQuery?.file_type ? (
                    <IconButton
                      onClick={handleClickClear}
                    >
                      <ClearIcon color="primary" />
                    </IconButton>
                  ) : <SearchIcon /> }
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
                          onClick={searchQuery?.file_type ? handleExpandMedia : handleExpand}
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
              rows={5}
              variant="outlined"
              fullWidth
              onChange={(e) => {
                setLocalSearchText(e.target.value);
              }}
              value={localSearchText}
            />
            <Grid
              container
              direction="row"
              justify="flex-end"
              alignItems="center"
            >
              <Grid item className={classes.button}>
                <Button
                  startIcon={<ClearIcon />}
                  onClick={handleClickClear}
                  disabled={!localSearchText}
                >
                  <FormattedMessage id="search.clear" defaultMessage="Clear" description="A label on a button that lets a user clear typing search text, deleting the text in the process." />
                </Button>
              </Grid>
            </Grid>
          </Popover>
          <Dialog
            open={expandMedia}
            onClose={handleCloseExpandMedia}
            maxWidth="md"
            fullWidth
          >
            <div>
              <IconButton
                aria-label="close"
                className={classes.closeButton}
                id="search-field__close-button"
                onClick={handleCloseExpandMedia}
              >
                <CloseIcon />
              </IconButton>
              <MediaPreview media={mediaData} />
            </div>
          </Dialog>
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
  handleClear: () => {},
  searchQuery: {},
};

SearchField.propTypes = {
  isActive: PropTypes.bool,
  inputBaseProps: PropTypes.object,
  endAdornment: PropTypes.node,
  showExpand: PropTypes.bool,
  setParentSearchText: PropTypes.func,
  handleClear: PropTypes.func,
  searchQuery: PropTypes.object,
};

export default SearchField;
