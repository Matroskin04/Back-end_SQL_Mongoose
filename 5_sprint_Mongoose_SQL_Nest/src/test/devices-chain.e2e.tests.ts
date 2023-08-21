/*
import {mongoURL} from "../infrastructure/db";
const request = require("supertest");
import {app} from "../setting";
import {ObjectId} from "mongodb";
import {AuthService} from "../application/services/auth-service";
import {DevicesService} from "../application/services/devices-service";
import mongoose from "mongoose";


//refresh 60 sec, access - 30 sec
let refreshToken1: string;
let refreshToken2: string;
let deviceId: string;


describe('devices: /security/devices', () => {

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

    it(`(Addition) + POST -> '/users' - create 2 new users; status 201;
              (Addition) + POST -> '/auth/login' - login 5 times (4+1) from different browsers; status 200`, async () => {
        //1 user
        await request(app)
            .post(`/hometask-03/users`)
            .auth('admin', 'qwerty')
            .send({login: 'Dima123', password: '123qwe', email: 'dim@mail.ru'})
            .expect(201);

        //2 user
        await request(app)
            .post(`/hometask-03/users`)
            .auth('admin', 'qwerty')
            .send({login: 'Sasha123', password: '123qwe', email: 'sash@mail.ru'})
            .expect(201);

        //№ 1
        const response1 = await request(app)
            .post(`/hometask-03/auth/login`)
            .set('user-agent', 'Mozilla')
            .send({loginOrEmail: 'Dima123', password: '123qwe'})
            .expect(200);
        //№ 2
        await request(app)
            .post(`/hometask-03/auth/login`)
            .set('user-agent', 'Safari')
            .send({loginOrEmail: 'Dima123', password: '123qwe'})
            .expect(200);
        //№ 3
        const response2 = await request(app)
            .post(`/hometask-03/auth/login`)
            .set('user-agent', 'Chrome')
            .send({loginOrEmail: 'Dima123', password: '123qwe'})
            .expect(200);
        //№ 4
        await request(app)
            .post(`/hometask-03/auth/login`)
            .set('user-agent', 'Opera')
            .send({loginOrEmail: 'Dima123', password: '123qwe'})
            .expect(200);
        //№ 5 another user
        const response3 = await request(app)
            .post(`/hometask-03/auth/login`)
            .set('user-agent', 'Opera')
            .send({loginOrEmail: 'Sasha123', password: '123qwe'})
            .expect(200);

        refreshToken1 = response3.headers["set-cookie"][0];
        expect(refreshToken1).not.toBeUndefined();

        //Get deviceId of user Sasha123
        const responseDevices = await request(app)
            .get(`/hometask-03/security/devices`)
            .set('Cookie', refreshToken1)
            .send({loginOrEmail: 'Sasha123', password: '123qwe'})
            .expect(200);
        deviceId = responseDevices.body[0].deviceId;

        refreshToken1 = response1.headers['set-cookie'][0];
        expect(refreshToken1).not.toBeUndefined();
        refreshToken2 = response2.headers['set-cookie'][0];
        expect(refreshToken2).not.toBeUndefined();
    })

    it(`- DELETE -> '/devices' - the refreshToken inside cookie is missing; status 401;
              - DELETE -> '/devices/:id' - the refreshToken inside cookie is missing; status 401;
              - DELETE -> '/devices/:id' - delete the deviceId of other user; status 403;
              - DELETE -> '/devices/:id' - Not Found; status 404;`, async () => {

        //missing refresh
        await request(app)
            .delete(`/hometask-03/security/devices`)
            .expect(401);

        //missing refresh
        await request(app)
            .delete(`/hometask-03/security/devices/${new ObjectId}`)
            .expect(401);

        //deviceId of other user
        await request(app)
            .delete(`/hometask-03/security/devices/${deviceId}`)
            .set('Cookie', refreshToken1)
            .expect(403);

        //Not Found
        await request(app)
            .delete(`/hometask-03/security/devices/${new ObjectId}`)
            .set('Cookie', refreshToken1)
            .expect(404);
    })

    it(`+ GET -> '/security/devices' - get all (4) devices; status 200;
              + POST -> '/auth/refresh-token' - update refresh for 1 device; status 200
              + GET -> '/security/devices' - get all (4) devices, lastActiveDate was changed; status 200;`, async () => {

        //get all devices
        const response = await request(app)
            .get(`/hometask-03/security/devices`)
            .set('Cookie', refreshToken1)
            .send({loginOrEmail: 'Sasha123', password: '123qwe'})
            .expect(200);
        expect(response.body).toHaveLength(4);
        const lastActiveDate = response.body[0].lastActiveDate

        //update refresh 200
        const refreshResponse = await request(app)
            .post("/hometask-03/auth/refresh-token")
            .set("Cookie", refreshToken1)
            .expect(200)
        refreshToken1 = refreshResponse.headers["set-cookie"][0];

        //get all devices
        const responseDevices = await request(app)
            .get(`/hometask-03/security/devices`)
            .set('Cookie', refreshToken1)
            .send({loginOrEmail: 'Sasha123', password: '123qwe'})
            .expect(200);
        expect(responseDevices.body).toHaveLength(4);
        expect(responseDevices.body[0].lastActiveDate).not.toBe(lastActiveDate);

        deviceId = responseDevices.body[1].deviceId;
    })

    it(`+ DELETE -> '/devices/:id' - should delete device by id; status 204;
              + GET -> '/security/devices' - get all (3) devices; status 200;
              + POST -> '/auth/logout' - should logout user; status 204;
              + GET -> '/security/devices' - get all (2) devices; status 200;
              - DELETE -> '/devices/:id' - the refreshToken inside cookie is expired; status 401;`, async () => {

        //+delete device
        await request(app)
            .delete(`/hometask-03/security/devices/${deviceId}`)
            .set('Cookie', refreshToken1)
            .expect(204);

        //+get all devices
        const response1 = await request(app)
            .get(`/hometask-03/security/devices`)
            .set('Cookie', refreshToken1)
            .send({loginOrEmail: 'Sasha123', password: '123qwe'})
            .expect(200);
        expect(response1.body).toHaveLength(3);

        //+logout
        await request(app)
            .post(`/hometask-03/auth/logout`)
            .set('Cookie', refreshToken2)
            .expect(204);

        //+get all devices
        const response2 = await request(app)
            .get(`/hometask-03/security/devices`)
            .set('Cookie', refreshToken1)
            .send({loginOrEmail: 'Sasha123', password: '123qwe'})
            .expect(200);
        expect(response2.body).toHaveLength(2);

        //delete all devices except current
        await request(app)
            .delete(`/hometask-03/security/devices`)
            .set('Cookie', refreshToken1)
            .expect(204);

        //+get all devices
        const response3 = await request(app)
            .get(`/hometask-03/security/devices`)
            .set('Cookie', refreshToken1)
            .send({loginOrEmail: 'Sasha123', password: '123qwe'})
            .expect(200);
        expect(response3.body).toHaveLength(1);

        //задержка 30 сек, чтобы проверить expired token
        await new Promise((resolve) => setTimeout(resolve, 60000))
        //refresh token is expired
        await request(app)
            .delete(`/hometask-03/security/devices/${deviceId}`)
            .set('Cookie', refreshToken1)
            .expect(401);
    })

    it(`+ POST -> '/auth/login' - 5 login one user; status 200;
              - POST -> '/security/devices' - more than 5 attempts (6) from one IP-address during 10 seconds; status 429;
              + POST -> '/auth/login' - one more login after 10 seconds; status 200;`, async () => {

        jest.spyOn(AuthService.prototype, 'loginUser')
        const loginUser = new AuthService(emailManager, jwtService, usersService, usersRepository, usersQueryRepository).loginUser;


        jest.spyOn(DevicesService.prototype, 'createNewDevice');
        const createNewDevice = new DevicesService(jwtQueryRepository, devicesQueryRepository, devicesRepository).createNewDevice;

        //1
        await request(app)
            .post(`/hometask-03/auth/login`)
            .send({loginOrEmail: 'Dima123', password: '123qwe'})
            .expect(200);
        expect(loginUser).toHaveBeenCalled();
        expect(createNewDevice).toHaveBeenCalled();
        //2
        await request(app)
            .post(`/hometask-03/auth/login`)
            .send({loginOrEmail: 'Dima123', password: '123qwe'})
            .expect(200);
        //3
        await request(app)
            .post(`/hometask-03/auth/login`)
            .send({loginOrEmail: 'Dima123', password: '123qwe'})
            .expect(200);
        //4
        await request(app)
            .post(`/hometask-03/auth/login`)
            .send({loginOrEmail: 'Dima123', password: '123qwe'})
            .expect(200);
        //5
        await request(app)
            .post(`/hometask-03/auth/login`)
            .send({loginOrEmail: 'Dima123', password: '123qwe'})
            .expect(200);

        //6 - too much, Status 429
        await request(app)
            .post(`/hometask-03/auth/login`)
            .send({loginOrEmail: 'Dima123', password: '123qwe'})
            .expect(429);

        await new Promise( (resolve) => setTimeout( resolve, 10000));
        //+7
        await request(app)
            .post(`/hometask-03/auth/login`)
            .set('user-agent', 'Chrome5')
            .send({loginOrEmail: 'Dima123', password: '123qwe'})
            .expect(200);
    })
})*/
