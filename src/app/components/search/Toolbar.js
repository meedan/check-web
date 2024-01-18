import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';
import CreateProjectMedia from '../media/CreateMedia';
import Can from '../Can';

const StyledToolbar = styled.div`
  background-color: var(--otherWhite);
  height: 88px;
  padding: 0 16px 0 0;
  margin: 0;

  .toolbar__title {
    color: var(--textPrimary);
    margin: 16px;
  }

  .toolbar__flex-row {
    align-items: center;
    display: flex;
    height: 100%;

    .toolbar__row {
      align-items: center;
      display: flex;
    }
  }

  &.toolbar__factCheck {
    border-radius: 8px 8px 0 0;
    min-height: auto;
    position: sticky;
    top: 0;
    background: white;
    z-index: 100;

    .toolbar__row,
    .toolbar__title {
      width: 100%;
    }
  }
`;

const OffsetButton = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: row-reverse;
`;

const Toolbar = ({
  actions,
  title,
  page,
  team,
  search,
  resultType,
}) => {
  const perms = { permissions: team.permissions, permission: 'create ProjectMedia' };

  return (
    <StyledToolbar className={`toolbar toolbar__${resultType}`}>
      <div className="toolbar__flex-row">
        <div className="toolbar__row">
          <span className="toolbar__title">{title}</span>
          {actions}
        </div>
        { page === 'all-items' ? (
          <Can {...perms}>
            <OffsetButton>
              <CreateProjectMedia search={search} team={team} />
            </OffsetButton>
          </Can>
        ) : null}
      </div>
    </StyledToolbar>
  );
};

Toolbar.propTypes = {
  page: PropTypes.oneOf(['all-items', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published', 'list', 'feed', 'spam', 'trash']).isRequired, // FIXME Define listing types as a global constant
  // FIXME: Define other PropTypes
};

export default injectIntl(Toolbar);
