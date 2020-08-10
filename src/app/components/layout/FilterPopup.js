import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import FilterListIcon from '@material-ui/icons/FilterList';
import styled from 'styled-components';
import { units, Row } from '../../styles/js/shared';

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
    return (
      <div className="filter-popup">
        <Row>
          { this.props.label ? this.props.label : null }
          { this.props.tooltip ?
            <Tooltip title={this.props.tooltip}>
              <IconButton onClick={this.handleMenuClick}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            :
            <IconButton onClick={this.handleMenuClick}>
              <FilterListIcon />
            </IconButton>
          }
        </Row>
        <Popper
          open={this.state.popper.open}
          anchorEl={this.state.popper.anchorEl}
          placement="bottom-start"
        >
          <StyledPaper>
            {this.props.onSearchChange ? (
              <FormattedMessage id="MultiSelector.search" defaultMessage="Search…">
                {placeholder => (
                  <TextField
                    defaultValue={this.props.search}
                    onChange={this.props.onSearchChange}
                    name="filter-search"
                    placeholder={placeholder}
                    fullWidth
                  />
                )}
              </FormattedMessage>
            ) : null}
            {this.props.children}
            <div>
              <Button onClick={this.handleClose} style={{ marginTop: units(2) }}>
                <FormattedMessage id="FilterPopup.close" defaultMessage="Done" />
              </Button>
            </div>
          </StyledPaper>
        </Popper>
      </div>
    );
  }
}

export default FilterPopup;
