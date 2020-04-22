import React from 'react';
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
} from 'react-intl';
import { browserHistory, Link } from 'react-router';
import TextField from 'material-ui/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
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
    defaultMessage: 'Workspace URL',
  },
  teamNotFound: {
    id: 'findTeamCard.teamNotFound',
    defaultMessage: 'Workspace not found!',
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

  handleQuery = () => {
    const { team, teamSlug } = this.props;

    if (teamSlug) {
      if (team && (teamSlug === team.slug)) {
        browserHistory.push(`/${team.slug}/join`);
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
    browserHistory.push(`/check/teams/find/${slug}`);
  };

  render() {
    return (
      <div>
        <Card className="find-team-card">
          <CardHeader
            titleStyle={{ fontSize: '20px', lineHeight: '32px' }}
            title={
              <FormattedMessage
                id="findTeamCard.mainHeading"
                defaultMessage="Find an existing workspace"
              />
            }
            subtitle={
              <FormattedMessage
                id="findTeamCard.blurb"
                defaultMessage="Request to join an existing workspace by adding its name here, or get started by creating your own."
              />
            }
          />
          <form className="find-team__form">
            <CardContent>
              <TeamUrlRow>
                <TeamUrlColumn>
                  <label htmlFor="team-slug-container">
                    <FormattedMessage
                      id="findTeamCard.url"
                      defaultMessage="Workspace URL"
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
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                className="find-team__submit-button"
                onClick={this.handleSubmit}
              >
                <FormattedMessage
                  id="findTeamCard.submitButton"
                  defaultMessage="Find workspace"
                />
              </Button>
            </CardActions>
          </form>
        </Card>
        <div style={{ marginTop: units(2) }}>
          <Link to="/check/teams/new" className="find-team__toggle-create">
            <FormattedMessage
              id="findTeamCard.createYourOwn"
              defaultMessage="You can also create your own workspace."
            />
          </Link>
        </div>
      </div>
    );
  }
}

export default injectIntl(FindTeamCard);
