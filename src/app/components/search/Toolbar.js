import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';
import CreateProjectMedia from '../media/CreateProjectMedia';
import Can from '../Can';
import { black87, units, Row, FlexRow } from '../../styles/js/shared';

const StyledToolbar = styled.div`
  background-color: white;
  min-height: ${units(5)};
  padding: ${units(2)};

  .toolbar__title {
    color: ${black87};
    margin: ${units(2)} ${units(2)} ${units(2)} 0;
  }
`;

const OffsetButton = styled.div`
  flex: 1 1 auto;
  text-align: end;
`;

class Toolbar extends React.PureComponent {
  render() {
    const {
      actions,
      title,
      project,
      page,
      team,
      search,
    } = this.props;

    const perms = project
      ? { permissions: project.permissions, permission: 'create Media' }
      : { permissions: team.permissions, permission: 'create ProjectMedia' };

    return (
      <StyledToolbar className="toolbar">
        <FlexRow>
          <Row>
            <span className="toolbar__title">{title}</span>
            {actions}
          </Row>
          {page !== 'trash' ? (
            <Can {...perms}>
              <OffsetButton>
                <CreateProjectMedia search={search} project={project} team={team} />
              </OffsetButton>
            </Can>
          ) : null}
        </FlexRow>
      </StyledToolbar>
    );
  }
}

Toolbar.defaultProps = {
  page: undefined, // FIXME find a cleaner way to render Trash differently
  project: null,
};
Toolbar.propTypes = {
  actions: PropTypes.node.isRequired,
  page: PropTypes.oneOf(['trash']), // FIXME find a cleaner way to render Trash differently
  project: PropTypes.shape({
    permissions: PropTypes.string.isRequired,
  }), // or null
  team: PropTypes.shape({
    permissions: PropTypes.string.isRequired,
  }).isRequired,
};

export default createFragmentContainer(injectIntl(Toolbar), graphql`
  fragment Toolbar_project on Project {
    ...CreateProjectMedia_project
    permissions
  }
  fragment Toolbar_team on Team {
    ...CreateProjectMedia_team
    permissions
  }
`);
