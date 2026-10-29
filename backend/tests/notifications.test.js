const mockSend = jest.fn();
jest.mock('nodemailer', () => ({ createTransport: () => ({ sendMail: mockSend }) }));

const { sendMail } = require('../src/modules/notifications/mailer');
const { notify, buildEmail, TYPES } = require('../src/modules/notifications/notification.service');

const event = { title: 'Tech Talk', start_time: '2026-12-01T10:00:00Z', venue: 'Hall A' };

describe('mailer', () => {
  beforeEach(() => {
    mockSend.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('sends an email and returns true', async () => {
    mockSend.mockResolvedValue({});
    await expect(sendMail({ to: 'a@ems.test', subject: 'Hi', text: 'Body' })).resolves.toBe(true);
    expect(mockSend.mock.calls[0][0]).toMatchObject({ to: 'a@ems.test', subject: 'Hi' });
  });

  it('retries a failed email and succeeds on a later attempt', async () => {
    mockSend.mockRejectedValueOnce(new Error('smtp down')).mockResolvedValueOnce({});
    await expect(sendMail({ to: 'a@ems.test', subject: 'Hi', text: '' }, { retryDelayMs: 0 })).resolves.toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('gives up after 3 attempts without throwing', async () => {
    mockSend.mockRejectedValue(new Error('smtp down'));
    await expect(sendMail({ to: 'a@ems.test', subject: 'Hi', text: '' }, { retryDelayMs: 0 })).resolves.toBe(false);
    expect(mockSend).toHaveBeenCalledTimes(3);
  });
});

describe('notification service (EVT-F-032)', () => {
  beforeEach(() => mockSend.mockReset().mockResolvedValue({}));

  it('includes the ticket ID in the confirmation email', () => {
    const email = buildEmail(TYPES.REGISTRATION_CONFIRMED, event, { ticket_id: 'TKT-ABC' });
    expect(email.subject).toBe('Registration confirmed: Tech Talk');
    expect(email.text).toContain('TKT-ABC');
    expect(email.text).toContain('Hall A');
  });

  it('includes the waitlist position in the waitlist email', () => {
    expect(buildEmail(TYPES.WAITLISTED, event, { queue_position: 3 }).text).toContain('position 3');
  });

  it.each([TYPES.PROMOTED, TYPES.REGISTRATION_CANCELLED, TYPES.EVENT_CANCELLED])('builds the %s email', (type) => {
    const email = buildEmail(type, event, { ticket_id: 'TKT-1' });
    expect(email.subject).toContain('Tech Talk');
  });

  it('rejects an unknown notification type', () => {
    expect(() => buildEmail('NOPE', event)).toThrow('Unknown notification type');
  });

  it('sends the email to the user', async () => {
    await notify(TYPES.REGISTRATION_CANCELLED, { email: 'attendee1@ems.test' }, event);
    expect(mockSend.mock.calls[0][0].to).toBe('attendee1@ems.test');
  });
});
