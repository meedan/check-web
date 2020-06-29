/* globals describe, expect, it */
import { mergeIntervals, getTimelineData } from './MediaTimelineUtils';

describe('Media Timeline Utils', () => {
  it('intersect separate intervals', () => {
    expect(mergeIntervals([
      [0, 10],
      [20, 30],
      [40, 50],
    ])).toEqual([
      [0, 10],
      [20, 30],
      [40, 50],
    ]);
  });

  it('intersect overlapping intervals', () => {
    expect(mergeIntervals([
      [0, 15],
      [10, 30],
    ])).toEqual([[0, 30]]);
  });

  it('convert comments', () => {
    expect(getTimelineData({
      media: {
        comments: {
          edges: [
            {
              node: {
                id: 'Q29tbWVudC8yNzQ=\n',
                dbid: '274',
                text: '2 hours',
                parsed_fragment: {
                  t: [7230.336476123596],
                },
                annotator: {
                  id: 'QW5ub3RhdG9yLzQ=\n',
                  name: 'Laurian',
                  profile_image: 'http://localhost:3000/images/user.png',
                },
                comments: {
                  edges: [],
                },
              },
            },
            {
              node: {
                id: 'Q29tbWVudC8yNzI=\n',
                dbid: '272',
                text: '1 hour',
                parsed_fragment: {
                  t: [3640.449134831461],
                },
                annotator: {
                  id: 'QW5ub3RhdG9yLzQ=\n',
                  name: 'Laurian',
                  profile_image: 'http://localhost:3000/images/user.png',
                },
                comments: {
                  edges: [
                    {
                      node: {
                        id: 'Q29tbWVudC8yNzM=\n',
                        created_at: '1593181694',
                        text: 'and 40 seconds',
                        annotator: {
                          id: 'QW5ub3RhdG9yLzQ=\n',
                          name: 'Laurian',
                          profile_image:
                            'http://localhost:3000/images/user.png',
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        clips: {
          edges: [],
        },
        tags: {
          edges: [],
        },
        geolocations: {
          edges: [],
        },
      },
      currentUser: {
        id: 'VXNlci80\n',
        name: 'Laurian',
        profile_image: 'http://localhost:3000/images/user.png',
      },
    })).toEqual({
      project: {
        projectclips: [],
        projecttags: [],
        projectplaces: [],
      },
      commentThreads: [
        {
          id: 'Q29tbWVudC8yNzQ=\n',
          dbid: '274',
          text: '2 hours',
          start_seconds: 7230.336476123596,
          user: {
            id: 'QW5ub3RhdG9yLzQ=\n',
            first_name: 'Laurian',
            last_name: '',
            profile_img_url: 'http://localhost:3000/images/user.png',
          },
          replies: [],
          node: {
            id: 'Q29tbWVudC8yNzQ=\n',
            dbid: '274',
            text: '2 hours',
            parsed_fragment: {
              t: [7230.336476123596],
            },
            annotator: {
              id: 'QW5ub3RhdG9yLzQ=\n',
              name: 'Laurian',
              profile_image: 'http://localhost:3000/images/user.png',
            },
            comments: {
              edges: [],
            },
          },
        },
        {
          id: 'Q29tbWVudC8yNzI=\n',
          dbid: '272',
          text: '1 hour',
          start_seconds: 3640.449134831461,
          user: {
            id: 'QW5ub3RhdG9yLzQ=\n',
            first_name: 'Laurian',
            last_name: '',
            profile_img_url: 'http://localhost:3000/images/user.png',
          },
          replies: [
            {
              id: 'Q29tbWVudC8yNzM=\n',
              thread_id: 'Q29tbWVudC8yNzI=\n',
              created_at: '1593181694',
              text: 'and 40 seconds',
              start_seconds: 0,
              user: {
                id: 'QW5ub3RhdG9yLzQ=\n',
                first_name: 'Laurian',
                last_name: '',
                profile_img_url: 'http://localhost:3000/images/user.png',
              },
            },
          ],
          node: {
            id: 'Q29tbWVudC8yNzI=\n',
            dbid: '272',
            text: '1 hour',
            parsed_fragment: {
              t: [3640.449134831461],
            },
            annotator: {
              id: 'QW5ub3RhdG9yLzQ=\n',
              name: 'Laurian',
              profile_image: 'http://localhost:3000/images/user.png',
            },
            comments: {
              edges: [
                {
                  node: {
                    id: 'Q29tbWVudC8yNzM=\n',
                    created_at: '1593181694',
                    text: 'and 40 seconds',
                    annotator: {
                      id: 'QW5ub3RhdG9yLzQ=\n',
                      name: 'Laurian',
                      profile_image: 'http://localhost:3000/images/user.png',
                    },
                  },
                },
              ],
            },
          },
        },
      ],
      videoClips: [],
      videoTags: [],
      videoPlaces: [],
      user: {
        first_name: 'Laurian',
        id: 'VXNlci80\n',
        last_name: '',
        profile_img_url: 'http://localhost:3000/images/user.png',
      },
    });
  });

  it('convert clips', () => {
    expect(getTimelineData({
      media: {
        comments: {
          __dataID__:
            'client:-7090457795_first(10000),annotation_type(comment)',
          edges: [],
        },
        clips: {
          __dataID__: 'client:-7090457798_first(10000),annotation_type(clip)',
          edges: [
            {
              __dataID__: 'client:client:-7090457798:RHluYW1pYy8yNzc=\n',
              node: {
                __dataID__: 'RHluYW1pYy8yNzc=\n',
                id: 'RHluYW1pYy8yNzc=\n',
                data: {
                  label: 'Test2',
                },
                parsed_fragment: {
                  t: [10820.223817415732, 10850.223817415732],
                },
              },
            },
            {
              __dataID__: 'client:client:-7090457798:RHluYW1pYy8yNzY=\n',
              node: {
                __dataID__: 'RHluYW1pYy8yNzY=\n',
                id: 'RHluYW1pYy8yNzY=\n',
                data: {
                  label: 'Test',
                },
                parsed_fragment: {
                  t: [7230.336476123596, 7260.336476123596],
                },
              },
            },
            {
              __dataID__: 'client:client:-7090457798:RHluYW1pYy8yNzU=\n',
              node: {
                __dataID__: 'RHluYW1pYy8yNzU=\n',
                id: 'RHluYW1pYy8yNzU=\n',
                data: {
                  label: 'Test',
                },
                parsed_fragment: {
                  t: [3640.449134831461, 3670.449134831461],
                },
              },
            },
          ],
        },
        tags: {
          __dataID__: 'client:-7090457799_first(10000)',
          edges: [],
        },
        geolocations: {
          __dataID__:
            'client:-70904577910_first(10000),annotation_type(geolocation)',
          edges: [],
        },
      },
      currentUser: {
        __dataID__: 'VXNlci80\n',
        id: 'VXNlci80\n',
        dbid: 4,
        name: 'Laurian',
        token:
          'eyJwcm92aWRlciI6ImNoZWNrZGVzayIsImlkIjoiIiwidG9rZW4iOiJxVktU++ncFB5RCIsInNlY3JldCI6IjFoV2h4enJwIn0=++n',
        email: 'laurian@meedan.com',
        is_admin: false,
        accepted_terms: true,
        last_accepted_terms_at: '2020-05-14 16:49:31 UTC',
        login: 'laurian',
        permissions:
          '{"read User":true,"update User":true,"destroy User":true,"create Source":true,"create TeamUser":false,"create Team":true,"create Project":true}',
        profile_image: 'http://localhost:3000/images/user.png',
        settings: {},
        source_id: 4,
        team_ids: [2],
        user_teams:
          '{"workspace1":{"id":2,"name":"workspace1","role":"owner","status":"member"}}',
        current_project: {
          __dataID__: 'UHJvamVjdC8x\n',
          dbid: 1,
          id: 'UHJvamVjdC8x\n',
          title: 'List1',
          team: {
            __dataID__: 'VGVhbS8y\n',
            id: 'VGVhbS8y\n',
            dbid: 2,
            avatar: 'http://localhost:3000/images/team.png',
            name: 'workspace1',
            slug: 'workspace1',
          },
        },
        current_team: {
          __dataID__: 'VGVhbS8y\n',
          id: 'VGVhbS8y\n',
          dbid: 2,
          avatar: 'http://localhost:3000/images/team.png',
          name: 'workspace1',
          slug: 'workspace1',
          projects: {
            __dataID__: 'client:-7090457791_first(10000)',
            edges: [
              {
                __dataID__: 'client:client:-7090457791:UHJvamVjdC8x\n',
                node: {
                  __dataID__: 'UHJvamVjdC8x\n',
                  id: 'UHJvamVjdC8x\n',
                  dbid: 1,
                  title: 'List1',
                  team: {
                    __dataID__: 'VGVhbS8y\n',
                    id: 'VGVhbS8y\n',
                    dbid: 2,
                    avatar: 'http://localhost:3000/images/team.png',
                    name: 'workspace1',
                    slug: 'workspace1',
                  },
                },
              },
              {
                __dataID__: 'client:client:-7090457791:UHJvamVjdC8y\n',
                node: {
                  __dataID__: 'UHJvamVjdC8y\n',
                  id: 'UHJvamVjdC8y\n',
                  dbid: 2,
                  title: 'List2',
                  team: {
                    __dataID__: 'VGVhbS8y\n',
                    id: 'VGVhbS8y\n',
                    dbid: 2,
                    avatar: 'http://localhost:3000/images/team.png',
                    name: 'workspace1',
                    slug: 'workspace1',
                  },
                },
              },
            ],
          },
        },
        teams:
          '{"workspace1":{"id":2,"name":"workspace1","role":"owner","status":"member"}}',
      },
    })).toEqual({
      project: {
        projectclips: [],
        projecttags: [],
        projectplaces: [],
      },
      commentThreads: [],
      videoClips: [
        {
          id: 'clip-Test2',
          name: 'Test2',
          type: 'clip',
          project_clip: {
            id: 'clip-Test2',
            name: 'Test2',
          },
          instances: [
            {
              id: 'RHluYW1pYy8yNzc=\n',
              start_seconds: 10820.223817415732,
              end_seconds: 10850.223817415732,
              url:
                'http://localhost/#t=10820.223817415732,10850.223817415732&id=RHluYW1pYy8yNzc%3D%0A',
            },
          ],
          node: {
            __dataID__: 'RHluYW1pYy8yNzc=\n',
            id: 'RHluYW1pYy8yNzc=\n',
            data: {
              label: 'Test2',
            },
            parsed_fragment: {
              t: [10820.223817415732, 10850.223817415732],
            },
          },
        },
        {
          id: 'clip-Test',
          name: 'Test',
          type: 'clip',
          project_clip: {
            id: 'clip-Test',
            name: 'Test',
          },
          instances: [
            {
              id: 'RHluYW1pYy8yNzY=\n',
              start_seconds: 7230.336476123596,
              end_seconds: 7260.336476123596,
              url:
                'http://localhost/#t=7230.336476123596,7260.336476123596&id=RHluYW1pYy8yNzY%3D%0A',
            },
            {
              id: 'RHluYW1pYy8yNzU=\n',
              start_seconds: 3640.449134831461,
              end_seconds: 3670.449134831461,
              url:
                'http://localhost/#t=3640.449134831461,3670.449134831461&id=RHluYW1pYy8yNzU%3D%0A',
            },
          ],
          node: {
            __dataID__: 'RHluYW1pYy8yNzY=\n',
            id: 'RHluYW1pYy8yNzY=\n',
            data: {
              label: 'Test',
            },
            parsed_fragment: {
              t: [7230.336476123596, 7260.336476123596],
            },
          },
        },
      ],
      videoTags: [],
      videoPlaces: [],
      user: {
        first_name: 'Laurian',
        id: 'VXNlci80\n',
        last_name: '',
        profile_img_url: 'http://localhost:3000/images/user.png',
      },
    });
  });

  it('convert tags', () => {
    expect(getTimelineData({
      media: {
        comments: {
          __dataID__:
            'client:-7090457795_first(10000),annotation_type(comment)',
          edges: [],
        },
        clips: {
          __dataID__: 'client:-7090457798_first(10000),annotation_type(clip)',
          edges: [],
        },
        tags: {
          __dataID__: 'client:-7090457799_first(10000)',
          edges: [
            {
              __dataID__: 'client:client:-7090457799:VGFnLzI4MA==\n',
              node: {
                __dataID__: 'VGFnLzI4MA==\n',
                id: 'VGFnLzI4MA==\n',
                __status__: 4,
                fragment: 't=19415.728719101124,19445.728719101124&type=tags',
                parsed_fragment: {
                  t: [19415.728719101124, 19445.728719101124],
                },
                tag_text_object: {
                  __dataID__: 'VGFnVGV4dC80Mw==\n',
                  id: 'VGFnVGV4dC80Mw==\n',
                  text: 'Tag2',
                },
              },
              __status__: 4,
            },
            {
              __dataID__: 'client:client:-7090457799:VGFnLzI3OQ==\n',
              node: {
                __dataID__: 'VGFnLzI3OQ==\n',
                id: 'VGFnLzI3OQ==\n',
                __status__: 4,
                fragment: 't=19415.728719101124,19445.728719101124&type=tags',
                parsed_fragment: {
                  t: [19415.728719101124, 19445.728719101124],
                },
                tag_text_object: {
                  __dataID__: 'VGFnVGV4dC80Mg==\n',
                  id: 'VGFnVGV4dC80Mg==\n',
                  text: 'Tag1',
                },
              },
              __status__: 4,
            },
            {
              __dataID__: 'client:client:-7090457799:VGFnLzI3OA==\n',
              node: {
                __dataID__: 'VGFnLzI3OA==\n',
                id: 'VGFnLzI3OA==\n',
                __status__: 4,
                fragment: 't=10820.223817415732,10850.223817415732&type=tags',
                parsed_fragment: {
                  t: [10820.223817415732, 10850.223817415732],
                },
                tag_text_object: {
                  __dataID__: 'VGFnVGV4dC80Mg==\n',
                  id: 'VGFnVGV4dC80Mg==\n',
                  text: 'Tag1',
                },
              },
              __status__: 4,
            },
          ],
          __status__: 4,
        },
        geolocations: {
          __dataID__:
            'client:-70904577910_first(10000),annotation_type(geolocation)',
          edges: [],
        },
      },
      currentUser: {
        __dataID__: 'VXNlci80\n',
        id: 'VXNlci80\n',
        dbid: 4,
        name: 'Laurian',
        token:
          'eyJwcm92aWRlciI6ImNoZWNrZGVzayIsImlkIjoiIiwidG9rZW4iOiJxVktU++ncFB5RCIsInNlY3JldCI6IjFoV2h4enJwIn0=++n',
        email: 'laurian@meedan.com',
        is_admin: false,
        accepted_terms: true,
        last_accepted_terms_at: '2020-05-14 16:49:31 UTC',
        login: 'laurian',
        permissions:
          '{"read User":true,"update User":true,"destroy User":true,"create Source":true,"create TeamUser":false,"create Team":true,"create Project":true}',
        profile_image: 'http://localhost:3000/images/user.png',
        settings: {},
        source_id: 4,
        team_ids: [2],
        user_teams:
          '{"workspace1":{"id":2,"name":"workspace1","role":"owner","status":"member"}}',
        current_project: {
          __dataID__: 'UHJvamVjdC8x\n',
          dbid: 1,
          id: 'UHJvamVjdC8x\n',
          title: 'List1',
          team: {
            __dataID__: 'VGVhbS8y\n',
            id: 'VGVhbS8y\n',
            dbid: 2,
            avatar: 'http://localhost:3000/images/team.png',
            name: 'workspace1',
            slug: 'workspace1',
          },
        },
        current_team: {
          __dataID__: 'VGVhbS8y\n',
          id: 'VGVhbS8y\n',
          dbid: 2,
          avatar: 'http://localhost:3000/images/team.png',
          name: 'workspace1',
          slug: 'workspace1',
          projects: {
            __dataID__: 'client:-7090457791_first(10000)',
            edges: [
              {
                __dataID__: 'client:client:-7090457791:UHJvamVjdC8x\n',
                node: {
                  __dataID__: 'UHJvamVjdC8x\n',
                  id: 'UHJvamVjdC8x\n',
                  dbid: 1,
                  title: 'List1',
                  team: {
                    __dataID__: 'VGVhbS8y\n',
                    id: 'VGVhbS8y\n',
                    dbid: 2,
                    avatar: 'http://localhost:3000/images/team.png',
                    name: 'workspace1',
                    slug: 'workspace1',
                  },
                },
              },
              {
                __dataID__: 'client:client:-7090457791:UHJvamVjdC8y\n',
                node: {
                  __dataID__: 'UHJvamVjdC8y\n',
                  id: 'UHJvamVjdC8y\n',
                  dbid: 2,
                  title: 'List2',
                  team: {
                    __dataID__: 'VGVhbS8y\n',
                    id: 'VGVhbS8y\n',
                    dbid: 2,
                    avatar: 'http://localhost:3000/images/team.png',
                    name: 'workspace1',
                    slug: 'workspace1',
                  },
                },
              },
            ],
          },
        },
        teams:
          '{"workspace1":{"id":2,"name":"workspace1","role":"owner","status":"member"}}',
      },
    })).toEqual({
      project: {
        projectclips: [],
        projecttags: [],
        projectplaces: [],
      },
      commentThreads: [],
      videoClips: [],
      videoTags: [
        {
          id: 'VGFnVGV4dC80Mw==\n',
          name: 'Tag2',
          project_tag: {
            id: 'VGFnVGV4dC80Mw==\n',
            name: 'Tag2',
          },
          instances: [
            {
              start_seconds: 19415.728719101124,
              end_seconds: 19445.728719101124,
              id: 'VGFnLzI4MA==\n',
            },
          ],
          node: {
            __dataID__: 'VGFnLzI4MA==\n',
            id: 'VGFnLzI4MA==\n',
            __status__: 4,
            fragment: 't=19415.728719101124,19445.728719101124&type=tags',
            parsed_fragment: {
              t: [19415.728719101124, 19445.728719101124],
            },
            tag_text_object: {
              __dataID__: 'VGFnVGV4dC80Mw==\n',
              id: 'VGFnVGV4dC80Mw==\n',
              text: 'Tag2',
            },
          },
          type: 'tag',
        },
        {
          id: 'VGFnVGV4dC80Mg==\n',
          name: 'Tag1',
          project_tag: {
            id: 'VGFnVGV4dC80Mg==\n',
            name: 'Tag1',
          },
          instances: [
            {
              start_seconds: 19415.728719101124,
              end_seconds: 19445.728719101124,
              id: 'VGFnLzI3OQ==\n',
            },
            {
              start_seconds: 10820.223817415732,
              end_seconds: 10850.223817415732,
              id: 'VGFnLzI3OA==\n',
            },
          ],
          node: {
            __dataID__: 'VGFnLzI3OQ==\n',
            id: 'VGFnLzI3OQ==\n',
            __status__: 4,
            fragment: 't=19415.728719101124,19445.728719101124&type=tags',
            parsed_fragment: {
              t: [19415.728719101124, 19445.728719101124],
            },
            tag_text_object: {
              __dataID__: 'VGFnVGV4dC80Mg==\n',
              id: 'VGFnVGV4dC80Mg==\n',
              text: 'Tag1',
            },
          },
          type: 'tag',
        },
      ],
      videoPlaces: [],
      user: {
        first_name: 'Laurian',
        id: 'VXNlci80\n',
        last_name: '',
        profile_img_url: 'http://localhost:3000/images/user.png',
      },
    });
  });

  it('convert geotags', () => {
    expect(getTimelineData({
      media: {
        comments: {
          __dataID__:
            'client:-7090457795_first(10000),annotation_type(comment)',
          edges: [],
        },
        clips: {
          __dataID__: 'client:-7090457798_first(10000),annotation_type(clip)',
          edges: [],
        },
        tags: {
          __dataID__: 'client:-7090457799_first(10000)',
          edges: [],
        },
        geolocations: {
          __dataID__:
            'client:-70904577910_first(10000),annotation_type(geolocation)',
          edges: [
            {
              __dataID__: 'client:client:-70904577910:RHluYW1pYy8yODQ=\n',
              node: {
                __dataID__: 'RHluYW1pYy8yODQ=\n',
                id: 'RHluYW1pYy8yODQ=\n',
                parsed_fragment: {
                  t: [31247.188407303373, 31277.188407303373],
                },
                content:
                  '[{"id":82,"annotation_id":284,"field_name":"geolocation_viewport","annotation_type":"geolocation","field_type":"json","value":{"viewport":{"south":43.66304827083646,"west":7.11772288115232,"north":43.6704987282918,"east":7.134889018847632},"zoom":15},"created_at":"2020-06-26T15:08:55.982Z","updated_at":"2020-06-26T15:08:55.982Z","value_json":{"zoom":15,"viewport":{"east":7.134889018847632,"west":7.11772288115232,"north":43.6704987282918,"south":43.66304827083646}},"formatted_value":"{\\"viewport\\"=\\u003e{\\"south\\"=\\u003e43.66304827083646, \\"west\\"=\\u003e7.11772288115232, \\"north\\"=\\u003e43.6704987282918, \\"east\\"=\\u003e7.134889018847632}, \\"zoom\\"=\\u003e15}"},{"id":83,"annotation_id":284,"field_name":"geolocation_location","annotation_type":"geolocation","field_type":"geojson","value":"{\\"type\\":\\"Feature\\",\\"bbox\\":[7.11772288115232,43.66304827083646,7.134889018847632,43.6704987282918],\\"geometry\\":{\\"type\\":\\"Polygon\\",\\"coordinates\\":[[[7.12270106108396,43.66866724322483],[7.119847190692115,43.66680465872263],[7.121885669543433,43.66500410543134],[7.124031436755347,43.664367690056956],[7.126520526721167,43.664476346818034],[7.1297606352111575,43.665004105431386],[7.1318849447509525,43.66556290361181],[7.132593047930884,43.667378961773856],[7.129524600817847,43.66854307272282],[7.1274646642944095,43.66776700126538],[7.1260913732787845,43.66941226084253],[7.124160182788062,43.667410005025445]]]},\\"properties\\":{\\"name\\":\\"Polygon\\"}}","created_at":"2020-06-26T15:08:56.127Z","updated_at":"2020-06-26T15:08:56.127Z","value_json":{"bbox":[7.11772288115232,43.66304827083646,7.134889018847632,43.6704987282918],"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[7.12270106108396,43.66866724322483],[7.119847190692115,43.66680465872263],[7.121885669543433,43.66500410543134],[7.124031436755347,43.664367690056956],[7.126520526721167,43.664476346818034],[7.1297606352111575,43.665004105431386],[7.1318849447509525,43.66556290361181],[7.132593047930884,43.667378961773856],[7.129524600817847,43.66854307272282],[7.1274646642944095,43.66776700126538],[7.1260913732787845,43.66941226084253],[7.124160182788062,43.667410005025445]]]},"properties":{"name":"Polygon"}},"formatted_value":"Polygon (7.12270106108396, 43.66866724322483, 7.119847190692115, 43.66680465872263, 7.121885669543433, 43.66500410543134, 7.124031436755347, 43.664367690056956, 7.126520526721167, 43.664476346818034, 7.1297606352111575, 43.665004105431386, 7.1318849447509525, 43.66556290361181, 7.132593047930884, 43.667378961773856, 7.129524600817847, 43.66854307272282, 7.1274646642944095, 43.66776700126538, 7.1260913732787845, 43.66941226084253, 7.124160182788062, 43.667410005025445)"}]',
              },
            },
            {
              __dataID__: 'client:client:-70904577910:RHluYW1pYy8yODM=\n',
              node: {
                __dataID__: 'RHluYW1pYy8yODM=\n',
                id: 'RHluYW1pYy8yODM=\n',
                parsed_fragment: {
                  t: [11275.279959269665, 11305.279959269665],
                },
                content:
                  '[{"id":80,"annotation_id":283,"field_name":"geolocation_viewport","annotation_type":"geolocation","field_type":"json","value":{"viewport":{"south":41.66447634454017,"west":11.986681493750018,"north":42.1550325308976,"east":13.085314306250018},"zoom":9},"created_at":"2020-06-26T15:07:53.059Z","updated_at":"2020-06-26T15:07:53.059Z","value_json":{"zoom":9,"viewport":{"east":13.085314306250018,"west":11.986681493750018,"north":42.1550325308976,"south":41.66447634454017}},"formatted_value":"{\\"viewport\\"=\\u003e{\\"south\\"=\\u003e41.66447634454017, \\"west\\"=\\u003e11.986681493750018, \\"north\\"=\\u003e42.1550325308976, \\"east\\"=\\u003e13.085314306250018}, \\"zoom\\"=\\u003e9}"},{"id":81,"annotation_id":283,"field_name":"geolocation_location","annotation_type":"geolocation","field_type":"geojson","value":"{\\"type\\":\\"Feature\\",\\"bbox\\":[11.986681493750018,41.66447634454017,13.085314306250018,42.1550325308976],\\"geometry\\":{\\"type\\":\\"Point\\",\\"coordinates\\":[12.4963655,41.90278349999999]},\\"properties\\":{\\"name\\":\\"Rome\\"}}","created_at":"2020-06-26T15:07:53.202Z","updated_at":"2020-06-26T15:07:53.202Z","value_json":{"bbox":[11.986681493750018,41.66447634454017,13.085314306250018,42.1550325308976],"type":"Feature","geometry":{"type":"Point","coordinates":[12.4963655,41.90278349999999]},"properties":{"name":"Rome"}},"formatted_value":"Rome (12.4963655, 41.90278349999999)"}]',
              },
            },
            {
              __dataID__: 'client:client:-70904577910:RHluYW1pYy8yODI=\n',
              node: {
                __dataID__: 'RHluYW1pYy8yODI=\n',
                id: 'RHluYW1pYy8yODI=\n',
                parsed_fragment: {
                  t: [11275.279959269665, 11305.279959269665],
                },
                content:
                  '[{"id":78,"annotation_id":282,"field_name":"geolocation_viewport","annotation_type":"geolocation","field_type":"json","value":{"viewport":{"east":2.621718103125028,"west":2.072401696875028,"north":48.96718146676017,"south":48.75033902000453},"zoom":10},"created_at":"2020-06-26T15:07:42.983Z","updated_at":"2020-06-26T15:07:42.983Z","value_json":{"zoom":10,"viewport":{"east":2.621718103125028,"west":2.072401696875028,"north":48.96718146676017,"south":48.75033902000453}},"formatted_value":"{\\"viewport\\"=\\u003e{\\"east\\"=\\u003e2.621718103125028, \\"west\\"=\\u003e2.072401696875028, \\"north\\"=\\u003e48.96718146676017, \\"south\\"=\\u003e48.75033902000453}, \\"zoom\\"=\\u003e10}"},{"id":79,"annotation_id":282,"field_name":"geolocation_location","annotation_type":"geolocation","field_type":"geojson","value":"{\\"bbox\\":[2.072401696875028,48.75033902000453,2.621718103125028,48.96718146676017],\\"type\\":\\"Feature\\",\\"geometry\\":{\\"type\\":\\"Point\\",\\"coordinates\\":[2.3522219,48.85661400000001]},\\"properties\\":{\\"name\\":\\"Paris\\"}}","created_at":"2020-06-26T15:07:43.132Z","updated_at":"2020-06-26T15:07:43.132Z","value_json":{"bbox":[2.072401696875028,48.75033902000453,2.621718103125028,48.96718146676017],"type":"Feature","geometry":{"type":"Point","coordinates":[2.3522219,48.85661400000001]},"properties":{"name":"Paris"}},"formatted_value":"Paris (2.3522219, 48.85661400000001)"}]',
              },
            },
            {
              __dataID__: 'client:client:-70904577910:RHluYW1pYy8yODE=\n',
              node: {
                __dataID__: 'RHluYW1pYy8yODE=\n',
                id: 'RHluYW1pYy8yODE=\n',
                parsed_fragment: {
                  t: [19415.728719101124, 19445.728719101124],
                },
                content:
                  '[{"id":76,"annotation_id":281,"field_name":"geolocation_viewport","annotation_type":"geolocation","field_type":"json","value":{"viewport":{"south":48.75033902000453,"west":2.072401696875028,"north":48.96718146676017,"east":2.621718103125028},"zoom":10},"created_at":"2020-06-26T15:07:38.386Z","updated_at":"2020-06-26T15:07:38.386Z","value_json":{"zoom":10,"viewport":{"east":2.621718103125028,"west":2.072401696875028,"north":48.96718146676017,"south":48.75033902000453}},"formatted_value":"{\\"viewport\\"=\\u003e{\\"south\\"=\\u003e48.75033902000453, \\"west\\"=\\u003e2.072401696875028, \\"north\\"=\\u003e48.96718146676017, \\"east\\"=\\u003e2.621718103125028}, \\"zoom\\"=\\u003e10}"},{"id":77,"annotation_id":281,"field_name":"geolocation_location","annotation_type":"geolocation","field_type":"geojson","value":"{\\"type\\":\\"Feature\\",\\"bbox\\":[2.072401696875028,48.75033902000453,2.621718103125028,48.96718146676017],\\"geometry\\":{\\"type\\":\\"Point\\",\\"coordinates\\":[2.3522219,48.85661400000001]},\\"properties\\":{\\"name\\":\\"Paris\\"}}","created_at":"2020-06-26T15:07:38.531Z","updated_at":"2020-06-26T15:07:38.531Z","value_json":{"bbox":[2.072401696875028,48.75033902000453,2.621718103125028,48.96718146676017],"type":"Feature","geometry":{"type":"Point","coordinates":[2.3522219,48.85661400000001]},"properties":{"name":"Paris"}},"formatted_value":"Paris (2.3522219, 48.85661400000001)"}]',
              },
            },
          ],
        },
      },
      currentUser: {
        __dataID__: 'VXNlci80\n',
        id: 'VXNlci80\n',
        dbid: 4,
        name: 'Laurian',
        token:
          'eyJwcm92aWRlciI6ImNoZWNrZGVzayIsImlkIjoiIiwidG9rZW4iOiJxVktU++ncFB5RCIsInNlY3JldCI6IjFoV2h4enJwIn0=++n',
        email: 'laurian@meedan.com',
        is_admin: false,
        accepted_terms: true,
        last_accepted_terms_at: '2020-05-14 16:49:31 UTC',
        login: 'laurian',
        permissions:
          '{"read User":true,"update User":true,"destroy User":true,"create Source":true,"create TeamUser":false,"create Team":true,"create Project":true}',
        profile_image: 'http://localhost:3000/images/user.png',
        settings: {},
        source_id: 4,
        team_ids: [2],
        user_teams:
          '{"workspace1":{"id":2,"name":"workspace1","role":"owner","status":"member"}}',
        current_project: {
          __dataID__: 'UHJvamVjdC8x\n',
          dbid: 1,
          id: 'UHJvamVjdC8x\n',
          title: 'List1',
          team: {
            __dataID__: 'VGVhbS8y\n',
            id: 'VGVhbS8y\n',
            dbid: 2,
            avatar: 'http://localhost:3000/images/team.png',
            name: 'workspace1',
            slug: 'workspace1',
          },
        },
        current_team: {
          __dataID__: 'VGVhbS8y\n',
          id: 'VGVhbS8y\n',
          dbid: 2,
          avatar: 'http://localhost:3000/images/team.png',
          name: 'workspace1',
          slug: 'workspace1',
          projects: {
            __dataID__: 'client:-7090457791_first(10000)',
            edges: [
              {
                __dataID__: 'client:client:-7090457791:UHJvamVjdC8x\n',
                node: {
                  __dataID__: 'UHJvamVjdC8x\n',
                  id: 'UHJvamVjdC8x\n',
                  dbid: 1,
                  title: 'List1',
                  team: {
                    __dataID__: 'VGVhbS8y\n',
                    id: 'VGVhbS8y\n',
                    dbid: 2,
                    avatar: 'http://localhost:3000/images/team.png',
                    name: 'workspace1',
                    slug: 'workspace1',
                  },
                },
              },
              {
                __dataID__: 'client:client:-7090457791:UHJvamVjdC8y\n',
                node: {
                  __dataID__: 'UHJvamVjdC8y\n',
                  id: 'UHJvamVjdC8y\n',
                  dbid: 2,
                  title: 'List2',
                  team: {
                    __dataID__: 'VGVhbS8y\n',
                    id: 'VGVhbS8y\n',
                    dbid: 2,
                    avatar: 'http://localhost:3000/images/team.png',
                    name: 'workspace1',
                    slug: 'workspace1',
                  },
                },
              },
            ],
          },
        },
        teams:
          '{"workspace1":{"id":2,"name":"workspace1","role":"owner","status":"member"}}',
      },
    })).toEqual({
      project: {
        projectclips: [],
        projecttags: [],
        projectplaces: [],
      },
      commentThreads: [],
      videoClips: [],
      videoTags: [],
      videoPlaces: [
        {
          id: 'place-Polygon',
          name: 'Polygon',
          viewport: {
            east: 7.134889018847632,
            west: 7.11772288115232,
            north: 43.6704987282918,
            south: 43.66304827083646,
          },
          zoom: 15,
          lng: [
            [7.12270106108396, 43.66866724322483],
            [7.119847190692115, 43.66680465872263],
            [7.121885669543433, 43.66500410543134],
            [7.124031436755347, 43.664367690056956],
            [7.126520526721167, 43.664476346818034],
            [7.1297606352111575, 43.665004105431386],
            [7.1318849447509525, 43.66556290361181],
            [7.132593047930884, 43.667378961773856],
            [7.129524600817847, 43.66854307272282],
            [7.1274646642944095, 43.66776700126538],
            [7.1260913732787845, 43.66941226084253],
            [7.124160182788062, 43.667410005025445],
          ],
          type: 'polygon',
          test: {
            geolocation_location: {
              bbox: [
                7.11772288115232,
                43.66304827083646,
                7.134889018847632,
                43.6704987282918,
              ],
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [7.12270106108396, 43.66866724322483],
                    [7.119847190692115, 43.66680465872263],
                    [7.121885669543433, 43.66500410543134],
                    [7.124031436755347, 43.664367690056956],
                    [7.126520526721167, 43.664476346818034],
                    [7.1297606352111575, 43.665004105431386],
                    [7.1318849447509525, 43.66556290361181],
                    [7.132593047930884, 43.667378961773856],
                    [7.129524600817847, 43.66854307272282],
                    [7.1274646642944095, 43.66776700126538],
                    [7.1260913732787845, 43.66941226084253],
                    [7.124160182788062, 43.667410005025445],
                  ],
                ],
              },
              properties: {
                name: 'Polygon',
              },
            },
          },
          project_place: {
            id: 'place-Polygon',
            name: 'Polygon',
          },
          instances: [
            {
              id: 'RHluYW1pYy8yODQ=\n',
              start_seconds: 31247.188407303373,
              end_seconds: 31277.188407303373,
            },
          ],
          node: {
            __dataID__: 'RHluYW1pYy8yODQ=\n',
            id: 'RHluYW1pYy8yODQ=\n',
            parsed_fragment: {
              t: [31247.188407303373, 31277.188407303373],
            },
            content:
              '[{"id":82,"annotation_id":284,"field_name":"geolocation_viewport","annotation_type":"geolocation","field_type":"json","value":{"viewport":{"south":43.66304827083646,"west":7.11772288115232,"north":43.6704987282918,"east":7.134889018847632},"zoom":15},"created_at":"2020-06-26T15:08:55.982Z","updated_at":"2020-06-26T15:08:55.982Z","value_json":{"zoom":15,"viewport":{"east":7.134889018847632,"west":7.11772288115232,"north":43.6704987282918,"south":43.66304827083646}},"formatted_value":"{\\"viewport\\"=\\u003e{\\"south\\"=\\u003e43.66304827083646, \\"west\\"=\\u003e7.11772288115232, \\"north\\"=\\u003e43.6704987282918, \\"east\\"=\\u003e7.134889018847632}, \\"zoom\\"=\\u003e15}"},{"id":83,"annotation_id":284,"field_name":"geolocation_location","annotation_type":"geolocation","field_type":"geojson","value":"{\\"type\\":\\"Feature\\",\\"bbox\\":[7.11772288115232,43.66304827083646,7.134889018847632,43.6704987282918],\\"geometry\\":{\\"type\\":\\"Polygon\\",\\"coordinates\\":[[[7.12270106108396,43.66866724322483],[7.119847190692115,43.66680465872263],[7.121885669543433,43.66500410543134],[7.124031436755347,43.664367690056956],[7.126520526721167,43.664476346818034],[7.1297606352111575,43.665004105431386],[7.1318849447509525,43.66556290361181],[7.132593047930884,43.667378961773856],[7.129524600817847,43.66854307272282],[7.1274646642944095,43.66776700126538],[7.1260913732787845,43.66941226084253],[7.124160182788062,43.667410005025445]]]},\\"properties\\":{\\"name\\":\\"Polygon\\"}}","created_at":"2020-06-26T15:08:56.127Z","updated_at":"2020-06-26T15:08:56.127Z","value_json":{"bbox":[7.11772288115232,43.66304827083646,7.134889018847632,43.6704987282918],"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[7.12270106108396,43.66866724322483],[7.119847190692115,43.66680465872263],[7.121885669543433,43.66500410543134],[7.124031436755347,43.664367690056956],[7.126520526721167,43.664476346818034],[7.1297606352111575,43.665004105431386],[7.1318849447509525,43.66556290361181],[7.132593047930884,43.667378961773856],[7.129524600817847,43.66854307272282],[7.1274646642944095,43.66776700126538],[7.1260913732787845,43.66941226084253],[7.124160182788062,43.667410005025445]]]},"properties":{"name":"Polygon"}},"formatted_value":"Polygon (7.12270106108396, 43.66866724322483, 7.119847190692115, 43.66680465872263, 7.121885669543433, 43.66500410543134, 7.124031436755347, 43.664367690056956, 7.126520526721167, 43.664476346818034, 7.1297606352111575, 43.665004105431386, 7.1318849447509525, 43.66556290361181, 7.132593047930884, 43.667378961773856, 7.129524600817847, 43.66854307272282, 7.1274646642944095, 43.66776700126538, 7.1260913732787845, 43.66941226084253, 7.124160182788062, 43.667410005025445)"}]',
          },
          polygon: [
            {
              lat: 43.66866724322483,
              lng: 7.12270106108396,
            },
            {
              lat: 43.66680465872263,
              lng: 7.119847190692115,
            },
            {
              lat: 43.66500410543134,
              lng: 7.121885669543433,
            },
            {
              lat: 43.664367690056956,
              lng: 7.124031436755347,
            },
            {
              lat: 43.664476346818034,
              lng: 7.126520526721167,
            },
            {
              lat: 43.665004105431386,
              lng: 7.1297606352111575,
            },
            {
              lat: 43.66556290361181,
              lng: 7.1318849447509525,
            },
            {
              lat: 43.667378961773856,
              lng: 7.132593047930884,
            },
            {
              lat: 43.66854307272282,
              lng: 7.129524600817847,
            },
            {
              lat: 43.66776700126538,
              lng: 7.1274646642944095,
            },
            {
              lat: 43.66941226084253,
              lng: 7.1260913732787845,
            },
            {
              lat: 43.667410005025445,
              lng: 7.124160182788062,
            },
          ],
        },
        {
          id: 'place-Rome',
          name: 'Rome',
          viewport: {
            east: 13.085314306250018,
            west: 11.986681493750018,
            north: 42.1550325308976,
            south: 41.66447634454017,
          },
          zoom: 9,
          lat: 41.90278349999999,
          lng: 12.4963655,
          type: 'marker',
          test: {
            geolocation_location: {
              bbox: [
                11.986681493750018,
                41.66447634454017,
                13.085314306250018,
                42.1550325308976,
              ],
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [12.4963655, 41.90278349999999],
              },
              properties: {
                name: 'Rome',
              },
            },
          },
          project_place: {
            id: 'place-Rome',
            name: 'Rome',
          },
          instances: [
            {
              id: 'RHluYW1pYy8yODM=\n',
              start_seconds: 11275.279959269665,
              end_seconds: 11305.279959269665,
            },
          ],
          node: {
            __dataID__: 'RHluYW1pYy8yODM=\n',
            id: 'RHluYW1pYy8yODM=\n',
            parsed_fragment: {
              t: [11275.279959269665, 11305.279959269665],
            },
            content:
              '[{"id":80,"annotation_id":283,"field_name":"geolocation_viewport","annotation_type":"geolocation","field_type":"json","value":{"viewport":{"south":41.66447634454017,"west":11.986681493750018,"north":42.1550325308976,"east":13.085314306250018},"zoom":9},"created_at":"2020-06-26T15:07:53.059Z","updated_at":"2020-06-26T15:07:53.059Z","value_json":{"zoom":9,"viewport":{"east":13.085314306250018,"west":11.986681493750018,"north":42.1550325308976,"south":41.66447634454017}},"formatted_value":"{\\"viewport\\"=\\u003e{\\"south\\"=\\u003e41.66447634454017, \\"west\\"=\\u003e11.986681493750018, \\"north\\"=\\u003e42.1550325308976, \\"east\\"=\\u003e13.085314306250018}, \\"zoom\\"=\\u003e9}"},{"id":81,"annotation_id":283,"field_name":"geolocation_location","annotation_type":"geolocation","field_type":"geojson","value":"{\\"type\\":\\"Feature\\",\\"bbox\\":[11.986681493750018,41.66447634454017,13.085314306250018,42.1550325308976],\\"geometry\\":{\\"type\\":\\"Point\\",\\"coordinates\\":[12.4963655,41.90278349999999]},\\"properties\\":{\\"name\\":\\"Rome\\"}}","created_at":"2020-06-26T15:07:53.202Z","updated_at":"2020-06-26T15:07:53.202Z","value_json":{"bbox":[11.986681493750018,41.66447634454017,13.085314306250018,42.1550325308976],"type":"Feature","geometry":{"type":"Point","coordinates":[12.4963655,41.90278349999999]},"properties":{"name":"Rome"}},"formatted_value":"Rome (12.4963655, 41.90278349999999)"}]',
          },
        },
        {
          id: 'place-Paris',
          name: 'Paris',
          viewport: {
            east: 2.621718103125028,
            west: 2.072401696875028,
            north: 48.96718146676017,
            south: 48.75033902000453,
          },
          zoom: 10,
          lat: 48.85661400000001,
          lng: 2.3522219,
          type: 'marker',
          test: {
            geolocation_location: {
              bbox: [
                2.072401696875028,
                48.75033902000453,
                2.621718103125028,
                48.96718146676017,
              ],
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [2.3522219, 48.85661400000001],
              },
              properties: {
                name: 'Paris',
              },
            },
          },
          project_place: {
            id: 'place-Paris',
            name: 'Paris',
          },
          instances: [
            {
              id: 'RHluYW1pYy8yODI=\n',
              start_seconds: 11275.279959269665,
              end_seconds: 11305.279959269665,
            },
            {
              id: 'RHluYW1pYy8yODE=\n',
              start_seconds: 19415.728719101124,
              end_seconds: 19445.728719101124,
            },
          ],
          node: {
            __dataID__: 'RHluYW1pYy8yODI=\n',
            id: 'RHluYW1pYy8yODI=\n',
            parsed_fragment: {
              t: [11275.279959269665, 11305.279959269665],
            },
            content:
              '[{"id":78,"annotation_id":282,"field_name":"geolocation_viewport","annotation_type":"geolocation","field_type":"json","value":{"viewport":{"east":2.621718103125028,"west":2.072401696875028,"north":48.96718146676017,"south":48.75033902000453},"zoom":10},"created_at":"2020-06-26T15:07:42.983Z","updated_at":"2020-06-26T15:07:42.983Z","value_json":{"zoom":10,"viewport":{"east":2.621718103125028,"west":2.072401696875028,"north":48.96718146676017,"south":48.75033902000453}},"formatted_value":"{\\"viewport\\"=\\u003e{\\"east\\"=\\u003e2.621718103125028, \\"west\\"=\\u003e2.072401696875028, \\"north\\"=\\u003e48.96718146676017, \\"south\\"=\\u003e48.75033902000453}, \\"zoom\\"=\\u003e10}"},{"id":79,"annotation_id":282,"field_name":"geolocation_location","annotation_type":"geolocation","field_type":"geojson","value":"{\\"bbox\\":[2.072401696875028,48.75033902000453,2.621718103125028,48.96718146676017],\\"type\\":\\"Feature\\",\\"geometry\\":{\\"type\\":\\"Point\\",\\"coordinates\\":[2.3522219,48.85661400000001]},\\"properties\\":{\\"name\\":\\"Paris\\"}}","created_at":"2020-06-26T15:07:43.132Z","updated_at":"2020-06-26T15:07:43.132Z","value_json":{"bbox":[2.072401696875028,48.75033902000453,2.621718103125028,48.96718146676017],"type":"Feature","geometry":{"type":"Point","coordinates":[2.3522219,48.85661400000001]},"properties":{"name":"Paris"}},"formatted_value":"Paris (2.3522219, 48.85661400000001)"}]',
          },
        },
      ],
      user: {
        first_name: 'Laurian',
        id: 'VXNlci80\n',
        last_name: '',
        profile_img_url: 'http://localhost:3000/images/user.png',
      },
    });
  });
});
