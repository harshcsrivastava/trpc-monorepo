import { email, z } from "zod"

//Procedure ke model - Input and Output
export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().describe("FullName of the User"),
  email: z.email().describe("Email of the User"),
  password: z.string().describe("Password of the user")
})

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("ID of the User Created")
})