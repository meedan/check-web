import React from 'react';
import { shallow } from 'enzyme';
import MediaPage from './MediaPage';
import MediaPageLayout from './MediaPageLayout';

describe('<MediaPage />', () => {
  describe('URL helpers', () => {
    it('should parse { listPath, listQuery, listIndex } from the /trash query string', () => {
      const childProps = shallow(<MediaPage
        route={{}}
        routeParams={{ team: 'a-team', mediaId: '2' }}
        location={{
          hash: 'hash',
          query: {
            listPath: '/a-team/trash',
            listQuery: JSON.stringify({ key1: 'value1', key2: 'value2' }),
            listIndex: 3,
          },
        }}
      />).find(MediaPageLayout).props();
      expect(childProps.listUrl)
        .toEqual(`/a-team/trash/${encodeURIComponent('{"key1":"value1","key2":"value2"}')}`);
      // listQuery has no offset (listIndex is the offset)
      expect(childProps.listQuery)
        .toEqual({ key1: 'value1', key2: 'value2' });
      expect(childProps.listIndex).toEqual(3);
    });

    it('should parse { listPath, listQuery, listIndex } from the /project query string', () => {
      const childProps = shallow(<MediaPage
        route={{}}
        routeParams={{ team: 'a-team', projectId: '1', mediaId: '2' }}
        location={{
          hash: 'hash',
          query: {
            listPath: '/a-team/project/1',
            listQuery: JSON.stringify({ key1: 'value1', key2: 'value2' }),
            listIndex: 3,
          },
        }}
      />).find(MediaPageLayout).props();
      expect(childProps.listUrl)
        .toEqual(`/a-team/project/1/${encodeURIComponent('{"key1":"value1","key2":"value2"}')}`);
      // listQuery has no offset (listIndex is the offset)
      expect(childProps.listQuery).toEqual({ key1: 'value1', key2: 'value2', projects: [1] });
      expect(childProps.listIndex).toEqual(3);
    });

    it('should infer listUrl, listQuery and nulls when there is no query string or projectId', () => {
      const childProps = shallow(<MediaPage
        route={{}}
        routeParams={{ team: 'a-team', mediaId: '2' }}
        location={{
          hash: 'hash',
          query: {},
        }}
      />).find(MediaPageLayout).props();
      expect(childProps.listUrl).toEqual('/a-team/all-items');
      expect(childProps.listQuery).toEqual({});
      expect(childProps.listIndex).toBeNull();
    });

    it('should infer listUrl, listQuery and nulls when there is no query string but there is a projectId', () => {
      const childProps = shallow(<MediaPage
        route={{}}
        routeParams={{ team: 'a-team', projectId: '1', mediaId: '2' }}
        location={{
          hash: 'hash',
          query: {},
        }}
      />).find(MediaPageLayout).props();
      expect(childProps.listUrl).toEqual('/a-team/project/1');
      expect(childProps.listQuery).toEqual({ projects: [1] });
      expect(childProps.listIndex).toBeNull();
    });
  });
});
