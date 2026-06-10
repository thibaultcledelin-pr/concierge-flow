import { describe, it, expect, afterEach } from "vitest"
import { requireCron } from "../cron-auth"

const make = (auth?: string) =>
  new Request("http://localhost/api/cron/x", auth ? { headers: { authorization: auth } } : undefined)

afterEach(() => {
  delete process.env.CRON_SECRET
})

describe("requireCron", () => {
  it("renvoie 503 (fail-closed) si CRON_SECRET n'est pas configuré", () => {
    delete process.env.CRON_SECRET
    const res = requireCron(make("Bearer whatever"))
    expect(res?.status).toBe(503)
  })

  it("renvoie 401 si le Bearer token est absent", () => {
    process.env.CRON_SECRET = "s3cr3t"
    const res = requireCron(make())
    expect(res?.status).toBe(401)
  })

  it("renvoie 401 si le Bearer token est incorrect", () => {
    process.env.CRON_SECRET = "s3cr3t"
    const res = requireCron(make("Bearer nope"))
    expect(res?.status).toBe(401)
  })

  it("renvoie null (autorisé) si le Bearer token est correct", () => {
    process.env.CRON_SECRET = "s3cr3t"
    const res = requireCron(make("Bearer s3cr3t"))
    expect(res).toBeNull()
  })

  it("accepte un token de longueur différente sans lever (hash de longueur fixe)", () => {
    process.env.CRON_SECRET = "court"
    const res = requireCron(make("Bearer un-token-beaucoup-plus-long-que-le-secret"))
    expect(res?.status).toBe(401)
  })
})
