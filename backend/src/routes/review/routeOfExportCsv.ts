import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import csvStringify from "csv-stringify/lib/sync";
import { UserDoc } from "@/models/User";
import { format } from "date-fns";
import { ReviewErrors } from "@/types/errors";

interface CsvRecord {
  clientName: string;
  clientEmail: string;
  rate: number;
  message: string;
  createdAt: string;
  replyMessage: string;
  replyCreatedAt: string;
}

const testEmailRegEx = /^[0-9a-f]{24}@gmail.com/;

const csvColumns: Array<{ key: keyof CsvRecord; header: string }> = [
  {
    key: "clientName",
    header: "Customer name",
  },
  {
    key: "clientEmail",
    header: "Customer email",
  },
  {
    key: "rate",
    header: "Rating",
  },
  {
    key: "message",
    header: "Customer Review",
  },
  {
    key: "createdAt",
    header: "Review Creation Date",
  },
  {
    key: "replyMessage",
    header: "Business Response",
  },
  {
    key: "replyCreatedAt",
    header: "Business Response Creation Date",
  },
];

const schema = {
  querystring: {
    type: "object",
    required: ["companyId"],
    properties: {
      companyId: { type: "string" },
    },
  },
} as const;

export const routeOfExportCsv: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Querystring: FromSchema<typeof schema.querystring>;
  }>({
    method: "GET",
    url: "/export-csv",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const { companyId } = request.query;

      try {
        const company = await fastify.resources.companyService.getCompanyById(
          companyId
        );

        if (!company) {
          return reply.code(400).send({ code: ReviewErrors.CompanyNotFound });
        }

        const isOwner = user.id === company.user.toString();
        if (!isOwner) {
          return reply.code(403).send({ code: ReviewErrors.Forbidden });
        }

        const { data } = await fastify.resources.reviewService.getReviews({
          companyId,
          limit: 0,
          sort: "createdAt",
          withoutReported: true,
        });

        const csvRecords: CsvRecord[] = data.map((review) => ({
          clientName: review.client.name || "",
          clientEmail: testEmailRegEx.test(review.client.email)
            ? ""
            : review.client.email,
          rate: review.rate,
          message: review.message || "",
          createdAt: format(review.createdAt, "yyyy-MM-dd"),
          replyMessage: review.reply?.message || "",
          replyCreatedAt: review.reply?.createdAt
            ? format(review.reply?.createdAt, "yyyy-MM-dd")
            : "",
        }));

        const csv = csvStringify(csvRecords, {
          header: true,
          columns: csvColumns,
        });

        reply.header("Content-Disposition", "attachment; filename=reviews.csv");
        reply.header("Content-Type", "text/csv");
        reply.send(csv);
      } catch (e) {
        fastify.log.error(e, ReviewErrors.ReviewUnhandledError);
        return reply
          .code(500)
          .send({ code: ReviewErrors.ReviewUnhandledError });
      }
    },
  });
};
