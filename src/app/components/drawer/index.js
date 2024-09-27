import React from 'react';
import DrawerArticles from './DrawerArticles';
import DrawerFeeds from './DrawerFeeds';
import DrawerTeamSettings from './DrawerTeamSettings';
import DrawerTipline from './DrawerTipline';
import DrawerUserSettings from './DrawerUserSettings';

const DrawerContent = ({ drawerType }) => {
  const teamRegex = window.location.pathname.match(/^\/([^/]+)/);
  const teamSlug = teamRegex ? teamRegex[1] : null;
  if (!teamSlug) return null; // Not in a team context

  switch (drawerType) {
  case 'articles':
    return <DrawerArticles />;
  case 'feed':
    return <DrawerFeeds />;
  case 'tipline':
    return <DrawerTipline />;
  case 'settings':
    return <DrawerTeamSettings />;
  case 'user':
    return <DrawerUserSettings />;
  default:
    return null;
  }
};

export default DrawerContent;
