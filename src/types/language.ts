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
  };
  search: {
    placeholder: string;
    allCities: string;
    button: string;
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
}

export const translations: Record<Language, Translations> = {
  en: {
    navbar: {
      title: 'Tattoo Booker',
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
    }
  },
  fr: {
    navbar: {
      title: 'Tattoo Booker',
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
    }
  }
};