import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { FormattedGlobalMessage } from './MappedMessage';
import { emojify } from '../helpers';

const StringOrFormattedMessage = PropTypes.oneOfType([
  PropTypes.string.isRequired,
  PropTypes.element.isRequired,
]);

/**
 * Behave like <FormattedMessage>{ value => ... }</FormattedMessage> ... even
 * if `value` is a `String`.
 *
 * Usage:
 *
 *     return (
 *       <RenderedValue value="hi">
 *         { title => <span>{title}</span> }
 *       </RenderedValue);
 *     ); // renders <span>hi</span>
 *
 * And:
 *
 *     const value = <FormattedMessage id="a.message" defaultMesage="hi" />;
 *     return (
 *       <RenderedValue value={value}>
 *         { title => <span>{title}</span> }
 *       </RenderedValue);
 *     ); // renders <span>hi</span> in the default locale
 */
function RenderedValue({ children, value }) {
  if (React.isValidElement(value)) {
    return React.cloneElement(value, { children });
  }
  return <React.Fragment>{children(value)}</React.Fragment>;
}
RenderedValue.propTypes = {
  children: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.node.isRequired]).isRequired,
};

function DefaultSuffix({ teamName, children }) {
  return (
    <FormattedGlobalMessage messageKey="appNameHuman">
      {s => children(teamName ? `${teamName} ${s}` : s)}
    </FormattedGlobalMessage>
  );
}
DefaultSuffix.defaultProps = {
  teamName: null,
};
DefaultSuffix.propTypes = {
  teamName: PropTypes.string, // or null
  children: PropTypes.func.isRequired,
};

function TitleFromPrefixAndTeam({ prefix, teamName, children }) {
  return (
    <DefaultSuffix teamName={teamName}>
      {localizedSuffix => (
        <RenderedValue value={prefix}>
          {localizedPrefix => children(`${localizedPrefix} | ${localizedSuffix}`)}
        </RenderedValue>
      )}
    </DefaultSuffix>
  );
}
TitleFromPrefixAndTeam.defaultProps = {
  teamName: null,
};
TitleFromPrefixAndTeam.propTypes = {
  prefix: StringOrFormattedMessage.isRequired,
  teamName: PropTypes.string, // or null
  children: PropTypes.func.isRequired,
};

function TitleFromProps({
  prefix, teamName, title, children,
}) {
  if (title === null) {
    if (prefix === null) {
      return (
        // "Check" or "Meedan Check"
        <DefaultSuffix teamName={teamName}>
          {localizedSuffix => children(localizedSuffix)}
        </DefaultSuffix>
      );
    }

    return (
      // "prefix | Meedan Check"
      <TitleFromPrefixAndTeam prefix={prefix} teamName={teamName}>
        {s => children(s)}
      </TitleFromPrefixAndTeam>
    );
  }

  return <RenderedValue value={title}>{ s => children(s) }</RenderedValue>;
}
TitleFromProps.defaultProps = {
  prefix: null,
  title: null,
  teamName: null,
};
TitleFromProps.propTypes = {
  prefix: StringOrFormattedMessage, // or null
  title: StringOrFormattedMessage, // or null
  teamName: PropTypes.string, // or null
  children: PropTypes.func.isRequired,
};

function PageTitle({
  children, title, prefix, team, skipTeam,
}) {
  return (
    <React.Fragment>
      <TitleFromProps
        title={title}
        prefix={prefix}
        teamName={(!skipTeam && team && team.name) ? team.name : null}
      >
        {localizedTitle => (
          <Helmet><title>{emojify(localizedTitle)}</title></Helmet>
        )}
      </TitleFromProps>
      {children /* TODO do not render children: make callers use this as a leaf node */}
    </React.Fragment>
  );
}
PageTitle.defaultProps = {
  prefix: null,
  title: null,
  team: null,
  skipTeam: false,
};
PageTitle.propTypes = {
  // overrides prefix|team
  title: StringOrFormattedMessage, // or null
  prefix: StringOrFormattedMessage, // or null
  // If team is set, write "My Team Check" instead of just "Check"
  team: PropTypes.shape({ name: PropTypes.string.isRequired }),
  skipTeam: PropTypes.bool, // TODO nix this: make team===null do this
};

export default PageTitle;
