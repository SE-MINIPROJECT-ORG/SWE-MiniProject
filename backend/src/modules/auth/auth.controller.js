const service = require('./auth.service');

async function register(req, res) {
  const user = await service.register(req.body);
  res.status(201).json({ user });
}

async function login(req, res) {
  const result = await service.login(req.body, req.ip);
  res.status(200).json(result);
}

async function logout(req, res) {
  await service.logout(req.user);
  res.status(204).end();
}

async function me(req, res) {
  const user = await service.getProfile(req.user.id);
  res.status(200).json({ user });
}

module.exports = { register, login, logout, me };
