import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../../users/auth/types";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt'
) {
  constructor(
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET_ACCESS')
    });
  }

  async validate(payload: JwtPayload) {

    return payload;
  }
}