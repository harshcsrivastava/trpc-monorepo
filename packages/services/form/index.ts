import { db, eq, sql } from "@repo/database";
import crypto from "crypto";
import { env } from "../env";
import {
  createFormFieldsInput,
  CreateFormFieldsType,
  createFormWithTitleAndDescriptionInput,
  CreateFormWithTitleAndDescriptionType,
  field,
  getFormsDataByUserIdInput,
  GetFormsDataByUserIdType,
  getFormByIdInput,
  GetFormByIdType,
  getPublicFormByIdInput,
  GetPublicFormByIdType,
  publishFormInput,
  PublishFormType,
  setFormAccessKeyInput,
  SetFormAccessKeyType,
  updateFormMetadataInput,
  UpdateFormMetadataType,
  updateFormSettingsInput,
  UpdateFormSettingsType,
  updateFormFieldsInput,
  UpdateFormFieldsType,
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

interface FormByIdRow extends Record<string, unknown> {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  fields: unknown;
  logic: unknown;
  visibility: string;
  accessKey: string | null;
  responseCount: number | null;
  expiresAt: Date | string | null;
  updatedAt: Date;
}
class FormService {
  private readonly mutationCooldownMs = 5000;
  private readonly mutationTimestamps = new Map<string, number>();

  private normalizeVisibility(visibility: unknown): "public" | "unlisted" | "draft" {
    return visibility === "public" || visibility === "unlisted" || visibility === "draft"
      ? visibility
      : "draft";
  }

  private createSlugFromInput(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  private hashFunction(input: string) {
    return crypto.createHash("sha256").update(input).digest("hex");
  }

  private createRedirectUrl(formId: string, slug: string) {
    return `${env.HOST_URL.replace(/\/$/, "")}/form/${formId}/${slug}`;
  }

  private createRandomId() {
    return crypto.randomUUID();
  }

  private createAccessKey() {
    return String(crypto.randomInt(100000, 1000000));
  }

  private getCooldownKey(scope: string, formId: string) {
    return `${scope}:${formId}`;
  }

  private assertMutationCooldown(scope: string, formId: string) {
    const cooldownKey = this.getCooldownKey(scope, formId);
    const lastUpdatedAt = this.mutationTimestamps.get(cooldownKey);
    if (lastUpdatedAt && Date.now() - lastUpdatedAt < this.mutationCooldownMs) {
      throw new Error("Please wait 5 seconds before modifying this form again.");
    }
  }

  private markMutationCooldown(scope: string, formId: string) {
    this.mutationTimestamps.set(this.getCooldownKey(scope, formId), Date.now());
  }

  private getNextIndex(fields: { index: number }[], position?: number): number {
    if (fields.length === 0) return 1.0;

    if (position === undefined || position >= fields.length) {
      const maxIndex = Math.max(...fields.map((f) => f.index));
      return maxIndex + 1.0;
    }

    if (position === 0) {
      const first = fields[0];
      if (!first) throw new Error("Field Undefined");
      return first.index / 2.0;
    }

    if (position > 0 && position < fields.length) {
      const prev = fields[position - 1];
      const next = fields[position];
      if (!prev || !next) throw new Error("Invalid neighbor field");
      return (prev.index + next.index) / 2.0;
    }

    throw new Error("Invalid position for index calculation");
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
      visibility: this.normalizeVisibility(r.visibility),
      slug: r.slug ?? this.createSlugFromInput(String(r.formTitle ?? "")),
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt),
      count: Number(r.count) || 0,
    }));

    return { forms: normalizedForms, metaData: { start, end, totalCount } };
  }

  public async getFormById(payload: GetFormByIdType) {
    const { formId } = await getFormByIdInput.parseAsync(payload);

    const result = await db.execute<FormByIdRow>(sql`
      SELECT
        f.id,
        f.title,
        f.description,
        f.slug,
        f.fields,
        f.logic,
        f.visibility,
        f.access_key as "accessKey",
        f.response_count as "responseCount",
        f.expire_at as "expiresAt",
        f.updated_at as "updatedAt"
      FROM ${formsTable} f
      WHERE f.id = ${formId}
      LIMIT 1;
    `);

    if (!result.rows || result.rows.length === 0 || result.rows[0] === undefined) {
      throw new Error("Form not found");
    }

    const row = result.rows[0];
    const resolvedSlug = row.slug ?? this.createSlugFromInput(String(row.title ?? ""));

    return {
      id: String(row.id),
      title: row.title ?? "Untitled Form",
      description: row.description === null ? null : String(row.description),
      slug: resolvedSlug,
      redirectUrl: this.createRedirectUrl(String(row.id), resolvedSlug),
      fields: Array.isArray(row.fields) ? row.fields : [],
      logic: Array.isArray(row.logic) ? row.logic : [],
      visibility: this.normalizeVisibility(row.visibility),
      accessKey: row.accessKey ?? null,
      responseCount: typeof row.responseCount === "number" ? row.responseCount : null,
      expiresAt: row.expiresAt instanceof Date || typeof row.expiresAt === "string" ? row.expiresAt : null,
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt),
    };
  }

  public async getPublicFormById(payload: GetPublicFormByIdType) {
    const { formId, slug, accessKey } = await getPublicFormByIdInput.parseAsync(payload);

    const result = await db.execute<FormByIdRow>(sql`
      SELECT
        f.id,
        f.title,
        f.description,
        f.slug,
        f.fields,
        f.logic,
        f.visibility,
        f.access_key as "accessKey",
        f.response_count as "responseCount",
        f.expire_at as "expiresAt",
        f.updated_at as "updatedAt"
      FROM ${formsTable} f
      WHERE f.id = ${formId}
      LIMIT 1;
    `);

    if (!result.rows || result.rows.length === 0 || result.rows[0] === undefined) {
      throw new Error("Form not found");
    }

    const row = result.rows[0];
    const resolvedSlug = row.slug ?? this.createSlugFromInput(String(row.title ?? ""));

    if (resolvedSlug !== slug) {
      throw new Error("Form not found");
    }

    const visibility = row.visibility ?? "draft";
    const normalizedVisibility = this.normalizeVisibility(visibility);

    if (normalizedVisibility === "draft") {
      throw new Error("Form not published");
    }

    if (normalizedVisibility === "unlisted") {
      if (!accessKey || row.accessKey !== accessKey) {
        throw new Error("Access key required");
      }
    }

    return {
      id: String(row.id),
      title: row.title ?? "Untitled Form",
      description: row.description === null ? null : String(row.description),
      slug: resolvedSlug,
      fields: Array.isArray(row.fields) ? row.fields : [],
      logic: Array.isArray(row.logic) ? row.logic : [],
      visibility: normalizedVisibility,
      requiresAccessKey: normalizedVisibility === "unlisted",
      redirectUrl: this.createRedirectUrl(String(row.id), resolvedSlug),
      accessKey: row.accessKey ?? null,
      responseCount: typeof row.responseCount === "number" ? row.responseCount : null,
      expiresAt: row.expiresAt instanceof Date || typeof row.expiresAt === "string" ? row.expiresAt : null,
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt),
    };
  }

  public async updateFormMetadata(payload: UpdateFormMetadataType) {
    const { formId, title, description, visibility } = await updateFormMetadataInput.parseAsync(payload);

    const slug = this.createSlugFromInput(title);

    const result = await db
      .update(formsTable)
      .set({
        title,
        description,
        slug,
        visibility: visibility ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(formsTable.id, formId))
      .returning({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        slug: formsTable.slug,
        visibility: formsTable.visibility,
        updatedAt: formsTable.updatedAt,
      });

    if (!result || result.length === 0) {
      throw new Error(`Unable to update form ${formId}`);
    }

    const saved = result[0];
    if (!saved) {
      throw new Error(`Unable to update form ${formId}`);
    }

    return {
      id: saved.id,
      title: saved.title,
      description: saved.description,
      slug: saved.slug,
      visibility: this.normalizeVisibility(saved.visibility),
      updatedAt: saved.updatedAt,
    };
  }

  public async updateFormSettings(payload: UpdateFormSettingsType) {
    const { formId, title, description, visibility, accessKey, responseCount, expiresAt } =
      await updateFormSettingsInput.parseAsync(payload);

    const resolvedVisibility = this.normalizeVisibility(visibility);
    const resolvedAccessKey =
      resolvedVisibility === "unlisted" ? accessKey?.trim() || this.createAccessKey() : null;
    const resolvedExpiresAt =
      expiresAt === undefined ? undefined : expiresAt === null ? null : new Date(expiresAt);

    const slug = this.createSlugFromInput(title);

    const result = await db
      .update(formsTable)
      .set({
        title,
        description,
        slug,
        visibility: resolvedVisibility,
        accessKey: resolvedAccessKey,
        responseCount: responseCount ?? undefined,
        expiresAt: resolvedExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(formsTable.id, formId))
      .returning({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        slug: formsTable.slug,
        visibility: formsTable.visibility,
        accessKey: formsTable.accessKey,
        responseCount: formsTable.responseCount,
        expiresAt: formsTable.expiresAt,
        updatedAt: formsTable.updatedAt,
      });

    if (!result || result.length === 0 || !result[0]) {
      throw new Error(`Unable to update form settings for ${formId}`);
    }

    const saved = result[0];

    return {
      id: saved.id,
      title: saved.title,
      description: saved.description,
      slug: saved.slug,
      visibility: this.normalizeVisibility(saved.visibility),
      accessKey: saved.accessKey ?? resolvedAccessKey ?? null,
      responseCount: typeof saved.responseCount === "number" ? saved.responseCount : null,
      expiresAt:
        saved.expiresAt instanceof Date || typeof saved.expiresAt === "string"
          ? saved.expiresAt
          : resolvedExpiresAt ?? null,
      updatedAt: saved.updatedAt,
    };
  }

  public async createFormFields(payload: CreateFormFieldsType) {
    const { formId, field, logic } = await createFormFieldsInput.parseAsync(payload);
    this.assertMutationCooldown("fields:create", formId);

    const existingResult = await db
      .select({ fields: formsTable.fields, logic: formsTable.logic })
      .from(formsTable)
      .where(eq(formsTable.id, formId));

    const existingFields = (existingResult[0]?.fields as any[]) || [];
    const existingLogic = (existingResult[0]?.logic as any[]) || [];

    // create id, index and slug
    const id = this.createRandomId();
    const labelSlug = this.createSlugFromInput(field.label);
    const idx = this.getNextIndex(existingFields, existingFields.length);

    const newField = {
      ...field,
      // id,
      index: idx,
      label_slug: labelSlug,
    };

    const updatedFields = [...existingFields, newField];
    const logicToSave = logic ?? existingLogic;

    const result = await db
      .update(formsTable)
      .set({ fields: updatedFields, logic: logicToSave, updatedAt: new Date() })
      .where(eq(formsTable.id, formId))
      .returning({ id: formsTable.id, fields: formsTable.fields, logic: formsTable.logic });

    if (!result || result.length === 0) {
      throw new Error(`Unable to add field to form ${formId}`);
    }

    this.markMutationCooldown("fields:create", formId);

    return { formId: result[0]?.id, fields: result[0]?.fields, logic: result[0]?.logic };
  }
  public async updateFormFields(payload: UpdateFormFieldsType) {
    const { formId, fields, logic } = await updateFormFieldsInput.parseAsync(payload);

    const existingResult = await db
      .select({ fields: formsTable.fields, logic: formsTable.logic })
      .from(formsTable)
      .where(eq(formsTable.id, formId));

    const existingFields = (existingResult && existingResult[0] && (existingResult[0].fields as any[])) || [];
    const existingLogic = (existingResult && existingResult[0] && (existingResult[0].logic as any[])) || [];

    const virtualList: { index: number }[] = existingFields
      .slice()
      .sort((a: any, b: any) => a.index - b.index)
      .map((f: any) => ({ index: f.index }));

    const fieldsWithIndexAndSlug = [] as any[];

    for (let pos = 0; pos < fields.length; pos++) {
      const field = fields[pos] as any;

      const idx = typeof field.index === "number" ? field.index : this.getNextIndex(virtualList, pos);

      virtualList.splice(pos, 0, { index: idx });

      fieldsWithIndexAndSlug.push({
        ...field,
        index: idx,
        label_slug: this.createSlugFromInput(field.label),
      });
    }

    const logicToSave = logic ?? existingLogic;

    await db
      .update(formsTable)
      .set({ fields: fieldsWithIndexAndSlug, logic: logicToSave, updatedAt: new Date() })
      .where(eq(formsTable.id, formId))
      .returning({ id: formsTable.id, fields: formsTable.fields, logic: formsTable.logic });
    
    // Return the saved state for client use
    const saved = await db
      .select({ id: formsTable.id, fields: formsTable.fields, logic: formsTable.logic })
      .from(formsTable)
      .where(eq(formsTable.id, formId));

    return {
      formId: saved[0]?.id,
      fields: saved[0]?.fields,
      logic: saved[0]?.logic,
    };
  }

  public async setFormAccessKey(payload: SetFormAccessKeyType) {
    const { formId, accessKey } = await setFormAccessKeyInput.parseAsync(payload);
    const nextAccessKey = accessKey ?? this.createAccessKey();

    const result = await db
      .update(formsTable)
      .set({
        accessKey: nextAccessKey,
        visibility: "unlisted",
        isPublished: true,
        updatedAt: new Date(),
      })
      .where(eq(formsTable.id, formId))
      .returning({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        slug: formsTable.slug,
        visibility: formsTable.visibility,
        accessKey: formsTable.accessKey,
        updatedAt: formsTable.updatedAt,
      });

    if (!result || result.length === 0 || !result[0]) {
      throw new Error(`Unable to update access key for form ${formId}`);
    }

    const saved = result[0];

    return {
      id: saved.id,
      visibility: this.normalizeVisibility(saved.visibility),
      accessKey: saved.accessKey ?? nextAccessKey,
      redirectUrl: this.createRedirectUrl(saved.id, saved.slug ?? this.createSlugFromInput(saved.title ?? "")),
      updatedAt: saved.updatedAt,
    };
  }

  public async publishForm(payload: PublishFormType) {
    const { formId, title, description, fields, logic } = await publishFormInput.parseAsync(payload);

    await this.updateFormMetadata({ formId, title, description });
    await this.updateFormFields({ formId, fields, logic });

    const result = await db
      .update(formsTable)
      .set({
        visibility: "public",
        isPublished: true,
        accessKey: null,
        updatedAt: new Date(),
      })
      .where(eq(formsTable.id, formId))
      .returning({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        slug: formsTable.slug,
        visibility: formsTable.visibility,
        accessKey: formsTable.accessKey,
        updatedAt: formsTable.updatedAt,
      });

    if (!result || result.length === 0 || !result[0]) {
      throw new Error(`Unable to publish form ${formId}`);
    }

    const saved = result[0];

    const publishedForm = await this.getFormById({ formId });

    return {
      ...publishedForm,
      visibility: "public" as const,
      redirectUrl: this.createRedirectUrl(saved.id, saved.slug ?? publishedForm.slug),
    };
  }
}

export default FormService;
