import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { AppError } from '../utils/errors'

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {}
        for (const issue of error.issues) {
          const path = issue.path.join('.')
          if (!errors[path]) errors[path] = []
          errors[path].push(issue.message)
        }
        return next(AppError.validation(errors))
      }
      next(error)
    }
  }
}

export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {}
        for (const issue of error.issues) {
          const path = issue.path.join('.')
          if (!errors[path]) errors[path] = []
          errors[path].push(issue.message)
        }
        return next(AppError.validation(errors))
      }
      next(error)
    }
  }
}

export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {}
        for (const issue of error.issues) {
          const path = issue.path.join('.')
          if (!errors[path]) errors[path] = []
          errors[path].push(issue.message)
        }
        return next(AppError.validation(errors))
      }
      next(error)
    }
  }
}

export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {}
        for (const issue of error.issues) {
          const path = issue.path.join('.')
          if (!errors[path]) errors[path] = []
          errors[path].push(issue.message)
        }
        return next(AppError.validation(errors))
      }
      next(error)
    }
  }
}