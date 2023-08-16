import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';
import CreateProjectMedia from '../media/CreateMedia';
import Can from '../Can';
import { units, Row, FlexRow } from '../../styles/js/shared';

const StyledToolbar = styled.div`
  background-color: var(--otherWhite);
  min-height: ${units(5)};
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
  flex: 1 1 auto;
  text-align: end;
`;

const Toolbar = ({
  actions,
  similarAction,
  title,
  project,
  page,
  team,
  search,
  resultType,
}) => {
  let perms = { permissions: {}, permission: '' };
  if (project) {
    perms = { permissions: project.permissions, permission: 'create Media' };
  } else if (team) {
    perms = { permissions: team.permissions, permission: 'create ProjectMedia' };
  }

  return (
    <StyledToolbar className={`toolbar toolbar__${resultType}`}>
      <FlexRow className="toolbar__flex-row">
        <Row className="toolbar__row">
          {similarAction}
          <span className="toolbar__title">{title}</span>
          {actions}
        </Row>
        {['trash', 'collection', 'list', 'imported-reports', 'tipline-inbox', 'spam', 'suggested-matches', 'feed', 'unmatched-media', 'published'].indexOf(page) === -1 && resultType !== 'feed' ? (
          <Can {...perms}>
            <OffsetButton>
              <CreateProjectMedia search={search} project={project} team={team} />
            </OffsetButton>
          </Can>
        ) : null}
      </FlexRow>
    </StyledToolbar>
  );
};

Toolbar.defaultProps = {
  page: undefined, // FIXME find a cleaner way to render Trash differently
};

Toolbar.propTypes = {
  page: PropTypes.oneOf(['trash', 'collection', 'folder', 'list', 'imported-reports', 'tipline-inbox', 'spam', 'suggested-matches', 'feed', 'unmatched-media', 'published']), // FIXME find a cleaner way to render Trash differently
  // FIXME: Define other PropTypes
};

export default injectIntl(Toolbar);
