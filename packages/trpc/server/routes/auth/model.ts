import { email, xid, z } from "zod";

//Procedure ke model - Input and Output
export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().describe("FullName of the User").min(2, "Must be atleast 2 characters"),
  email: z.email().describe("Email of the User").min(2, "Must be atleast 2 characters"),
  password: z.string().describe("Password of the user").min(6, "Must be atleast 6 characters"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("ID of the User Created"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
  email: z.email().describe("Email of the User").min(2, "Must be atleast 2 characters"),
  password: z.string().describe("Password of the user").min(5, "Must be atleast 5 characters"),
});

export const signInUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user"),
});

export const getLoggedInUserInfoInputModel = z.undefined(); // need no input

export const getLoggedInUserInfoOutputModel = z.object({
  id: z.string().describe("ID of the User Created"),
  email: z.email().describe("Email of the User"),
  fullName: z.string().describe("Fullname of user"),
  profileImageUrl: z.string().describe("Profile Image if the user").optional().nullable(),
});
