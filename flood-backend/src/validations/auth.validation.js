const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100),

  email: z
    .string()
    .email(),

  password: z
    .string()
    .min(8)
    .max(128),

  role: z
    .enum([
      "admin",
      "operator",
      "viewer"
    ])
    .optional()
});


const loginSchema = z.object({
  email: z
    .string()
    .email(),

  password: z
    .string()
    .min(1)
});


function validate(schema) {
  return (req, res, next) => {
    const result =
      schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details:
          result.error.issues
      });
    }

    req.body = result.data;

    next();
  };
}


module.exports = {
  registerSchema,
  loginSchema,
  validate
};