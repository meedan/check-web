import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import cx from 'classnames/bind';
import CreateProjectMedia from '../media/CreateMedia';
import Can from '../Can';
import styles from './SearchResults.module.css';

const Toolbar = ({
  title,
  page,
  team,
  search,
  resultType,
}) => {
  const perms = { permissions: team.permissions, permission: 'create ProjectMedia' };

  return (
    <div className={cx(styles['search-results-toolbar'], 'toolbar', `toolbar__${resultType}`)}>
      {title}
      { page === 'all-items' ? (
        <Can {...perms}>
          <div className={styles['search-results-add-item']}>
            <CreateProjectMedia search={search} team={team} />
          </div>
        </Can>
      ) : null}
    </div>
  );
};

Toolbar.propTypes = {
  page: PropTypes.oneOf(['all-items', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published', 'list', 'feed', 'spam', 'trash', 'assigned-to-me']).isRequired, // FIXME Define listing types as a global constant
  // FIXME: Define other PropTypes
};

export default injectIntl(Toolbar);
