jest.mock('../src/config/db', () => ({ query: jest.fn() }));

const db = require('../src/config/db');
const { audit, ACTIONS, cleanDetails } = require('../src/utils/auditLogger');

describe('auditLogger (EVT-SR-006)', () => {
  beforeEach(() => {
    db.query.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('inserts user ID, action and details into audit_logs', async () => {
    db.query.mockResolvedValue({ rowCount: 1 });
    await audit(7, ACTIONS.LOGIN_SUCCESS, { ip: '1.2.3.4' });
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('INSERT INTO audit_logs');
    expect(params).toEqual([7, 'LOGIN_SUCCESS', JSON.stringify({ ip: '1.2.3.4' })]);
  });

  it('stores a null user ID when the user is unknown', async () => {
    db.query.mockResolvedValue({ rowCount: 1 });
    await audit(undefined, ACTIONS.LOGIN_FAILED, { email: 'nobody@ems.test' });
    expect(db.query.mock.calls[0][1][0]).toBeNull();
  });

  it('never stores passwords or tokens', () => {
    const clean = cleanDetails({ email: 'a@ems.test', password: 'x', accessToken: 'y' });
    expect(clean).toEqual({ email: 'a@ems.test' });
  });

  it('does not throw when the database write fails', async () => {
    db.query.mockRejectedValue(new Error('db down'));
    await expect(audit(1, ACTIONS.CHECK_IN, {})).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('can write inside an existing transaction client', async () => {
    const client = { query: jest.fn().mockResolvedValue({}) };
    await audit(3, ACTIONS.EVENT_CANCELLED, { eventId: 5 }, client);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(db.query).not.toHaveBeenCalled();
  });
});
