import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Tooltip from '@material-ui/core/Tooltip';
import FilterListIcon from '@material-ui/icons/FilterList';
import styled from 'styled-components';
import { units } from '../../styles/js/shared';

const StyledPaper = styled(Paper)`
  padding: ${units(2)};
`;

class FilterPopup extends React.Component {
  state = {
    popper: {
      open: false,
    },
  };

  handleMenuClick = (event) => {
    const popperOpen = !this.state.popper.open;
    const popper = { open: popperOpen, anchorEl: event.currentTarget };
    this.setState({ popper });
  };

  handleClose = () => {
    this.setState({ popper: { open: false } });
  };

  render() {
    const iconButton = (
      <IconButton onClick={this.handleMenuClick}>
        <FilterListIcon />
      </IconButton>
    );
    return (
      <div>
        { this.props.tooltip ?
          <Tooltip title={this.props.tooltip}>
            {iconButton}
          </Tooltip>
          :
          iconButton
        }
        <Popper
          open={this.state.popper.open}
          anchorEl={this.state.popper.anchorEl}
          placement="bottom-start"
        >
          <StyledPaper>
            {this.props.children}
            <Button onClick={this.handleClose} style={{ marginTop: units(2) }}>
              <FormattedMessage id="FilterPopup.close" defaultMessage="Done" />
            </Button>
          </StyledPaper>
        </Popper>
      </div>
    );
  }
}

export default FilterPopup;
