import React from 'react';
import { shallow } from 'enzyme';
import MediaPage from './MediaPage';
import MediaPageLayout from './MediaPageLayout';

describe('<MediaPage />', () => {
  describe('URL helpers', () => {
    it('should parse { listPath, listQuery, listIndex } from the /trash query string', () => {
      const childProps = shallow(<MediaPage
        location={{
          hash: 'hash',
          query: {
            listPath: '/a-team/trash',
            listQuery: JSON.stringify({ key1: 'value1', key2: 'value2' }),
            listIndex: 3,
          },
        }}
        route={{}}
        routeParams={{ team: 'a-team', mediaId: '2' }}
      />).find(MediaPageLayout).props();
      expect(childProps.listUrl)
        .toEqual(`/a-team/trash/${encodeURIComponent('{"key1":"value1","key2":"value2"}')}`);
      // listQuery has no offset (listIndex is the offset)
      expect(childProps.listQuery)
        .toEqual({ key1: 'value1', key2: 'value2' });
      expect(childProps.listIndex).toEqual(3);
      expect(childProps.buildSiblingUrl(4, 5))
        .toEqual(`/a-team/media/4?listPath=%2Fa-team%2Ftrash&listQuery=${encodeURIComponent('{"key1":"value1","key2":"value2"}')}&listIndex=5`);
    });

    it('should parse { listPath, listQuery, listIndex } from the /project query string', () => {
      const childProps = shallow(<MediaPage
        location={{
          hash: 'hash',
          query: {
            listPath: '/a-team/project/1',
            listQuery: JSON.stringify({ key1: 'value1', key2: 'value2' }),
            listIndex: 3,
          },
        }}
        route={{}}
        routeParams={{ team: 'a-team', projectId: '1', mediaId: '2' }}
      />).find(MediaPageLayout).props();
      expect(childProps.listUrl)
        .toEqual(`/a-team/project/1/${encodeURIComponent('{"key1":"value1","key2":"value2"}')}`);
      // listQuery has no offset (listIndex is the offset)
      expect(childProps.listQuery).toEqual({ key1: 'value1', key2: 'value2', projects: [1] });
      expect(childProps.listIndex).toEqual(3);
      expect(childProps.buildSiblingUrl(4, 5))
        .toEqual(`/a-team/project/1/media/4?listPath=%2Fa-team%2Fproject%2F1&listQuery=${encodeURIComponent('{"key1":"value1","key2":"value2"}')}&listIndex=5`);
    });

    it('should infer listUrl, listQuery and nulls when there is no query string or projectId', () => {
      const childProps = shallow(<MediaPage
        location={{
          hash: 'hash',
          query: {},
        }}
        route={{}}
        routeParams={{ team: 'a-team', mediaId: '2' }}
      />).find(MediaPageLayout).props();
      expect(childProps.listUrl).toEqual('/a-team/all-items');
      expect(childProps.listQuery).toEqual({});
      expect(childProps.listIndex).toBeNull();
      expect(childProps.buildSiblingUrl).toBeNull();
    });

    it('should infer listUrl, listQuery and nulls when there is no query string but there is a projectId', () => {
      const childProps = shallow(<MediaPage
        location={{
          hash: 'hash',
          query: {},
        }}
        route={{}}
        routeParams={{ team: 'a-team', projectId: '1', mediaId: '2' }}
      />).find(MediaPageLayout).props();
      expect(childProps.listUrl).toEqual('/a-team/project/1');
      expect(childProps.listQuery).toEqual({ projects: [1] });
      expect(childProps.listIndex).toBeNull();
      expect(childProps.buildSiblingUrl).toBeNull();
    });

    it('should give a buildSiblingUrl() even when inferring listUrl and listQuery if there is no projectId', () => {
      const childProps = shallow(<MediaPage
        location={{
          hash: 'hash',
          query: { listIndex: '3' },
        }}
        route={{}}
        routeParams={{ team: 'a-team', mediaId: '2' }}
      />).find(MediaPageLayout).props();
      expect(childProps.listUrl).toEqual('/a-team/all-items');
      expect(childProps.listQuery).toEqual({});
      expect(childProps.listIndex).toEqual(3);
      expect(childProps.buildSiblingUrl(4, 5)).toEqual('/a-team/media/4?listIndex=5');
    });

    it('should give a buildSiblingUrl() even when inferring listUrl and listQuery if there is a projectId', () => {
      const childProps = shallow(<MediaPage
        location={{
          hash: 'hash',
          query: { listIndex: '3' },
        }}
        route={{}}
        routeParams={{ team: 'a-team', projectId: '1', mediaId: '2' }}
      />).find(MediaPageLayout).props();
      expect(childProps.listUrl).toEqual('/a-team/project/1');
      expect(childProps.listQuery).toEqual({ projects: [1] });
      expect(childProps.listIndex).toEqual(3);
      expect(childProps.buildSiblingUrl(4, 5)).toEqual('/a-team/project/1/media/4?listIndex=5');
    });
  });
});
