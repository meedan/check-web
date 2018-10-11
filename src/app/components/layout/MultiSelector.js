import React from 'react';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import styled from 'styled-components';
import { units, opaqueBlack02, opaqueBlack05 } from '../../styles/js/shared';

const messages = defineMessages({
  search: {
    id: 'MultiSelector.search',
    defaultMessage: 'Search...',
  },
});

const StyledMultiSelectorArea = styled.div`
  padding: ${units(2)};
  min-height: ${units(36)};
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

class MultiSelector extends React.Component {
  state = {
    selected: [],
    filter: '',
  };

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

    const { formatMessage } = this.props.intl;
    const options = this.filter(this.props.options);

    return (
      <div>
        { this.props.allowSearch ?
          <div style={{ padding: units(2) }}>
            <TextField
              onChange={this.handleChange}
              placeholder={formatMessage(messages.search)}
            />
          </div>
          : null
        }
        <StyledMultiSelectorArea>
          <FormGroup>
            {
              options.map((o, index) => (
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
              ))
            }
          </FormGroup>
        </StyledMultiSelectorArea>
        <StyledActions>
          <Button onClick={onDismiss}>
            <FormattedMessage id="teamTasks.cancel" defaultMessage="Cancel" />
          </Button>
          <Button color="primary" onClick={() => onSubmit(this.state.selected)}>
            <FormattedMessage id="teamTasks.save" defaultMessage="Save" />
          </Button>
        </StyledActions>
      </div>
    );
  }
}

export default injectIntl(MultiSelector);
