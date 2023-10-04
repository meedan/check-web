// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=4295-43910&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import Popover from '@material-ui/core/Popover';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import MultiSelector from '../../layout/MultiSelector';
import styles from './TagList.module.css';
import Chip from '../buttons-checkboxes-chips/Chip';
import Tooltip from '../alerts-and-prompts/Tooltip';
import LocalOfferIcon from '../../../icons/local_offer.svg';
import AddCircleIcon from '../../../icons/add_circle.svg';

const TagList = ({
  readOnly,
  options: teamTags,
  tags,
  setTags,
  maxTags,
  onClickTag,
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
  const selected = tags;

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
      className="int-tag-list__button--create"
      theme="brand"
      variant="text"
      size="default"
      onClick={() => handleAddNew(searchValue)}
      label={
        <FormattedMessage id="tagList.create" defaultMessage="+ Create search tags" description="A label for a button that allows people to create a new tag based on text they have typed into an adjacent tag search bar when there are no search results." />
      }
      buttonProps={{
        id: 'tag-menu__create-button',
      }}
    />
  );

  return (
    <div className={styles['grid-wrapper']}>
      <Tooltip
        disableHoverListener={readOnly}
        placement="top"
        title={
          <FormattedMessage
            id="taglist.tooltipManage"
            defaultMessage="Manage Tags"
            description="Tooltip message displayed on a tag item to let the user know they can manage the tags in the list"
          />
        }
        arrow
      >
        <span>
          <ButtonMain
            iconCenter={<LocalOfferIcon />}
            variant="text"
            theme="text"
            size="small"
            disabled={readOnly}
            className={`int-tag-list__button--manage ${styles['tag-icon']}`}
            onClick={readOnly ? undefined : handleOpenMenu}
          />
        </span>
      </Tooltip>
      <Popover
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        className={styles['tag-list-manager']}
      >
        <FormattedMessage id="multiSelector.search" defaultMessage="Search…" description="The placeholder text in a search box.">
          {placeholder => (
            <MultiSelector
              actionButton={actionButton}
              allowSearch
              inputPlaceholder={placeholder}
              selected={selected}
              options={options}
              cancelLabel={
                <FormattedMessage
                  id="global.cancel"
                  defaultMessage="Cancel"
                  description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
                />
              }
              onDismiss={handleCloseMenu}
              onSearchChange={handleSearchChange}
              onSubmit={handleSubmit}
              notFoundLabel={
                <FormattedMessage
                  id="tagList.notFound"
                  defaultMessage="No tags found"
                  description="A message that appears when a user has searched for tag text but no matches have been found."
                />
              }
              submitLabel={
                <FormattedMessage
                  id="tagList.submit"
                  defaultMessage="Tag"
                  description="Verb, infinitive form. Button to commit action of tagging an item"
                />
              }
            />
          )}
        </FormattedMessage>
      </Popover>
      <div
        className={`${styles['tag-list-container']}`}
      >
        { tags.length > 0 && tags.map(tag => (
          <Chip
            label={tag}
            className="tag-list__chip"
            key={tag}
            onClick={onClickTag ? () => onClickTag(tag) : null}
            onRemove={!readOnly ? () => {
              deleteTag(tag);
            } : null}
          />
        )).slice(0, maxTags)}
        {
          (tags.length > maxTags) && (
            <Tooltip title={tags.slice(maxTags).join(', ')}>
              <div id="hidden-tags" className={styles['tooltip-container']}>
                <Chip
                  label={`+${tags.length - maxTags}`}
                />
              </div>
            </Tooltip>
          )
        }
        {
          tags.length === 0 && (
            <em id="empty-list" className={cx('typography-body2', styles['empty-list'])}>
              <FormattedMessage
                id="tagList.empty"
                defaultMessage="0 tags"
                description="A message that appears in a lag list when there are no available tags to display."
              />
            </em>
          )
        }
      </div>
      { !readOnly &&
        <Tooltip
          placement="top"
          title={
            <FormattedMessage
              id="taglist.tooltipAdd"
              defaultMessage="Add Tags"
              description="Tooltip message displayed on a tag item to let the user know they can add new tags to the list"
            />
          }
          arrow
        >
          <span>
            <ButtonMain
              iconCenter={<AddCircleIcon />}
              variant="text"
              theme="text"
              size="small"
              className={`int-tag-list__button--add ${styles['circle-icon']}`}
              onClick={handleOpenMenu}
            />
          </span>
        </Tooltip>
      }
    </div>
  );
};

TagList.defaultProps = {
  readOnly: false,
  maxTags: Infinity,
  onClickTag: null,
  options: null,
};

TagList.propTypes = {
  readOnly: PropTypes.bool,
  setTags: PropTypes.func.isRequired,
  options: PropTypes.array,
  tags: PropTypes.array.isRequired,
  maxTags: PropTypes.number,
  onClickTag: PropTypes.func,
};

export default TagList;
