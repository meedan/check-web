import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import SaveTag from './SaveTag';
import TeamTagsActions from './TeamTagsActions';
import BlankState from '../../layout/BlankState';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import NextIcon from '../../../icons/chevron_right.svg';
import PrevIcon from '../../../icons/chevron_left.svg';
import SearchField from '../../search/SearchField';
import TimeBefore from '../../TimeBefore';
import SettingsHeader from '../SettingsHeader';
import Loader from '../../cds/loading/Loader';
import Can from '../../Can';
import styles from './TeamTagsComponent.module.css';
import settingsStyles from '../Settings.module.css';

const TeamTagsComponent = ({
  pageSize,
  permissions,
  relay,
  rules,
  rulesSchema,
  searchTerm,
  setSearchTerm,
  tags,
  teamDbid,
  teamId,
  totalCount,
  totalTags,
}) => {
  const [showCreateTag, setShowCreateTag] = React.useState(false);
  const [cursor, setCursor] = React.useState(0);
  const [isPaginationLoading, setIsPaginationLoading] = React.useState(false);

  const handleSearchFieldClear = () => {
    setSearchTerm('');
  };

  return (
    <>
      <SettingsHeader
        actionButton={
          <Can permission="create TagText" permissions={permissions}>
            <ButtonMain
              buttonProps={{
                id: 'team-tags__create',
              }}
              label={
                <FormattedMessage
                  defaultMessage="New tag"
                  description="Button label for calling the new tag creation modal"
                  id="teamTagsComponent.newTag"
                />
              }
              size="default"
              theme="info"
              variant="contained"
              onClick={() => { setShowCreateTag(true); }}
            />
          </Can>
        }
        context={
          <FormattedHTMLMessage
            defaultMessage='Automatically categorize items by keyword. <a href="{helpLink}" target="_blank" title="Learn more">Learn more about tags</a>.'
            description="Context description for the functionality of this page"
            id="teamTagsComponent.helpContext"
            values={{ helpLink: 'https://help.checkmedia.org/en/articles/8720966-tags' }}
          />
        }
        extra={
          <SearchField
            handleClear={handleSearchFieldClear}
            inputBaseProps={{
              onBlur: (e) => { setSearchTerm(e.target.value); },
            }}
            searchText={searchTerm}
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Tags [{count}]"
            description="Title for the tags settings page"
            id="teamTagsComponent.title"
            values={{ count: totalTags }}
          />
        }
      />
      { totalTags > pageSize && // only display paginator if there are more than pageSize worth of tags overall in the database
        <div className={styles['tags-wrapper']}>
          <Tooltip
            arrow
            title={
              <FormattedMessage defaultMessage="Previous page" description="Pagination button to go to previous page" id="search.previousPage" />
            }
          >
            <span>
              <ButtonMain
                disabled={isPaginationLoading || cursor - pageSize < 0}
                iconCenter={<PrevIcon />}
                size="default"
                theme="info"
                variant="text"
                onClick={() => {
                  if (cursor - pageSize >= 0) {
                    setCursor(cursor - pageSize);
                  }
                }}
              />
            </span>
          </Tooltip>
          <span className={cx('typography-button', styles['tags-header-count'])}>
            <FormattedMessage
              defaultMessage="{totalCount, plural, one {1 / 1} other {{from} - {to} / #}}"
              description="Pagination count of items returned"
              id="searchResults.itemsCount"
              values={{
                from: cursor + 1,
                to: Math.min(cursor + pageSize, totalCount),
                totalCount,
              }}
            />
          </span>
          <Tooltip
            title={
              <FormattedMessage defaultMessage="Next page" description="Pagination button to go to next page" id="search.nextPage" />
            }
          >
            <span>
              <ButtonMain
                disabled={isPaginationLoading || cursor + pageSize >= totalCount}
                iconCenter={<NextIcon />}
                size="default"
                theme="info"
                variant="text"
                onClick={() => {
                  if (relay.hasMore() && !relay.isLoading() && (cursor + pageSize >= tags.length)) {
                    setIsPaginationLoading(true);
                    relay.loadMore(pageSize, () => {
                      setCursor(cursor + pageSize);
                      setIsPaginationLoading(false);
                    });
                  } else if (cursor + pageSize < tags.length) {
                    setCursor(cursor + pageSize);
                  }
                }}
              />
            </span>
          </Tooltip>
        </div>
      }
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        {totalTags === 0 ?
          <BlankState>
            <FormattedMessage
              defaultMessage="No Workspace Tags"
              description="Message displayed when there are no tags in the workspace"
              id="teamTagsComponent.blank"
            />
          </BlankState>
          :
          <div className={settingsStyles['setting-content-container']}>
            { isPaginationLoading &&
              <div className={styles['tags-loader']}>
                <Loader size="small" theme="grey" variant="inline" />
              </div>
            }
            <ul className={settingsStyles['setting-content-list']}>
              { tags.slice(cursor, cursor + pageSize).map(tag => (
                <li className="team-tags__row" key={tag.id}>
                  <div>
                    <strong>{tag.text}</strong>
                    <br />
                    <Tooltip
                      arrow
                      title={
                        <FormattedMessage defaultMessage="Last Updated: {count}" description="The date the last time this tag was updated" id="teamTagsComponent.lastUpdated" values={{ count: tag.updated_at }} />
                      }
                    >
                      <small>
                        <TimeBefore date={tag.updated_at} />
                      </small>
                    </Tooltip>
                  </div>
                  <Can permission="create TagText" permissions={permissions}>
                    <div className={settingsStyles['setting-content-list-actions']}>
                      <TeamTagsActions
                        pageSize={pageSize}
                        relay={relay}
                        rules={rules}
                        rulesSchema={rulesSchema}
                        tag={tag}
                        teamDbid={teamDbid}
                        teamId={teamId}
                      />
                    </div>
                  </Can>
                </li>
              ))}
            </ul>
          </div>
        }
      </div>
      { showCreateTag ?
        <SaveTag
          pageSize={pageSize}
          relay={relay}
          rules={rules}
          rulesSchema={rulesSchema}
          tag={null}
          teamDbid={teamDbid}
          teamId={teamId}
          onCancel={() => { setShowCreateTag(false); }}
        /> : null }
    </>
  );
};

TeamTagsComponent.defaultProps = {
  rules: [],
};

TeamTagsComponent.propTypes = {
  pageSize: PropTypes.number.isRequired,
  permissions: PropTypes.string.isRequired,
  rules: PropTypes.arrayOf(PropTypes.object),
  rulesSchema: PropTypes.object.isRequired,
  tags: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    updated_at: PropTypes.object.isRequired, // Date object
  }).isRequired).isRequired,
  teamDbid: PropTypes.number.isRequired,
  teamId: PropTypes.string.isRequired,
};

export default TeamTagsComponent;
