import {z} from 'zod';
import validator from "validator";
import dayjs from 'dayjs';

export const createAccountSchema = z.object({
    first_name: z.string().min(2).max(50),
    last_name: z.string().min(2).max(50),
    email: z.string().email("Please provide a valid email address"),
    phone_number: z.string().refine(validator.isMobilePhone),
    gender: z.enum(["OTHER","MALE", "FEMALE"]),
    password: z.string().min(6, "Password should be atleast 6 characters long").max(24, "Password should be a maximum of 24 characters"),
    confirm_password: z.string()
  }).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});



export const settingsSchema = z.object({
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  email: z.string().email("Please provide a valid email address"),
  phone_number: z.string().refine(validator.isMobilePhone),
  gender: z.enum(["OTHER","MALE", "FEMALE"]),
  password: z.string().optional(),
  confirm_password: z.string(),
  current_password: z.string().min(6,"Password must be atleast 6 characters"),
  code: z.string().optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});


export const AccountSetupSchema =  z.object({
  account_type: z.enum(["PERSONAL","MERCHANT"]),
})


export const AccountCountrySchema =  z.object({
  country: z.string().length(2, 'Invalid country selected'),
})

export const PasswordRegistrationSchema = z.object({
  password: z.string().min(6, "Password should be atleast 6 characters long").max(24, "Password should be a maximum of 24 characters"),
  password_confirm: z.string()
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
})



export const PasswordResetSchema = z.object({
  password: z.string().min(6, "Password should be atleast 6 characters long").max(24, "Password should be a maximum of 24 characters"),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});


export enum AccountType {
  PERSONAL = "PERSONAL",
  MERCHANT = "MERCHANT"
}


export const registerSchema = z.object({
  email: z.string().email(),
});



export const sendVerificationEmailSchema = z.object({
  email: z.string().email(),
});


export const emailVerificationSchema = z.object({
  otp: z.string().length(6),
});


export const resendVerificationEmailSchema = z.object({
  email: z.string().email()
})


export const CountryPhoneSetupSchema = z.object({
  country: z.string(),
  phone: z.string().refine(validator.isMobilePhone),
})



export const phoneVerificationSchema = z.object({
  otp: z.string().length(6),
});



export type PublicUser = {
  username: string,
  first_name: string,
  last_name: string,
}

export type PrivateUser = {
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  phone_number: string,
  profile_photo?: string,
  emailVerified?: string,
  createdAt: Date,
  updatedAt?: Date
}



export const NewPasswordSchema = z.object({
  password: z.string().min(6, "Password should be atleast 6 characters long").max(24, "Password should be a maximum of 24 characters"),
  password_confirm: z.string()
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});




export const DepositSchema = z.object({
  phone_number: z.string().refine(validator.isMobilePhone),
  payment_method: z.enum(["mpesa","yo_uganda"]),
  amount: z.coerce.number().min(1, {message: "Minimum deposit amount is $1"})
});
export const BuyAtSchema = z.object({
  phone_number: z.string().refine(validator.isMobilePhone),
  amount: z.coerce.number().min(1, {message: "Please enter amount"})
});


export const ActivateSchema = z.object({
  package: z.enum(["NONE", "STARTER","BRONZE", "DIAMOND", "PLATINUM"]),
  leg: z.enum(["LEFT", "RIGHT"]).optional(),
  placement_id: z.string().optional()
});

export const TransferSchema = z.object({
  referral_code: z.string().min(1, {
    message: "Referral code is required",
  }),
  amount: z.coerce.number().min(1, {message: "Minimum transfer amount is $1"}),
  current_password: z.string().min(6,"Password must be atleast 6 characters"),
});



export const BuyUnitSchema = z.object({
  phone_number: z.string().refine(validator.isMobilePhone),
  amount: z.coerce.number().min(1, {message: "Minimum deposit amount is Ugx. 5000"})
});







export const EditProfileSchema = z.object({
  firstName: z.string().min(3, "First name is required and must be atleast 3 characters long"),
  lastName: z.string().min(3, "Last name is required and must be atleast 3 characters long"),
  dateOfBirth: z.string().refine((data) => {
    console.log("date: ", data);
    return dayjs(data, 'DD-MM-YYYY').isValid()
  }, {message: "Invalid date of birth"}),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().length(2, 'Invalid country selected'),
  phone: z.string().refine(validator.isMobilePhone),
});

export type SidebarProps = {
  isOpen?: boolean,
  toggleIsOpen?: (option: boolean) => void,
}




export enum TransactionType  {

  //deposit | withdraw | transfer | investment
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
  INVESTMENT = "investment"

}

export enum TransactionStatus {
  // pending | completed | failed
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed"
}


export enum TransactionProvider {
  // crypto | mpesa | emoney
  USDT = "usdt",
  MPESAKE = "mpesake",
  EMONEY = "emoney",
  MTNUG  = "mtnug",
  AIRTELUG = "airtelug"
}






export type DashboardNavigationType = {
  name: string,
  href: string,
  icon?: any,
  current: boolean
}








