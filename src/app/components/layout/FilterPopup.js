import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import FilterListIcon from '@material-ui/icons/FilterList';
import styled from 'styled-components';
import { units } from '../../styles/js/shared';

const StyledPaper = styled(Paper)`
  padding: ${units(4)} ${units(2)};
`;

class FilterPopup extends React.Component {
  state = {
    popper: {
      open: false,
    },
  };

  handleMenuClick = (event) => {
    const popper = { open: true, anchorEl: event.currentTarget };
    this.setState({ popper });
  };

  render() {
    return (
      <div>
        <IconButton onClick={this.handleMenuClick}>
          <FilterListIcon />
        </IconButton>
        <Popper
          open={this.state.popper.open}
          anchorEl={this.state.popper.anchorEl}
          placement="bottom-start"
        >
          <StyledPaper>
            {...this.props.children}
          </StyledPaper>
        </Popper>
      </div>
    );
  }
}

export default FilterPopup;
