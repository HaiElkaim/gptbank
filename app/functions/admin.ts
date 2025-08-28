import { Handler, HandlerEvent } from '@netlify/functions';
import { router, get, post } from 'itty-router';
import { getAllCsvRecords } from './lib/csv';
import { logger } from './lib/utils';

const USER = process.env.ADMIN_BASIC_USER || 'admin';
const PASS = process.env.ADMIN_BASIC_PASS || 'change-me';

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }
  const token = authHeader.substring(6);
  const decoded = Buffer.from(token, 'base64').toString('utf8');
  const [user, pass] = decoded.split(':');
  return user === USER && pass === PASS;
}

const unauthorizedResponse = () => new Response('Unauthorized', {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
});

const getCsvData = async () => {
  if (!isAuthorized(request)) return unauthorizedResponse();
  try {
    const records = await getAllCsvRecords();
    return new Response(JSON.stringify(records), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    logger.error(error, 'Failed to get CSV data');
    return new Response('Error reading data', { status: 500 });
  }
};

// NOTE: Persisting changes to CSV is not directly possible in a standard Netlify serverless function environment.
// The filesystem is read-only, except for the /tmp directory which is ephemeral.
// This POST handler is a placeholder to show the logic.
// A real implementation would require a database or a Git-based workflow (e.g., a bot making commits).
const updateCsvData = async (request: Request) => {
  if (!isAuthorized(request)) return unauthorizedResponse();
  const body = await request.json();
  logger.info({ update: body }, 'Admin update request received (simulation)');
  // In a real scenario, you would write to a database here.
  // For now, we just log it and return success.
  return new Response(JSON.stringify({ success: true, message: 'Simulated update successful.' }), { headers: { 'Content-Type': 'application/json' } });
};

const r = router({ base: '/.netlify/functions/admin' });
r.get('*', getCsvData).post('*', updateCsvData);

export const handler: Handler = (event: HandlerEvent) => {
    const req = new Request(`http://${event.headers.host}${event.path}`, {
        method: event.httpMethod,
        headers: event.headers as HeadersInit,
        body: event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined,
    });
    return r.handle(req);
};
