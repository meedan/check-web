import React, { Component } from 'react';
import styled from 'styled-components';
import {
  black38,
} from '../../styles/js/shared';

const StyledSelectable = styled.div`
  cursor: pointer;

  .media-selectable__selected .media-detail__card-header {
    background: ${black38};
  }
`;

class MediaSelectable extends Component {
  handleSelect = () => {
    if (this.props.onSelect) {
      this.props.onSelect(this.props.media.id);
    }
  };

  render() {
    return (
      <StyledSelectable
        id="media-selectable"
        className={this.props.selected ? 'media-selectable__selected' : 'media-selectable__not-selected'}
        onClick={(event) => { this.handleSelect(event); }}
      >
        {this.props.children}
      </StyledSelectable>
    );
  }
}

export default MediaSelectable;
