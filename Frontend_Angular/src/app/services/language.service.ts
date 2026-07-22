import { Injectable, signal } from '@angular/core';

export type SupportedLanguage = 'en' | 'hi' | 'fr' | 'de' | 'es';

export interface TranslationDictionary {
  [key: string]: string;
}

const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard Overview',
    'nav.transactions': 'Recent Transactions',
    'nav.openAccount': 'Open Account',
    'nav.kyc': 'KYC Verification',
    'nav.beneficiaries': 'Beneficiaries',
    'nav.goals': 'Savings Goals',
    'nav.profile': 'My Profile',
    'nav.settings': 'Settings',
    'nav.admin': 'Admin Console',

    // Dashboard Header
    'header.welcome': 'Welcome Back',
    'header.searchPlaceholder': 'Search transactions, beneficiaries, savings goals, or settings...',
    'header.refresh': 'Refresh Data',
    'header.notifications': 'Notifications',
    'header.sendMoney': 'Send Money',
    'header.logout': 'Sign Out',

    // Dashboard Stats Cards
    'stats.totalBalance': 'Total Balance',
    'stats.activeAccounts': 'Active Accounts',
    'stats.monthlyIncome': 'Monthly Income',
    'stats.monthlyExpenses': 'Monthly Expenses',
    'stats.accNo': 'Acc No',

    // Dashboard Views
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.sendMoneyBtn': 'Send Money',
    'dashboard.transferDesc': 'Instant transfer to saved beneficiaries',
    'dashboard.openAccountBtn': 'Open New Account',
    'dashboard.openAccountDesc': 'Apply for high-yield savings account',
    'dashboard.kycBtn': 'Complete KYC',
    'dashboard.kycDesc': 'Verify identity to unlock higher limits',
    'dashboard.goalsBtn': 'Savings Goals',
    'dashboard.goalsDesc': 'Create & track financial targets',

    // Settings View
    'settings.title': 'App Settings',
    'settings.subtitle': 'Configure application display and preferences',
    'settings.darkMode': 'Dark Mode',
    'settings.darkModeDesc': 'Switch to dark display theme (for night comfort)',
    'settings.language': 'Display Language',
    'settings.languageDesc': 'Select your preferred system language',

    // Transaction & KYC Labels
    'common.status': 'Status',
    'common.amount': 'Amount',
    'common.date': 'Date',
    'common.action': 'Action',
    'common.completed': 'Completed',
    'common.pending': 'Pending',
    'common.failed': 'Failed',
    'common.save': 'Save Changes'
  },
  hi: {
    // Navigation
    'nav.dashboard': 'डैशबोर्ड अवलोकन',
    'nav.transactions': 'हाल के लेनदेन',
    'nav.openAccount': 'खाता खोलें',
    'nav.kyc': 'केवाईसी सत्यापन',
    'nav.beneficiaries': 'लाभार्थी',
    'nav.goals': 'बचत लक्ष्य',
    'nav.profile': 'मेरी प्रोफाइल',
    'nav.settings': 'सेटिंग्स',
    'nav.admin': 'एडमिन कंसोल',

    // Dashboard Header
    'header.welcome': 'वापसी पर स्वागत है',
    'header.searchPlaceholder': 'लेनदेन, लाभार्थी, बचत लक्ष्य या सेटिंग्स खोजें...',
    'header.refresh': 'डेटा रीफ्रेश करें',
    'header.notifications': 'सूचनाएं',
    'header.sendMoney': 'पैसे भेजें',
    'header.logout': 'साइन आउट',

    // Dashboard Stats Cards
    'stats.totalBalance': 'कुल शेष राशि',
    'stats.activeAccounts': 'सक्रिय खाते',
    'stats.monthlyIncome': 'मासिक आय',
    'stats.monthlyExpenses': 'मासिक खर्च',
    'stats.accNo': 'खाता संख्या',

    // Dashboard Views
    'dashboard.quickActions': 'त्वरित कार्रवाई',
    'dashboard.sendMoneyBtn': 'पैसे भेजें',
    'dashboard.transferDesc': 'सहेजे गए लाभार्थियों को तुरंत स्थानांतरण',
    'dashboard.openAccountBtn': 'नया खाता खोलें',
    'dashboard.openAccountDesc': 'उच्च ब्याज बचत खाते के लिए आवेदन करें',
    'dashboard.kycBtn': 'केवाईसी पूरा करें',
    'dashboard.kycDesc': 'उच्च सीमा अनलॉक करने के लिए पहचान सत्यापित करें',
    'dashboard.goalsBtn': 'बचत लक्ष्य',
    'dashboard.goalsDesc': 'वित्तीय लक्ष्य बनाएं और ट्रैक करें',

    // Settings View
    'settings.title': 'ऐप सेटिंग्स',
    'settings.subtitle': 'आवेदन प्रदर्शन और प्राथमिकताएं कॉन्फ़िगर करें',
    'settings.darkMode': 'डार्क मोड',
    'settings.darkModeDesc': 'डार्क डिस्प्ले थीम पर स्विच करें',
    'settings.language': 'प्रदर्शित भाषा',
    'settings.languageDesc': 'अपनी पसंदीदा प्रणाली भाषा चुनें',

    // Transaction & KYC Labels
    'common.status': 'स्थिति',
    'common.amount': 'राशि',
    'common.date': 'तिथि',
    'common.action': 'कार्रवाई',
    'common.completed': 'पूर्ण हुआ',
    'common.pending': 'लंबित',
    'common.failed': 'विफल',
    'common.save': 'सहेजें'
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Aperçu du tableau de bord',
    'nav.transactions': 'Transactions récentes',
    'nav.openAccount': 'Ouvrir un compte',
    'nav.kyc': 'Vérification KYC',
    'nav.beneficiaries': 'Bénéficiaires',
    'nav.goals': 'Objectifs d’épargne',
    'nav.profile': 'Mon Profil',
    'nav.settings': 'Paramètres',
    'nav.admin': 'Console d’administration',

    // Dashboard Header
    'header.welcome': 'Bienvenue',
    'header.searchPlaceholder': 'Rechercher des transactions, bénéficiaires, objectifs...',
    'header.refresh': 'Actualiser',
    'header.notifications': 'Notifications',
    'header.sendMoney': 'Envoyer de l’argent',
    'header.logout': 'Déconnexion',

    // Dashboard Stats Cards
    'stats.totalBalance': 'Solde total',
    'stats.activeAccounts': 'Comptes actifs',
    'stats.monthlyIncome': 'Revenu mensuel',
    'stats.monthlyExpenses': 'Dépenses mensuelles',
    'stats.accNo': 'N° de compte',

    // Dashboard Views
    'dashboard.quickActions': 'Actions rapides',
    'dashboard.sendMoneyBtn': 'Envoyer de l’argent',
    'dashboard.transferDesc': 'Virement instantané vers vos bénéficiaires',
    'dashboard.openAccountBtn': 'Ouvrir un nouveau compte',
    'dashboard.openAccountDesc': 'Souscrire à un compte d’épargne rémunéré',
    'dashboard.kycBtn': 'Compléter le KYC',
    'dashboard.kycDesc': 'Vérifier l’identité pour augmenter vos plafonds',
    'dashboard.goalsBtn': 'Objectifs d’épargne',
    'dashboard.goalsDesc': 'Créer et suivre des objectifs financiers',

    // Settings View
    'settings.title': 'Paramètres de l’application',
    'settings.subtitle': 'Configurer l’affichage et les préférences',
    'settings.darkMode': 'Mode Sombre',
    'settings.darkModeDesc': 'Passer au thème sombre',
    'settings.language': 'Langue d’affichage',
    'settings.languageDesc': 'Sélectionnez votre langue préférée',

    // Transaction & KYC Labels
    'common.status': 'Statut',
    'common.amount': 'Montant',
    'common.date': 'Date',
    'common.action': 'Action',
    'common.completed': 'Terminé',
    'common.pending': 'En attente',
    'common.failed': 'Échoué',
    'common.save': 'Enregistrer'
  },
  de: {
    // Navigation
    'nav.dashboard': 'Dashboard-Übersicht',
    'nav.transactions': 'Letzte Transaktionen',
    'nav.openAccount': 'Konto eröffnen',
    'nav.kyc': 'KYC-Überprüfung',
    'nav.beneficiaries': 'Empfänger',
    'nav.goals': 'Sparziele',
    'nav.profile': 'Mein Profil',
    'nav.settings': 'Einstellungen',
    'nav.admin': 'Admin-Konsole',

    // Dashboard Header
    'header.welcome': 'Willkommen zurück',
    'header.searchPlaceholder': 'Transaktionen, Empfänger, Sparziele suchen...',
    'header.refresh': 'Daten aktualisieren',
    'header.notifications': 'Benachrichtigungen',
    'header.sendMoney': 'Geld senden',
    'header.logout': 'Abmelden',

    // Dashboard Stats Cards
    'stats.totalBalance': 'Gesamtguthaben',
    'stats.activeAccounts': 'Aktive Konten',
    'stats.monthlyIncome': 'Monatliches Einkommen',
    'stats.monthlyExpenses': 'Monatliche Ausgaben',
    'stats.accNo': 'Konto-Nr',

    // Dashboard Views
    'dashboard.quickActions': 'Schnellaktionen',
    'dashboard.sendMoneyBtn': 'Geld senden',
    'dashboard.transferDesc': 'Sofortüberweisung an gespeicherte Empfänger',
    'dashboard.openAccountBtn': 'Neues Konto eröffnen',
    'dashboard.openAccountDesc': 'Hochverzinstes Sparkonto beantragen',
    'dashboard.kycBtn': 'KYC abschließen',
    'dashboard.kycDesc': 'Identität verifizieren für höhere Limits',
    'dashboard.goalsBtn': 'Sparziele',
    'dashboard.goalsDesc': 'Finanzielle Ziele erstellen und verfolgen',

    // Settings View
    'settings.title': 'App-Einstellungen',
    'settings.subtitle': 'Anzeige und Einstellungen konfigurieren',
    'settings.darkMode': 'Dunkelmodus',
    'settings.darkModeDesc': 'Zum dunklen Design wechseln',
    'settings.language': 'Anzeigesprache',
    'settings.languageDesc': 'Wählen Sie Ihre bevorzugte System sprache',

    // Transaction & KYC Labels
    'common.status': 'Status',
    'common.amount': 'Betrag',
    'common.date': 'Datum',
    'common.action': 'Aktion',
    'common.completed': 'Abgeschlossen',
    'common.pending': 'Ausstehend',
    'common.failed': 'Fehlgeschlagen',
    'common.save': 'Speichern'
  },
  es: {
    // Navigation
    'nav.dashboard': 'Resumen del Panel',
    'nav.transactions': 'Transacciones Recientes',
    'nav.openAccount': 'Abrir Cuenta',
    'nav.kyc': 'Verificación KYC',
    'nav.beneficiaries': 'Beneficiarios',
    'nav.goals': 'Metas de Ahorro',
    'nav.profile': 'Mi Perfil',
    'nav.settings': 'Configuración',
    'nav.admin': 'Consola de Administración',

    // Dashboard Header
    'header.welcome': 'Bienvenido de nuevo',
    'header.searchPlaceholder': 'Buscar transacciones, beneficiarios, metas...',
    'header.refresh': 'Actualizar datos',
    'header.notifications': 'Notificaciones',
    'header.sendMoney': 'Enviar dinero',
    'header.logout': 'Cerrar sesión',

    // Dashboard Stats Cards
    'stats.totalBalance': 'Saldo Total',
    'stats.activeAccounts': 'Cuentas Activas',
    'stats.monthlyIncome': 'Ingresos Mensuales',
    'stats.monthlyExpenses': 'Gastos Mensuales',
    'stats.accNo': 'Nº Cuenta',

    // Dashboard Views
    'dashboard.quickActions': 'Acciones Rápidas',
    'dashboard.sendMoneyBtn': 'Enviar Dinero',
    'dashboard.transferDesc': 'Transferencia instantánea a beneficiarios',
    'dashboard.openAccountBtn': 'Abrir Nueva Cuenta',
    'dashboard.openAccountDesc': 'Solicitar cuenta de ahorro de alto rendimiento',
    'dashboard.kycBtn': 'Completar KYC',
    'dashboard.kycDesc': 'Verificar identidad para desbloquear límites mayores',
    'dashboard.goalsBtn': 'Metas de Ahorro',
    'dashboard.goalsDesc': 'Crear y rastrear metas financieras',

    // Settings View
    'settings.title': 'Configuración de la Aplicación',
    'settings.subtitle': 'Configurar preferencias de pantalla',
    'settings.darkMode': 'Modo Oscuro',
    'settings.darkModeDesc': 'Cambiar a tema oscuro',
    'settings.language': 'Idioma de Pantalla',
    'settings.languageDesc': 'Seleccione su idioma preferido del sistema',

    // Transaction & KYC Labels
    'common.status': 'Estado',
    'common.amount': 'Monto',
    'common.date': 'Fecha',
    'common.action': 'Acción',
    'common.completed': 'Completado',
    'common.pending': 'Pendiente',
    'common.failed': 'Fallido',
    'common.save': 'Guardar Cambios'
  }
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLang = signal<SupportedLanguage>('en');

  constructor() {
    const saved = localStorage.getItem('yono_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lang && TRANSLATIONS[parsed.lang as SupportedLanguage]) {
          this.currentLang.set(parsed.lang as SupportedLanguage);
        }
      } catch {
        // ignore
      }
    }
  }

  setLanguage(lang: SupportedLanguage) {
    if (TRANSLATIONS[lang]) {
      this.currentLang.set(lang);
    }
  }

  translate(key: string): string {
    const lang = this.currentLang();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  }
}
