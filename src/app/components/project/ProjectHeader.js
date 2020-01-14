import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import IconArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';
import { FormattedMessage } from 'react-intl';
import ProjectRoute from '../../relay/ProjectRoute';
import { urlFromSearchQuery } from '../search/Search';
import { Row, Text, HeaderTitle, FadeIn, SlideIn, black54 } from '../../styles/js/shared';
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
    const regexProject = /^(\/[^/]+\/project\/[0-9]+)/;
    const regexTeam = /^(\/[^/]+)/;
    const regexMedia = /project\/[0-9]+\/media\/[0-9]/;
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
          basePath = `${path.match(regexTeam)[1]}/all-items`;
          break;
        case 'trash':
          basePath = `${path.match(regexTeam)[1]}/trash`;
          break;
        default:
          basePath = `${path.match(regexTeam)[1]}/all-items`;
          if (regexProject.test(path)) {
            basePath = `${path.match(regexProject)[1]}`;
          }
          break;
        }
        const baseQuery = query.original || query;
        delete baseQuery.esoffset;
        return urlFromSearchQuery(baseQuery, basePath);
      } else if (isProjectSubpage) {
        return path.match(regexProject)[1];
      }
      return `${path.match(regexTeam)[1]}/all-items`;
    };

    const url = backUrl();

    return (
      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {url ?
          <Row>
            <IconButton
              containerElement={<Link to={url} />}
              className="project-header__back-button"
            >
              <FadeIn>
                <SlideIn>
                  <IconArrowBack color={black54} />
                </SlideIn>
              </FadeIn>
            </IconButton>
            <HeaderTitle className="project-header__title" style={{ maxWidth: '100%' }}>
              <Text ellipsis>
                {currentProject ? currentProject.title : <FormattedMessage id="projectHeader.allItems" defaultMessage="All items" />}
              </Text>
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
  } else if (props.params && props.params.mediaId) {
    return (<ProjectHeaderComponent
      {...props}
    />);
  }
  return null;
};

export default ProjectHeader;
