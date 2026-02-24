function normalizeAllowedRoles(allowedRoles) {
  if (Array.isArray(allowedRoles)) return allowedRoles;
  if (typeof allowedRoles === 'string' && allowedRoles.trim()) return [allowedRoles.trim()];
  return [];
}

function getRoleFromUser(user) {
  if (!user) return undefined;
  if (typeof user.role === 'string' && user.role.trim()) return user.role.trim();
  return undefined;
}

/**
 * Role-based authorization middleware.
 *
 * Usage: `app.get('/admin', verifyFirebaseToken, requireRole(['admin']), handler)`
 */
export function requireRole(allowedRoles) {
  const roles = normalizeAllowedRoles(allowedRoles);

  if (roles.length === 0) {
    throw new Error('requireRole(allowedRoles) requires at least one role.');
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: {
          message: 'Authentication required',
          status: 401,
        },
      });
    }

    const role = getRoleFromUser(req.user);
    if (!role) {
      return res.status(403).json({
        ok: false,
        error: {
          message: 'User role is missing',
          status: 403,
          allowedRoles: roles,
        },
      });
    }

    if (!roles.includes(role)) {
      return res.status(403).json({
        ok: false,
        error: {
          message: 'Insufficient role',
          status: 403,
          role,
          allowedRoles: roles,
        },
      });
    }

    return next();
  };
}
