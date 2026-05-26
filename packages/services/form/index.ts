import { db, eq, sql } from "@repo/database";
import {
  createFormWithTitleAndDescriptionInput,
  CreateFormWithTitleAndDescriptionType,
  getFormsDataByUserIdInput,
  GetFormsDataByUserIdType,
} from "./model";
import { formsTable, usersTable } from "@repo/database/schema";

interface FormRow extends Record<string, unknown> {
  formId: string;
  creatorName: string;
  formTitle: string;
  formDescription: string | null;
  responseCount: number;
  visibility: string;
  slug: string;
  updatedAt: Date;
  count: number;
}
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

  public async getFormsDataByUserId(payload: GetFormsDataByUserIdType) {
    const { id, pageSize, page } = await getFormsDataByUserIdInput.parseAsync(payload);
    const result = await db.execute<FormRow>(sql`
    WITH total AS (
      SELECT count(*)::int AS count
      FROM ${formsTable}
      WHERE creator_id = ${id}
    )
    SELECT 
      f.id as "formId",
      u.full_name as "creatorName",
      f.title as "formTitle",
      f.description as "formDescription",
      f.response_count as "responseCount",
      f.visibility,
      f.slug,
      f.updated_at as "updatedAt",
      t.count
    FROM ${formsTable} f
    INNER JOIN ${usersTable} u ON f.creator_id = u.id
    CROSS JOIN total t
    WHERE f.creator_id = ${id}
    ORDER BY f.updated_at DESC
    LIMIT ${pageSize}
    OFFSET ${(page - 1) * pageSize};
  `);

    if (!result.rows || result.rows.length === 0 || result.rows[0] === undefined) {
      throw new Error("No Forms created");
    }

    const totalCount = result.rows[0].count;
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalCount);

    // Normalize rows to ensure types expected by the trpc/zod output validator
    const normalizedForms = result.rows.map((r) => ({
      formId: String(r.formId),
      creatorName: r.creatorName ?? "",
      formTitle: r.formTitle ?? "",
      formDescription: r.formDescription === null ? null : String(r.formDescription),
      responseCount:
        typeof r.responseCount === "number" ? r.responseCount : Number(r.responseCount) || 0,
      visibility: r.visibility ?? "",
      slug: r.slug ?? this.createSlugFromInput(String(r.formTitle ?? "")),
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt),
      count: Number(r.count) || 0,
    }));

    return { forms: normalizedForms, metaData: { start, end, totalCount } };
  }
}

export default FormService;
