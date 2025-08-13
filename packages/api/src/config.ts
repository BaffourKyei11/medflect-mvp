export const config = {
  jwtSecret: process.env.JWT_SECRET || 'dev',
  mockAI: process.env.MOCK_AI === 'true',
  mockSMS: process.env.MOCK_SMS === 'true',
};
