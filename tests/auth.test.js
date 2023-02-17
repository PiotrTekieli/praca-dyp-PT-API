const request = require("supertest")
require("dotenv").config()

const baseURL = "http://localhost:" + process.env.PORT
const login = process.env.TEST_ACCOUNT_LOGIN
const pass = process.env.TEST_ACCOUNT_PASS

const newLogin = {
    username: login,
    password: pass,
}

let token

describe("POST /login", () => {


    let response
    beforeAll(async () => {
        response = await request(baseURL).post("/auth/login").send(newLogin)
    })

    it("should return 200", async () => {
        expect(response.statusCode).toBe(200)
    })

    it("should return a token", async () => {
        expect(response.body.token).toBeDefined()
        token = response.body.token
    })

    it("token should be valid", async () => {
        let response = await request(baseURL).get("/auth/checkToken").set("Authorization", "Bearer " + token)
        expect(response.statusCode).toBe(200)
    })
})

describe("POST /logout", () => {
    let response
    beforeAll(async () => {
        response = await request(baseURL).post("/auth/logout").set("Authorization", "Bearer " + token)
    })

    it("should return 200", async () => {
        expect(response.statusCode).toBe(200)
    })

    it("should make the token invalid", async () => {
        let response = await request(baseURL).get("/auth/checkToken").set("Authorization", "Bearer " + token)
        expect(response.statusCode).toBe(401)
    })
})