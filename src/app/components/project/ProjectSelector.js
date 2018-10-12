import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MultiSelector from '../layout/MultiSelector';

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
        <Button onClick={this.handleClick} variant="outlined">
          { this.props.label ?
            this.props.label :
            <FormattedMessage id="teamTasks.selectProject" defaultMessage="Select projects" />
          }
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MultiSelector
            allowSearch
            options={this.props.projects.map(p => ({
              label: p.node.title,
              value: `${p.node.dbid}`,
            }))}
            onDismiss={this.handleClose}
            onSubmit={this.handleSelect}
          />
        </Menu>
      </div>
    );
  }
}

export default ProjectSelector;
