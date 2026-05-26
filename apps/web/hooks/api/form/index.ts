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
