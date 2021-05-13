import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import globalStrings from '../../globalStrings';
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
  justify-content: flex-end;
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
    const defaultSelected = props.defaultAllSelected
      ? props.options.filter(o => o.value !== '').map(o => o.value)
      : [];

    this.state = {
      selected: props.selected.length ? props.selected : defaultSelected,
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

  handleToggleAll = () => {
    if (this.isAllSelected()) {
      this.setState({ selected: [] });
    } else {
      this.setState({
        selected: this.props.options
          .filter(o => o.value !== '')
          .map(o => o.value),
      });
    }
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
      return options.filter(o => Object.values(o).join(' ').toLowerCase().includes(filter.toLowerCase()));
    }
    return options;
  };

  isAllSelected = () => {
    const filteredOptions = this.props.options.filter(o => o.value !== '');
    return (this.state.selected.length === filteredOptions.length);
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
          <div style={{ padding: units(2) }}>
            <FormattedMessage id="MultiSelector.search" defaultMessage="Search…">
              {placeholder => (
                <TextField
                  className="multiselector__search-input"
                  onChange={this.handleChange}
                  placeholder={placeholder}
                  variant="outlined"
                  fullWidth
                />
              )}
            </FormattedMessage>
          </div>
          : null
        }
        { this.props.allowToggleAll ?
          <div style={{ padding: units(2) }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.isAllSelected()}
                  onChange={this.handleToggleAll}
                  id="multiselector__select-all"
                />
              }
              label={<FormattedMessage id="MultiSelector.all" defaultMessage="All" />}
            />
          </div>
          : null
        }
        <StyledMultiSelectorArea>
          <FormGroup>
            {
              options.map((o, index) => {
                if (o.value === '' && o.label === '') {
                  return (
                    <Divider key={`multiselector-divider-${index.toString()}`} style={{ marginTop: units(1), marginBottom: units(1) }} />
                  );
                }
                if (o.value === '') {
                  return (
                    <Typography variant="button" key={`multiselector-header-${index.toString()}`}>
                      {o.label}
                    </Typography>
                  );
                }
                return (
                  <FormControlLabel
                    key={`multiselector-option-${index.toString()}`}
                    control={
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
                );
              })
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
          { onDismiss ? (
            <Button onClick={onDismiss}>
              { this.props.cancelLabel ?
                this.props.cancelLabel
                : <FormattedMessage id="multiSelector.cancel" defaultMessage="Cancel" />
              }
            </Button>
          ) : null }
          <Button
            className="multi__selector-save"
            color="primary"
            variant="contained"
            onClick={() => onSubmit(this.state.selected)}
          >
            { this.props.submitLabel ?
              this.props.submitLabel
              : <FormattedMessage {...globalStrings.update} />
            }
          </Button>
        </StyledActions>
      </div>
    );
  }
}

MultiSelector.defaultProps = {
  allowSearch: false,
  allowToggleAll: false,
  cancelLabel: null,
  submitLabel: null,
  onDismiss: null,
};

MultiSelector.propTypes = {
  allowSearch: PropTypes.bool,
  allowToggleAll: PropTypes.bool,
  cancelLabel: PropTypes.node,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  submitLabel: PropTypes.node,
  onDismiss: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
};

export default MultiSelector;
