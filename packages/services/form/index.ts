import { db } from "@repo/database";
import {
  createFormWithTitleAndDescriptionInput,
  CreateFormWithTitleAndDescriptionType,
} from "./model";
import { formsTable } from "@repo/database/schema";

class FormService {
  private createSlugFromInput(input: string) {
    // new name
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }
  public async createFormWithTitleAndDescription(payload: CreateFormWithTitleAndDescriptionType) {
    const { title, description, creatorId } =
      await createFormWithTitleAndDescriptionInput.parseAsync(payload);

    const slug = this.createSlugFromInput(title);

    const formTableResult = await db
      .insert(formsTable)
      .values({
        creatorId,
        title,
        description,
        slug,
      })
      .returning({
        id: formsTable.id,
      });

    if (!formTableResult || formTableResult.length === 0 || !formTableResult[0]?.id)
      throw new Error(`Unable to create the form`);

    const formId = formTableResult[0].id;
    return {
      id: formId,
    };
  }
}

export default FormService;
