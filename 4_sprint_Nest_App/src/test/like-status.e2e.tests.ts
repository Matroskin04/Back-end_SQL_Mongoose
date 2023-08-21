/*
import {describe} from "node:test";
import {mongoURL} from "../infrastructure/db";
const request = require("supertest");
import {app} from "../setting";
import mongoose from "mongoose";

let userId1;
let accessToken: string;
let commentId1;

describe('comments: /comments - test like status', () => {

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

    it(`(Addition) + POST -> create new user; status 201
                         + POST -> '/login' should login in system with 'email'; status: 200`, async () => {

        //user1
        const user1 = await request(app)
            .post(`/hometask-03/users`)
            .auth('admin', 'qwerty')
            .send({login: 'Dima123', password: '123qwe', email: 'dim@mail.ru'})
            .expect(201);

        userId1 = user1.body.id;

        const response = await request(app)
            .post(`/hometask-03/auth/login`)
            .send({loginOrEmail: 'dim@mail.ru', password: '123qwe'})
            .expect(200);
        expect(response.body).toEqual({accessToken: expect.any(String)})

        accessToken = response.body.accessToken;
    })

    it(`(Addition)
              + POST -> "/blogs": should create new blog; status 201;
              + POST -> "/posts": should create new post; status 201;
              + POST -> '/posts/{id}/comments' should create new comment; status: 201;
              + GET  -> '/posts/{id}/comments' should return comment, status 200`, async () => {

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

        const responseComment = await request(app)
            .post(`/hometask-03/posts/${responsePost.body.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: 'super normal content 12341235123412351235'})
            .expect(201);

        commentId1 = responseComment.body.id;

        const comment = await request(app)
            .get(`/hometask-03/comments/${commentId1}`)
            .expect(200)
        expect(comment.body.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None'
        })

    });
})*/
