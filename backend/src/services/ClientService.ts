import { Types } from "mongoose";
import { Client, ClientDoc, ClientProps } from "@/models/Client";
import randToken from "rand-token";
import { ServiceError } from "./ServiceError";
import { ClientErrors } from "@/types/errors";
import { addDays } from "date-fns";

interface ImportRecord {
  name?: string;
  email: string;
}

export class ClientService {
  async getClients(companyId: string, ids: string[]): Promise<ClientDoc[]> {
    return await Client.find({
      company: Types.ObjectId(companyId),
      _id: {
        $in: ids.map((id) => Types.ObjectId(id)),
      },
    });
  }

  async getClientByEmail(
    companyId: string,
    email: string
  ): Promise<ClientDoc | null> {
    return await Client.findOne({
      company: Types.ObjectId(companyId),
      email,
    });
  }

  async getClientByFingerprint(
    companyId: string,
    fingerprint: string
  ): Promise<ClientDoc | null> {
    return await Client.findOne(
      {
        company: Types.ObjectId(companyId),
        fingerprint,
      },
      null,
      { sort: { lastReviewAt: -1 } }
    );
  }

  async getClientsForInviter(): Promise<ClientDoc[]> {
    return await Client.find({
      batchId: "byBcc",
      lastInvitedAt: { $exists: false },
      sendInviteAt: { $lt: new Date() },
    });
  }

  async getExistsClientsByEmails(
    companyId: string,
    emails: string[]
  ): Promise<ClientDoc[]> {
    return await Client.find({
      company: Types.ObjectId(companyId),
      email: {
        $in: emails,
      },
    });
  }

  async importClients(
    companyId: string,
    records: ImportRecord[],
    isFromEmail = false,
    bccDelay = parseInt(process.env.BCC_INVITATION_DELAY_DEFAULT as string)
  ): Promise<{
    importedCount: number;
    createdCount: number;
    updatedCount: number;
    batchId: string;
  }> {
    const importEmails = records.map(({ email }) => email);
    const updatableClients = await this.getExistsClientsByEmails(
      companyId,
      importEmails
    );
    const updatableClientsEmailsMap = updatableClients.reduce(
      (result, client) => {
        result[client.email] = client;
        return result;
      },
      {} as Record<string, ClientDoc>
    );

    const updatableRecords = [] as Array<
      Pick<ClientProps, "name" | "email" | "batchId" | "sendInviteAt">
    >;
    const createdRecords = [] as Array<
      Pick<
        ClientProps,
        "name" | "email" | "company" | "createdAt" | "batchId" | "sendInviteAt"
      >
    >;

    const batchId = isFromEmail ? "byBcc" : randToken.generate(16);

    records.forEach((record) => {
      let count = 0;
      records.forEach((checkRecord) => {
        if (record.email == checkRecord.email) {
          if (++count >= 2) {
            throw new ServiceError({ code: ClientErrors.ClientDuplicated });
          }
        }
      });
    });

    // delay invitation for bcc
    let bccSendInviteAt = new Date();
    if (isFromEmail) {
      bccSendInviteAt = addDays(new Date(), bccDelay);
    }

    records.forEach((record) => {
      // Optimize?
      if (Object.keys(updatableClientsEmailsMap).includes(record.email)) {
        updatableRecords.push({
          ...record,
          batchId: batchId,
        });
      } else {
        createdRecords.push({
          ...record,
          company: Types.ObjectId(companyId),
          createdAt: new Date(),
          batchId: batchId,
          sendInviteAt: bccSendInviteAt,
        });
      }
    });

    const promises = [] as Promise<any>[];
    let updatedRecordsCount = 0;
    if (createdRecords.length) {
      promises.push(Client.insertMany(createdRecords));
    }
    updatableRecords.forEach((record) => {
      const client = updatableClientsEmailsMap[record.email];
      if (
        !record.name ||
        (record.name === client.name && client.batchId === record.batchId)
      ) {
        return;
      }
      client.name = record.name;
      client.batchId = record.batchId;
      client.sendInviteAt = bccSendInviteAt;
      promises.push(client.save());
      updatedRecordsCount++;
    });

    await Promise.all(promises);

    return {
      importedCount: records.length,
      createdCount: createdRecords.length,
      updatedCount: updatedRecordsCount,
      batchId: batchId,
    };
  }

  async createClient(
    data: Pick<ClientProps, "company" | "name" | "email" | "fingerprint">,
    isInvited = false
  ): Promise<ClientDoc> {
    const client = new Client(data);
    const currentDate = new Date();
    client.createdAt = currentDate;
    if (isInvited) {
      client.lastInvitedAt = currentDate;
    }
    await client.save();
    return client;
  }
}
