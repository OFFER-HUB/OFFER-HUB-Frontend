export interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  dateOfBirth: string;
  professionalTitle: string;
  bio: string;
  location: string;
  timezone: string;
  phone: string;
}

export type ProfileFormErrors = Partial<Record<keyof ProfileFormData, string>> & {
  submit?: string;
};
