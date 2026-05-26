import { trpc } from "~/trpc/client";

export const useCreateForm = () => {
  const {
    mutateAsync: createFormWithTitleAndDescriptionAsync,
    mutate: createFormWithTitleAndDescription,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.createFormWithTitleAndDescription.useMutation();

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
