import React from 'react';
import Relay from 'react-relay';
import { IntlProvider } from 'react-intl';
import { render } from 'enzyme';
import { expect } from 'chai';
import SocialMediaCard from '../../src/app/components/media/SocialMediaCard';

const tweetMedia = {
  __dataID__: 'UHJvamVjdE1lZGlhLzUxNzY=\n',
  id: 'UHJvamVjdE1lZGlhLzUxNzY=\n',
  dbid: 5176,
  url: 'https://twitter.com/mollypriddy/status/895081687989669888',
  quote: null,
  published: '1502397128',
  updated_at: '1502397129',
  embed: '',
  log_count: 0,
  verification_statuses: '',
  translation_statuses: '',
  overridden: '{"title":false,"description":false,"username":false}',
  project_id: 444,
  pusher_channel: '',
  language: null,
  language_code: null,
  domain: 'twitter.com',
  permissions: JSON.stringify({
    'read ProjectMedia': true,
    'update ProjectMedia': true,
    'destroy ProjectMedia': true,
    'create Comment': true,
    'create Flag': true,
    'create Status': true,
    'create Tag': true,
    'create Dynamic': true,
    'create Task': true,
  }),
  last_status: 'undetermined',
  field_value: 'pending',
  translation_status: {},
  last_status_obj: {},
  project: {},
  media: {},
  user: {},
  team: {},
  tags: {},
  embed_path: '',
};

const data = {
  raw: {
    api: {
      favorite_count: 10,
      retweet_count: 20,
    },
  },
};

describe('<SocialMediaCard />', () => {
  it('shows stats for tweets on project page', () => {
    const twitterCard = render(
      <IntlProvider locale="en">
        <SocialMediaCard condensed media={tweetMedia} data={data} />
      </IntlProvider>,
    );
    expect(twitterCard.text()).to.contain('10 favorites');
    expect(twitterCard.text()).to.contain('20 retweets');
  });
});
