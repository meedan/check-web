import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage, injectIntl } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MediaUtil from './MediaUtil';
import CheckContext from '../../CheckContext';
import { units } from '../../styles/js/shared';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import TeamRoute from '../../relay/TeamRoute';
import RelayContainer from '../../relay/RelayContainer';
import { nested } from '../../helpers';

const destinationProjects = (team, projectId) => {
  if (team.projects) {
    const projects = team.projects.edges.sortp((a, b) =>
      a.node.title.localeCompare(b.node.title));
    return projects.filter(p => p.node.dbid !== projectId);
  }

  return [];
};

class MoveMediaComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleCloseDialog() {
    this.setState({
      dstProj: null,
    });
    this.props.onClose();
  }

  handleMoveProjectMedia() {
    const { media } = this.props;
    const dstProj = this.props.team.projects.edges.find(p => p.node.id === this.state.dstProj);
    const { dbid: previousProjectId } = this.props.media.project;
    const { history } = this.getContext();

    const onFailure = (transaction) => {
      if (/^\/[^/]+\/project\/[0-9]+$/.test(window.location.pathname)) {
        history.push(`/${media.team.slug}/project/${previousProjectId}`);
      }
      const error = transaction.getError();
      if (error.json) {
        error.json().then(this.handleError);
      } else {
        this.handleError(JSON.stringify(error));
      }
    };

    const path = `/${media.team.slug}/project/${dstProj.node.dbid}`;

    const onSuccess = () => {
      if (/^\/[^/]+\/search\//.test(window.location.pathname)) {
        this.props.parentComponent.props.relay.forceFetch();
      } else if (
        /^\/[^/]+\/project\/[0-9]+\/media\/[0-9]+$/.test(window.location.pathname)
      ) {
        history.push(`${path}/media/${media.dbid}`);
        this.handleCloseDialog();
      }
    };

    // Optimistic-redirect to target project
    if (/^\/[^/]+\/project\/[0-9]+$/.test(window.location.pathname)) {
      history.push(path);
    }

    console.log('this.props.media.project');
    console.log(this.props.media.project);

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        project_id: dstProj.node.dbid,
        id: media.id,
        srcProj: this.props.media.project,
        dstProj,
      }),
      { onSuccess, onFailure },
    );

    // this.setState({ openMoveDialog: false });
  }

  handleSelectDestProject(event, dstProj) {
    this.setState({ dstProj });
  }

  render() {
    const { media } = this.props;
    const projs = destinationProjects(this.props.team, media.project_id);

    const moveDialogActions = [
      <FlatButton
        label={
          <FormattedMessage
            id="mediaDetail.cancelButton"
            defaultMessage="Cancel"
          />
        }
        onClick={this.handleCloseDialog.bind(this)}
      />,
      <FlatButton
        label={<FormattedMessage id="mediaDetail.move" defaultMessage="Move" />}
        primary
        className="media-detail__move-button"
        keyboardFocused
        onClick={this.handleMoveProjectMedia.bind(this)}
        disabled={!this.state.dstProj}
      />,
    ];

    return (
      <Dialog
        actions={moveDialogActions}
        modal
        open={this.props.open}
        onRequestClose={this.handleCloseDialog.bind(this)}
        autoScrollBodyContent
      >
        <h4 className="media-detail__dialog-header">
          <FormattedMessage
            id="mediaDetail.dialogHeader"
            defaultMessage="Move this {mediaType} to a different project"
            values={{
              mediaType: MediaUtil.typeLabel(
                media,
                media.embed,
                this.props.intl,
              ),
            }}
          />
        </h4>
        <small className="media-detail__dialog-media-path">
          <FormattedMessage
            id="mediaDetail.dialogMediaPath"
            defaultMessage="Currently filed under {teamName} > {projectTitle}"
            values={{
              teamName: this.props.team.name,
              projectTitle: nested(['project', 'title'], media),
            }}
          />
        </small>
        <RadioGroup
          name="moveMedia"
          className="media-detail__dialog-radio-group"
          onChange={this.handleSelectDestProject.bind(this)}
          value={this.state.dstProj}
        >
          {projs.map(proj => (
            <FormControlLabel
              key={proj.node.dbid}
              label={proj.node.title}
              value={proj.node.id}
              style={{ padding: units(1) }}
              control={<Radio />}
            />
          ))}
        </RadioGroup>
      </Dialog>
    );
  }
}

MoveMediaComponent.contextTypes = {
  store: PropTypes.object,
};

const MoveMediaContainer = Relay.createContainer(injectIntl(MoveMediaComponent), {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        id,
        dbid,
        name,
        projects(first: 10000) {
          edges {
            node {
              id,
              dbid,
              title,
              search_id,
            }
          }
        }
      }
    `,
  },
});

const MoveMedia = (props) => {
  const teamSlug = props.media.team.slug;
  const route = new TeamRoute({ teamSlug });

  return (
    <RelayContainer
      Component={MoveMediaContainer}
      route={route}
      renderFetched={data => <MoveMediaContainer {...props} {...data} />}
    />
  );
};

export default MoveMedia;
