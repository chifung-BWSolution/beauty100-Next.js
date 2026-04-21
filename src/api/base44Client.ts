// base44Client.ts — delegates to Supabase
import {
  authApi,
  SalonApplication,
  SalonProfile,
  SalonProfileVersion,
  UserActivityLog,
  functionsApi,
  uploadFile,
} from './supabaseApi';

export const base44 = {
  auth: {
    me: authApi.me,
    logout: authApi.logout,
    redirectToLogin: () => {},
    updateMe: authApi.updateMe,
    isAuthenticated: async () => {
      const user = await authApi.me();
      return !!user;
    },
  },

  entities: {
    SalonApplication,
    SalonProfile,
    SalonProfileVersion,
    UserActivityLog,
  },

  functions: {
    invoke: functionsApi.invoke,
  },

  integrations: {
    Core: {
      UploadFile: uploadFile,
    },
  },
};
