import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import cx from 'classnames/bind';
import DrawerListCounter from './DrawerListCounter';
import styles from './SavedSearches.module.css';

const SavedSearchesListItem = ({
  className,
  icon,
  isActive,
  onClick,
  routePrefix,
  routeSuffix,
  savedSearch,
  teamSlug,
  tooltip,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(routePrefix, savedSearch.dbid);
    }
  };

  const Item = listItemProps => (
    <Link
      className={styles.linkList}
      to={`/${teamSlug}/${routePrefix}/${savedSearch.dbid}${routeSuffix}`}
      onClick={handleClick}
    >
      <li
        className={cx(
          'save-search-list__link',
          styles.listItem,
          styles.listItem_containsCount,
          {
            [className]: true,
            [styles.listItem_active]: isActive,
          })
        }
        key={`${savedSearch.id}-${savedSearch.title}`}
        title={tooltip}
        {...listItemProps}
      >
        {icon}
        <div
          className={cx(
            styles.listLabel,
            {
              [styles.listLabel_plainText]: !icon,
            })
          }
        >
          <span>
            {savedSearch.title || savedSearch.name}
          </span>
        </div>
        <DrawerListCounter numberOfItems={savedSearch.medias_count} />
      </li>
    </Link>
  );

  return <Item />;
};

SavedSearchesListItem.defaultProps = {
  className: '',
  icon: null,
  isActive: false,
  routeSuffix: '',
  tooltip: null,
  onClick: null,
};

SavedSearchesListItem.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.node,
  isActive: PropTypes.bool,
  routePrefix: PropTypes.string.isRequired,
  routeSuffix: PropTypes.string,
  savedSearch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    title: PropTypes.string,
    name: PropTypes.string,
    medias_count: PropTypes.number,
  }).isRequired,
  teamSlug: PropTypes.string.isRequired,
  tooltip: PropTypes.node,
  onClick: PropTypes.func,
};

export default createFragmentContainer(SavedSearchesListItem, graphql`
  fragment SavedSearchesListItem_savedSearch on SavedSearch {
    dbid
    title
    medias_count: items_count
  }
`);
