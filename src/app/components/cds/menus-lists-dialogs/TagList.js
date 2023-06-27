import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import { MultiSelector } from '@meedan/check-ui';
import styles from './TagList.module.css';
import Chip from '../buttons-checkboxes-chips/Chip';
import LocalOfferIcon from '../../../icons/local_offer.svg';
import AddCircleIcon from '../../../icons/add_circle.svg';

const TagList = ({
  tags,
  setTags,
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
    setTags(tags.filter(tag => newSelectedItems.includes(tag)));
    handleCloseMenu();
  };

  // MultiSelector requires an options array of objects with label and tag
  const options = tags.map(tag => ({ label: tag, value: tag }));
  const selected = tags;

  const handleAddNew = (value) => {
    tags.push(value);
    // silently merge non-unique items
    setTags([...new Set(tags)]);
    handleCloseMenu();
  };

  const actionButton = (
    <Button
      id="tag-menu__create-button"
      color="primary"
      onClick={() => handleAddNew(searchValue)}
    >
      <FormattedMessage id="tagList.create" defaultMessage="+ Create this tag" description="A label for a button that allows people to create a new tag based on text they have typed into an adjacent tag search bar when there are no search results." />
    </Button>
  );

  return (
    <div className={`${styles['grid-wrapper']}`} >
      <LocalOfferIcon className={`${styles['tag-icon']}`} onClick={handleOpenMenu} />
      <Popover
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
      >
        <FormattedMessage id="multiSelector.search" defaultMessage="Search…" description="The placeholder text in a search box.">
          {placeholder => (
            <MultiSelector
              actionButton={actionButton}
              allowSearch
              inputPlaceholder={placeholder}
              selected={selected}
              options={options}
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
            key={tag}
            onRemove={() => {
              deleteTag(tag);
            }}
            removable
          />
        ))}
        {
          tags.length === 0 && (
            <span className={`typography-body2-italic ${styles['empty-list']}`}>
              <FormattedMessage
                id="tagList.empty"
                defaultMessage="0 tags"
                description="A message that appears in a lag list when there are no available tags to display."
              />
            </span>
          )
        }
      </div>
      <AddCircleIcon className={`${styles['circle-icon']}`} />
    </div>
  );
};

TagList.defaultProps = {
};

TagList.propTypes = {
  setTags: PropTypes.func.isRequired,
  tags: PropTypes.array.isRequired,
};

export default TagList;
