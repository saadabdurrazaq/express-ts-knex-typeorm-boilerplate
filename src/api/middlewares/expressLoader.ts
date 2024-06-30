import bodyParser from 'body-parser';
import { Application } from 'express';

export function expressLoader(app: Application): void {
    // Middleware to parse application/json
    app.use(bodyParser.json());

    // Other middleware configurations or routes can follow
    // Example:
    // app.use('/api', yourRouter);
}
