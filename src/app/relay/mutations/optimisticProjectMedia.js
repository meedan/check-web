const optimisticProjectMedia = (media, proj, context, customTeam) => {
  let { team } = context;
  if (customTeam) {
    team = Object.assign(team, customTeam);
  }

  let title = null;
  let project = null;

  const now = parseInt((new Date().getTime() / 1000), 10).toString();

  /* eslint-disable prefer-destructuring */
  if (typeof media === 'object') {
    title = media.title;
    project = media.project;
  } else {
    title = media;
    project = proj || context.project;
  }

  let mediasCount = 0;
  const counter = document.getElementsByClassName('search__results-heading span')[0];
  if (counter) {
    mediasCount = parseInt(counter.innerHTML.replace(/[^0-9]/, ''), 10);
  }

  const relayId = btoa(`ProjectMedia/${Math.random()}`);

  const optimisticResponse = {
    project_mediaEdge: {
      node: {
        dbid: 0,
        title,
        type: '-',
        demand: 0,
        linked_items_count: 0,
        status: 'undetermined',
        picture: null,
        description: '',
        created_at: now,
        updated_at: now,
        last_seen: now,
        share_count: 0,
        check_search_project: project ? {
          id: project.search_id,
          number_of_results: mediasCount + 1,
        } : null,
        check_search_team: {
          id: team.search_id,
          number_of_results: team.medias_count + 1,
        },
        is_read: false,
        project_id: project ? project.dbid : null,
        id: relayId,
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
          team: {
            slug: team.slug,
            id: team.id || 'VGVhbS8w\n',
            medias_count: team.medias_count + 1,
          },
        } : null,
      },
    },
    project_media: {
      dbid: 0,
      title,
      id: relayId,
    },
  };

  return optimisticResponse;
};

export default optimisticProjectMedia;
