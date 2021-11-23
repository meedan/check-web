import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';
import CreateProjectMedia from '../media/CreateMedia';
import ViewModeSwitcher from './ViewModeSwitcher';
import Can from '../Can';
import { black87, units, Row, FlexRow } from '../../styles/js/shared';

const StyledToolbar = styled.div`
  background-color: white;
  min-height: ${units(5)};
  /* max-width: calc(100vw - ${units(34)}); Seems unecessary */
  padding: 0 ${units(2)} ${units(2)} ${units(2)};
  margin: 0;

  .toolbar__title {
    color: ${black87};
    margin: ${units(2)};
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
  viewMode,
  onChangeViewMode,
}) => {
  let perms = { permissions: {}, permission: '' };
  if (project) {
    perms = { permissions: project.permissions, permission: 'create Media' };
  } else if (team) {
    perms = { permissions: team.permissions, permission: 'create ProjectMedia' };
  }

  return (
    <StyledToolbar className="toolbar">
      <FlexRow>
        <Row>
          {similarAction}
          <span className="toolbar__title">{title}</span>
          {actions}
          <ViewModeSwitcher viewMode={viewMode} onChangeViewMode={onChangeViewMode} />
        </Row>
        {['trash', 'unconfirmed', 'collection', 'list', 'imported-reports', 'tipline-inbox'].indexOf(page) === -1 && resultType !== 'trends' ? (
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
  viewMode: 'shorter',
};

Toolbar.propTypes = {
  page: PropTypes.oneOf(['trash', 'unconfirmed', 'collection', 'folder', 'list', 'imported-reports', 'tipline-inbox']), // FIXME find a cleaner way to render Trash differently
  viewMode: PropTypes.oneOf(['shorter', 'longer']),
  onChangeViewMode: PropTypes.func.isRequired,
  // FIXME: Define other PropTypes
};

export default injectIntl(Toolbar);
