import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import CreateProjectMutation from '../../relay/mutations/CreateProjectMutation';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import { units } from '../../styles/js/shared';

const Styles = theme => ({
  rootCard: {
  },
  rootNotCard: {
    padding: theme.spacing(0, 2),
  },
  rootHidden: {
    visibility: 'hidden',
    pointerEvents: 'none',
  },
});

class CreateProject extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
      name: '',
      isSubmitting: false,
    };
  }

  handleChange = (e) => {
    this.setState({ name: e.target.value });
  };

  handleKeyDown = (e) => {
    if (e.key === 'Escape' && this.props.onBlur) {
      this.props.onBlur();
    }
  };

  handleSubmit(e) {
    const title = this.state.name ? this.state.name.trim() : null;
    const { team } = this.props;

    const onFailure = (transaction) => {
      const fallbackMessage = (
        <FormattedMessage
          id="createProject.error"
          defaultMessage="Sorry, an error occurred while updating the list. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message, isSubmitting: false });
    };

    const onSuccess = (response) => {
      const { createProject: { project } } = response;
      const path = `/${team.slug}/project/${project.dbid}`;
      browserHistory.push(path);
      if (this.props.onCreate) {
        this.props.onCreate();
      }
      this.setState({ message: null, name: '', isSubmitting: false });
    };

    if (!this.state.isSubmitting && title) {
      Relay.Store.commitUpdate(
        new CreateProjectMutation({
          title,
          team,
        }),
        { onSuccess, onFailure },
      );
      this.setState({ isSubmitting: true });
    }

    e.preventDefault();
  }

  render() {
    const {
      classes, team, visible, renderCard,
    } = this.props;
    const className = `create-project-${renderCard ? 'card' : 'form'} ${renderCard ? classes.rootCard : classes.rootNotCard} ${visible ? '' : classes.rootHidden}`;
    const disabled = !visible;

    const textInput = (
      <FormattedMessage id="createProject.newProjectName" defaultMessage="List name">
        {placeholder => (
          <TextField
            key={visible /* re-render -- and thus autofocus -- when visible becomes true */}
            name="title"
            placeholder={placeholder /* TODO make it `label`? */}
            style={this.props.style}
            autoFocus={this.props.autoFocus}
            label={this.state.message}
            error={this.state.message}
            value={this.state.name}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            disabled={disabled}
            fullWidth
          />
        )}
      </FormattedMessage>
    );

    const submitButton = (
      <Button type="submit" color="primary" disabled={disabled || !this.state.name}>
        <FormattedMessage id="createProject.addProject" defaultMessage="Create list" />
      </Button>
    );

    if (this.props.renderCard) {
      return (
        <Card
          component="form"
          onSubmit={this.handleSubmit.bind(this)}
          className={className}
          style={{ marginBottom: units(2) }}
        >
          <CardHeader
            title={team.projects.edges.length
              ? <FormattedMessage id="createProject.title" defaultMessage="Add a list" />
              : <FormattedMessage id="createProject.titleBlank" defaultMessage="Add your first list" />
            }
          />
          <CardContent>
            {textInput}
          </CardContent>
          <CardActions>
            {submitButton}
          </CardActions>
        </Card>
      );
    }

    return (
      <form onSubmit={this.handleSubmit.bind(this)} className={className}>
        {textInput}
        {submitButton}
      </form>
    );
  }
}
CreateProject.defaultProps = {
  onBlur: null,
  visible: true,
};
CreateProject.propTypes = {
  visible: PropTypes.bool, // default true
  autoFocus: PropTypes.bool.isRequired,
  onBlur: PropTypes.func, // or null
  onCreate: PropTypes.func.isRequired,
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    projects: PropTypes.shape({
      edges: PropTypes.array.isRequired,
    }).isRequired,
  }).isRequired,
};

export default withStyles(Styles)(CreateProject);
