import React from 'react';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import styled from 'styled-components';
import { units, opaqueBlack02, opaqueBlack05, black54 } from '../../styles/js/shared';
import { emojify } from '../../helpers';

const StyledMultiSelectorArea = styled.div`
  padding: ${units(2)};
  max-height: ${units(40)};
  height: ${units(40)};
  min-width: ${units(32)};
  overflow-y: auto;
  border: 1px solid ${opaqueBlack05};
  background-color: ${opaqueBlack02};
`;

const StyledActions = styled.div`
  padding: ${units(2)};
  align-items: flex-end;
  flex-direction: row;
  display: flex;
`;

const StyledNotFound = styled.div`
  color: ${black54};
  padding-top: ${units(14)};
  padding-bottom: ${units(14)};
  display: flex;
  justify-content: center;
`;

class MultiSelector extends React.Component {
  constructor(props) {
    super(props);
    const defaultSelected = props.single ? null : [];
    this.state = {
      selected: props.selected ? props.selected : defaultSelected,
      filter: '',
    };
  }

  handleChange = (e) => {
    this.setState({ filter: e.target.value });
  };

  handleSelectCheckbox = (e, inputChecked) => {
    if (inputChecked) {
      this.addItem(e.target.id);
    } else {
      this.removeItem(e.target.id);
    }
  };

  handleSelectRadio = (e, inputChecked) => {
    let selected = null;
    if (inputChecked) {
      selected = e.target.id;
    } else {
      selected = null;
    }
    this.setState({ selected });
  };

  handleSelectAll = () => {
    this.setState({
      selected: this.props.options.map(o => o.value),
    });
  };

  handleUnselectAll = () => {
    this.setState({ selected: [] });
  };

  addItem = (value) => {
    const selected = [...this.state.selected];
    selected.push(value);
    this.setState({ selected });
  };

  removeItem = (value) => {
    const selected = [...this.state.selected];
    const index = selected.indexOf(value);
    if (index > -1) {
      selected.splice(index, 1);
    }
    this.setState({ selected });
  };

  filter = (options) => {
    const { filter } = this.state;
    if (filter) {
      return options.filter(o => o.label.toLowerCase().includes(filter.toLowerCase()));
    }
    return options;
  };

  render() {
    const {
      onDismiss,
      onSubmit,
    } = this.props;

    const options = this.filter(this.props.options).map(emojify);

    return (
      <div>
        { this.props.allowSearch ?
          <Box p={units(2)}>
            <FormattedMessage id="MultiSelector.search" defaultMessage="Search…">
              {placeholder => (
                <TextField onChange={this.handleChange} placeholder={placeholder} fullWidth />
              )}
            </FormattedMessage>
          </Box>
          : null
        }
        { (this.props.allowSelectAll || this.props.allowUnselectAll) ?
          <Box p={units(2)}>
            { this.props.allowSelectAll ?
              <Button color="primary" onClick={this.handleSelectAll}>
                <FormattedMessage id="multiSelector.all" defaultMessage="Select all" />
              </Button>
              : null
            }
            { this.props.allowUnselectAll ?
              <Button color="primary" onClick={this.handleUnselectAll}>
                <FormattedMessage id="multiSelector.none" defaultMessage="Unselect all" />
              </Button>
              : null
            }
          </Box>
          : null
        }
        <StyledMultiSelectorArea>
          <FormGroup>
            {
              options.map((o, index) => (
                <FormControlLabel
                  key={`multiselector-option-${index.toString()}`}
                  control={this.props.single ?
                    <Radio
                      checked={this.state.selected === o.value}
                      onChange={this.handleSelectRadio}
                      id={o.value}
                      icon={o.icon}
                      checkedIcon={o.checkedIcon}
                    /> :
                    <Checkbox
                      checked={this.state.selected.indexOf(o.value) > -1}
                      onChange={this.handleSelectCheckbox}
                      id={o.value}
                      icon={o.icon}
                      checkedIcon={o.checkedIcon}
                    />
                  }
                  label={o.label}
                />
              ))
            }
            { options.length < 1 ?
              <StyledNotFound>
                <FormattedMessage id="multiSelector.empty" defaultMessage="No items found" />
              </StyledNotFound>
              : null
            }
          </FormGroup>
        </StyledMultiSelectorArea>
        <StyledActions>
          <Button onClick={onDismiss}>
            { this.props.cancelLabel ?
              this.props.cancelLabel
              : <FormattedMessage id="multiSelector.cancel" defaultMessage="Cancel" />
            }
          </Button>
          <Button className="multi__selector-save" color="primary" onClick={() => onSubmit(this.state.selected)}>
            { this.props.submitLabel ?
              this.props.submitLabel
              : <FormattedMessage id="multiSelector.save" defaultMessage="Save" />
            }
          </Button>
        </StyledActions>
      </div>
    );
  }
}

export default MultiSelector;
