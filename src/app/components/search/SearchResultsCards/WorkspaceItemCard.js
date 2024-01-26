import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import ItemThumbnail from '../SearchResultsTable/ItemThumbnail';
import ItemDescription from '../../cds/media-cards/ItemDescription';
import styles from './ItemCard.module.css';

const WorkspaceItemCard = ({
  description,
  factCheckUrl,
  isUnread,
  mediaThumbnail,
  title,
}) => {
  // eslint-disable-next-line
  console.log('~~~',isUnread);

  return (
    <div className={cx(styles.itemCard, 'workspace-item--card')}>
      <Card className={cx({ [styles.listItemUnread]: isUnread })}>
        <div className={styles.sharedItemCardLeft}>
          <ItemThumbnail picture={mediaThumbnail?.media?.picture} maskContent={mediaThumbnail?.show_warning_cover} type={mediaThumbnail?.media?.type} url={mediaThumbnail?.media?.url} />
        </div>
        <div className={styles.sharedItemCardMiddle}>
          <CardHoverContext.Consumer>
            { isHovered => (
              <ItemDescription title={title} description={description} factCheckUrl={factCheckUrl} showCollapseButton={isHovered} />
            )}
          </CardHoverContext.Consumer>
        </div>
      </Card>
    </div>
  );
};

WorkspaceItemCard.defaultProps = {
  description: null,
  factCheckUrl: null,
  isUnread: false,
  mediaThumbnail: null,
};


WorkspaceItemCard.propTypes = {
  description: PropTypes.string,
  factCheckUrl: PropTypes.string,
  isUnread: PropTypes.bool,
  mediaThumbnail: PropTypes.exact({
    media: PropTypes.exact({
      picture: PropTypes.string, // url
      type: PropTypes.string,
      url: PropTypes.string,
    }),
    show_warning_cover: PropTypes.bool,
  }),
  title: PropTypes.string.isRequired,
};

export default WorkspaceItemCard;
