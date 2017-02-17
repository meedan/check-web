import Relay from 'react-relay';

class MediaRoute extends Relay.Route {
  static queries = {
    media: () => Relay.QL`query ProjectMedia { project_media(ids: $ids) }`,
  };
  static paramDefinitions = {
    ids: { required: true },
  };
  static routeName = 'MediaRoute';
}

export default MediaRoute;
