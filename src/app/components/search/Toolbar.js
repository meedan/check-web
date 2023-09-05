import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';
import CreateProjectMedia from '../media/CreateMedia';
import Can from '../Can';
import { units, Row, FlexRow } from '../../styles/js/shared';

const StyledToolbar = styled.div`
  background-color: var(--otherWhite);
  height: ${units(7)};
  padding: 0 ${units(2)} 0 0;
  margin: 0;

  .toolbar__title {
    color: var(--textPrimary);
    margin: ${units(2)};
  }

  .toolbar__flex-row {
    height: 100%;
  }

  &.toolbar__factCheck {
    border-radius: 8px 8px 0 0;
    min-height: auto;
    position: sticky;
    top: 0;
    background: white;
    z-index: 100;

    .toolbar__row, .toolbar__title {
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
      <FlexRow className="toolbar__flex-row">
        <Row className="toolbar__row">
          <span className="toolbar__title">{title}</span>
          {actions}
        </Row>
        {['trash', 'list', 'imported-fact-checks', 'tipline-inbox', 'spam', 'suggested-matches', 'feed', 'unmatched-media', 'published'].indexOf(page) === -1 && resultType !== 'feed' ? (
          <Can {...perms}>
            <OffsetButton>
              <CreateProjectMedia search={search} team={team} />
            </OffsetButton>
          </Can>
        ) : null}
      </FlexRow>
    </StyledToolbar>
  );
};

Toolbar.propTypes = {
  page: PropTypes.oneOf(['all-items', 'tipline-inbox', 'imported-fact-checks', 'suggested-matches', 'unmatched-media', 'published', 'list', 'feed', 'spam', 'trash']).isRequired, // FIXME Define listing types as a global constant
  // FIXME: Define other PropTypes
};

export default injectIntl(Toolbar);
