import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import ListIcon from '@material-ui/icons/List';
import Select from '../cds/inputs/Select';

const SelectListQueryRenderer = ({
  helperText,
  onChange,
  onRemove,
  value,
}) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SelectListQuery($slug: String!) {
        team(slug: $slug) {
          saved_searches(first: 1000) {
            edges {
              node {
                dbid
                title
              }
            }
          }
        }
      }
    `}
    variables={{
      slug: window.location.pathname.match(/^\/([^/]+)/)[1],
    }}
    render={({ error, props }) => {
      if (!error && props) {
        return (
          <FormattedMessage id="selectList.select" defaultMessage="Select list…" description="Label for list selector">
            { selectLabel => (
              <Select
                iconLeft={<ListIcon />}
                value={value}
                onChange={onChange}
                onRemove={onRemove}
                helpContent={helperText}
              >
                <option value={null}>{selectLabel}</option>
                { props.team.saved_searches.edges.map(l => (
                  <option value={l.node.dbid}>{l.node.title}</option>
                )) }
              </Select>
            )}
          </FormattedMessage>
        );
      }

      return null;
    }}
  />
);

SelectListQueryRenderer.defaultProps = {
  helperText: null,
  onChange: null,
  onRemove: null,
  value: null,
};

SelectListQueryRenderer.propTypes = {
  helperText: PropTypes.node,
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};


export default SelectListQueryRenderer;
