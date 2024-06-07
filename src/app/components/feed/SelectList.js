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
  required,
  label,
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
        if (required && props.team.saved_searches.edges.length === 0) {
          return (
            <Alert
              variant="warning"
              title={
                <FormattedMessage
                  id="selectList.noListTitle"
                  defaultMessage="Your workspace needs a Custom Filtered List to contribute."
                  description="Title of a warning displayed on edit feed page when the workspace has no lists."
                />
              }
              content={
                <FormattedMessage
                  id="selectList.noListDescription"
                  defaultMessage="Create a list and set up filters in order to select the fact-checks you would like to contribute to this shared feed."
                  description="Content of a warning displayed on edit feed page when the workspace has no lists."
                />
              }
              buttonLabel={
                <FormattedMessage
                  id="selectList.noListButtonLabel"
                  defaultMessage="How to create lists"
                  description="Helper link in a warning displayed on edit feed page when the workspace has no lists."
                />
              }
              onButtonClick={() => { window.open('https://help.checkmedia.org/en/articles/8720927-custom-lists'); }}
            />
          );
        }
        return (
          <div className={styles['select-list-container']}>
            { (required && !value) ?
              <div>
                <Alert
                  variant="warning"
                  title={
                    <FormattedMessage
                      id="saveFeed.noListSelected"
                      defaultMessage="Your workspace is not contributing to this shared feed. Select a list below to contribute."
                      description="Warning displayed on edit feed page when no list is selected."
                    />
                  }
                />
              </div> : null }
            <FormattedMessage id="selectList.select" defaultMessage="Select list…" description="Label for list selector">
              { selectLabel => (
                <Select
                  iconLeft={<ListIcon />}
                  value={value}
                  onChange={onChange}
                  onRemove={onRemove}
                  label={label}
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
  />
);

SelectListQueryRenderer.defaultProps = {
  required: true,
  label: null,
  onChange: null,
  onRemove: null,
  value: null,
};

SelectListQueryRenderer.propTypes = {
  required: PropTypes.bool,
  label: PropTypes.node,
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};


export default SelectListQueryRenderer;
