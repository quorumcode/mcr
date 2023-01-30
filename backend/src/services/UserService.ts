import randToken from "rand-token";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, UserDoc, UserProps } from "@/models/User";
import { ServiceError } from "@/services/ServiceError";
import { UserErrors } from "@/types/errors";

type JWTPayload = { id: string };
type JWTChangeEmailPayload = {
  userId: string;
  newEmail?: string;
  newName?: string;
  confirmationToken?: string;
};

type Props = Pick<UserProps, "name" | "email" | "password">;

interface Config {
  jwtAuthSecret: string;
}

export class UserService {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async createUser({
    name,
    email,
    password,
  }: Pick<UserProps, "name" | "email" | "password">): Promise<UserDoc> {
    if (await this.getUserByEmail(email)) {
      throw new ServiceError({ code: UserErrors.UserAlreadyExists });
    }

    const verifyEmailCode = randToken.generate(16);
    const confirmationToken = randToken.generate(32);
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      verifyEmailCode,
      confirmationToken,
      password: passwordHash,
    });
    await user.save();

    return user;
  }

  async getUserByEmail(email: string): Promise<UserDoc | null> {
    return await User.findOne({ email }).exec();
  }

  async getUserByConfirmationToken(
    confirmationToken: string
  ): Promise<UserDoc | null> {
    return await User.findOne({ confirmationToken }).exec();
  }

  async getUserById(id: string): Promise<UserDoc | null> {
    return User.findById(id);
  }

  async getUserByCredentials(
    email: string,
    password: string
  ): Promise<UserDoc> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new ServiceError({ code: UserErrors.UserNotFound });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ServiceError({ code: UserErrors.InvalidPassword });
    }

    return user;
  }

  async getUserConfirmationToken(confirmationToken: string): Promise<UserDoc> {
    const user = await this.getUserByConfirmationToken(confirmationToken);
    if (!user) {
      throw new ServiceError({ code: UserErrors.UserNotFound });
    }

    return user;
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.getUserByCredentials(email, password);

    if (!user.isEmailVerified) {
      throw new ServiceError({ code: UserErrors.EmailNotVerified });
    }

    if (user.isBanned) {
      throw new ServiceError({ code: UserErrors.UserBanned });
    }

    const payload: JWTPayload = { id: user.id };
    return jwt.sign(payload, this.config.jwtAuthSecret, { expiresIn: "7d" });
  }

  async loginByConfirmationToken(confirmationToken: string): Promise<string> {
    const user = await this.getUserConfirmationToken(confirmationToken);

    if (!user.isEmailVerified) {
      throw new ServiceError({ code: UserErrors.EmailNotVerified });
    }

    if (user.isBanned) {
      throw new ServiceError({ code: UserErrors.UserBanned });
    }

    user.confirmationToken = undefined;
    await user.save();

    const payload: JWTPayload = { id: user.id };
    return jwt.sign(payload, this.config.jwtAuthSecret, { expiresIn: "7d" });
  }

  async verifyUserAccessToken(token: string): Promise<JWTPayload> {
    try {
      return jwt.verify(token, this.config.jwtAuthSecret) as JWTPayload;
    } catch (e) {
      throw new ServiceError({ code: UserErrors.InvalidAccessToken }, e);
    }
  }

  async verifyUserEmail(verifyEmailCode: string): Promise<void> {
    const user = await User.findOne({ verifyEmailCode }).exec();
    if (!user) {
      throw new ServiceError({ code: UserErrors.InvalidEmailVerifyCode });
    }
    user.verifyEmailCode = undefined;
    user.isEmailVerified = true;
    await user.save();
  }

  async recreateUserVerifyEmailCode(
    email: string,
    password: string
  ): Promise<UserDoc> {
    const user = await this.getUserByCredentials(email, password);
    if (user.isEmailVerified) {
      throw new ServiceError({ code: UserErrors.EmailAlreadyVerified });
    }
    if (user.isBanned) {
      throw new ServiceError({ code: UserErrors.UserBanned });
    }
    user.verifyEmailCode = randToken.generate(16);
    user.confirmationToken = randToken.generate(32);
    await user.save();
    return user;
  }

  async recreateUserChangePasswordCode(email: string): Promise<UserDoc> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new ServiceError({ code: UserErrors.UserNotFound });
    }
    if (user.isBanned) {
      throw new ServiceError({ code: UserErrors.UserBanned });
    }
    user.changePasswordCode = randToken.generate(16);
    await user.save();
    return user;
  }

  async changeUserPasswordByCode(
    changePasswordCode: string,
    password: string
  ): Promise<UserDoc> {
    const user = await User.findOne({ changePasswordCode }).exec();
    if (!user) {
      throw new ServiceError({ code: UserErrors.InvalidChangePasswordCode });
    }
    if (user.isBanned) {
      throw new ServiceError({ code: UserErrors.UserBanned });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    user.changePasswordCode = undefined;
    user.password = passwordHash;
    await user.save();
    return user;
  }

  async generateAutoLoginToken(user: UserDoc): Promise<string> {
    user.confirmationToken = randToken.generate(32);
    await user.save();

    return user.confirmationToken;
  }

  async changeUserPassword(
    user: UserDoc,
    oldPassword: string,
    newPassword: string
  ): Promise<UserDoc> {
    if (oldPassword === newPassword) {
      throw new ServiceError({ code: UserErrors.EqualPasswords });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new ServiceError({ code: UserErrors.InvalidOldPassword });
    }

    if (user.isBanned) {
      throw new ServiceError({ code: UserErrors.UserBanned });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.password = newPasswordHash;
    await user.save();
    return user;
  }

  async setUserBan(id: string, isBanned: boolean): Promise<void> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new ServiceError({ code: UserErrors.UserNotFound });
    }
    user.isBanned = isBanned;
    await user.save();
  }

  async CreateTokenForCredsChange(
    userId: string,
    newEmail?: string,
    newName?: string
  ): Promise<string> {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new ServiceError({ code: UserErrors.UserNotFound });
    }

    if (user.isBanned) {
      throw new ServiceError({ code: UserErrors.UserBanned });
    }

    if (newEmail) {
      if (await this.getUserByEmail(newEmail)) {
        throw new ServiceError({ code: UserErrors.UserAlreadyExists });
      }
    }

    const payload: JWTChangeEmailPayload = { userId, newEmail, newName };
    return jwt.sign(payload, this.config.jwtAuthSecret, { expiresIn: "2d" });
  }

  async verifyChangeCredsToken(token: string): Promise<JWTChangeEmailPayload> {
    try {
      return jwt.verify(
        token,
        this.config.jwtAuthSecret
      ) as JWTChangeEmailPayload;
    } catch (e) {
      throw new ServiceError({ code: UserErrors.InvalidAccessToken });
    }
  }

  async updateUserCreds(creds: JWTChangeEmailPayload): Promise<void> {
    const user = await this.getUserById(creds.userId);

    if (!user) {
      throw new ServiceError({ code: UserErrors.UserNotFound });
    }

    if (user.isBanned) {
      throw new ServiceError({ code: UserErrors.UserBanned });
    }

    if (creds.newEmail) {
      user.email = creds.newEmail;
    }

    if (creds.newName) {
      user.name = creds.newName;
    }

    await user.save();
  }

  async updateUserName(newName: string, user: UserDoc): Promise<void> {
    user.name = newName;
    await user.save();
  }

  async convertToTest(user: UserDoc): Promise<void> {
    user.isTest = true;
    await user.save();
  }

  async patchUser(user: UserDoc, data: Partial<Props>): Promise<UserDoc> {
    await user.updateOne(data);
    return user;
  }
}
