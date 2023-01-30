import { Page, PageDoc, PageProps } from "@/models/Page";
import { FoundDocument, PageCategory } from "@/types/common";

export class PageService {
  async getPages(): Promise<PageDoc[]> {
    return Page.find();
  }

  async getPageByName(name: string): Promise<FoundDocument<PageDoc>> {
    return (await Page.findOne({ name })) as FoundDocument<PageDoc>;
  }

  async getPageById(id: string): Promise<FoundDocument<PageDoc>> {
    try {
      return (await Page.findById(id)) as FoundDocument<PageDoc>;
    } catch (e) {
      return null;
    }
  }

  async createPage(data: {
    name: string;
    title: string;
    category?: PageCategory;
    subtitle?: string;
    body?: string;
    withHeaderImage?: boolean;
  }): Promise<PageDoc> {
    const currentDate = new Date();
    const page = new Page(data);
    page.createdAt = currentDate;
    page.updatedAt = currentDate;
    await page.save();
    return page;
  }

  async patchPage(page: PageDoc, data: Partial<PageProps>): Promise<PageDoc> {
    await page.updateOne({
      ...data,
      updatedAt: new Date(),
    });
    return page;
  }

  async removePage(page: PageDoc): Promise<void> {
    await page.remove();
  }
}
