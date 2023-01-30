import { FromSchema } from "json-schema-to-ts";
import csvParse from "csv-parse/lib/sync";
import { FastifyPluginAsync } from "fastify";
import fastifyMultipart, { MultipartFile } from "fastify-multipart";
import { UserDoc } from "@/models/User";
import { ServiceError } from "@/services/ServiceError";
import { ClientErrors } from "@/types/errors";

interface CsvRecord {
  name: string;
  email: string;
}

const schema = {
  body: {
    type: "object",
    required: ["companyId", "csv"],
    properties: {
      companyId: {
        properties: {
          value: {
            type: "string",
          },
        },
      },
      csv: { $ref: "#fileSchema" },
    },
  },
  response: {
    200: {
      type: "object",
      required: ["importedCount", "createdCount", "updatedCount"],
      properties: {
        importedCount: {
          type: "number",
        },
        createdCount: {
          type: "number",
        },
        updatedCount: {
          type: "number",
        },
        batchId: {
          type: "string",
        },
      },
    },
  },
} as const;

export const routeOfImportCsv: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyMultipart, {
    attachFieldsToBody: true,
    sharedSchemaId: "#fileSchema",
    limits: {
      fileSize: 100 * 1024,
      files: 1,
    },
  });
  fastify.route<{ Body: FromSchema<typeof schema.body> }>({
    method: "POST",
    url: "/import-csv",
    schema,
    preHandler: fastify.auth([fastify.verifyAuth]),
    async handler(request, reply) {
      const user = request.user as UserDoc; // Because we called verifyAuth prehandler
      const csv = request.body.csv as MultipartFile;
      // @ts-ignore
      const companyId = request.body.companyId.value as string;

      let company;
      try {
        company = await fastify.resources.companyService.getCompanyById(
          companyId
        );
      } catch (e) {
        // Maybe bad id format
      }
      if (!company) {
        return reply.code(400).send({ code: ClientErrors.CompanyNotFound });
      }

      if (company.isRemoved) {
        return reply.code(400).send({ code: ClientErrors.CompanyRemoved });
      }

      if (!company.isActiveSubscription) {
        return reply.code(400).send({ code: ClientErrors.SubscriptionExpired });
      }

      if (user.id !== company.user.toString()) {
        return reply.code(403).send({ code: ClientErrors.Forbidden });
      }

      const csvBuffer = await csv.toBuffer();

      let records: CsvRecord[];
      try {
        records = csvParse(csvBuffer, {
          columns: ["name", "email"],
        }) as CsvRecord[];
      } catch {
        return reply.status(400).send({ code: ClientErrors.CsvInvalid });
      }

      if (existRecordsHeader(records[0])) {
        records.shift();
      }

      if (records.length > 1000) {
        return reply.code(400).send({ code: ClientErrors.ImportLimitExceeded });
      }

      try {
        return await fastify.resources.clientService.importClients(
          companyId,
          records
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code == ClientErrors.ClientDuplicated) {
            return reply
              .code(400)
              .send({ code: ClientErrors.ClientDuplicated });
          }
        }
        fastify.log.error(e, ClientErrors.ClientUnhandledError);
        return reply
          .code(500)
          .send({ code: ClientErrors.ClientUnhandledError });
      }
    },
  });
};

function existRecordsHeader(header: CsvRecord) {
  return !(
    header.name.toLowerCase() !== "name" ||
    header.email.toLowerCase() !== "email"
  );
}
