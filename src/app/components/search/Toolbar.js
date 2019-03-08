import React from 'react';
import styled from 'styled-components';
import isEqual from 'lodash.isequal';
import CreateProjectMedia from '../media/CreateMedia';
import Can from '../Can';
import { black05, black87, units, Row, FlexRow } from '../../styles/js/shared';

const StyledToolbar = styled.div`
  background-color: ${black05};
  min-height: ${units(5)};
  margin: 0 ${units(1)};
  padding-right: ${units(1)};

  .toolbar__title {
    color: ${black87};
    margin: ${units(2)};
  }
`;

class Toolbar extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state, nextState) ||
           !isEqual(this.props, nextProps);
  }

  render() {
    const {
      filter,
      actions,
      title,
      project,
      addons,
    } = this.props;

    return (
      <StyledToolbar className="toolbar">
        <FlexRow>
          <Row>
            {filter} | {actions} {actions ? '|' : null} <span className="toolbar__title">{title}</span>
          </Row>
          { project ?
            <Can permissions={project.permissions} permission="create Media">
              <CreateProjectMedia />
            </Can>
            : null
          }
          {addons}
        </FlexRow>
      </StyledToolbar>
    );
  }
}

export default Toolbar;
