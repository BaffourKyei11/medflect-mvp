const Joi = require('joi');
// In a real app, load FHIR R4 schemas dynamically or from a schema map
// Here, we use a simple placeholder for demonstration
const fhirSchemas = {
  Patient: Joi.object({
    resourceType: Joi.string().valid('Patient').required(),
    id: Joi.string().optional(),
    name: Joi.array().items(Joi.object({
      family: Joi.string().required(),
      given: Joi.array().items(Joi.string()).required(),
    })).required(),
    gender: Joi.string().valid('male', 'female', 'other', 'unknown').optional(),
    birthDate: Joi.string().optional(),
    // ... add more FHIR Patient fields as needed
  }),
  Observation: Joi.object({
    resourceType: Joi.string().valid('Observation').required(),
    id: Joi.string().optional(),
    status: Joi.string().required(),
    code: Joi.object().required(),
    subject: Joi.object().required(),
    effectiveDateTime: Joi.string().optional(),
    valueQuantity: Joi.object().optional(),
    // ... add more FHIR Observation fields as needed
  })
};

function validateFHIRResource(req, res, next) {
  const { resourceType } = req.body;
  const schema = fhirSchemas[resourceType];
  if (!schema) {
    return res.status(400).json({ message: `No schema for resource type: ${resourceType}` });
  }
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: 'FHIR validation error', details: error.details });
  }
  next();
}

module.exports = validateFHIRResource;
