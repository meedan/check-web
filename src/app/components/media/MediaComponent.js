import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withPusher, pusherShape } from '../../pusher';
import PageTitle from '../PageTitle';
import MediaDetail from './MediaDetail';
import MediaRelated from './MediaRelated';
import MediaTasks from './MediaTasks';
import MediaAnalysis from './MediaAnalysis';
import MediaLog from './MediaLog';
import MediaComments from './MediaComments';
import MediaRequests from './MediaRequests';
import MediaTitle from './MediaTitle';
import { columnWidthMedium, columnWidthLarge, units } from '../../styles/js/shared';

const StyledTwoColumnLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: center;
`;

const Column = styled.div`
  min-width: min(50%, ${columnWidthMedium});
  max-width: ${columnWidthLarge};
  padding: ${units(2)};
  flex-grow: 1;
`;

class MediaComponent extends Component {
  static scrollToAnnotation() {
    if (window.location.hash !== '') {
      const id = window.location.hash.replace(/^#/, '');
      const element = document.getElementById(id);
      if (element && element.scrollIntoView !== undefined) {
        element.scrollIntoView();
      }
    }
  }

  constructor(props) {
    super(props);

    const { team_bots: teamBots } = props.media.team;
    const enabledBots = teamBots.edges.map(b => b.node.login);
    const showRequests = (enabledBots.indexOf('smooch') > -1 || props.media.requests_count > 0);
    const showTab = showRequests ? 'requests' : 'tasks';

    this.state = {
      showTab,
      showRequests,
    };
  }

  componentDidMount() {
    this.setCurrentContext();
    MediaComponent.scrollToAnnotation();
    this.subscribe();
  }

  componentWillUpdate(nextProps) {
    if (this.props.media.dbid !== nextProps.media.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    this.setCurrentContext();
    MediaComponent.scrollToAnnotation();
    if (this.props.media.dbid !== prevProps.media.dbid) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  setCurrentContext() {
    if (/^\/[^/]+\/project\/[0-9]+\/media\/[0-9]+/.test(window.location.pathname)) {
      const projectId = window.location.pathname.match(/^\/[^/]+\/project\/([0-9]+)\/media\/[0-9]+/)[1];
      if (this.props.relay.variables.contextId !== projectId) {
        this.props.relay.setVariables({ contextId: projectId });
      }
    }
  }

  subscribe() {
    const { pusher, clientSessionId, media } = this.props;
    pusher.subscribe(media.pusher_channel).bind('relationship_change', 'MediaComponent', (data, run) => {
      const relationship = JSON.parse(data.message);
      if (
        (!relationship.id || clientSessionId !== data.actor_session_id) &&
        (relationship.source_id === media.dbid ||
        relationship.target_id === media.dbid)
      ) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-${media.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });

    pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaComponent', (data, run) => {
      const annotation = JSON.parse(data.message);
      if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-${media.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });
  }

  unsubscribe() {
    const { pusher, media } = this.props;
    pusher.unsubscribe(media.pusher_channel);
  }

  handleTabChange = (e, value) => this.setState({ showTab: value });

  render() {
    if (this.props.relay.variables.contextId === null && /\/project\//.test(window.location.pathname)) {
      return null;
    }

    const { media } = this.props;
    media.url = media.media.url;
    media.quote = media.media.quote;
    media.embed_path = media.media.embed_path;

    return (
      <React.Fragment>
        <MediaTitle projectMedia={media}>
          {text => <PageTitle prefix={text} team={media.team} data-id={media.dbid} />}
        </MediaTitle>
        <StyledTwoColumnLayout className="media">
          <Column>
            <MediaDetail
              media={media}
              hideBorder
              hideRelated
            />
            {this.props.extras}
            <MediaRelated
              media={media}
            />
          </Column>
          <Column className="media__annotations-column">
            <Tabs
              indicatorColor="primary"
              textColor="primary"
              value={this.state.showTab}
              onChange={this.handleTabChange}
            >
              { this.state.showRequests ?
                <Tab
                  label={
                    <FormattedMessage
                      id="mediaComponent.requests"
                      defaultMessage="Requests"
                    />
                  }
                  value="requests"
                  className="media-tab__requests"
                />
                : null }
              <Tab
                label={
                  <FormattedMessage
                    id="mediaComponent.tasks"
                    defaultMessage="Tasks"
                  />
                }
                value="tasks"
                className="media-tab__tasks"
              />
              <Tab
                label={
                  <FormattedMessage
                    id="mediaComponent.analysis"
                    defaultMessage="Analysis"
                  />
                }
                value="analysis"
                className="media-tab__analysis"
              />

              <Tab
                label={
                  <FormattedMessage
                    id="mediaComponent.notes"
                    defaultMessage="Notes"
                  />
                }
                value="notes"
                className="media-tab__comments"
              />
              <Tab
                label={
                  <FormattedMessage
                    id="mediaComponent.activity"
                    defaultMessage="Activity"
                  />
                }
                value="activity"
                className="media-tab__activity"
              />
            </Tabs>
            { this.state.showTab === 'requests' ? <MediaRequests media={media} /> : null }
            { this.state.showTab === 'tasks' ? <MediaTasks media={media} /> : null }
            { this.state.showTab === 'analysis' ? <MediaAnalysis media={media} /> : null }
            { this.state.showTab === 'notes' ? <MediaComments media={media} /> : null }
            { this.state.showTab === 'activity' ? <MediaLog media={media} /> : null }
          </Column>
        </StyledTwoColumnLayout>
      </React.Fragment>
    );
  }
}

MediaComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

export default withPusher(MediaComponent);
