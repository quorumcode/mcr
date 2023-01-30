import { FastifyPluginAsync } from "fastify";
import { UserInfo, UserRole } from "@/types/common";
import { getRolePermissions } from "@/helpers/getRolePermissions";
import { normalizeCompanyForReply } from "@/helpers/normalizeCompanyForReply";
import { CompanyProps } from "@/models/Company";
import { UserErrors } from "@/types/errors";

export const routeOfMyInfo: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: "GET",
    url: "/my-info",
    async handler(request, reply) {
      try {
        if (!request.user) {
          const role = UserRole.guest;
          const result: UserInfo = {
            role,
            permissions: getRolePermissions(role),
          };
          return result;
        }

        const { id, name, email, role = UserRole.user } = request.user;
        const result: UserInfo & {
          company?: Partial<CompanyProps> & {
            reviewToken?: string;
            reviewsStats?: {
              count: number;
              rateAvg: number;
            };
          };
        } = {
          id,
          name,
          email,
          role,
          permissions: getRolePermissions(role),
        };
        const userCompany =
          await fastify.resources.companyService.getCompanyByUser(id);
        if (userCompany) {
          result.company = normalizeCompanyForReply(userCompany, true);

          const reviewToken =
            await fastify.resources.invitationService.getQRReviewTokenValue(
              userCompany.id
            );
          result.company.reviewToken = reviewToken?.value || "";

          const reviewsStats =
            await fastify.resources.reviewService.getReviewsStats([
              userCompany.id,
            ]);
          result.company.reviewsStats = reviewsStats[userCompany.id];
        }
        return result;
      } catch (e) {
        fastify.log.error(e, UserErrors.UserUnhandledError);
        return reply.code(500).send({ code: UserErrors.UserUnhandledError });
      }
    },
  });
};
