export type Language = 'en' | 'fr';

export interface Translations {
  navbar: {
    title: string;
    login: string;
    logout: string;
    register: string;
    darkMode: string;
    lightMode: string;
    language: string;
    settings: string;
    explore: string;
  };
  search: {
    placeholder: string;
    allCities: string;
    button: string;
  };
  explore: {
    title: string;
    searchPlaceholder: string;
    filterByPlacement: string;
    filterByStyle: string;
    allPlacements: string;
    allStyles: string;
    noResults: string;
    likes: string;
    favorites: string;
  };
  business: {
    reviews: string;
    phone: string;
    website: string;
    bookAppointment: string;
    appointmentRequired: string;
    womenOwned: string;
    wheelchairAccessible: string;
    loading: string;
    noResults: string;
    previous: string;
    next: string;
    page: string;
    of: string;
  };
  settings: {
    title: string;
    tabs: {
      account: string;
      privacy: string;
      notifications: string;
      preferences: string;
      business: string;
    };
    account: {
      title: string;
      email: string;
      currentPassword: string;
      newPassword: string;
      updateProfile: string;
      updating: string;
    };
    privacy: {
      title: string;
      shareProfile: {
        label: string;
        description: string;
      };
      publicBookings: {
        label: string;
        description: string;
      };
      deleteAccount: {
        button: string;
        title: string;
        description: string;
        cancel: string;
        confirm: string;
      };
    };
    notifications: {
      title: string;
      email: {
        label: string;
        description: string;
      };
      marketing: {
        label: string;
        description: string;
      };
      updates: {
        label: string;
        description: string;
      };
    };
    preferences: {
      title: string;
      theme: {
        label: string;
        description: string;
      };
      language: {
        label: string;
        description: string;
      };
    };
    business: {
      title: string;
      comingSoon: string;
    };
  };
  account: {
    title: string;
    avatar: {
      title: string;
      description: string;
      upload: string;
      uploading: string;
      requirements: string;
    };
    profile: {
      title: string;
      description: string;
      fullName: string;
      phone: string;
      address: string;
      bio: string;
      update: string;
      updating: string;
    };
  };
  validation: {
    fullNameInvalid: string;
    phoneInvalid: string;
    required: string;
  };
  auth: {
    signIn: string;
    signInDescription: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    rememberMe: string;
    forgotPassword: string;
    resetPassword: string;
    resetDescription: string;
    securityCode: string;
    newPassword: string;
    cancel: string;
    continue: string;
    signingIn: string;
    noAccount: string;
    register: string;
    backToSite: string;
    showPassword: string;
    hidePassword: string;
    invalidCredentials: string;
    tooManyAttempts: string;
    generalError: string;
    passwordRequirements: {
      title: string;
      length: string;
      uppercase: string;
      lowercase: string;
      number: string;
      special: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    navbar: {
      title: 'Tattoo Booker',
      explore: 'Explore',
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      language: 'Language',
      settings: 'Settings'
    },
    search: {
      placeholder: 'Search for tattoo shops...',
      allCities: 'All Cities',
      button: 'Search'
    },
    explore: {
      title: 'Explore Tattoos',
      searchPlaceholder: 'Search by title...',
      filterByPlacement: 'Filter by placement',
      filterByStyle: 'Filter by style',
      allPlacements: 'All Placements',
      allStyles: 'All Styles',
      noResults: 'No tattoos found',
      likes: 'likes',
      favorites: 'favorites'
    },
    business: {
      reviews: 'reviews',
      phone: 'Phone',
      website: 'Website',
      bookAppointment: 'Book Appointment',
      appointmentRequired: 'Appointment Required',
      womenOwned: 'Women Owned',
      wheelchairAccessible: 'Wheelchair Accessible',
      loading: 'Loading businesses...',
      noResults: 'No businesses found',
      previous: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of'
    },
    settings: {
      title: 'Settings',
      tabs: {
        account: 'Account',
        privacy: 'Privacy',
        notifications: 'Notifications',
        preferences: 'Preferences',
        business: 'Business'
      },
      account: {
        title: 'Account Settings',
        email: 'Email',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        updateProfile: 'Update Profile',
        updating: 'Updating...'
      },
      privacy: {
        title: 'Privacy Settings',
        shareProfile: {
          label: 'Share Profile',
          description: 'Allow others to view your public profile'
        },
        publicBookings: {
          label: 'Public Bookings',
          description: 'Show your bookings in public profile'
        },
        deleteAccount: {
          button: 'Delete Account',
          title: 'Are you sure?',
          description: 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
          cancel: 'Cancel',
          confirm: 'Delete Account'
        }
      },
      notifications: {
        title: 'Notification Preferences',
        email: {
          label: 'Email Notifications',
          description: 'Receive booking and account notifications'
        },
        marketing: {
          label: 'Marketing Emails',
          description: 'Receive marketing and promotional emails'
        },
        updates: {
          label: 'Product Updates',
          description: 'Receive updates about new features'
        }
      },
      preferences: {
        title: 'Preferences',
        theme: {
          label: 'Theme',
          description: 'Choose between light and dark mode'
        },
        language: {
          label: 'Language',
          description: 'Select your preferred language'
        }
      },
      business: {
        title: 'Business Settings',
        comingSoon: 'Business settings content coming soon...'
      }
    },
    account: {
      title: 'My Account',
      avatar: {
        title: 'Profile Picture',
        description: 'Upload a profile picture to personalize your account',
        upload: 'Upload Image',
        uploading: 'Uploading...',
        requirements: 'JPG, PNG or JPEG (max. 5MB)'
      },
      profile: {
        title: 'Profile Information',
        description: 'Update your personal information',
        fullName: 'Full Name',
        phone: 'Phone Number',
        address: 'Address',
        bio: 'Bio',
        update: 'Update Profile',
        updating: 'Updating...'
      }
    },
    validation: {
      fullNameInvalid: 'Please enter a valid name (minimum 2 letters)',
      phoneInvalid: 'Please enter a valid phone number (e.g., +1234567890)',
      required: 'This field is required'
    },
    auth: {
      signIn: 'Sign In',
      signInDescription: 'Enter your credentials to access your account',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      resetPassword: 'Reset Password',
      resetDescription: 'Enter your email to receive a password reset link',
      securityCode: 'Security Code',
      newPassword: 'New Password',
      cancel: 'Cancel',
      continue: 'Continue',
      signingIn: 'Signing in...',
      noAccount: "Don't have an account?",
      register: 'Register here',
      backToSite: 'Back to Site',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      invalidCredentials: 'Invalid email or password',
      tooManyAttempts: 'Too many failed attempts. Please try again later.',
      generalError: 'An error occurred. Please try again.',
      passwordRequirements: {
        title: 'Password must contain:',
        length: 'At least 8 characters',
        uppercase: 'One uppercase letter',
        lowercase: 'One lowercase letter',
        number: 'One number',
        special: 'One special character'
      }
    }
  },
  fr: {
    navbar: {
      title: 'Tattoo Booker',
      explore: 'Explorer',
      login: 'Connexion',
      logout: 'Déconnexion',
      register: 'Inscription',
      darkMode: 'Mode Sombre',
      lightMode: 'Mode Clair',
      language: 'Langue',
      settings: 'Paramètres'
    },
    search: {
      placeholder: 'Rechercher des salons de tatouage...',
      allCities: 'Toutes les villes',
      button: 'Rechercher'
    },
    explore: {
      title: 'Explorer les Tatouages',
      searchPlaceholder: 'Rechercher par titre...',
      filterByPlacement: 'Filtrer par emplacement',
      filterByStyle: 'Filtrer par style',
      allPlacements: 'Tous les emplacements',
      allStyles: 'Tous les styles',
      noResults: 'Aucun tatouage trouvé',
      likes: 'j\'aime',
      favorites: 'favoris'
    },
    business: {
      reviews: 'avis',
      phone: 'Téléphone',
      website: 'Site Web',
      bookAppointment: 'Prendre Rendez-vous',
      appointmentRequired: 'Rendez-vous Requis',
      womenOwned: 'Entreprise Féminine',
      wheelchairAccessible: 'Accessible en Fauteuil Roulant',
      loading: 'Chargement des entreprises...',
      noResults: 'Aucune entreprise trouvée',
      previous: 'Précédent',
      next: 'Suivant',
      page: 'Page',
      of: 'sur'
    },
    settings: {
      title: 'Paramètres',
      tabs: {
        account: 'Compte',
        privacy: 'Confidentialité',
        notifications: 'Notifications',
        preferences: 'Préférences',
        business: 'Entreprise'
      },
      account: {
        title: 'Paramètres du Compte',
        email: 'Email',
        currentPassword: 'Mot de Passe Actuel',
        newPassword: 'Nouveau Mot de Passe',
        updateProfile: 'Mettre à Jour le Profil',
        updating: 'Mise à jour...'
      },
      privacy: {
        title: 'Paramètres de Confidentialité',
        shareProfile: {
          label: 'Partager le Profil',
          description: 'Permettre aux autres de voir votre profil public'
        },
        publicBookings: {
          label: 'Réservations Publiques',
          description: 'Afficher vos réservations dans le profil public'
        },
        deleteAccount: {
          button: 'Supprimer le Compte',
          title: 'Êtes-vous sûr ?',
          description: 'Cette action ne peut pas être annulée. Cela supprimera définitivement votre compte et supprimera vos données de nos serveurs.',
          cancel: 'Annuler',
          confirm: 'Supprimer le Compte'
        }
      },
      notifications: {
        title: 'Préférences de Notification',
        email: {
          label: 'Notifications par Email',
          description: 'Recevoir les notifications de réservation et de compte'
        },
        marketing: {
          label: 'Emails Marketing',
          description: 'Recevoir des emails marketing et promotionnels'
        },
        updates: {
          label: 'Mises à Jour Produit',
          description: 'Recevoir des mises à jour sur les nouvelles fonctionnalités'
        }
      },
      preferences: {
        title: 'Préférences',
        theme: {
          label: 'Thème',
          description: 'Choisir entre le mode clair et sombre'
        },
        language: {
          label: 'Langue',
          description: 'Sélectionner votre langue préférée'
        }
      },
      business: {
        title: 'Paramètres Entreprise',
        comingSoon: 'Paramètres entreprise bientôt disponibles...'
      }
    },
    account: {
      title: 'Mon Compte',
      avatar: {
        title: 'Photo de Profil',
        description: 'Téléchargez une photo de profil pour personnaliser votre compte',
        upload: 'Télécharger une Image',
        uploading: 'Téléchargement...',
        requirements: 'JPG, PNG ou JPEG (max. 5MB)'
      },
      profile: {
        title: 'Informations du Profil',
        description: 'Mettez à jour vos informations personnelles',
        fullName: 'Nom Complet',
        phone: 'Numéro de Téléphone',
        address: 'Adresse',
        bio: 'Biographie',
        update: 'Mettre à Jour le Profil',
        updating: 'Mise à Jour...'
      }
    },
    validation: {
      fullNameInvalid: 'Veuillez entrer un nom valide (minimum 2 lettres)',
      phoneInvalid: 'Veuillez entrer un numéro de téléphone valide (ex: +1234567890)',
      required: 'Ce champ est obligatoire'
    },
    auth: {
      signIn: 'Connexion',
      signInDescription: 'Entrez vos identifiants pour accéder à votre compte',
      email: 'Email',
      emailPlaceholder: 'Entrez votre email',
      password: 'Mot de passe',
      passwordPlaceholder: 'Entrez votre mot de passe',
      rememberMe: 'Se souvenir de moi',
      forgotPassword: 'Mot de passe oublié ?',
      resetPassword: 'Réinitialiser le mot de passe',
      resetDescription: 'Entrez votre email pour recevoir un lien de réinitialisation',
      securityCode: 'Code de sécurité',
      newPassword: 'Nouveau mot de passe',
      cancel: 'Annuler',
      continue: 'Continuer',
      signingIn: 'Connexion en cours...',
      noAccount: "Vous n'avez pas de compte ?",
      register: 'Inscrivez-vous ici',
      backToSite: 'Retour au site',
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe',
      invalidCredentials: 'Email ou mot de passe invalide',
      tooManyAttempts: 'Trop de tentatives échouées. Veuillez réessayer plus tard.',
      generalError: 'Une erreur est survenue. Veuillez réessayer.',
      passwordRequirements: {
        title: 'Le mot de passe doit contenir :',
        length: 'Au moins 8 caractères',
        uppercase: 'Une lettre majuscule',
        lowercase: 'Une lettre minuscule',
        number: 'Un chiffre',
        special: 'Un caractère spécial'
      }
    }
  }
};