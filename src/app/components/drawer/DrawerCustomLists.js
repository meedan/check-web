import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Collapse from '@material-ui/core/Collapse';
import cx from 'classnames/bind';
import SavedSearchesListItem from './SavedSearches/SavedSearchesListItem';
import NewSavedSearch from './SavedSearches/NewSavedSearch';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import AddIcon from '../../icons/add_filled.svg';
import ExpandLessIcon from '../../icons/chevron_down.svg';
import ExpandMoreIcon from '../../icons/chevron_right.svg';
import SharedFeedIcon from '../../icons/dynamic_feed.svg';
import ListIcon from '../../icons/list.svg';
import Can from '../Can';
import styles from './SavedSearches/SavedSearches.module.css';

const DrawerCustomListsComponent = ({
  listType,
  location,
  routePrefix,
  savedSearches,
  team,
}) => {
  const [showNewListDialog, setShowNewListDialog] = React.useState(false);
  const getBooleanPref = (key, fallback) => {
    const inStore = window.storage.getValue(key);
    if (inStore === null) return fallback;
    return (inStore === 'true');
  };
  const [listsExpanded, setListsExpanded] =
    React.useState(getBooleanPref('drawer.listsExpanded', true));
  // Get/set which list item should be highlighted
  const pathParts = window.location.pathname.split('/');
  const [activeItem, setActiveItem] = React.useState({ type: pathParts[2], id: parseInt(pathParts[3], 10) });
  React.useEffect(() => {
    const path = location.pathname.split('/');
    if (activeItem.type !== path[2] || activeItem.id !== path[3]) {
      setActiveItem({ type: path[2], id: parseInt(path[3], 10) });
    }
  }, [location.pathname]);

  const handleToggleListsExpand = () => {
    setListsExpanded(!listsExpanded);
    window.storage.set('drawer.listsExpanded', !listsExpanded);
  };
  return (
    <React.Fragment>
      {/* Lists Header */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <li className={cx(styles.listItem, styles.listHeader, styles.listItem_containsCount, 'project-list__header')} onClick={handleToggleListsExpand}>
        { listsExpanded ? <ExpandLessIcon className={styles.listIcon} /> : <ExpandMoreIcon className={styles.listIcon} /> }
        <div className={styles.listLabel}>
          <FormattedMessage defaultMessage="Custom Filtered Lists" description="List of items with some filters applied" id="drawerCustomLists.lists" tagName="span" />
        </div>
        <Can permission="create Project" permissions={team.permissions}>
          <Tooltip arrow title={<FormattedMessage defaultMessage="New Custom Filtered List" description="Tooltip for button that opens list creation dialog" id="drawerCustomLists.newListButton" />}>
            <div className={cx(styles.listItemCount, styles.listAddListButton)}>
              <ButtonMain
                buttonProps={{
                  id: 'projects-list__add-filtered-list',
                }}
                iconCenter={<AddIcon />}
                size="default"
                theme="text"
                variant="text"
                onClick={(e) => { setShowNewListDialog(true); e.stopPropagation(); }}
              />
            </div>
          </Tooltip>
        </Can>
      </li>

      {/* Lists */}
      <React.Fragment>
        <Collapse className={styles.listCollapseWrapper} in={listsExpanded}>
          { savedSearches.length === 0 ?
            <li className={cx(styles.listItem, styles.listItem_containsCount, styles.listItem_empty)}>
              <div className={styles.listLabel}>
                <span>
                  <FormattedMessage defaultMessage="No custom lists" description="Displayed under the custom list header when there are no lists in it" id="drawerCustomLists.noCustomLists" tagName="em" />
                </span>
              </div>
            </li> :
            <>
              {savedSearches.sort((a, b) => (a.title.localeCompare(b.title))).map(search => (
                <SavedSearchesListItem
                  icon={search.is_part_of_feeds ? <SharedFeedIcon className={`${styles.listIcon} ${styles.listIconFeed}`} /> : <ListIcon className={styles.listIcon} />}
                  isActive={activeItem.type === routePrefix && activeItem.id === search.dbid}
                  key={search.id}
                  project={search}
                  routePrefix={routePrefix}
                  teamSlug={team.slug}
                  tooltip={search.title}
                />
              ))}
            </>
          }
        </Collapse>
      </React.Fragment>

      {/* Dialog to create list */}

      <NewSavedSearch
        buttonLabel={<FormattedMessage defaultMessage="Create List" description="Label for a button to create a new list displayed on the left sidebar." id="drawerCustomLists.createList" />}
        errorMessage={<FormattedMessage defaultMessage="Could not create list, please try again" description="Error message when creating new list fails" id="drawerCustomLists.newListErrorMessage" />}
        listType={listType}
        open={showNewListDialog}
        routePrefix={routePrefix}
        successMessage={<FormattedMessage defaultMessage="Filtered List created successfully" description="Success message when new list is created" id="drawerCustomLists.newListSuccessMessage" />}
        team={team}
        title={<FormattedMessage defaultMessage="New Custom Filtered List" description="Title for a dialog to create a new list displayed on the left sidebar." id="drawerCustomLists.newList" />}
        onClose={() => { setShowNewListDialog(false); }}
      />
    </React.Fragment>
  );
};

DrawerCustomListsComponent.propTypes = {
  listType: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  routePrefix: PropTypes.string.isRequired,
  savedSearch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    filters: PropTypes.string.isRequired,
  }).isRequired,
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    slug: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired,
  }).isRequired,
};

const DrawerCustomLists = ({ listType, routePrefix, teamSlug }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query DrawerCustomListsQuery($teamSlug: String!, $listType: String!) {
        team(slug: $teamSlug) {
          dbid
          slug
          permissions
          saved_searches(first: 10000, list_type: $listType) {
            edges {
              node {
                id
                dbid
                title
                is_part_of_feeds
                ...SavedSearchesListItem_savedSearch
              }
            }
          }
        }
      }
    `}
    render={({ error, props }) => {
      if (!props || error) return null;

      const { location } = window;

      return (
        <DrawerCustomListsComponent
          listType={listType}
          location={location}
          routePrefix={routePrefix}
          savedSearches={props.team.saved_searches.edges.map(ss => ss.node)}
          team={props.team}
        />
      );
    }}
    variables={{ teamSlug, listType }}
  />
);

export default injectIntl(DrawerCustomLists);
