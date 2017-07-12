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
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import MdChevronRight from 'react-icons/lib/md/chevron-right';
import MDEdit from 'react-icons/lib/md/edit';
import { List, ListItem } from 'material-ui/List';
import PageTitle from '../PageTitle';
import Medias from '../media/Medias';
import MappedMessage from '../MappedMessage';
// import UpdateSourceMutation from '../../relay/UpdateSourceMutation';
import Message from '../Message';
import CreateProject from '../project/CreateProject';
import Can from '../Can';
import CheckContext from '../../CheckContext';
import ContentColumn from '../layout/ContentColumn';
import ParsedText from '../ParsedText';
import {
  highlightBlue,
  titleStyle,
  listItemStyle,
  listStyle,
} from '../../../../config-styles';

const messages = defineMessages({
  editError: {
    id: 'sourceComponent.editError',
    defaultMessage: 'Sorry, could not edit the source',
  },
  editSuccess: {
    id: 'sourceComponent.editSuccess',
    defaultMessage: 'Source information updated successfully!',
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
      values: {
        name: source.name,
        description: source.description,
      },
    };
  }

  componentDidMount() {
    this.setContextSource();
  }

  componentDidUpdate() {
    this.setContextSource();
  }

  setContextSource() {
    // const context = new CheckContext(this);
    // const store = context.getContextStore();
    // const { team, project_id, source_id } = this.props.source;
    //
    // console.log('team');
    // console.log(team);
    // console.log('project_id');
    // console.log(project_id);
    // console.log('source_id');
    // console.log(source_id);
    //
    // const sourceUrl = `/${team.slug}/project/${project_id}/source/${source_id}`;
    //
    // if (!store.team || store.team.slug !== team.slug) {
    //   context.setContextStore({ team });
    //   // const path = `/${team.slug}`;
    //   store.history.push(sourceUrl);
    // }
  }

  render() {
    const source = this.props.source;
    const isEditing = this.state.isEditing;

    return (
      <PageTitle prefix={source.name} skipTeam={false} team={source.team}>
        <div className="team">
          <Card className="team__profile team__profile--editing">
            <ContentColumn>
              <Message message={this.state.message} />
                <div>
                  <section className="layout-two-column">
                    <div className="column-secondary">
                      <div
                        className="team__avatar"
                        style={{ backgroundImage: `url(${source.image})` }}
                      />
                    </div>
                    <div className="column-primary">
                      <div className="team__primary-info">
                        <h1 className="team__name">
                          {source.name}
                        </h1>
                        <div className="team__description">
                          <p className="team__description-text">
                            {<ParsedText text={source.description} /> ||
                              <MappedMessage
                                msgObj={messages}
                                msgKey="verificationTeam"
                              />}
                          </p>
                        </div>
                      </div>

                      <div className="team__contact-info">
                        <FormattedHTMLMessage id="sourceComponent.dateAdded" defaultMessage="Added {date} &bull; Source of {number} links"
                          values={{
                            date: this.props.intl.formatDate(source.created_at, { year: 'numeric', month: 'short', day: '2-digit'}),
                            number: source.medias.edges.length,
                          }}
                        />
                      </div>
                    </div>
                  </section>
                  <section className="layout-fab-container">
                    <Can
                      permissions={source.permissions}
                      permission="update Source"
                    >
                      <IconButton
                        className="team__edit-button"
                        tooltip={
                          <FormattedMessage
                            id="teamComponent.editButton"
                            defaultMessage="Edit profile"
                          />
                        }
                        tooltipPosition="top-center"
                      >
                        <MDEdit />
                      </IconButton>
                    </Can>
                  </section>
                </div>
                <CardActions className="source-component__tabs">
            </ContentColumn>
              <FlatButton label={<FormattedMessage id="sourceComponent.notes" defaultMessage="Notes" />} />
              <FlatButton label={<FormattedMessage id="sourceComponent.medias" defaultMessage="Media" />} />
              <FlatButton label={<FormattedMessage id="sourceComponent.network" defaultMessage="Network" />} />
            </CardActions>
          </Card>
          <ContentColumn>
            <Medias medias={source.medias.edges} />
          </ContentColumn>
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
