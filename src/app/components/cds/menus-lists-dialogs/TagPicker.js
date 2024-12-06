// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=4295-43910&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Popover from '@material-ui/core/Popover';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import MultiSelector from '../../layout/MultiSelector';
import Tooltip from '../alerts-and-prompts/Tooltip';
import TagMoreIcon from '../../../icons/tag_add.svg';
import Loader from '../../cds/loading/Loader';
import styles from './TagList.module.css';

const TagPicker = ({
  customCreateLabel,
  hasMore,
  loadMore,
  loading,
  options: teamTags,
  readOnly,
  saving,
  searchTerm,
  setSearchTerm,
  setTags,
  tags,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchValue, setSearchValue] = React.useState(searchTerm);

  // MultiSelector requires an options array of objects with label and tag
  const options = teamTags || tags.map(tag => ({ label: tag, value: tag }));

  const swallowClick = e => e.stopPropagation();
  const handleOpenMenu = e => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => {
    setSearchTerm('');
    setAnchorEl(null);
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
    if (setSearchTerm) {
      setSearchTerm(value);
    }
  };

  const handleLoadMore = () => loadMore();

  const handleSubmit = (newSelectedItems) => {
    setTags(newSelectedItems);
    handleCloseMenu();
  };

  const handleAddNew = (value) => {
    if (value.trim() === '') {
      return;
    }
    const newTags = [...tags];
    newTags.push(value);
    // silently merge non-unique items
    setTags([...new Set(newTags)]);
    handleCloseMenu();
  };

  const actionButton = (
    <ButtonMain
      buttonProps={{
        id: 'tag-menu__create-button',
      }}
      className="int-tag-list__button--create"
      label={
        customCreateLabel || <FormattedMessage defaultMessage="+ Create search tags" description="A label for a button that allows people to create a new tag based on text they have typed into an adjacent tag search bar when there are no search results." id="tagList.create" />
      }
      size="default"
      theme="info"
      variant="text"
      onClick={() => handleAddNew(searchValue)}
    />
  );

  return (
    <div className={styles['tag-list-container']} onClick={swallowClick} onKeyDown={swallowClick}>
      <Popover
        anchorEl={anchorEl}
        className={styles['tag-list-manager']}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <FormattedMessage defaultMessage="Search…" description="The placeholder text in a search box." id="multiSelector.search">
          {placeholder => (
            <MultiSelector
              actionButton={actionButton}
              allowSearch
              cancelLabel={
                <FormattedMessage
                  defaultMessage="Cancel"
                  description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
                  id="global.cancel"
                />
              }
              hasMore={hasMore}
              inputPlaceholder={placeholder}
              loadingIcon={loading && <Loader size="small" theme="grey" variant="inline" />}
              notFoundLabel={
                <FormattedMessage
                  defaultMessage="No tags found"
                  description="A message that appears when a user has searched for tag text but no matches have been found."
                  id="tagList.notFound"
                />
              }
              options={options}
              selected={tags}
              submitLabel={
                <FormattedMessage
                  defaultMessage="Tag"
                  description="Verb, infinitive form. Button to commit action of tagging an item"
                  id="tagList.submit"
                />
              }
              onDismiss={handleCloseMenu}
              onScrollBottom={handleLoadMore}
              onSearchChange={handleSearchChange}
              onSubmit={handleSubmit}
            />
          )}
        </FormattedMessage>
      </Popover>
      { !readOnly &&
        <Tooltip
          arrow
          placement="top"
          title={
            <FormattedMessage
              defaultMessage="Manage Tags"
              description="Tooltip message displayed on a tag item to let the user know they can manage the tags in the list"
              id="taglist.tooltipManage"
            />
          }
        >
          <div>
            <ButtonMain
              className="int-tag-list__button--manage"
              iconCenter={<TagMoreIcon />}
              size="small"
              theme="lightText"
              variant="contained"
              onClick={handleOpenMenu}
            />
          </div>
        </Tooltip>
      }
      { saving && <Loader size="icon" theme="grey" variant="icon" /> }
    </div>
  );
};

TagPicker.defaultProps = {
  customCreateLabel: null,
  hasMore: false,
  loadMore: () => {},
  options: null,
  readOnly: false,
  saving: false,
  searchTerm: '',
  setSearchTerm: null,
};

TagPicker.propTypes = {
  customCreateLabel: PropTypes.node,
  hasMore: PropTypes.bool,
  loadMore: PropTypes.func,
  options: PropTypes.array,
  readOnly: PropTypes.bool,
  saving: PropTypes.bool,
  searchTerm: PropTypes.string,
  setSearchTerm: PropTypes.func,
  setTags: PropTypes.func.isRequired,
  tags: PropTypes.array.isRequired,
};

export default TagPicker;
