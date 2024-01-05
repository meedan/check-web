import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, injectIntl, intlShape } from 'react-intl';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import TeamAvatar from '../../team/TeamAvatar';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ItemDescription from '../../cds/media-cards/ItemDescription';
import ItemDate from '../../cds/media-cards/ItemDate';
import ItemThumbnail from '../SearchResultsTable/ItemThumbnail';
import BulletSeparator from '../../layout/BulletSeparator';
import { getCompactNumber } from '../../../helpers';
import MediaIcon from '../../../icons/perm_media.svg';
import SuggestionsIcon from '../../../icons/question_answer.svg';
import styles from './ItemCard.module.css';

const SharedItemCard = ({
  date,
  description,
  factCheckUrl,
  intl,
  lastRequestDate,
  mediaCount,
  mediaThumbnail,
  suggestionsCount,
  title,
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
          <div>
            <BulletSeparator
              className={styles.bulletSeparator}
              compact
              details={[
                mediaCount && <ButtonMain
                  disabled
                  size="small"
                  theme="brand"
                  iconLeft={<MediaIcon />}
                  variant="contained"
                  label={getCompactNumber(intl.locale, mediaCount)}
                />,
                <ButtonMain
                  disabled
                  size="small"
                  theme="brand"
                  iconLeft={<SuggestionsIcon />}
                  variant="contained"
                  label={getCompactNumber(intl.locale, suggestionsCount)}
                />,
                <ButtonMain
                  disabled
                  size="small"
                  theme="brand"
                  iconLeft={<MediaIcon />}
                  variant="contained"
                  label={<FormattedDate value={lastRequestDate * 1000} year="numeric" month="long" day="numeric" />}
                />,
              ]}
            />
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
  mediaCount: null,
  suggestionsCount: null,
};

SharedItemCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  factCheckUrl: PropTypes.string,
  date: PropTypes.number, // Timestamp
  mediaCount: PropTypes.number,
  suggestionsCount: PropTypes.number,
  intl: intlShape.isRequired,
};

export default injectIntl(SharedItemCard);
