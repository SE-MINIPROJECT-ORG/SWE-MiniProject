const AppError = require('../../utils/AppError');
const service = require('./auth.service');

function userId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError(404, 'NOT_FOUND', 'User not found');
  return id;
}

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

async function updateMe(req, res) {
  res.status(200).json({ user: await service.updateProfile(req.user.id, req.body) });
}

async function changePassword(req, res) {
  await service.changePassword(req.user.id, req.body);
  res.status(204).end();
}

async function listUsers(req, res) {
  res.status(200).json({ users: await service.listUsers() });
}

async function changeRole(req, res) {
  res.status(200).json({ user: await service.changeRole(userId(req), req.body, req.user) });
}

async function changeStatus(req, res) {
  res.status(200).json({ user: await service.changeStatus(userId(req), req.body, req.user) });
}

module.exports = { register, login, logout, me, updateMe, changePassword, listUsers, changeRole, changeStatus };
