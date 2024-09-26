import React from 'react';
import ProjectsComponent from './ProjectsComponent';
import FeedsComponent from './FeedsComponent';
import SettingsComponent from './SettingsComponent';
import UserSettingsComponent from './UserSettingsComponent';
import ArticlesComponent from '../../article/ArticlesComponent';

const Projects = ({ drawerType }) => {
  const teamRegex = window.location.pathname.match(/^\/([^/]+)/);
  const teamSlug = teamRegex ? teamRegex[1] : null;

  // Not in a team context
  if (!teamSlug) {
    return null;
  }

  switch (drawerType) {
  case 'tipline':
    return <ProjectsComponent />;
  case 'feed':
    return <FeedsComponent />;
  case 'settings':
    return <SettingsComponent />;
  case 'user':
    return <UserSettingsComponent />;
  case 'articles':
    return <ArticlesComponent />;
  default:
    return null;
  }
};

export default Projects;
