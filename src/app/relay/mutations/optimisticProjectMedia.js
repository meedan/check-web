import config from 'config'; // eslint-disable-line require-path-exists/exists

const optimisticProjectMedia = (media, proj, context) => {
  const { team } = context;

  let title = null;
  let published = null;
  let log_count = null;
  let last_status = null;
  let project = null;

  /* eslint-disable prefer-destructuring */
  if (typeof media === 'object') {
    title = media.title;
    published = media.published;
    log_count = media.log_count;
    last_status = media.last_status;
    project = media.project;
  } else {
    title = media;
    published = parseInt((new Date().getTime() / 1000), 10).toString();
    log_count = 1;
    last_status = config.appName === 'check' ?
      team.verification_statuses.default : team.translation_statuses.default;
    project = proj || context.project;
  }

  const user = context && context.currentUser ? context.currentUser : {};

  let mediasCount = 0;
  const counter = document.getElementsByClassName('search__results-heading span')[0];
  if (counter) {
    mediasCount = parseInt(counter.innerHTML.replace(/[^0-9]/, ''), 10);
  }

  const relayId = btoa(`ProjectMedia/${Math.random()}`);

  return {
    project_mediaEdge: {
      node: {
        dbid: 0,
        language: null,
        dynamic_annotation_language: null,
        url: '',
        quote: '',
        published,
        metadata: JSON.stringify({ title }),
        log_count,
        verification_statuses: JSON.stringify(team.verification_statuses),
        translation_statuses: JSON.stringify(team.translation_statuses),
        last_status,
        last_status_obj: {
          locked: true,
        },
        check_search_project: project ? {
          id: project.search_id,
          number_of_results: mediasCount + 1,
        } : null,
        field_value: team.translation_statuses.default,
        overridden: '{"title":true,"description":false,"username":false}',
        project_id: project ? project.dbid : null,
        id: relayId,
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
        team: {
          slug: team.slug,
          id: team.id || 'VGVhbS8w\n',
          medias_count: team.medias_count + 1,
        },
        project: project ? {
          id: project.id,
          dbid: project.dbid,
          title: project.title,
          medias_count: project.medias_count + 1,
          team: {
            slug: team.slug,
            id: team.id || 'VGVhbS8w\n',
            medias_count: team.medias_count + 1,
          },
        } : null,
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
      id: relayId,
    },
  };
};

module.exports = optimisticProjectMedia;
