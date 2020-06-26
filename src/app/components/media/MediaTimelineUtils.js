/* eslint-disable no-sequences */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */

export const intersectIntervals = intervals => intervals.sort((a, b) => a[0] - b[0])
  .reduce((ac, x) => (!ac.length || ac[ac.length - 1][1] < x[0]
    ? ac.push(x)
    : ac[ac.length - 1][1] = Math.max(ac[ac.length - 1][1], x[1]), ac), []);

export const getTimelineData = ({
  media: {
    // id: mediaId, dbid,
    tags: { edges: tags = [] },
    clips: { edges: clips = [] },
    geolocations: { edges: locations = [] },
    comments,
  },
  // duration, time,
  currentUser: { name: first_name, id: userId, profile_image: profile_img_url },
}) => {
  const projecttags = [];
  const entities = {};

  const commentThreads = comments.edges
    .filter(({ node: { dbid: dbid2, parsed_fragment } }) =>
      !!dbid2 && !!parsed_fragment && !!parsed_fragment.t).map(({
      node,
      node: {
        id: thread_id, dbid: dbid3, text, parsed_fragment,
        annotator: {
          id: annoId, name, profile_image,
        },
        comments: comments2,
      },
    }) => ({
      id: thread_id,
      dbid: dbid3,
      text,
      start_seconds: parsed_fragment.t[0],
      user: {
        id: annoId,
        first_name: name,
        last_name: '',
        profile_img_url: profile_image,
      },
      replies: comments2 && comments2.edges ? comments2.edges.map(({
        node: {
          id, created_at, text: text2,
          annotator: {
            id: annoId2, name: name2, profile_image: profile_image2,
          },
        },
      }) => ({
        id,
        thread_id,
        created_at,
        text: text2,
        start_seconds: 0,
        user: {
          id: annoId2,
          first_name: name2,
          last_name: '',
          profile_img_url: profile_image2,
        },
      })).sort((a, b) => a.created_at - b.created_at) : [],
      node,
    }));

  clips.filter(({ node: { id } }) => !!id).forEach(({
    node,
    node: { id, parsed_fragment: { t: [start_seconds, end_seconds] }, data: { label: name } },
  }) => {
    if (!entities[`clip-${name}`]) {
      entities[`clip-${name}`] = {
        id: `clip-${name}`,
        name,
        type: 'clip',
        project_clip: { id: `clip-${name}`, name },
        instances: [],
        node,
      };
    }

    entities[`clip-${name}`].instances.push({
      id,
      start_seconds,
      end_seconds,
      url: new URL(`#t=${start_seconds},${end_seconds}&id=${encodeURIComponent(id)}`, document.location.href).href,
    });
  });

  tags
    .filter(({ node }) => !!node)
    .forEach(({
      node,
      node: {
        id: instance,
        fragment,
        parsed_fragment: { t: [start_seconds, end_seconds] = [] } = {},
        tag_text_object,
      },
    }) => {
      if (!tag_text_object) return;

      const { id, text: name } = tag_text_object;
      if (!fragment) {
        projecttags.push({ id, name });
        return;
      }

      if (!entities[id]) {
        entities[id] = {
          id, name, project_tag: { id, name }, instances: [], node,
        };
      }

      entities[id].type = 'tag';
      entities[id].instances.push({ start_seconds, end_seconds, id: instance });
    });

  locations.filter(({ node: { id } }) => !!id).forEach(({
    node, node: { id, parsed_fragment: { t: [start_seconds, end_seconds] }, content },
  }) => {
    const {
      geolocation_viewport: { viewport, zoom = 10 },
      geolocation_location,
    } = JSON.parse(content).reduce((acc, { field_name, value_json }) =>
      ({ ...acc, [field_name]: value_json }), {});

    const {
      properties: { name = id.trim() } = {},
      geometry: { type = 'Point', coordinates = [0, 0] } = {},
    } = geolocation_location;
    const [lng, lat] = coordinates;

    if (!entities[`place-${name}`]) {
      entities[`place-${name}`] = {
        id: `place-${name}`,
        name,
        viewport,
        zoom,
        lat,
        lng,
        type: type === 'Point' ? 'marker' : 'polygon',
        test: { geolocation_location },
        project_place: { id: `place-${name}`, name },
        instances: [],
        node,
      };

      if (type === 'Polygon') {
        entities[`place-${name}`].polygon = coordinates[0].map(([lng2, lat2]) => ({ lat: lat2, lng: lng2 }));
      }
    }

    entities[`place-${name}`].instances.push({ id, start_seconds, end_seconds });
  });

  const data = {
    project: {
      projectclips: projecttags,
      projecttags,
      projectplaces: projecttags,
    },
    commentThreads,
    videoClips: Object.values(entities).filter(({ project_clip }) => !!project_clip),
    videoTags: Object.values(entities).filter(({ project_tag }) => !!project_tag),
    videoPlaces: Object.values(entities).filter(({ project_place }) => !!project_place),
    user: {
      first_name,
      id: userId,
      last_name: '',
      profile_img_url,
    },
  };

  return data;
};

// return {
//   duration, time, data, mediaId, dbid,
// };
