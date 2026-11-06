import {type Request, type Response, type Router} from 'express'

export function registerHealthRoutes(app: Router) {
  // Health check endpoint for Docker
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({status: 'ok', service: 'mocks-server'})
  })
}
