import Relay from 'react-relay';

class MediaRoute extends Relay.Route {
  static queries = {
    media: () => Relay.QL`query Media { media(id: $mediaId) }`, 
  };
  static paramDefinitions = {
    mediaId: { required: true }
  };
  static routeName = 'MediaRoute';
};

export default MediaRoute;
