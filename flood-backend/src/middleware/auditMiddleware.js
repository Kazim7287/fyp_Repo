// =========================================================
// AUDIT MIDDLEWARE
// =========================================================

const auditMiddleware = ({
  action,
  module,
  resourceType = null,
}) => {

  return (req, res, next) => {

    // -------------------------------------------------------
    // STORE AUDIT INFORMATION ON REQUEST
    // -------------------------------------------------------

    req.audit = {
      action,
      module,
      resourceType,

      resourceId:
        req.params?.id ||
        req.params?.nodeId ||
        req.params?.userId ||
        null,

      ipAddress:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        null,

      userAgent:
        req.get("user-agent") ||
        null,
    };

    next();
  };
};


module.exports = auditMiddleware;