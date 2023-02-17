const request = require("supertest")
require("dotenv").config()

const baseURL = "http://localhost:" + process.env.PORT
const login = process.env.TEST_ACCOUNT_LOGIN
const pass = process.env.TEST_ACCOUNT_PASS

let token
const newLogin = {
    username: login,
    password: pass,
}

beforeAll(async () => {
    const response = await request(baseURL).post("/auth/login").send(newLogin)
    token = response.body.token
})

describe("GET /file/0", () => {
    let response
    beforeAll(async () => {
        response = await request(baseURL).get("/file/0").send(newLogin).set("Authorization", "Bearer " + token)
    })

    it("should return 200", async () => {
        expect(response.statusCode).toBe(200)
    })
})