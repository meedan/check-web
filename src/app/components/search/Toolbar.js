import React from 'react';
import styled from 'styled-components';
import { black05, black87, units, Row } from '../../styles/js/shared';

const StyledToolbar = styled.div`
  background-color: ${black05};
  min-height: ${units(5)};
  margin: 0 ${units(1)};

  .toolbar__title {
    color: ${black87};
    margin: ${units(2)};
  }
`;

class Toolbar extends React.PureComponent {
  render() {
    const { filter, actions, title } = this.props;
    return (
      <StyledToolbar className="toolbar">
        <Row>{filter} | {actions} |<span className="toolbar__title">{title}</span></Row>
      </StyledToolbar>
    );
  }
}

export default Toolbar;
