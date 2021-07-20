import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import { MultiSelector } from '@meedan/check-ui';
import globalStrings from '../../globalStrings';

class ProjectSelector extends React.Component {
  state = {};

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleSelect = (selected) => {
    this.handleClose();
    if (this.props.onSelect) {
      this.props.onSelect(selected);
    }
  };

  render() {
    const { anchorEl } = this.state;

    return (
      <div>
        <Button onClick={this.handleClick} variant="outlined" fullWidth={this.props.fullWidth}>
          {this.props.selected.length ?
            <FormattedMessage
              id="projectSelector.numProjs"
              defaultMessage="{length, plural, one {# selected} other {# selected}}"
              description="Label for number of selected folders"
              values={{ length: this.props.selected.length }}
            /> :
            <FormattedMessage id="projectSelector.allProjs" defaultMessage="All folders" />
          }
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <FormattedMessage id="multiSelector.search" defaultMessage="Search…">
            {placeholder => (
              <MultiSelector
                allowSearch
                allowToggleAll
                inputPlaceholder={placeholder}
                toggleAllLabel={<FormattedMessage id="MultiSelector.all" defaultMessage="All" />}
                cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
                submitLabel={<FormattedMessage {...globalStrings.update} />}
                options={this.props.projects.map(p => ({
                  label: p.node.title,
                  value: `${p.node.dbid}`,
                }))}
                selected={this.props.selected}
                onDismiss={this.handleClose}
                onSubmit={this.handleSelect}
              />
            )}
          </FormattedMessage>
        </Menu>
      </div>
    );
  }
}

export default ProjectSelector;
