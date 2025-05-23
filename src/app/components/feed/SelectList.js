/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import ListIcon from '../../icons/list.svg';
import Alert from '../cds/alerts-and-prompts/Alert';
import Select from '../cds/inputs/Select';
import styles from './SelectList.module.css';

const SelectListQueryRenderer = ({
  label,
  listType,
  onChange,
  onRemove,
  required,
  value,
}) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SelectListQuery($slug: String!, $listType: String!) {
        team(slug: $slug) {
          saved_searches(first: 1000, list_type: $listType) {
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
    render={({ error, props }) => {
      if (!error && props) {
        if (required && props.team.saved_searches.edges.length === 0) {
          return (
            <Alert
              buttonLabel={
                <FormattedMessage
                  defaultMessage="How to create lists"
                  description="Helper link in a warning displayed on edit feed page when the workspace has no lists."
                  id="selectList.noListButtonLabel"
                />
              }
              content={
                <FormattedMessage
                  defaultMessage="Create a list and set up filters in order to select the fact-checks you would like to contribute to this shared feed."
                  description="Content of a warning displayed on edit feed page when the workspace has no lists."
                  id="selectList.noListDescription"
                />
              }
              title={
                <FormattedMessage
                  defaultMessage="Your workspace needs a Custom Filtered List to contribute."
                  description="Title of a warning displayed on edit feed page when the workspace has no lists."
                  id="selectList.noListTitle"
                />
              }
              variant="warning"
              onButtonClick={() => { window.open('https://help.checkmedia.org/en/articles/8720927-custom-lists'); }}
            />
          );
        }
        return (
          <div className={styles['select-list-container']}>
            { listType === 'article' && (required && !value) ?
              <div>
                <Alert
                  content={
                    <FormattedMessage
                      defaultMessage="Select a custom filtered list of <strong>articles</strong> from your workspace to contribute to this shared feed. You will be able to update this list at any time."
                      description="Content of a warning displayed on edit feed page when no articles list is selected."
                      id="saveFeed.noArticleListDescription"
                    />
                  }
                  title={
                    <FormattedMessage
                      defaultMessage="Your workspace is not contributing Articles."
                      description="Warning displayed on edit feed page when no articles list is selected."
                      id="saveFeed.noArticlediaListSelected"
                    />
                  }
                  variant="warning"
                />
              </div> : null }
            { listType === 'media' && (required && !value) ?
              <div>
                <Alert
                  content={
                    <FormattedMessage
                      defaultMessage="Select a custom filtered list of <strong>media clusters</strong> from your workspace to contribute to this shared feed. You will be able to update this list at any time."
                      description="Content of a warning displayed on edit feed page when no media list is selected."
                      id="saveFeed.noMediaListDescription"
                    />
                  }
                  title={
                    <FormattedMessage
                      defaultMessage="Your workspace is not contributing Media Clusters."
                      description="Warning displayed on edit feed page when no media list is selected."
                      id="saveFeed.noMediaListSelected"
                    />
                  }
                  variant="warning"
                />
              </div> : null }
            <FormattedMessage defaultMessage="Select list…" description="Label for list selector" id="selectList.select">
              { selectLabel => (
                <Select
                  iconLeft={<ListIcon />}
                  label={label}
                  value={value}
                  onChange={onChange}
                  onRemove={onRemove}
                >
                  <option value={null}>{selectLabel}</option>
                  {
                    // Attempting to sort a read-only array directly would result in a TypeError, so we create a new array first to avoid the error.
                    [...props.team.saved_searches.edges]
                      .sort((a, b) => a.node.title.localeCompare(b.node.title))
                      .map(l => (
                        <option key={l.node.dbid} value={l.node.dbid}>{l.node.title}</option>
                      ))
                  }
                </Select>
              )}
            </FormattedMessage>
          </div>
        );
      }

      return null;
    }}
    variables={{
      slug: window.location.pathname.match(/^\/([^/]+)/)[1],
      listType,
    }}
  />
);

SelectListQueryRenderer.defaultProps = {
  required: true,
  label: null,
  listType: null,
  onChange: null,
  onRemove: null,
  value: null,
};

SelectListQueryRenderer.propTypes = {
  required: PropTypes.bool,
  label: PropTypes.node,
  listType: PropTypes.string,
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};


export default SelectListQueryRenderer;
