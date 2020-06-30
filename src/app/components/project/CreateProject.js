import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import CreateProjectMutation from '../../relay/mutations/CreateProjectMutation';
import CheckContext from '../../CheckContext';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import {
  units,
} from '../../styles/js/shared';

const messages = defineMessages({
  addProject: {
    id: 'createProject.addProject',
    defaultMessage: 'Create list',
  },
  cardTitle: {
    id: 'createProject.title',
    defaultMessage: 'Add a list',
  },
  cardTitleBlank: {
    id: 'createProject.titleBlank',
    defaultMessage: 'Add your first list',
  },
  newProjectName: {
    id: 'createProject.newProjectName',
    defaultMessage: 'List name',
  },
  error: {
    id: 'createProject.error',
    defaultMessage: 'Sorry, an error occurred while updating the list. Please try again and contact {supportEmail} if the condition persists.',
  },
});

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
      name: null,
      submitDisabled: false,
    };
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
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
      const fallbackMessage = this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.setState({ message, submitDisabled: false });
    };

    const onSuccess = (response) => {
      const { createProject: { project } } = response;
      const path = `/${team.slug}/project/${project.dbid}`;
      browserHistory.push(path);
      if (this.props.onCreate) {
        this.props.onCreate();
      }
    };

    if (!this.state.submitDisabled && title) {
      Relay.Store.commitUpdate(
        new CreateProjectMutation({
          title,
          team,
        }),
        { onSuccess, onFailure },
      );
      this.setState({ submitDisabled: true });
    }

    e.preventDefault();
  }

  render() {
    const {
      classes, team, visible, renderCard,
    } = this.props;
    const className = `${renderCard ? classes.rootCard : classes.rootNotCard} ${visible ? '' : classes.rootHidden}`;
    const disabled = !visible;

    const textInput = (
      <TextField
        key={visible /* re-render -- and thus autofocus -- when visible becomes true */}
        id="create-project-title"
        className={this.props.className || 'team__new-project-input'}
        placeholder={this.props.intl.formatMessage(messages.newProjectName)}
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
    );

    const submitButton = (
      <Button
        id="create-project-submit-button"
        onClick={this.handleSubmit.bind(this)}
        color="primary"
        disabled={disabled || !this.state.name}
      >
        {this.props.intl.formatMessage(messages.addProject)}
      </Button>
    );

    const form = (
      <form onSubmit={this.handleSubmit.bind(this)} disabled={disabled} className={className}>
        {textInput}
        {submitButton}
      </form>
    );

    if (renderCard) {
      const cardTitle = team.projects.edges.length
        ? messages.cardTitle
        : messages.cardTitleBlank;

      return (
        <Card className={className} style={{ marginBottom: units(2) }}>
          <CardHeader title={this.props.intl.formatMessage(cardTitle)} />
          <CardContent>
            <form onSubmit={this.handleSubmit.bind(this)} className="create-project">
              {textInput}
            </form>
          </CardContent>
          <CardActions>
            {submitButton}
          </CardActions>
        </Card>
      );
    }

    return form;
  }
}
CreateProject.defaultProps = {
  visible: true,
};
CreateProject.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
  visible: PropTypes.bool, // default true
};

CreateProject.contextTypes = {
  store: PropTypes.object,
};

export default withStyles(Styles)(injectIntl(CreateProject));
