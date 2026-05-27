import { trpc } from "~/trpc/client";

export const useCreateForm = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: createFormWithTitleAndDescriptionAsync,
    mutate: createFormWithTitleAndDescription,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.createFormWithTitleAndDescription.useMutation({
    onSuccess: async () => {
      // Invalidate forms list so UI refetches and shows the newly created form
      await utils.form.getFormsDataByUserId.invalidate();
    },
  });

  return {
    createFormWithTitleAndDescriptionAsync,
    createFormWithTitleAndDescription,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

type UseGetFormsParams = {
  pageSize?: number;
  page?: number;
};

type UseGetFormByIdParams = {
  formId?: string;
};

type UseGetPublicFormByIdParams = {
  formId?: string;
  slug?: string;
  accessKey?: string;
};

type UseGetFormResponsesParams = {
  formId?: string;
};

export const useGetForm = ({ pageSize = 5, page = 1 }: UseGetFormsParams = {}) => {
  const {
    data: formsDataById,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getFormsDataByUserId.useQuery({ pageSize, page });

  return {
    formsDataById,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
};

export const useGetFormById = ({ formId }: UseGetFormByIdParams = {}) => {
  const query = trpc.form.getFormById.useQuery(
    { formId: formId ?? "" },
    { enabled: Boolean(formId) },
  );

  return {
    ...query,
    formById: query.data,
  };
};

export const useGetPublicFormById = ({
  formId,
  slug,
  accessKey,
}: UseGetPublicFormByIdParams = {}) => {
  const query = trpc.form.getPublicFormById.useQuery(
    {
      formId: formId ?? "",
      slug: slug ?? "",
      accessKey,
    },
    { enabled: Boolean(formId && slug) },
  );

  return {
    ...query,
    publicFormById: query.data,
  };
};

export const useGetFormResponses = ({ formId }: UseGetFormResponsesParams = {}, options?: Parameters<typeof trpc.form.getFormResponses.useQuery>[1]) => {
  const query = trpc.form.getFormResponses.useQuery(
    { formId: formId ?? "" },
    { enabled: Boolean(formId), refetchOnWindowFocus: true }
  );

  return {
    ...query,
    formResponsesById: query.data,
    ...options
  };
};

export const useSubmitFormResponse = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: submitFormResponseAsync,
    mutate: submitFormResponse,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.submitFormResponse.useMutation({
    onSuccess: async (_data, variables) => {
      const formId = variables.formId
      await utils.form.getFormById.invalidate({ formId });
      await utils.form.getFormResponses.invalidate({ formId });
      await utils.form.getFormsDataByUserId.invalidate();
    },
  });

  return {
    submitFormResponseAsync,
    submitFormResponse,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useUpdateFormSettings = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: updateFormSettingsAsync,
    mutate: updateFormSettings,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.updateFormSettings.useMutation({
    onSuccess: async () => {
      await utils.form.getFormsDataByUserId.invalidate();
      await utils.form.getFormById.invalidate();
      await utils.form.getPublicFormById.invalidate();
    },
  });

  return {
    updateFormSettingsAsync,
    updateFormSettings,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useUpdateFormMetadata = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: updateFormMetadataAsync,
    mutate: updateFormMetadata,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.updateFormMetadata.useMutation({
    onSuccess: async () => {
      await utils.form.getFormsDataByUserId.invalidate();
      await utils.form.getFormById.invalidate();
    },
  });

  return {
    updateFormMetadataAsync,
    updateFormMetadata,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useCreateFormFields = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: createFormFieldsAsync,
    mutate: createFormFields,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.createFormFields.useMutation({
    onSuccess: async () => {
      await utils.form.getFormsDataByUserId.invalidate();
    },
  });

  return {
    createFormFieldsAsync,
    createFormFields,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useUpdateFormFields = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: updateFormFieldsAsync,
    mutate: updateFormFields,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.updateFormFields.useMutation({
    onSuccess: async () => {
      await utils.form.getFormsDataByUserId.invalidate();
    },
  });

  return {
    updateFormFieldsAsync,
    updateFormFields,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const usePublishForm = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: publishFormAsync,
    mutate: publishForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.publishForm.useMutation({
    onSuccess: async () => {
      await utils.form.getFormsDataByUserId.invalidate();
      await utils.form.getFormById.invalidate();
      await utils.form.getPublicFormById.invalidate();
    },
  });

  return {
    publishFormAsync,
    publishForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useSetFormAccessKey = () => {
  const utils = trpc.useUtils();
  const {
    mutateAsync: setFormAccessKeyAsync,
    mutate: setFormAccessKey,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.setFormAccessKey.useMutation({
    onSuccess: async () => {
      await utils.form.getFormsDataByUserId.invalidate();
      await utils.form.getFormById.invalidate();
      await utils.form.getPublicFormById.invalidate();
    },
  });

  return {
    setFormAccessKeyAsync,
    setFormAccessKey,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};
