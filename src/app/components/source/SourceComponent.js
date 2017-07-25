import React, { Component } from 'react';
import Relay from 'react-relay';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedHTMLMessage,
  FormattedDate,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import { Tabs, Tab } from 'material-ui/Tabs';
import MDEdit from 'react-icons/lib/md/edit';
import AccountCard from './AccountCard';
import Annotations from '../annotations/Annotations';
import PageTitle from '../PageTitle';
import Medias from '../media/Medias';
import MediaUtil from '../media/MediaUtil';
import MappedMessage from '../MappedMessage';
import Message from '../Message';
import Can from '../Can';
import CheckContext from '../../CheckContext';
import ContentColumn from '../layout/ContentColumn';
import ParsedText from '../ParsedText';
import UploadImage from '../UploadImage';
import { truncateLength } from '../../helpers';
import globalStrings from '../../globalStrings';
import UpdateSourceMutation from '../../relay/UpdateSourceMutation';

const messages = defineMessages({
  addInfo: {
    id: 'sourceComponent.addInfo',
    defaultMessage: 'Add Info',
  },
  editError: {
    id: 'sourceComponent.editError',
    defaultMessage: 'Sorry, could not edit the source',
  },
  editSuccess: {
    id: 'sourceComponent.editSuccess',
    defaultMessage: 'Source information updated successfully!',
  },
  mergeSource: {
    id: 'sourceComponent.mergeSource',
    defaultMessage: 'Merge Source',
  },
  sourceName: {
    id: 'sourceComponent.sourceName',
    defaultMessage: 'Source name',
  },
  sourceBio: {
    id: 'sourceComponent.sourceBio',
    defaultMessage: 'Source bio',
  },
});

class SourceComponent extends Component {

  constructor(props) {
    super(props);
    const source = this.props.source;
    this.state = {
      message: null,
      isEditing: false,
      submitDisabled: false,
      showTab: 'media',
    };
  }

  componentDidMount() {
    this.setContextSource();
  }

  componentDidUpdate() {
    this.setContextSource();
  }

  setContextSource() {
    const context = new CheckContext(this);
    const store = context.getContextStore();
    const { team, project_id } = this.props.source;

    if (!store.team || store.team.slug !== team.slug) {
      context.setContextStore({ team });
    }

    if (!store.project || store.project.dbid !== project_id) {
      context.setContextStore({ project: { dbid: project_id } });
    }
  }

  isProjectSource() {
    return !!this.props.source.source;
  }

  getSource() {
    const { source } = this.isProjectSource() ? this.props.source : this.props;
    return source;
  }

  handleEditProfileImg = () => {
    this.setState({ editProfileImg: true });
  };

  handleTabChange = (value) => {
    this.setState({
      showTab: value,
    });
  };

  handleEnterEditMode(e) {
    this.setState({ isEditing: true });
    e.preventDefault();
  }

  handleLeaveEditMode() {
    this.setState({ isEditing: false, editProfileImg: false });
    this.onClear();
  }

  handleChange() {

  }

  handleUpdateSource(e) {
    const that = this;
    const source = this.getSource();

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = error.source;
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      that.setState({ message });
    };

    const onSuccess = (response) => {
      that.setState({ message: null, isEditing: false });
    };

    const form = document.forms['edit-source-form'];

    Relay.Store.commitUpdate(
      new UpdateSourceMutation({
        source: {
          id: source.id,
          name: form.name.value,
          image: form.image,
          description: form.description.value,
        },
      }),
      { onSuccess, onFailure },
    );

    e.preventDefault();
  }

  onImage(file) {
    document.forms['edit-source-form'].image = file;
    this.setState({ image: file });
  }

  onClear = () => {
    document.forms['edit-source-form'].image = null;
    this.setState({ image: null });
  };

  onImageError(file, message) {
    this.setState({ message, image: null });
  }

  renderSourceView(source, isProjectSource) {
    return (
        <div className="source__profile-content">
          <section className="layout-two-column">
            <div className="column-secondary">
              <div
                className="source__avatar"
                style={{ backgroundImage: `url(${source.image})` }}
                />
            </div>

            <div className="column-primary">
              <div className="source__primary-info">
                <h1 className="source__name">
                  {source.name}
                </h1>
                <div className="source__description">
                  <p className="source__description-text">
                    <ParsedText text={truncateLength(source.description, 600)} />
                  </p>
                </div>
              </div>

              { isProjectSource ?
                <div className="source__contact-info">
                  <FormattedHTMLMessage
                    id="sourceComponent.dateAdded" defaultMessage="Added {date} &bull; Source of {number} links"
                    values={{
                      date: this.props.intl.formatDate(MediaUtil.createdAt({ published: source.created_at }), { year: 'numeric', month: 'short', day: '2-digit' }),
                      number: source.medias.edges.length || '0',
                    }}
                    />
                </div> : null
              }
            </div>
          </section>
          { isProjectSource ?
            <Tabs value={this.state.showTab} onChange={this.handleTabChange}>
              <Tab
                label={<FormattedMessage id="sourceComponent.medias" defaultMessage="Media" />}
                value="media"
                className="source__tab-button-media"
              />
              <Tab
                label={<FormattedMessage id="sourceComponent.notes" defaultMessage="Notes" />}
                className="source__tab-button-notes"
                value="annotation"
              />
              <Tab
                label={<FormattedMessage id="sourceComponent.network" defaultMessage="Networks" />}
                value="account"
                className="source__tab-button-account"
              />
            </Tabs> : <CardActions />
          }
        </div>
    );
  }

  renderSourceEdit(source) {
    const avatarPreview = this.state.image && this.state.image.preview;

    return (
      <div className="source__profile-content">
        <section className="layout-two-column">
          <div className="column-secondary">
            <div
              className="source__avatar"
              style={{ backgroundImage: `url(${ avatarPreview || source.image})` }}
              />
            { !this.state.editProfileImg ?
              <div className="source__edit-avatar-button">
                <FlatButton
                  label={this.props.intl.formatMessage(globalStrings.edit)}
                  onClick={this.handleEditProfileImg.bind(this)}
                  primary
                  />
              </div> : null
            }
          </div>

          <div className="column-primary">
            <form onSubmit={this.handleUpdateSource.bind(this)} name="edit-source-form">
              { this.state.editProfileImg ?
                <UploadImage onImage={this.onImage.bind(this)} onClear={this.onClear} onError={this.onImageError.bind(this)} noPreview /> : null
              }
              <TextField
                className="source__name-input"
                name="name"
                id="source__name-container"
                defaultValue={source.name}
                floatingLabelText={this.props.intl.formatMessage(messages.sourceName)}
                onChange={this.handleChange.bind(this, 'name')}
                fullWidth
              />

              <TextField
                className="source__bio-input"
                name="description"
                id="source__bio-container"
                defaultValue={source.description}
                floatingLabelText={this.props.intl.formatMessage(messages.sourceBio)}
                onChange={this.handleChange.bind(this, 'bio')}
                multiLine={true}
                rows={2}
                rowsMax={4}
                fullWidth
              />
            </form>

            <div className="source__edit-buttons">
              <FlatButton className="source__edit-cancel-button"
                onClick={this.handleLeaveEditMode.bind(this)}
                label={this.props.intl.formatMessage(globalStrings.cancel)} />
              <RaisedButton className="source__edit-save-button"
                onClick={this.handleUpdateSource.bind(this)}
                label={this.props.intl.formatMessage(globalStrings.save)} primary />
            </div>
          </div>
        </section>
      </div>
    );
  }

  render() {
    const isProjectSource = this.isProjectSource();
    const source = this.getSource();
    const isEditing = this.state.isEditing;

    return (
      <PageTitle prefix={source.name} skipTeam={false} team={source.team}>
        <div className="source" data-id={source.dbid} data-user-id={source.user_id}>
          <Card className="source__profile source__profile--editing">
            <ContentColumn>
              <Message message={this.state.message} />
              { isEditing ?
                  this.renderSourceEdit(source, isProjectSource) :
                  this.renderSourceView(source, isProjectSource)
              }
            </ContentColumn>
            { !isEditing ?
              <section className="layout-fab-container">
                <Can
                  permissions={source.permissions}
                  permission="update Source"
                  >
                  <IconButton
                    className="source__edit-button"
                    tooltip={
                      <FormattedMessage
                        id="sourceComponent.editButton"
                        defaultMessage="Edit profile"
                      />
                    }
                    tooltipPosition="top-center"
                    onTouchTap={this.handleEnterEditMode.bind(this)}
                    >
                    <MDEdit />
                  </IconButton>
                </Can>
              </section> : null
            }
          </Card>

          { !isEditing ?
            <div>
              { this.state.showTab === 'annotation' ? <Annotations annotations={source.annotations.edges.slice().reverse()} annotated={source} annotatedType="Source" /> : null }
              <ContentColumn>
                { this.state.showTab === 'media' ? <Medias medias={source.medias.edges} /> : null }
                { this.state.showTab === 'account' ? source.accounts.edges.map(account => <AccountCard key={account.node.id} account={account.node} />) : null }
              </ContentColumn>
            </div> : null
          }
        </div>
      </PageTitle>
    );
  }
}

SourceComponent.propTypes = {
  intl: intlShape.isRequired,
  source: PropTypes.object,
};

SourceComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(SourceComponent);
