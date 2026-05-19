import { trpc } from "~/trpc/client";

export const useSignUp = () => {
  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createUserWithEmailAndPassword,
    error, 
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status
  } = trpc.auth.createUserWithEmailAndPassword.useMutation();

  return {
    createUserWithEmailAndPasswordAsync,
    createUserWithEmailAndPassword, // withhout asyn
    error, 
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status
  };
};
