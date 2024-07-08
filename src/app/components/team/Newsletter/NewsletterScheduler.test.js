import { getWeekDays } from './NewsletterScheduler';

describe('<NewsletterScheduler />', () => {
  it('returns localized week day', () => {
    const firstDayOfWeek = getWeekDays('pt-BR').labels[0];
    expect(firstDayOfWeek).toBe('dom.');
  });

  it('returns days of the week starting by Sunday for America timezone', () => {
    process.env.TZ = 'America/New_York';
    const firstDayOfWeek = getWeekDays('en-US').labels[0];
    expect(firstDayOfWeek).toBe('Sun');
  });

  it('returns days of the week starting by Sunday for India timezone', () => {
    process.env.TZ = 'Asia/Calcutta';
    const firstDayOfWeek = getWeekDays('en-US').labels[0];
    expect(firstDayOfWeek).toBe('Sun');
  });
});
