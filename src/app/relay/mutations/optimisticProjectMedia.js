const optimisticProjectMedia = (media, context, customTeam) => {
  let { team } = context;
  if (customTeam) {
    team = Object.assign(team, customTeam);
  }

  let title = null;

  const now = parseInt((new Date().getTime() / 1000), 10).toString();

  /* eslint-disable prefer-destructuring */
  if (typeof media === 'object') {
    title = media.title;
  } else {
    title = media;
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
        check_search_team: {
          id: team.search_id,
          number_of_results: team.medias_count + 1,
        },
        is_read: false,
        id: relayId,
        permissions: JSON.stringify({
          'read ProjectMedia': true,
          'update ProjectMedia': false,
          'destroy ProjectMedia': false,
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
