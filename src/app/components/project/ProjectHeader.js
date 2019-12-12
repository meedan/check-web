import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import IconArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import ProjectRoute from '../../relay/ProjectRoute';
import { urlFromSearchQuery } from '../search/Search';
import { Row, HeaderTitle, FadeIn, SlideIn, black54 } from '../../styles/js/shared';
import CheckContext from '../../CheckContext';

class ProjectHeaderComponent extends React.PureComponent {
  getContext() {
    return new CheckContext(this);
  }

  currentContext() {
    return this.getContext().getContextStore();
  }

  render() {
    const { props } = this;
    const currentProject = props.project;
    const path = props.location ? props.location.pathname : window.location.pathname;
    const regexProject = /(.*\/project\/[0-9]+)/;
    const regexTeam = /^(\/[^/]+)/;
    const regexMedia = /\/media\/[0-9]/;
    const regexSource = /\/source\/[0-9]/;
    let mediaQuery = null;
    const { state } = this.currentContext().history.getCurrentLocation();
    if (state && state.query) {
      mediaQuery = state.query;
    }
    const isProjectSubpage = regexMedia.test(path) || regexSource.test(path);

    const backUrl = () => {
      if (mediaQuery) {
        const query = Object.assign({}, mediaQuery);
        let basePath = '';
        switch (query.referer) {
        case 'search':
          basePath = `${path.match(regexTeam)[1]}/search`;
          break;
        case 'trash':
          basePath = `${path.match(regexTeam)[1]}/trash`;
          break;
        default:
          basePath = `${path.match(regexProject)[1]}`;
          break;
        }
        const baseQuery = query.original || query;
        delete baseQuery.esoffset;
        return urlFromSearchQuery(baseQuery, basePath);
      } else if (isProjectSubpage) {
        return path.match(regexProject)[1];
      }
      return null;
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {isProjectSubpage ?
          <Row>
            <IconButton
              containerElement={<Link to={backUrl()} />}
              className="project-header__back-button"
            >
              <FadeIn>
                <SlideIn>
                  <IconArrowBack color={black54} />
                </SlideIn>
              </FadeIn>
            </IconButton>
            <HeaderTitle className="project-header__title">
              {currentProject.title}
            </HeaderTitle>
          </Row>
          : null}
      </div>
    );
  }
}

ProjectHeaderComponent.contextTypes = {
  store: PropTypes.object,
  router: PropTypes.object,
};

const ProjectHeaderContainer = Relay.createContainer(ProjectHeaderComponent, {
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        title,
        description
      }
    `,
  },
});

const ProjectHeader = (props) => {
  if (props.params && props.params.projectId) {
    const route = new ProjectRoute({ contextId: props.params.projectId });
    return (<Relay.RootContainer
      Component={ProjectHeaderContainer}
      route={route}
    />);
  }
  return null;
};

export default ProjectHeader;
