export function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token']
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Não autorizado' })
  }
  next()
}