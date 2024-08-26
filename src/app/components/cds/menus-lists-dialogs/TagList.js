/* eslint-disable react/sort-prop-types */
// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=4295-43910&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import Popover from '@material-ui/core/Popover';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import MultiSelector from '../../layout/MultiSelector';
import Chip from '../buttons-checkboxes-chips/Chip';
import Tooltip from '../alerts-and-prompts/Tooltip';
import TagMoreIcon from '../../../icons/tag_add.svg';
import MediasLoading from '../../media/MediasLoading';
import styles from './TagList.module.css';

const TagList = ({
  customCreateLabel,
  maxTags,
  onClickTag,
  options: teamTags,
  readOnly,
  saving,
  setTags,
  tags,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchValue, setSearchValue] = React.useState('');

  const deleteTag = (deletedTag) => {
    const deleteIndex = tags.findIndex(tag => tag === deletedTag);
    const newTags = [...tags];
    newTags.splice(deleteIndex, 1);
    setTags(newTags);
  };

  const handleOpenMenu = (e) => {
    setMenuOpen(true);
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
    setAnchorEl(null);
  };

  const handleSearchChange = value => setSearchValue(value);
  const handleSubmit = (newSelectedItems) => {
    setTags(newSelectedItems);
    handleCloseMenu();
  };

  // MultiSelector requires an options array of objects with label and tag
  const options = teamTags || tags.map(tag => ({ label: tag, value: tag }));
  const selected = [...tags];

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

  const swallowClick = (e) => {
    e.stopPropagation();
  };
  // Should load 100 tags and allow search by keyword.
  return (
    <div className={styles['tag-list-container']} onClick={swallowClick} onKeyDown={swallowClick}>
      <Popover
        anchorEl={anchorEl}
        className={styles['tag-list-manager']}
        open={menuOpen}
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
              inputPlaceholder={placeholder}
              notFoundLabel={
                <FormattedMessage
                  defaultMessage="No tags found"
                  description="A message that appears when a user has searched for tag text but no matches have been found."
                  id="tagList.notFound"
                />
              }
              options={options}
              selected={selected}
              submitLabel={
                <FormattedMessage
                  defaultMessage="Tag"
                  description="Verb, infinitive form. Button to commit action of tagging an item"
                  id="tagList.submit"
                />
              }
              onDismiss={handleCloseMenu}
              onSearchChange={handleSearchChange}
              onSubmit={handleSubmit}
            />
          )}
        </FormattedMessage>
      </Popover>
      { tags.length > 0 && tags.map(tag => (
        <Chip
          className="tag-list__chip"
          key={tag}
          label={tag}
          onClick={onClickTag ? () => onClickTag(tag) : null}
          onRemove={!readOnly ? () => {
            deleteTag(tag);
          } : null}
        />
      )).slice(0, maxTags)}
      {
        (tags.length > maxTags) && (
          <Tooltip arrow title={tags.slice(maxTags).join(', ')}>
            <div className={styles['tooltip-container']} id="hidden-tags">
              <Chip
                label={`+${tags.length - maxTags}`}
              />
            </div>
          </Tooltip>
        )
      }
      {
        tags.length === 0 && (
          <em className={cx('typography-body2', styles['empty-list'])} id="empty-list" >
            <FormattedMessage
              defaultMessage="0 tags"
              description="A message that appears in a lag list when there are no available tags to display."
              id="tagList.empty"
            />
          </em>
        )
      }
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
      { saving && <MediasLoading size="icon" theme="grey" variant="icon" /> }
    </div>
  );
};

TagList.defaultProps = {
  readOnly: false,
  maxTags: Infinity,
  onClickTag: null,
  options: null,
  saving: false,
  customCreateLabel: null,
};

TagList.propTypes = {
  readOnly: PropTypes.bool,
  setTags: PropTypes.func.isRequired,
  options: PropTypes.array,
  tags: PropTypes.array.isRequired,
  maxTags: PropTypes.number,
  onClickTag: PropTypes.func,
  saving: PropTypes.bool,
  customCreateLabel: PropTypes.node,
};

export default TagList;
