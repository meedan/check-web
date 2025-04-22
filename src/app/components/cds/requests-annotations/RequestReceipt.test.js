import React from 'react';
import RequestReceipt from './RequestReceipt';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import Tooltip from '../alerts-and-prompts/Tooltip';
import DownVoteIcon from '../../../icons/downvote.svg';
import FactCheckIcon from '../../../icons/fact_check.svg';
import RecommendIcon from '../../../icons/recommend.svg';
import EditNoteIcon from '../../../icons/edit_note.svg';
import SearchIcon from '../../../icons/search.svg';

describe('<RequestReceipt />', () => {
  it('should display "no results" label', () => {
    const events = [
      { type: 'default_requests' },
    ];
    const wrapper = mountWithIntl(<RequestReceipt events={events} />);
    expect(wrapper.text()).toContain('No results returned');
    expect(wrapper.find(SearchIcon).length).toEqual(1);
  });

  it('should display "negative feedback" label', () => {
    const events = [
      { type: 'irrelevant_search_result_requests' },
    ];
    const wrapper = mountWithIntl(<RequestReceipt events={events} />);
    expect(wrapper.text()).toContain('Search result – negative feedback');
    expect(wrapper.find(DownVoteIcon).length).toEqual(1);
  });

  it('should display "positive feedback" label', () => {
    const events = [
      { type: 'relevant_search_result_requests' },
    ];
    const wrapper = mountWithIntl(<RequestReceipt events={events} />);
    expect(wrapper.text()).toContain('Search result – positive feedback');
    expect(wrapper.find(RecommendIcon).length).toEqual(1);
  });

  it('should display "no feedback" label', () => {
    const events = [
      { type: 'timeout_search_requests' },
    ];
    const wrapper = mountWithIntl(<RequestReceipt events={events} />);
    expect(wrapper.text()).toContain('Search result – no feedback');
    expect(wrapper.find(SearchIcon).length).toEqual(1);
  });

  it('should display "Fact-check sent on" label', () => {
    const events = [
      { type: 'smooch_report_sent_at', date: 1681234567 },
    ];
    const wrapper = mountWithIntl(<RequestReceipt events={events} />);
    expect(wrapper.text()).toContain('Fact-check sent on');
    expect(wrapper.find(FactCheckIcon).length).toBe(1);
  });

  it('should display "Fact-check delivered on" label', () => {
    const events = [
      { type: 'smooch_report_received_at', date: 1681237890 },
    ];
    const wrapper = mountWithIntl(<RequestReceipt events={events} />);
    expect(wrapper.text()).toContain('Fact-check delivered on');
    expect(wrapper.find(FactCheckIcon).length).toBe(1);
  });

  it('should display "Correction sent on" label', () => {
    const events = [
      { type: 'smooch_report_correction_sent_at', date: 1681239999 },
    ];
    const wrapper = mountWithIntl(<RequestReceipt events={events} />);
    expect(wrapper.text()).toContain('Correction sent on');
    expect(wrapper.find(EditNoteIcon).length).toBe(1);
  });

  it('should render the correct icon and label for the last event', () => {
    const events = [
      { type: 'smooch_report_sent_at', date: 1681234567 },
      { type: 'smooch_report_received_at', date: 1681237890 },
    ];
    const wrapper = mountWithIntl(<RequestReceipt events={events} />);
    expect(wrapper.find(FactCheckIcon).length).toEqual(1);
    expect(wrapper.text()).toContain('Fact-check delivered on');
  });

  it('should render multiple events in the tooltip', () => {
    const events = [
      { type: 'smooch_report_sent_at', date: 1681234567 },
      { type: 'irrelevant_search_result_requests', date: 1681237890 },
    ];
    const wrapper = mountWithIntl(<RequestReceipt events={events} />);
    const tooltip = wrapper.find(Tooltip);
    const tooltipContent = mountWithIntl(tooltip.prop('title'));

    expect(tooltipContent.find('li').at(0).text()).toContain('Fact-check sent on');
    expect(tooltipContent.find('li').at(1).text()).toContain('Search result – negative feedback');
  });
});
