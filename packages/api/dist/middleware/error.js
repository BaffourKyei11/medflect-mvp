export function errorHandler(err, _req, res, _next) {
    // Normalize axios errors
    const status = err?.response?.status || err?.status || 500;
    const message = err?.response?.data?.error || err?.message || 'Internal Server Error';
    console.error('Error:', message, '| status:', status);
    res.status(status).json({ error: message });
}
