import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { stripUnit } from 'polished';
import { Tabs, Tab } from 'material-ui/Tabs';
import PageTitle from '../PageTitle';
import MediaDetail from './MediaDetail';
import MediaRelated from './MediaRelated';
import MediaTasks from './MediaTasks';
import MediaAnalysis from './MediaAnalysis';
import MediaLog from './MediaLog';
import MediaComments from './MediaComments';
import MediaUtil from './MediaUtil';
import CheckContext from '../../CheckContext';
import {
  ContentColumn,
  headerHeight,
  gutterMedium,
  units,
  mediaQuery,
} from '../../styles/js/shared';

const StyledTwoColumnLayout = styled(ContentColumn)`
  flex-direction: column;
  ${mediaQuery.desktop`
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    padding: 0;
    flex-direction: row;

    .media__media-column {
      max-width: 100%;
    }

    .media__annotations-column {
      max-width: 100%;
    }
  `}
`;

const StyledBackgroundColor = styled.div`
  margin-top: -${stripUnit(headerHeight) + stripUnit(gutterMedium)}px;
  padding-bottom: ${units(6)};
  padding-top: ${stripUnit(headerHeight) + stripUnit(gutterMedium)}px;
  min-height: 100vh;
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

    this.state = {
      showTab: 'tasks',
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

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  setCurrentContext() {
    const { project } = this.getContext();
    if (project && project.dbid) {
      this.props.relay.setVariables({ contextId: project.dbid });
    }
  }

  subscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.subscribe(this.props.media.pusher_channel).bind('relationship_change', 'MediaComponent', (data, run) => {
        const relationship = JSON.parse(data.message);
        if (
          (!relationship.id || this.getContext().clientSessionId !== data.actor_session_id) &&
          (relationship.source_id === this.props.media.dbid ||
          relationship.target_id === this.props.media.dbid)
        ) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `media-${this.props.media.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });

      pusher.subscribe(this.props.media.pusher_channel).bind('media_updated', 'MediaComponent', (data, run) => {
        const annotation = JSON.parse(data.message);
        if (annotation.annotated_id === this.props.media.dbid &&
          this.getContext().clientSessionId !== data.actor_session_id
        ) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `media-${this.props.media.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.unsubscribe(this.props.media.pusher_channel);
    }
  }

  handleTabChange = value => this.setState({ showTab: value });

  render() {
    if (this.props.relay.variables.contextId === null && /\/project\//.test(window.location.pathname)) {
      return null;
    }

    const { media } = this.props;
    const data = media.metadata;
    media.url = media.media.url;
    media.quote = media.media.quote;
    media.embed_path = media.media.embed_path;

    return (
      <PageTitle
        prefix={MediaUtil.title(media, data, this.props.intl)}
        skipTeam={false}
        team={media.team}
        data-id={media.dbid}
      >
        <StyledBackgroundColor
          className="media"
        >
          <StyledTwoColumnLayout>
            <ContentColumn className="media__media-column">
              <MediaDetail
                media={media}
                hideBorder
                hideRelated
              />
              {this.props.extras}
              <MediaRelated
                media={media}
                showHeader
              />
            </ContentColumn>
            <ContentColumn className="media__annotations-column">
              <Tabs
                value={this.state.showTab}
                onChange={this.handleTabChange}
                style={{
                  marginBottom: units(1),
                }}
                tabItemContainerStyle={{
                  backgroundColor: 'transparent',
                }}
              >
                <Tab
                  label={
                    <FormattedMessage
                      id="mediaComponent.tasks"
                      defaultMessage="Tasks"
                    />
                  }
                  value="tasks"
                />
                <Tab
                  label={
                    <FormattedMessage
                      id="mediaComponent.analysis"
                      defaultMessage="Analysis"
                    />
                  }
                  value="analysis"
                />
                <Tab
                  label={
                    <FormattedMessage
                      id="mediaComponent.activity"
                      defaultMessage="Activity"
                    />
                  }
                  value="activity"
                />
              </Tabs>
              { this.state.showTab === 'tasks' ? <MediaTasks media={media} /> : null }
              { this.state.showTab === 'analysis' ? <MediaAnalysis media={media} /> : null }
              { this.state.showTab === 'activity' ? <MediaLog media={media} /> : null }
              <MediaComments media={media} style={{ marginTop: units(5) }} />
            </ContentColumn>
          </StyledTwoColumnLayout>
        </StyledBackgroundColor>
      </PageTitle>
    );
  }
}

MediaComponent.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

MediaComponent.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(MediaComponent);
