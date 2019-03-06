import config from 'config'; // eslint-disable-line require-path-exists/exists

const optimisticProjectMedia = (title, project, context) => {
  const user = context && context.currentUser ? context.currentUser : {};
  const { team } = project;
  const ls = config.appName === 'check' ?
    team.verification_statuses.default : team.translation_statuses.default;

  let mediasCount = 0;
  const counter = document.getElementsByClassName('search__results-heading span')[0];
  if (counter) {
    mediasCount = parseInt(counter.innerHTML.replace(/[^0-9]/, ''), 10);
  }

  return {
    project_mediaEdge: {
      node: {
        dbid: 0,
        language: null,
        dynamic_annotation_language: null,
        url: '',
        quote: '',
        published: parseInt((new Date().getTime() / 1000), 10).toString(),
        embed: JSON.stringify({ title }),
        log_count: 1,
        verification_statuses: JSON.stringify(team.verification_statuses),
        translation_statuses: JSON.stringify(team.translation_statuses),
        deadline: null,
        last_status: ls,
        last_status_obj: {
          locked: true,
        },
        check_search_project: {
          id: project.search_id,
          number_of_results: mediasCount + 1,
        },
        field_value: team.translation_statuses.default,
        overridden: '{"title":true,"description":false,"username":false}',
        project_id: project.dbid,
        id: 'UHJvamVjdE1lZGlhLzA=\n',
        language_code: null,
        domain: '',
        permissions: JSON.stringify({
          'read ProjectMedia': true,
          'update ProjectMedia': false,
          'destroy ProjectMedia': false,
          'create Comment': false,
          'create Flag': false,
          'create Status': false,
          'create Tag': false,
          'create Dynamic': false,
          'create Task': false,
        }),
        project: {
          id: project.id,
          dbid: project.dbid,
          title: project.title,
        },
        media: {
          url: null,
          quote: '',
          embed_path: `//${config.selfHost}/images/loading.gif`,
          thumbnail_path: `//${config.selfHost}/images/loading-thumb.gif`,
          id: 'TWVkaWEvMA==\n',
        },
        user: {
          name: user.name,
          source: {
            dbid: 0,
            id: 'U291cmNlLzA=\n',
          },
          id: 'VXNlci8w\n',
        },
        team: {
          slug: team.slug,
          id: 'VGVhbS8w\n',
        },
        tags: {
          edges: [],
        },
        tasks: {
          edges: [],
        },
        log: {
          edges: [],
        },
      },
    },
    project_media: {
      dbid: 0,
      id: 'UHJvamVjdE1lZGlhLzA=\n',
    },
  };
};

module.exports = optimisticProjectMedia;
