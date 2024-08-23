/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import cx from 'classnames/bind';
import Popover from '@material-ui/core/Popover';
import Dialog from '@material-ui/core/Dialog';
import TextField from '../cds/inputs/TextField';
import TextArea from '../cds/inputs/TextArea';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import MediaPreview from '../feed/MediaPreview';
import SearchIcon from '../../icons/search.svg';
import ClearIcon from '../../icons/clear.svg';
import OpenInFullIcon from '../../icons/open_in_full.svg';
import styles from './search.module.css';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'search.inputHint',
    defaultMessage: 'Search',
    description: 'Placeholder for search keywords input',
  },
  clearSearch: {
    id: 'search.clearSearch',
    defaultMessage: 'Clear search',
    description: 'Tooltip for button on main search component to remove the current search keywords',
  },
  expandSearch: {
    id: 'search.expandSearch',
    defaultMessage: 'Expand search input',
    description: 'Tooltip for button on main search component to make the input size larger so the user can write more text',
  },
});

const SearchField = ({
  handleClear,
  inputBaseProps,
  intl,
  isActive,
  searchQuery,
  searchText,
  setParentSearchText,
  showExpand,
}) => {
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
    <>
      <div className={cx(styles['search-field-wrapper'])}>
        <TextField
          className={cx(
            styles['search-field'],
            {
              [styles['search-field-active']]: isActive && !expand,
              [styles['search-field-expandable']]: showExpand,
            })
          }
          componentProps={{
            name: 'search-input',
            id: 'search-input',
          }}
          iconLeft={<SearchIcon />}
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
          {...inputBaseProps}
          disabled={expand}
          value={localSearchText}
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
        />
        { localSearchText || searchQuery?.file_type ? (
          <ButtonMain
            className={cx(styles['search-clear-button'])}
            iconCenter={<ClearIcon />}
            size="small"
            theme="lightText"
            title={intl.formatMessage(messages.clearSearch)}
            variant="contained"
            onClick={handleClickClear}
          />
        ) : null }
        { showExpand ? (
          <ButtonMain
            className={cx(styles['search-expand-button'])}
            iconCenter={<OpenInFullIcon />}
            size="small"
            theme="lightText"
            title={intl.formatMessage(messages.expandSearch)}
            variant="contained"
            onClick={searchQuery?.file_type ? handleExpandMedia : handleExpand}
          />
        ) : null }
        <Popover
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          className={cx(styles['search-expanded-popover'])}
          open={expand}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          onClose={handleClose}
        >
          <TextArea
            disabled={!expand}
            label={
              <FormattedMessage defaultMessage="Enter search terms" description="Label for expanded search box with extra room for longer search strings" id="search.expandedSearchLabel" />
            }
            rows="5"
            value={localSearchText}
            onChange={(e) => {
              setParentSearchText(e.target.value);
              setLocalSearchText(e.target.value);
            }}
          />
          <div
            className={cx(
              styles['search-expanded-popover-buttons'],
              {
                [styles['submit-search-expanded']]: localSearchText || searchQuery?.file_type,
              })
            }
          >
            { localSearchText || searchQuery?.file_type ? (
              <ButtonMain
                disabled={!localSearchText}
                iconLeft={<ClearIcon />}
                label={
                  <FormattedMessage defaultMessage="Clear" description="A label on a button that lets a user clear typing search text, deleting the text in the process." id="search.clear" />
                }
                size="default"
                theme="lightText"
                variant="contained"
                onClick={handleClickClear}
              />
            ) : null }
            <ButtonMain
              buttonProps={{
                form: 'search-form',
                type: 'submit',
              }}
              disabled={!localSearchText}
              label={
                <FormattedMessage defaultMessage="Search" description="Button label for the search submit button when entering long text." id="search.expandedButton" />
              }
              size="default"
              theme="info"
              variant="contained"
            />
          </div>
        </Popover>
      </div>
      <Dialog
        fullWidth
        maxWidth="md"
        open={expandMedia}
        onClose={handleCloseExpandMedia}
      >
        <ButtonMain
          aria-label="close"
          buttonProps={{
            id: 'search-field__close-button',
          }}
          className={styles['close-media-button']}
          iconCenter={<ClearIcon />}
          size="default"
          theme="text"
          variant="contained"
          onClick={handleCloseExpandMedia}
        />
        <MediaPreview media={mediaData} />
      </Dialog>
    </>
  );
};

SearchField.defaultProps = {
  isActive: false,
  inputBaseProps: {},
  showExpand: false,
  setParentSearchText: () => {},
  handleClear: () => {},
  searchQuery: {},
};

SearchField.propTypes = {
  intl: intlShape.isRequired,
  isActive: PropTypes.bool,
  inputBaseProps: PropTypes.object,
  showExpand: PropTypes.bool,
  setParentSearchText: PropTypes.func,
  handleClear: PropTypes.func,
  searchQuery: PropTypes.object,
};

export default injectIntl(SearchField);
