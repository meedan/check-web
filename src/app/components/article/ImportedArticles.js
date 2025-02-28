import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Articles from './Articles';
import FileDownloadIcon from '../../icons/file_download.svg';

const ImportedArticles = ({ routeParams }) => (
  <Articles
    articleTypeReadOnly
    defaultFilters={{ imported: true }}
    filterOptions={['tags', 'range', 'imported', 'language_filter']}
    icon={<FileDownloadIcon />}
    teamSlug={routeParams.team}
    title={<FormattedMessage defaultMessage="Imported" description="Title of the imported articles page." id="importedArticles.title" />}
    type="fact-check"
  />
);

ImportedArticles.defaultProps = {};

ImportedArticles.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired, // slug
  }).isRequired,
};

export default ImportedArticles;
