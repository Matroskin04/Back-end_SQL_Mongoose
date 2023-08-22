import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAccessGuardMongo extends AuthGuard('jwt-access-mongo') {}

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt-access') {}
