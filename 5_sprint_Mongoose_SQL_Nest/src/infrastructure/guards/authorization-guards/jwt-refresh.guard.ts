import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuardMongo extends AuthGuard('jwt-refresh-mongo') {}

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
