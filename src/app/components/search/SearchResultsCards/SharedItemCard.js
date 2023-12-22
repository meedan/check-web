import React from 'react';
import PropTypes from 'prop-types';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import TeamAvatar from '../../team/TeamAvatar';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ItemDescription from '../../cds/media-cards/ItemDescription';
import ItemDate from '../../cds/media-cards/ItemDate';
import ItemThumbnail from '../SearchResultsTable/ItemThumbnail';
import styles from './ItemCard.module.css';

const SharedItemCard = ({
  title,
  description,
  date,
  factCheckUrl,
  mediaThumbnail,
  workspaces,
}) => {
  const maxWorkspaces = 5;
  const renderedWorkspaces = workspaces.slice(0, maxWorkspaces);
  const extraWorkspaces = workspaces.slice(maxWorkspaces, Infinity).map(workspace => <li>{workspace.name}</li>);

  return (
    <div className={`${styles.itemCard} shared-item--card`}>
      <Card>
        { mediaThumbnail && (
          <div className={styles.sharedItemCardLeft}>
            <ItemThumbnail picture={mediaThumbnail.media?.picture} maskContent={mediaThumbnail.show_warning_cover} type={mediaThumbnail.media?.type} url={mediaThumbnail.media?.url} />
          </div>)
        }
        <div className={styles.sharedItemCardMiddle}>
          <CardHoverContext.Consumer>
            { isHovered => (
              <ItemDescription title={title} description={description} factCheckUrl={factCheckUrl} showCollapseButton={isHovered} />
            )}
          </CardHoverContext.Consumer>
          <div className={styles.sharedItemCardWorkspaces}>
            {
              renderedWorkspaces.map(workspace => (
                <TeamAvatar team={{ avatar: workspace.url }} size="30px" />
              ))
            }
            <div className={styles.extraWorkspaces}>
              <Tooltip
                arrow
                title={<ul>{extraWorkspaces}</ul>}
                placement="right"
              >
                <span className="typography-body2">
                  +3
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className={styles.sharedItemCardRight}>
          { date ? <ItemDate date={date} /> : null }
        </div>
      </Card>
    </div>
  );
};

SharedItemCard.defaultProps = {
  description: null,
  factCheckUrl: null,
  date: null,
};

SharedItemCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  factCheckUrl: PropTypes.string,
  date: PropTypes.number, // Timestamp
};

export default SharedItemCard;

