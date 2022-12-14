import request from 'supertest'
import { Pool } from 'pg'
import app from '../app'
import queries from './mocks/queries'
import results from './mocks/results'

// Skip this test suite that mocks the database if the CI environment variable is not set to true
const maybe = process.env.CI !== 'true' ? describe.skip : describe

maybe('Products API - Mocked DB', () => {
  // Need to explicity set the types for spyOn so that we can set the return value
  // to be any to allow mocking the return value because, it will have a type of never if not
  const querySpy = jest.spyOn<typeof Pool.prototype, any>(Pool.prototype, 'query')

  // Reset the mock information on each test
  beforeEach(() => {
    querySpy.mockClear()
  })

  describe('GET /products', () => {
    it('should return the default count of the first 5 products', async () => {
      querySpy.mockResolvedValueOnce({ rows: queries.products })

      await request(app)
        .get('/api/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(results.getProducts)
        })

      expect(querySpy).toHaveBeenCalledTimes(1)
    })

    it('should return the second page of default count of 5 products', async () => {
      querySpy.mockResolvedValueOnce({ rows: queries.productsPage2 })

      await request(app)
        .get('/api/products?page=2')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(results.getProductsPage2)
        })
    })

    it('should return the first 10 products', async () => {
      querySpy.mockResolvedValueOnce({ rows: queries.productsCount10 })

      await request(app)
        .get('/api/products?count=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(results.getProductsCount10)
        })
    })
  })

  describe('GET /products/:id', () => {
    it("should return status 400 if the id is not valid or doesn't exist", async () => {
      querySpy.mockResolvedValue({ rows: [] })

      await request(app)
        .get('/api/products/test')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('error')
        })

      await request(app)
        .get('/api/products/0')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('error')
        })
    })

    it('should return the product details for the given id', async () => {
      querySpy.mockResolvedValueOnce({
        rows: [results.getProductDetails],
      })

      await request(app)
        .get('/api/products/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(results.getProductDetails)
        })

      expect(querySpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('GET /products/:id/styles', () => {
    it("should return status 400 if the id is not valid or doesn't exist", async () => {
      querySpy.mockResolvedValue({ rows: [] })

      await request(app)
        .get('/api/products/test')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('error')
        })

      await request(app)
        .get('/api/products/0')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('error')
        })
    })

    it('should return the product styles for the given id', async () => {
      querySpy.mockResolvedValueOnce({ rows: queries.styles })

      await request(app)
        .get('/api/products/1/styles')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(results.getProductStyles)
        })

      expect(querySpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('GET /products/:id/related', () => {
    it("should return status 400 if the id is not valid or doesn't exist", async () => {
      querySpy.mockResolvedValue({ rows: [] })

      await request(app)
        .get('/api/products/test')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('error')
        })

      await request(app)
        .get('/api/products/0')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('error')
        })
    })

    it('should return an array of the related product ids', async () => {
      querySpy.mockResolvedValueOnce({ rows: queries.related })

      await request(app)
        .get('/api/products/1/related')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(results.getRelatedProducts)
        })
    })
  })
})
