import React from 'react';
import PropTypes from 'prop-types';
import styles from './TagList.module.css';
import Chip from '../buttons-checkboxes-chips/Chip';
import LocalOfferIcon from '../../../icons/local_offer.svg';
import AddCircleIcon from '../../../icons/add_circle.svg';

const TagList = ({
  allTags,
  tags,
  setTags,
}) => {
  // eslint-disable-next-line
  console.log('~~~',allTags);
  const deleteTag = (id) => {
    const deleteIndex = tags.findIndex(tag => tag.id === id);
    const newTags = [...tags];
    newTags.splice(deleteIndex, 1);
    setTags(newTags);
  };

  return (
    <div className={`${styles['grid-wrapper']}`} >
      <LocalOfferIcon className={`${styles['tag-icon']}`} />
      <div
        className={`${styles['tag-list-container']}`}
      >
        { tags.map(tag => (
          <Chip
            label={tag.label}
            key={tag.id}
            onRemove={() => {
              deleteTag(tag.id);
            }}
            removable
          />
        ))}
      </div>
      <AddCircleIcon className={`${styles['circle-icon']}`} />
    </div>
  );
};

TagList.defaultProps = {
};

TagList.propTypes = {
  allTags: PropTypes.array.isRequired,
  setTags: PropTypes.func.isRequired,
  tags: PropTypes.array.isRequired,
};

export default TagList;
