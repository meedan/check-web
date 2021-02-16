const currentUser = {
  id: 'VXNlci8x\n',
  dbid: 1,
  name: 'Karim Ratib',
  email: 'karim@meedan.com',
  permissions: '{"read User":true,"update User":true,"destroy User":false,"create Source":true,"create TeamUser":false,"create Team":true,"create Project":true}',
  provider: 'slack',
  profile_image: 'https://avatars.slack-edge.com/2017-08-29/233586829012_e4eeb443f541e4164139_192.jpg',
  current_team: {
    id: 'VGVhbS8x\n',
    dbid: 1,
    name: 'Karim',
    avatar: 'http://localhost:3000/uploads/team/1/LSD_logo_headphone-300x300.jpg',
    slug: 'karim',
    members_count: 2,
  },
  team_users: {
    edges: [
      {
        node: {
          team: {
            id: 'VGVhbS8x\n',
            dbid: 1,
            name: 'Karim',
            avatar: 'http://localhost:3000/uploads/team/1/LSD_logo_headphone-300x300.jpg',
            slug: 'karim',
            private: true,
            members_count: 2,
            permissions: '{"read Team":true,"update Team":true,"destroy Team":true,"create Project":true,"create Account":false,"create TeamUser":false,"create User":true,"create Contact":true}',
          },
          id: 'VGVhbVVzZXIvMQ==\n',
          status: 'member',
          role: 'admin',
        },
      },
      {
        node: {
          team: {
            id: 'VGVhbS8y\n',
            dbid: 2,
            name: 'team2',
            avatar: 'http://localhost:3000/images/team.png',
            slug: 'team2',
            private: true,
            members_count: 1,
            permissions: '{"read Team":true,"update Team":false,"destroy Team":false,"create Project":true,"create Account":false,"create TeamUser":false,"create User":true,"create Contact":true}',
          },
          id: 'VGVhbVVzZXIvMg==\n',
          status: 'member',
          role: 'admin',
        },
      },
    ],
  },
  source: {
    id: 'U291cmNlLzE=\n',
    dbid: 1,
    created_at: '1506034067',
    updated_at: '1506983317',
    name: 'Karim Ratib',
    image: 'http://localhost:3000/uploads/source/1/beaker-muppet.jpg',
    user_id: 1,
    description: '',
    permissions: '{"read Source":true,"update Source":true,"destroy Source":false,"create Account":false,"create ProjectSource":false,"create Project":true}',
    verification_statuses: '{"label":"Status","default":"undetermined","statuses":[{"description":"Default, just added to Check, no work has started","id":"undetermined","label":"Unstarted","style":{"backgroundColor":"green","color":"orange"}},{"description":"Conclusion: the source is credible","id":"credible","label":"Credible","style":{"backgroundColor":"green","color":"orange"}},{"description":"Conclusion: the source is not credible","id":"not_credible","label":"Not Credible","style":{"backgroundColor":"green","color":"orange"}},{"description":"Conclusion: the source is slightly credible","id":"slightly_credible","label":"Slightly Credible","style":{"backgroundColor":"green","color":"orange"}},{"description":"Conclusion: the source is a sockpuppet","id":"sockpuppet","label":"Sockpuppet","style":{"backgroundColor":"green","color":"orange"}}]}',
    accounts: {
      edges: [
        {
          node: {
            url: 'https://meedan.slack.com/team/karim',
            provider: 'page',
          },
        },
      ],
    },
    account_sources: {
      edges: [
        {
          node: {
            id: 'QWNjb3VudFNvdXJjZS8x\n',
            account: {
              id: 'QWNjb3VudC8x\n',
              created_at: '1506034068',
              updated_at: '1506034068',
              embed: {
                published_at: '',
                username: 'Slack',
                title: 'Slack',
                description: '',
                picture: 'http://pender:3200/screenshots/https-meedan-slack-com-redir-team-karim.png',
                author_url: 'https://meedan.slack.com',
                author_picture: 'http://pender:3200/screenshots/https-meedan-slack-com-redir-team-karim.png',
                author_name: 'Slack',
                raw: {
                  metatags: [
                    {
                      'http-equiv': 'refresh',
                      content: '0; URL=/?redir=%252Fteam%252Fkarim&nojsmode=1',
                    },
                    {
                      name: 'referrer',
                      content: 'no-referrer',
                    },
                    {
                      name: 'superfish',
                      content: 'nofish',
                    },
                    {
                      name: 'author',
                      content: 'Slack',
                    },
                    {
                      name: 'msapplication-TileColor',
                      content: '#FFFFFF',
                    },
                    {
                      name: 'msapplication-TileImage',
                      content: 'https://a.slack-edge.com/436da/marketing/img/meta/app-144.png',
                    },
                  ],
                  oembed: {
                    type: 'rich',
                    version: '1.0',
                    title: 'Slack',
                    author_name: 'Slack',
                    author_url: '',
                    provider_name: 'page',
                    provider_url: 'http://meedan.slack.com',
                    thumbnail_url: 'http://pender:3200/screenshots/https-meedan-slack-com-redir-team-karim.png',
                    html: '<iframe src="https://meedan.slack.com/?redir=/team/karim" width="800" height="200" scrolling="no" border="0" seamless>Not supported</iframe>',
                    width: 800,
                    height: 200,
                  },
                },
                url: 'https://meedan.slack.com/?redir=/team/karim',
                provider: 'page',
                type: 'item',
                parsed_at: '2017-09-21T22:47:48.943+00:00',
                favicon: 'https://www.google.com/s2/favicons?domain_url=meedan.slack.com/?redir=/team/karim',
                embed_tag: '<script src="http://pender:3200/api/medias.js?url=https%3A%2F%2Fmeedan.slack.com%2Fteam%2Fkarim" type="text/javascript"></script>',
                refreshes_count: 1,
              },
              url: 'https://meedan.slack.com/team/karim',
              provider: 'page',
            },
          },
        },
      ],
    },
    tags: {
      edges: [],
    },
    medias: {
      edges: [],
    },
  },
};

const otherUser = {
  id: 'VXNlci8y\n',
  dbid: 2,
  name: 'KR',
  email: 'karim.ratib+email@gmail.com',
  permissions: '{"read User":true,"update User":false,"destroy User":false,"create Source":true,"create TeamUser":false,"create Team":true,"create Project":true}',
  provider: '',
  profile_image: 'http://localhost:3000/images/user.png',
  current_team: {
    id: 'VGVhbS8x\n',
    dbid: 1,
    name: 'Karim',
    avatar: 'http://localhost:3000/uploads/team/1/LSD_logo_headphone-300x300.jpg',
    slug: 'karim',
    members_count: 2,
  },
  team_users: {
    edges: [
      {
        node: {
          team: {
            id: 'VGVhbS8x\n',
            dbid: 1,
            name: 'Karim',
            avatar: 'http://localhost:3000/uploads/team/1/LSD_logo_headphone-300x300.jpg',
            slug: 'karim',
            private: true,
            members_count: 2,
            permissions: '{"read Team":true,"update Team":true,"destroy Team":true,"create Project":true,"create Account":false,"create TeamUser":false,"create User":true,"create Contact":true}',
          },
          id: 'VGVhbVVzZXIvMw==\n',
          status: 'member',
          role: 'collaborator',
        },
      },
      {
        node: {
          team: {
            name: 'Team otherUser is member but currentUser cannot read',
            slug: 'secret-team',
            private: true,
            members_count: 1,
            permissions: '{"read Team": false}',
          },
          id: 'VGVhbVVzZXIvMw==\n',
          status: 'member',
          role: 'collaborator',
        },
      },
      {
        node: {
          team: {
            name: 'Team otherUser Has Been Deleted From',
            slug: 'former-team',
            private: true,
            members_count: 1,
            permissions: '{"read Team": true}',
          },
          id: 'VGVhbVVzZXIvMw==\n',
          status: 'banned',
          role: 'collaborator',
        },
      },
      {
        node: {
          team: {
            name: 'Team otherUser has requested to join',
            slug: 'requested-team',
            private: true,
            members_count: 1,
            permissions: '{"read Team": true}',
          },
          id: 'VGVhbVVzZXIvMw==\n',
          status: 'requested',
          role: 'collaborator',
        },
      },
    ],
  },
  source: {
    id: 'U291cmNlLzEw\n',
    dbid: 10,
    created_at: '1507072703',
    updated_at: '1507072703',
    name: 'KR',
    image: 'http://localhost:3000/images/user.png',
    user_id: 2,
    description: '',
    permissions: '{"read Source":false,"update Source":false,"destroy Source":false,"create Account":false,"create ProjectSource":false,"create Project":true}',
    verification_statuses: '{"label":"Status","default":"undetermined","statuses":[{"description":"Default, just added to Check, no work has started","id":"undetermined","label":"Unstarted","style":{"backgroundColor":"green","color":"orange"}},{"description":"Conclusion: the source is credible","id":"credible","label":"Credible","style":{"backgroundColor":"green","color":"orange"}},{"description":"Conclusion: the source is not credible","id":"not_credible","label":"Not Credible","style":{"backgroundColor":"green","color":"orange"}},{"description":"Conclusion: the source is slightly credible","id":"slightly_credible","label":"Slightly Credible","style":{"backgroundColor":"green","color":"orange"}},{"description":"Conclusion: the source is a sockpuppet","id":"sockpuppet","label":"Sockpuppet","style":{"backgroundColor":"green","color":"orange"}}]}',
    accounts: {
      edges: [],
    },
    account_sources: {
      edges: [],
    },
    tags: {
      edges: [],
    },
    medias: {
      edges: [],
    },
  },
};

export { currentUser, otherUser };
