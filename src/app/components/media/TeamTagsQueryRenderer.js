import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import TagPicker from '../cds/menus-lists-dialogs/TagPicker';

const pageSize = 50;
let lastTypedValue = '';

const TeamTagsQueryRenderer = ({
  readOnly,
  setTags,
  tags,
  teamSlug,
}) => {
  const [keyword, setKeyword] = React.useState('');

  const handleType = (value) => {
    lastTypedValue = value;
    setTimeout(() => {
      if (value === lastTypedValue) {
        setKeyword(value);
      }
    }, 1500);
  };

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query TeamTagsQueryRendererQuery($teamSlug: String!, $keyword: String, $pageSize: Int) {
          team(slug: $teamSlug) {
            # tag_texts_count(keyword: $keyword)
            tag_texts(first: $pageSize, keyword: $keyword) {
              edges {
                node {
                  text
                }
              }
            }
          }
        }
      `}
      render={({ error, props }) => {
        if (error) return null;

        const options = props?.team.tag_texts.edges.map(edge => ({
          label: edge.node.text,
          value: edge.node.text,
        })) || [];

        return (
          <TagPicker
            options={options}
            readOnly={readOnly}
            searchTerm={keyword}
            setSearchTerm={handleType}
            setTags={setTags}
            tags={tags}
          />
        );
      }}
      variables={{
        teamSlug,
        pageSize,
        keyword,
      }}
    />
  );
};

export default TeamTagsQueryRenderer;
