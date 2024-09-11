// DESIGNS: https://www.figma.com/file/rnSPSHDgFncxjXsZQuEVKd/Design-System?type=design&node-id=4295-43910&mode=design&t=ZVq51pKdIKdWZicO-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import TeamTagsQueryRenderer from '../../media/TeamTagsQueryRenderer';
import Chip from '../buttons-checkboxes-chips/Chip';
import Tooltip from '../alerts-and-prompts/Tooltip';
import styles from './TagList.module.css';

const TagList = ({
  maxTags,
  onClickTag,
  readOnly,
  setTags,
  tags,
  teamSlug,
}) => {
  const deleteTag = (deletedTag) => {
    const deleteIndex = tags.findIndex(tag => tag === deletedTag);
    const newTags = [...tags];
    newTags.splice(deleteIndex, 1);
    setTags(newTags);
  };

  const swallowClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles['tag-list-container']} onClick={swallowClick} onKeyDown={swallowClick}>
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
      <TeamTagsQueryRenderer
        readOnly={readOnly}
        setTags={setTags}
        tags={tags}
        teamSlug={teamSlug}
      />
    </div>
  );
};

TagList.defaultProps = {
  maxTags: Infinity,
  onClickTag: null,
  readOnly: false,
};

TagList.propTypes = {
  maxTags: PropTypes.number,
  readOnly: PropTypes.bool,
  setTags: PropTypes.func.isRequired,
  tags: PropTypes.array.isRequired,
  onClickTag: PropTypes.func,
};

export default TagList;
