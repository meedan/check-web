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
import MappedMessage from '../MappedMessage';
import Message from '../Message';
import Can from '../Can';
import CheckContext from '../../CheckContext';
import ContentColumn from '../layout/ContentColumn';
import ParsedText from '../ParsedText';
import { truncateLength } from '../../helpers';
import globalStrings from '../../globalStrings';

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

  handleTabChange = (value) => {
    this.setState({
      showTab: value,
    });
  };

  handleEnterEditMode(e) {
    this.setState({ isEditing: true });
    e.preventDefault();
  }

  handleLeaveEditMode(){
    this.setState({ isEditing: false });
  }

  handleChange() {
    console.log(arguments);
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
                  {console.log('source.created_at')}
                  {console.log(source.created_at)}
                  <FormattedHTMLMessage
                    id="sourceComponent.dateAdded" defaultMessage="Added {date} &bull; Source of {number} links"
                    values={{
                      date: this.props.intl.formatDate(source.created_at, { year: 'numeric', month: 'short', day: '2-digit' }),
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
    return (
      <div className="source__profile-content">
        <section className="layout-two-column">
          <div className="column-secondary">
            <div
              className="source__avatar"
              style={{ backgroundImage: `url(${source.image})` }}
              />
            <div className="source__edit-avatar-button">
              <FlatButton
                label={this.props.intl.formatMessage(globalStrings.edit)}
                primary
                />
            </div>
          </div>

          <div className="column-primary">
            <TextField
              className="source__name-input"
              id="source__name-container"
              defaultValue={source.name}
              floatingLabelText={this.props.intl.formatMessage(messages.sourceName)}
              onChange={this.handleChange.bind(this, 'name')}
              fullWidth
            />

            <TextField
              className="source__bio-input"
              id="source__bio-container"
              defaultValue={source.description}
              floatingLabelText={this.props.intl.formatMessage(messages.sourceBio)}
              onChange={this.handleChange.bind(this, 'bio')}
              multiLine={true}
              rows={2}
              rowsMax={4}
              fullWidth
            />

            <div className="source__edit-buttons">
              <FlatButton className="source__edit-addinfo-button"
                label={this.props.intl.formatMessage(messages.addInfo)} primary />
              <FlatButton className="source__edit-merge-button"
                label={this.props.intl.formatMessage(messages.mergeSource)} primary />
              <span className="source__edit-hspacer" />
              <FlatButton className="source__edit-cancel-button"
                onClick={this.handleLeaveEditMode.bind(this)}
                label={this.props.intl.formatMessage(globalStrings.cancel)} />
              <RaisedButton className="source__edit-save-button"
                label={this.props.intl.formatMessage(globalStrings.save)} primary />
            </div>
          </div>
        </section>
      </div>
    );
  }

  render() {
    const isProjectSource = !!this.props.source.source;
    const { source } = isProjectSource ? this.props.source : this.props;
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
