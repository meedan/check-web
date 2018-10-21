import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import MediaDetail from '../media/MediaDetail';
import SourceRoute from '../../relay/SourceRoute';
import { black87, units } from '../../styles/js/shared';

const SourceMediasComponent = (props) => {
  const { source } = props;

  const StyledSearchResultsHeading = styled.div`
    .source-medias__results-heading {
      color: ${black87};
      margin-top: ${units(3)};
      text-align: center;
    }
  `;

  if (source && source.source && source.source.medias) {
    const project_source = {
      source: {
        name: source.source.name,
      },
    };

    const medias = source.source.medias.edges.map((node) => {
      const media = node.node;
      media.project_source = project_source;

      return (
        <li key={media.dbid} style={{ marginTop: units(1) }}>
          <MediaDetail media={media} condensed />
        </li>
      );
    });

    return (
      <div>
        <StyledSearchResultsHeading>
          <h3 className="source-medias__results-heading">
            <FormattedMessage
              id="sourceMedias.items"
              defaultMessage="{resultsCount, plural, =0 {No results} one {1 result} other {# results}}"
              values={{ resultsCount: source.source.medias_count }}
            />
          </h3>
        </StyledSearchResultsHeading>
        <ul className="medias">
          {medias}
        </ul>
      </div>
    );
  }
  return null;
};

const SourceMediasContainer = Relay.createContainer(SourceMediasComponent, {
  fragments: {
    source: () => Relay.QL`
      fragment on ProjectSource {
        id
        dbid
        project_id
        source {
          id
          dbid
          name
          medias_count
          medias(first: 10000) {
            edges {
              node {
                id,
                dbid,
                url,
                published,
                embed,
                log_count,
                domain,
                last_status,
                media {
                  embed,
                  url,
                  quote,
                  embed_path,
                  thumbnail_path
                },
                permissions,
                project_id,
                verification_statuses,
                archived,
                relationships { sources_count, targets_count },
                id,
                dbid,
                quote,
                published,
                url,
                last_status,
                field_value(annotation_type_field_name: "translation_status:translation_status_status"),
                log_count,
                domain,
                permissions,
                project {
                  id,
                  dbid,
                  title,
                  get_languages
                },
                project_id,
                pusher_channel,
                verification_statuses,
                translation_statuses,
                overridden,
                language,
                language_code,
                media {
                  url,
                  quote,
                  embed_path,
                  thumbnail_path
                }
                user {
                  dbid,
                  name,
                  email,
                  source {
                    dbid,
                    image,
                    accounts(first: 10000) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                  }
                }
                last_status_obj {
                  id
                  dbid
                  locked
                  assignments(first: 10000) {
                    edges {
                      node {
                        id
                        dbid
                        name
                        source {
                          id
                          dbid
                          image
                        }
                      }
                    }
                  }
                }
                translation_status: annotation(annotation_type: "translation_status") {
                  id
                  dbid
                }
                translations: annotations(annotation_type: "translation", first: 10000) {
                  edges {
                    node {
                      id,
                      dbid,
                      annotation_type,
                      annotated_type,
                      annotated_id,
                      annotator,
                      content,
                      created_at,
                      updated_at
                    }
                  }
                }
                tags(first: 10000) {
                  edges {
                    node {
                      tag,
                      tag_text,
                      id
                    }
                  }
                }
                tasks(first: 10000) {
                  edges {
                    node {
                      id,
                      dbid,
                      label,
                      type,
                      description,
                      permissions,
                      jsonoptions,
                      first_response {
                        id,
                        dbid,
                        permissions,
                        content,
                        annotator {
                          name
                        }
                      }
                    }
                  }
                }
                log(first: 10000) {
                  edges {
                    node {
                      id,
                      dbid,
                      item_type,
                      item_id,
                      event,
                      event_type,
                      created_at,
                      object_after,
                      object_changes_json,
                      meta,
                      projects(first: 2) {
                        edges {
                          node {
                            id,
                            dbid,
                            title
                          }
                        }
                      }
                      user {
                        dbid,
                        name,
                        profile_image,
                        email,
                        source {
                          dbid,
                          accounts(first: 10000) {
                            edges {
                              node {
                                url
                              }
                            }
                          }
                        }
                      }
                      task {
                        id,
                        dbid,
                        label,
                        type
                      }
                      annotation {
                        id,
                        dbid,
                        content,
                        annotation_type,
                        updated_at,
                        created_at,
                        permissions,
                        medias(first: 10000) {
                          edges {
                            node {
                              id,
                              dbid,
                              quote,
                              published,
                              url,
                              embed,
                              project_id,
                              last_status,
                              field_value(annotation_type_field_name: "translation_status:translation_status_status"),
                              log_count,
                              permissions,
                              verification_statuses,
                              translation_statuses,
                              domain,
                              team {
                                slug
                              }
                              media {
                                embed_path,
                                thumbnail_path,
                                url,
                                quote
                              }
                              user {
                                name,
                                source {
                                  dbid
                                }
                              }
                            }
                          }
                        }
                        annotator {
                          name,
                          profile_image
                        }
                        version {
                          id
                          item_id
                          item_type
                        }
                      }
                    }
                  }
                }
                team {
                  get_suggested_tags,
                  slug
                }
              }
            }
          }
        }
      }
    `,
  },
});

class SourceMedias extends Component {
  // eslint-disable-next-line class-methods-use-this
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const ids = `${this.props.source.source_id},${this.props.source.project_id}`;
    const route = new SourceRoute({ ids });

    return (<Relay.RootContainer Component={SourceMediasContainer} route={route} forceFetch />);
  }
}

export default SourceMedias;
