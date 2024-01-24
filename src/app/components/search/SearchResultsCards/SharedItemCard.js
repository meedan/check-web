import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import Card, { CardHoverContext } from '../../cds/media-cards/Card';
import TeamAvatar from '../../team/TeamAvatar';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ItemDescription from '../../cds/media-cards/ItemDescription';
import ItemDate from '../../cds/media-cards/ItemDate';
import ItemChannels from '../../cds/media-cards/ItemChannels';
import ItemRating from '../../cds/media-cards/ItemRating';
import ItemThumbnail from '../SearchResultsTable/ItemThumbnail';
import MediaCount from '../../cds/media-cards/MediaCount';
import RequestsCount from '../../cds/media-cards/RequestsCount';
import BulletSeparator from '../../layout/BulletSeparator';
import { getCompactNumber } from '../../../helpers';
import CalendarMonthIcon from '../../../icons/calendar_month.svg';
import FactCheckIcon from '../../../icons/fact_check.svg';
import CheckFeedDataPoints from '../../../CheckFeedDataPoints';
import styles from './ItemCard.module.css';

const SharedItemCard = ({
  channels,
  date,
  dataPoints,
  description,
  factCheckCount,
  factCheckUrl,
  intl,
  lastRequestDate,
  mediaCount,
  mediaThumbnail,
  mediaType,
  requestsCount,
  title,
  workspaces,
}) => {
  const maxWorkspaces = 5;
  const renderedWorkspaces = workspaces.slice(0, maxWorkspaces);
  const extraWorkspaces = workspaces.slice(maxWorkspaces, Infinity).map(workspace => <li>{workspace.name}</li>);

  const feedContainsFactChecks = dataPoints.includes(CheckFeedDataPoints.PUBLISHED_FACT_CHECKS);
  const feedContainsMediaRequests = dataPoints.includes(CheckFeedDataPoints.MEDIA_CLAIM_REQUESTS);

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
                <Tooltip
                  arrow
                  title={workspace.name}
                  placement="top"
                >
                  <span>
                    <TeamAvatar team={{ avatar: workspace.url }} size="30px" />
                  </span>
                </Tooltip>
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
                mediaCount && (
                  <MediaCount
                    mediaCount={mediaCount}
                    mediaType={mediaType}
                  />
                ),
                requestsCount && (
                  <RequestsCount
                    requestsCount={requestsCount}
                  />
                ),
                lastRequestDate && (
                  <FormattedMessage id="sharedItemCard.lastRequested" defaultMessage="Last Requested" description="This appears as a label before a date with a colon between them, like 'Last Requested: May 5, 2023'.">
                    { lastRequestDateLabel => (
                      <Tooltip
                        arrow
                        title={(
                          <>
                            <span>{lastRequestDateLabel}:</span>
                            <ul>
                              <li>{Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(lastRequestDate)}</li>
                              <li>{Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(lastRequestDate)}</li>
                            </ul>
                          </>
                        )}

                        placement="top"
                      >
                        <span>
                          <ButtonMain
                            disabled
                            size="small"
                            theme="brand"
                            iconLeft={<CalendarMonthIcon />}
                            variant="contained"
                            label={<FormattedDate value={lastRequestDate * 1000} year="numeric" month="long" day="numeric" />}
                          />
                        </span>
                      </Tooltip>
                    )}
                  </FormattedMessage>),
                channels && <ItemChannels channels={channels} sortMainFirst />,
              ]}
            />
          </div>
        </div>
        <div className={styles.sharedItemCardRight}>
          { (date && feedContainsMediaRequests && !feedContainsFactChecks) ? <ItemDate date={date} tooltipLabel={<FormattedMessage id="sharedItemCard.lastUpdated" defaultMessage="Last Updated" description="This appears as a label before a date with a colon between them, like 'Last Updated: May 5, 2023'." />} /> : null }
          { (factCheckCount && feedContainsMediaRequests && feedContainsFactChecks) ? (
            <ButtonMain
              disabled
              size="small"
              theme="brand"
              iconLeft={<FactCheckIcon />}
              variant="contained"
              label={<FormattedMessage
                id="sharedItemCard.factCheckCount"
                defaultMessage="{count} Fact-checks"
                description="A label showing the number of fact-checks represented in an item."
                values={{
                  count: getCompactNumber(intl.locale, factCheckCount),
                }}
              />}
            />
          ) : null }
          { (date && !feedContainsMediaRequests && feedContainsFactChecks) ? (
            <>
              <ItemRating rating="False" ratingColor="#f00" size="small" />
              <ItemDate date={date} tooltipLabel={<FormattedMessage id="sharedItemCard.lastUpdated" defaultMessage="Last Updated" description="This appears as a label before a date with a colon between them, like 'Last Updated: May 5, 2023'." />} />
            </>
          ) : null }
        </div>
      </Card>
    </div>
  );
};

SharedItemCard.defaultProps = {
  channels: null,
  dataPoints: [],
  date: null,
  description: null,
  factCheckCount: null,
  factCheckUrl: null,
  lastRequestDate: null,
  mediaCount: null,
  mediaThumbnail: null,
  mediaType: null,
  requestsCount: null,
};

SharedItemCard.propTypes = {
  channels: PropTypes.exact({
    main: PropTypes.number,
    others: PropTypes.arrayOf(PropTypes.number),
  }),
  dataPoints: PropTypes.arrayOf(PropTypes.number),
  date: PropTypes.instanceOf(Date),
  description: PropTypes.string,
  factCheckCount: PropTypes.number,
  factCheckUrl: PropTypes.string,
  intl: intlShape.isRequired,
  lastRequestDate: PropTypes.instanceOf(Date),
  mediaCount: PropTypes.number,
  mediaThumbnail: PropTypes.exact({
    media: PropTypes.exact({
      picture: PropTypes.string, // url
      type: PropTypes.string,
      url: PropTypes.string,
    }),
    show_warning_cover: PropTypes.bool,
  }),
  mediaType: PropTypes.string,
  requestsCount: PropTypes.number,
  title: PropTypes.string.isRequired,
  workspaces: PropTypes.arrayOf(PropTypes.exact({
    name: PropTypes.string,
    url: PropTypes.string,
  })).isRequired,
};

export default injectIntl(SharedItemCard);
