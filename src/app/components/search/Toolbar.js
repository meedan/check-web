import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import styled from 'styled-components';
import isEqual from 'lodash.isequal';
import CreateProjectMedia from '../media/CreateMedia';
import Can from '../Can';
import { black87, units, Row, FlexRow } from '../../styles/js/shared';

const StyledToolbar = styled.div`
  background-color: white;
  min-height: ${units(5)};
  max-width: calc(100vw - ${units(34)});
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

class Toolbar extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state, nextState) ||
           !isEqual(this.props, nextProps);
  }

  render() {
    const {
      actions,
      title,
      project,
      page,
      team,
      search,
    } = this.props;

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
};
Toolbar.propTypes = {
  page: PropTypes.oneOf(['trash']), // FIXME find a cleaner way to render Trash differently
};

export default injectIntl(Toolbar);
