import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { Link } from 'react-router';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import styled from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import CheckContext from '../../CheckContext';
import {
  black38,
  caption,
  checkBlue,
  subheading2,
  units,
} from '../../styles/js/shared';

const messages = defineMessages({
  teamSlugHint: {
    id: 'findTeamCard.teamSlugHint',
    defaultMessage: 'team-slug',
  },
  teamNotFound: {
    id: 'findTeamCard.teamNotFound',
    defaultMessage: 'Team not found!',
  },
});

const TeamUrlRow = styled.div`
  align-items: flex-end;
  display: flex;
  font-size: 12px;
  margin-top: 24px;
  label {
    font: ${caption};
    color: ${checkBlue};
  }
`;

const TeamUrlColumn = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 9px;
`;

const TeamUrlDomain = styled.span`
  font: ${subheading2};
  color: ${black38};
`;

class FindTeamCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      slug: this.props.teamSlug,
      message: null,
    };
  }

  componentWillMount() {
    this.handleQuery();
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleQuery = () => {
    const { team, teamSlug } = this.props;

    if (teamSlug) {
      if (team && (teamSlug === team.slug)) {
        this.getContext().history.push(`/${team.slug}/join`);
      } else {
        this.setState({ message: this.props.intl.formatMessage(messages.teamNotFound) });
      }
    }
  };

  handleSlugChange = (e) => {
    this.setState({ slug: e.target.value, message: null });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { slug } = this.state;
    this.getContext().history.push(`/check/teams/find/${slug}`);
  };

  render() {
    const link = (
      <Link to="/check/teams/new" className="find-team__toggle-create">
        <FormattedMessage
          id="findTeamCard.createYourOwn"
          defaultMessage="create your own team"
        />
      </Link>
    );

    return (
      <div>
        <Card className="find-team-card">
          <CardHeader
            titleStyle={{ fontSize: '20px', lineHeight: '32px' }}
            title={
              <FormattedMessage
                id="findTeamCard.mainHeading"
                defaultMessage="Find an existing team"
              />
            }
            subtitle={
              <FormattedMessage
                id="findTeamCard.blurb"
                defaultMessage="Request to join an existing team by adding their name here, or get started by creating your own."
              />
            }
          />
          <form className="find-team__form">
            <CardText>
              <TeamUrlRow>
                <TeamUrlColumn>
                  <label htmlFor="team-slug-container">
                    <FormattedMessage
                      id="findTeamCard.url"
                      defaultMessage="Team URL"
                    />
                  </label>
                  <TeamUrlDomain>
                    {config.selfHost}/
                  </TeamUrlDomain>
                </TeamUrlColumn>
                <TextField
                  type="text"
                  id="team-slug-container"
                  className="find-team__team-slug-input"
                  defaultValue={this.props.teamSlug}
                  onChange={this.handleSlugChange}
                  hintText={this.props.intl.formatMessage(messages.teamSlugHint)}
                  errorText={this.state.message}
                  autoComplete="off"
                  fullWidth
                />
              </TeamUrlRow>
            </CardText>
            <CardActions>
              <RaisedButton
                type="submit"
                className="find-team__submit-button"
                label={
                  <FormattedMessage
                    id="findTeamCard.submitButton"
                    defaultMessage="Find team"
                  />
                }
                primary
                onClick={this.handleSubmit}
              />
            </CardActions>
          </form>
        </Card>
        <div style={{ marginTop: units(2) }}>
          <FormattedMessage
            id="findTeamCard.createTeam"
            defaultMessage="You can also {action}."
            values={{ action: link }}
          />
        </div>
      </div>
    );
  }
}

FindTeamCard.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(FindTeamCard);
