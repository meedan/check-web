import React, { Component } from 'react';
import styled from 'styled-components';
import {
  black38,
} from '../../styles/js/shared';

const StyledSelectable = styled.div`
  .media-selectable__selected .media-detail__card-header {
    background: ${black38};
  }
`;

class MediaSelectable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: false,
    };
  }

  handleSelect = (event) => {
    event.stopPropagation();
    this.setState({ selected: true });
  };

  render() {
    return (
      <StyledSelectable
        id="media-selectable"
        className={this.state.selected ? 'media-selectable__selected' : 'media-selectable__not-selected'}
        onClickCapture={(event) => { this.handleSelect(event); }}
      >
        {this.props.children}
      </StyledSelectable>
    );
  }
}

export default MediaSelectable;
