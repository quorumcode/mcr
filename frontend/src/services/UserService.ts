import { BaseService } from "@/services/BaseService";
import { createServiceErrorFromError } from "@/services/ServiceError";
import { UserInfo as UserInfoResponse } from "@/types/commonTypes";
import { normalizeCompanyFromResponse } from "@/helpers/normalizeCompanyFromResponse";

interface RegisterParams {
  userName: string;
  email: string;
  password: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface ChangePasswordParams {
  code: string;
  password: string;
}

interface UpdatePasswordParams {
  oldPassword: string;
  newPassword: string;
}

interface ContactFormParams {
  email: string;
  body: string;
}

export class UserService extends BaseService {
  async register({ userName, email, password }: RegisterParams): Promise<void> {
    const request = {
      name: userName,
      email,
      password,
    };
    try {
      await this.client.axios.post("/user/register", request);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async confirmEmail(code: string): Promise<void> {
    const request = { code };
    try {
      await this.client.axios.post("/user/verify-email", request);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async login({ email, password }: LoginParams): Promise<string> {
    const request = {
      email,
      password,
    };
    try {
      const result = await this.client.axios.post("/user/login", request);
      const token = result.data.token;
      this.client.setToken(token);
      return token;
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async resetPassword(email: string): Promise<void> {
    const request = { email };
    try {
      await this.client.axios.post("/user/reset-password", request);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async changePassword({
    code,
    password,
  }: ChangePasswordParams): Promise<void> {
    const request = { code, password };
    try {
      await this.client.axios.post("/user/change-password", request);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async changeAccountPassword({
    oldPassword,
    newPassword,
  }: UpdatePasswordParams): Promise<void> {
    const request = { oldPassword, newPassword };
    try {
      return await this.client.axios.post(
        "/user/change-account-password",
        request
      );
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getMyInfo(): Promise<UserInfoResponse> {
    try {
      const result = await this.client.axios.get<UserInfoResponse>(
        "/user/my-info"
      );
      return {
        ...result.data,
        company: result.data.company
          ? // @ts-ignore TODO
          normalizeCompanyFromResponse(result.data.company)
          : undefined,
      };
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async getInfo(id: string): Promise<UserInfoResponse> {
    try {
      const result = await this.client.axios.get<UserInfoResponse>(
        `/user/${id}`
      );
      return {
        ...result.data,
        company: result.data.company
          ? // @ts-ignore TODO
          normalizeCompanyFromResponse(result.data.company)
          : undefined,
      };
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async ban(id: string): Promise<void> {
    try {
      await this.client.axios.post(`/user/${id}/ban`);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async unban(id: string): Promise<void> {
    try {
      await this.client.axios.post(`/user/${id}/unban`);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      return await this.client.axios.delete(`/user/${id}/delete`);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async sendContactForm(form: ContactFormParams): Promise<void> {
    try {
      return await this.client.axios.post("user/send-contact-form", form);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async updateEmailAndName(params: any): Promise<void> {
    try {
      await this.client.axios.post("user/change-creds", params);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async putTokensChangeCreds(tokens: any): Promise<void> {
    try {
      await this.client.axios.put("user/confirm-creds", tokens);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async tokenLogin(confirmationToken: string): Promise<string> {
    try {
      const result = await this.client.axios.post("user/token-login", {
        confirmationToken,
      });
      const token = result.data.token;
      this.client.setToken(token);
      return token;
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }

  async updateUser(id: string | undefined, params: object): Promise<void> {
    try {
      await this.client.axios.patch(`/user/${id}`, params);
    } catch (e) {
      throw createServiceErrorFromError(e);
    }
  }
}
