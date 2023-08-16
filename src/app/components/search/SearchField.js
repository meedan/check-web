import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import cx from 'classnames/bind';
import Popover from '@material-ui/core/Popover';
import Dialog from '@material-ui/core/Dialog';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
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
    description: 'Placeholder for search keywords input"',
  },
});

const SearchField = ({
  intl,
  isActive,
  inputBaseProps,
  showExpand,
  setParentSearchText,
  searchText,
  handleClear,
  searchQuery,
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
      <TextField
        className={cx(
          styles['search-field'],
          {
            [styles['search-field-active']]: isActive,
          })
        }
        disabled={expand}
        inputProps={{
          name: 'search-input',
          id: 'search-input',
          ...inputBaseProps,
        }}
        iconLeft={<SearchIcon />}
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
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
      />
      { localSearchText || searchQuery?.file_type ? (
        <Tooltip title={<FormattedMessage id="search.clearSearch" defaultMessage="Clear search" description="Tooltip for button on main search component to remove the current search keywords" />}>
          <ButtonMain
            iconCenter={<ClearIcon />}
            variant="contained"
            size="small"
            theme="lightText"
            className={cx(styles['search-clear-button'])}
            onClick={handleClickClear}
          />
        </Tooltip>
      ) : null }
      { showExpand ? (
        <ButtonMain
          iconCenter={<OpenInFullIcon />}
          variant="contained"
          size="small"
          theme="lightText"
          className={cx(styles['search-expand-button'])}
          onClick={searchQuery?.file_type ? handleExpandMedia : handleExpand}
        />
      ) : null }
      <Popover
        className={cx(styles['search-expanded-popover'])}
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
      >
        <TextArea
          disabled={!expand}
          rows={5}
          onChange={(e) => {
            setLocalSearchText(e.target.value);
          }}
          value={localSearchText}
          label={
            <FormattedMessage id="search.expandedSearchLabel" defaultMessage="Enter search terms" description="Label for expanded search box with extra room for longer search strings" />
          }
        />
        <ButtonMain
          iconLeft={<ClearIcon />}
          size="default"
          variant="text"
          theme="text"
          onClick={handleClickClear}
          disabled={!localSearchText}
          label={
            <FormattedMessage id="search.clear" defaultMessage="Clear" description="A label on a button that lets a user clear typing search text, deleting the text in the process." />
          }
        />
      </Popover>
      <Dialog
        open={expandMedia}
        onClose={handleCloseExpandMedia}
        maxWidth="md"
        fullWidth
      >
        <ButtonMain
          iconCenter={<ClearIcon />}
          variant="contained"
          size="default"
          theme="text"
          aria-label="close"
          className={styles['close-media-button']}
          buttonProps={{
            id: 'search-field__close-button',
          }}
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
