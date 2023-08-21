/*
import {describe} from "node:test";
import {mongoURL} from "../infrastructure/db";
const request = require("supertest");
import {app} from "../setting";
import mongoose from "mongoose";

let idOfPost: string;
let idOfBlog: string;
describe('Posts All operation, chains: /posts', () => {

    beforeAll( async () => {
        await mongoose.connection.close();
        await mongoose.connect(mongoURL);

        await request(app)
            .delete('/hometask-03/testing/all-data')
            .expect(204)
    })

    afterAll(async () => {
        await mongoose.connection.close();
    })

    it(`+ GET -> '/posts/:id': should return empty array;
              + POST -> "/blogs": should create new blog; status 201;
              + POST -> "/posts": should create new post; status 201;
                GET -> /posts/:id;`, async () => {

        await request(app)
            .get(`/hometask-03/posts`)
            .expect({
                "pagesCount": 0,
                "page": 1,
                "pageSize": 10,
                "totalCount": 0,
                "items": []
            })

        const responseBlog = await request(app)
            .post(`/hometask-03/blogs`)
            .auth('admin', 'qwerty')
            .send({
                name: "Blog2-ITforYOU",
                description: "some information",
                websiteUrl: "https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF"
            }).expect(201);

        const responsePost = await request(app)
            .post(`/hometask-03/posts`)
            .auth('admin', 'qwerty')
            .send({
                title: "post 1",
                shortDescription: "something interesting",
                content: "content of the post",
                blogId: responseBlog.body.id
            }).expect(201);
        expect(responsePost.body).toEqual({
            id: expect.any(String),
            title: "post 1",
            shortDescription: "something interesting",
            content: "content of the post",
            blogId: responseBlog.body.id,
            blogName: "Blog2-ITforYOU",
            createdAt: expect.any(String)
        })

        const responseGet = await request(app)
            .get(`/hometask-03/posts/${responsePost.body.id}`)
            .expect(200)
        expect(responseGet.body).toEqual(responsePost.body)

        idOfBlog = responseBlog.body.id;
        idOfPost = responsePost.body.id;
    });

   it(`- POST -> "/posts/:id": unauthorized; status 401;
             - POST -> '/posts/:id': incorrect blogId, st: 400`, async () => {

        await request(app)
            .post(`/hometask-03/posts`)
            .send({
                title: "postForBlog1",
                shortDescription: "something",
                content: "hello",
                blogId: idOfBlog
            }).expect(401)

       await request(app)
           .post(`/hometask-03/posts`)
           .auth('admin', 'qwerty')
           .send({
                title: "postForBlog1",
                shortDescription: "something",
                content: "hello",
                blogId: idOfPost
            }).expect(400)
    });

    it(`+ PUT -> "/posts/:id": should update the post; status 204
              + GET -> "/posts/:id": should return the post, status 200`, async () => {

        await request(app)
            .put(`/hometask-03/posts/${idOfPost}`)
            .auth('admin', 'qwerty')
            .send({
                title: "Update post",
                shortDescription: "something",
                content: "hello",
                blogId: idOfBlog
            })
            .expect(204)

        const responseGet = await request(app).get(`/hometask-03/posts/${idOfPost}`).expect(200)
        expect(responseGet.body.title).toEqual("Update post")
    });

   it(`- PUT -> "/posts/:id": Unauthorized; status 401;
             - PUT -> "/posts/:id": The title is too long, status 400`, async () => {

        await request(app)
            .put(`/hometask-03/posts/${idOfPost}`)
            .send({
                title: "Update post",
                shortDescription: "something",
                content: "hello",
                blogId: idOfBlog
            })
            .expect(401)

        await request(app)
            .put(`/hometask-03/posts/${idOfPost}`)
            .auth('admin', 'qwerty')
            .send({
                title: "Too long title 123456789123456789",
                shortDescription: "something",
                content: "hello",
                blogId: idOfBlog
            })
            .expect(400)

    });

    it(`+ DELETE -> "/posts/:id": should delete the post, status 204;
              - GET -> "/posts/:id": should NOT find the post; status 404;
              - DELETE -> "/posts/:id": should NOT delete the post; status 404`, async () => {

        await request(app).delete(`/hometask-03/posts/${idOfPost}`).auth('admin', 'qwerty').expect(204);
        await request(app).get(`/posts/${idOfPost}`).expect(404);
        await request(app).delete(`/posts/${idOfPost}`).auth('admin', 'qwerty').expect(404);

    })
})*/
