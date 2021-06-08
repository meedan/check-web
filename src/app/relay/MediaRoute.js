import Relay from 'react-relay/classic';

class MediaRoute extends Relay.Route {
  static queries = {
    media: () => Relay.QL`query ProjectMedia { project_media(ids: $ids) }`,
    about: () => Relay.QL`query About { about }`,
  };
  static paramDefinitions = {
    ids: { required: true },
  };
  static routeName = 'MediaRoute';
}

export default MediaRoute;
