import { formService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createFormFieldsInputModel,
  createFormFieldsOutputModel,
  createFormWithTitleAndDescriptionInputModel,
  createFormWithTitleAndDescriptionOutputModel,
  getFormByIdInputModel,
  getFormByIdOutputModel,
  getFormResponsesInputModel,
  getFormResponsesOutputModel,
  getPublicFormByIdInputModel,
  getPublicFormByIdOutputModel,
  getFormsDataByUserIdInputModel,
  getFormsDataByUserIdOutputModel,
  publishFormInputModel,
  publishFormOutputModel,
  setFormAccessKeyInputModel,
  setFormAccessKeyOutputModel,
  submitFormResponseInputModel,
  submitFormResponseOutputModel,
  updateFormMetadataInputModel,
  updateFormMetadataOutputModel,
  updateFormSettingsInputModel,
  updateFormSettingsOutputModel,
  updateFormFieldsInputModel,
  updateFormFieldsOutputModel,
} from "./model";

const TAGS = ["Forms"];
const getPath = generatePath("/form");

export const formRouter = router({
  createFormWithTitleAndDescription: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createFormWithTitleAndDescription"),
        tags: TAGS,
      },
    })
    .input(createFormWithTitleAndDescriptionInputModel)
    .output(createFormWithTitleAndDescriptionOutputModel)
    .mutation(async ({ input, ctx }) => {
      const creatorId = ctx.user.id;
      const { title, description } = input;
      const { id } = await formService.createFormWithTitleAndDescription({
        creatorId,
        title,
        description,
      });

      return { id };
    }),

  getFormsDataByUserId: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormsDataByUserId"),
        tags: TAGS,
      },
    })
    .input(getFormsDataByUserIdInputModel)
    .output(getFormsDataByUserIdOutputModel)
    .query(async ({ input, ctx }) => {
      const id = ctx.user.id;
      const { pageSize, page } = input;

      const { forms, metaData } = await formService.getFormsDataByUserId({
        id,
        pageSize,
        page,
      });

      return {
        forms,
        metaData,
      };
    }),

  getFormById: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormById"),
        tags: TAGS,
      },
    })
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async ({ input }) => {
      return await formService.getFormById({ formId: input.formId });
    }),

  getPublicFormById: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getPublicFormById"),
        tags: TAGS,
      },
    })
    .input(getPublicFormByIdInputModel)
    .output(getPublicFormByIdOutputModel)
    .query(async ({ input }) => {
      return await formService.getPublicFormById({
        formId: input.formId,
        slug: input.slug,
        accessKey: input.accessKey,
      });
    }),

  updateFormMetadata: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/updateFormMetadata"),
        tags: TAGS,
      },
    })
    .input(updateFormMetadataInputModel)
    .output(updateFormMetadataOutputModel)
    .mutation(async ({ input }) => {
      const { id, title, description, visibility, slug, updatedAt } =
        await formService.updateFormMetadata({
          formId: input.formId,
          title: input.title,
          description: input.description,
          visibility: input.visibility,
        });
      return {
        id,
        title,
        description,
        visibility,
        slug,
        updatedAt: updatedAt ?? new Date(),
      };
    }),

  updateFormSettings: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/updateFormSettings"),
        tags: TAGS,
      },
    })
    .input(updateFormSettingsInputModel)
    .output(updateFormSettingsOutputModel)
    .mutation(async ({ input }) => {
      return await formService.updateFormSettings({
        formId: input.formId,
        title: input.title,
        description: input.description,
        visibility: input.visibility,
        accessKey: input.accessKey,
        responseCount: input.responseCount,
        expiresAt: input.expiresAt,
      });
    }),

  createFormFields: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createFormFields"),
        tags: TAGS,
      },
    })
    .input(createFormFieldsInputModel)
    .output(createFormFieldsOutputModel)
    .mutation(async ({ input }) => {
      const { id, field, logic } = input;
      const result = await formService.createFormFields({ formId: id, field, logic });

      if (!result || !result.formId || !result.fields) {
        throw new Error("Failed to create form fields");
      }

      return {
        formId: result.formId,
        fields: result.fields,
        logic: result.logic,
      };
    }),

  updateFormFields: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/updateFormFields"),
        tags: TAGS,
      },
    })
    .input(updateFormFieldsInputModel)
    .output(updateFormFieldsOutputModel)
    .mutation(async ({ input }) => {
      const { formId, fields, logic } = input;
      const result = await formService.updateFormFields({ formId, fields, logic });

      if (!result || !result.formId || !result.fields) {
        throw new Error("Failed to update form fields");
      }

      return {
        formId: result.formId,
        fields: result.fields,
        logic: result.logic,
      };
    }),

  setFormAccessKey: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/setFormAccessKey"),
        tags: TAGS,
      },
    })
    .input(setFormAccessKeyInputModel)
    .output(setFormAccessKeyOutputModel)
    .mutation(async ({ input }) => {
      const { id, visibility, accessKey, redirectUrl, updatedAt } =
        await formService.setFormAccessKey({
          formId: input.formId,
          accessKey: input.accessKey,
        });

      return {
        id,
        visibility,
        accessKey,
        redirectUrl,
        updatedAt: updatedAt ?? new Date(),
      };
    }),

  publishForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/publishForm"),
        tags: TAGS,
      },
    })
    .input(publishFormInputModel)
    .output(publishFormOutputModel)
    .mutation(async ({ input }) => {
      return await formService.publishForm({
        formId: input.formId,
        title: input.title,
        description: input.description,
        fields: input.fields,
        logic: input.logic,
      });
    }),

  submitFormResponse: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/submitFormResponse"),
        tags: TAGS,
      },
    })
    .input(submitFormResponseInputModel)
    .output(submitFormResponseOutputModel)
    .mutation(async ({ input }) => {
      return await formService.submitFormResponse({
        formId: input.formId,
        slug: input.slug,
        accessKey: input.accessKey,
        answers: input.answers,
        browser: input.browser,
        os: input.os,
        country: input.country,
        durationSeconds: input.durationSeconds,
      });
    }),

  getFormResponses: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormResponses"),
        tags: TAGS,
      },
    })
    .input(getFormResponsesInputModel)
    .output(getFormResponsesOutputModel)
    .query(async ({ input, ctx }) => {
      return await formService.getFormResponses({
        formId: input.formId,
        creatorId: ctx.user.id,
      });
    }),
});
